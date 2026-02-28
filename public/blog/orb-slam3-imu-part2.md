# [ENG] ORB-SLAM3 IMU Preintegration Code Review (2)

## Introduction

![image](/blog/images/orb-slam3-code-review1-intro.png)

Last time, we analyzed the first of several components of IMU preintegration in ORB-SLAM3, the IMU sensor measurement integration part, by comparing the paper and the code. The measurement integration part (1) computes the relative state (rotation, translation, velocity) values between two keyframes, (2) obtains the covariance matrix through noise propagation, and (3) computes the Jacobian matrix for bias update. The values computed here are later used to perform bundle adjustment using keyframes, or to perform nonlinear optimization such as pose estimation for a single camera frame.

In this tutorial, we will analyze how the residual function of IMU factors and the definition of Jacobian matrix are implemented in the ORB-SLAM3 code to perform nonlinear optimization.


---

### Prerequisites

#### Factor Graphs and MAP Esimation

A **factor graph **is a structure used to represent the relationships between variables in a stochastic model and to find solutions that satisfy all constraints (factors). It is used here to address the Visual-Inertial Odometry (VIO) problem and consists of the following main components

1. Graph node
  1. Variable node: represents the state of the system (state, $\mathcal{X}_k$)
  1. Factor nodes: represent probabilistic factors that represent relationships between measurements (measurement, $\mathcal{Z}_k$) and states.
1. Graph edges
  1. Connects variables and factors, and represents constraints on which variables affect which factors.

The VIO problem defined in the IMU preintegration paper is represented as follows in Equation (25).

$$

\begin{equation}
\begin{aligned}
p(\mathcal{X}_k \mid \mathcal{Z}_k) &\propto p(\mathcal{X}_0) p(\mathcal{Z}_k \mid \mathcal{X}_k) \\
&\overset{(a)}{=} p(\mathcal{X}_0) \prod_{(i,j) \in \mathcal{K}_k} p(\mathcal{C}_i, \mathcal{I}_{ij} \mid \mathcal{X}_k) \\
&\overset{(b)}{=} p(\mathcal{X}_0) \prod_{(i,j) \in \mathcal{K}_k} p(\mathcal{I}_{ij} \mid \mathbf{x}_i, \mathbf{x}_j) 
\prod_{i \in \mathcal{K}_k} \prod_{l \in \mathcal{C}_i} p(\mathbf{z}_{il} \mid \mathbf{x}_i).
\end{aligned}
\tag{25}
\end{equation}
$$

where the state value $\mathcal{X}_k$ the state for the keyframe we are interested in obtaining (rotation $\mathbf{R}_i$, translation $\mathbf{p}_i$, velocity $\mathbf{v}_i$, bias $\mathbf{b}_i $ ) values, and the measurements $\mathcal{Z}_k$ contain observations from the camera sensors (2D keypoint position information $\mathcal{C_i}$ about 3D landmarks) and measurements from the IMU sensors (acceleration and angular velocity $\mathcal{I_{ij}}$). For more details on the notation, please refer to the section IV. Maximum a Posteriori Visual-Inertial State Estimation in the [paper](https://rpg.ifi.uzh.ch/docs/TRO16_forster.pdf).

$$
\begin{align*}
\mathcal{X}_k &\doteq \left\{ \mathbf{x}_i \right\}_{i \in \mathcal{K}_k}, \text{ where } \mathbf{x}_i \doteq \left[ \mathbf{R}_i, \mathbf{p}_i, \mathbf{v}_i, \mathbf{b}_i \right] \\
\mathcal{Z}_k &\doteq \left\{ C_i, \mathcal{I}_{ij} \right\}_{(i,j) \in \mathcal{K}_k}.
\end{align*}
$$

We want to perform **Maximum-a-Priori (MAP) estimation **to find the state value $\mathcal{X}_k$ that causes the probabilistic model in Equation (25) to have a maximum value. To do this, we take the negative logarithm of Equation (25) and express it in sum form as follows

$$

\begin{aligned}
\boldsymbol{\mathcal{X}}_k^* &\doteq\arg\min_{\boldsymbol{\mathcal{X}}_k} -\log_e \, p(\boldsymbol{\mathcal{X}}_k \mid \boldsymbol{\mathcal{Z}}_k) \\
&= \arg\min_{\boldsymbol{\mathcal{X}}_k} \|\mathbf{r}_0\|^2_{\boldsymbol{\Sigma}_0} 
+ \sum_{(i,j) \in \mathcal{K}_k} \|\mathbf{r}_{\mathcal{I}_{ij}}\|^2_{\boldsymbol{\Sigma}_{ij}} 
+ \sum_{i \in \mathcal{K}_k} \sum_{l \in \mathcal{C}_i} \|\mathbf{r}_{\mathcal{C}_{il}}\|^2_{\boldsymbol{\Sigma}_C}.
\end{aligned}
\tag{26}

$$

where $\mathbf{r}_0, \mathbf{r}_{\mathcal{I}_{ij}}, \mathbf{r}_{\mathcal{C}_{il}}$are the residuals for the prior factor, the residual for the IMU sensor, and the residual for the Camera sensor, respectively. Here, residual is the difference between the measurement from the sensor and the prediction of the state. Finding the parameter $\mathcal{X}_k$that minimizes the equation (26) composed of these residual functions becomes the solution of the probabilistic model equation (25), and finding this solution is called **state estimation **of the system.

#### Nonlinear optimization & Open-source libraries

The process of finding the solution usually uses nonlinear optimization methods, and there are many open-source libraries available for general developers and engineers to easily use, including

- Google, ceres-solver[(http://ceres-solver.org/)](http://ceres-solver.org/)
- Georgia Tech, GTSAM[(https://gtsam.org/)](https://gtsam.org/)
- University of Freiburg, g2o[(https://github.com/RainerKuemmerle/g2o)](https://github.com/RainerKuemmerle/g2o)
- Skydio, Symforce[(https://symforce.org/)](https://symforce.org/)
In the ORB-SLAM3 code referenced in this article, the g2o library is used to perform nonlinear optimization, so the code description below will be based on g2o. The tools required in the general nonlinear optimization process (e.g., optimization loop, nonlinear solver, etc.) are all implemented in the library, but the system model of the problem we want to solve must be implemented by ourselves. Therefore, it is necessary to implement the system model for the IMU preintegration problem in code, and what we need is a** definition **of** the residual function and a definition of the Jacobian matrix**. In the code analysis section below, we will compare the code in ORB-SLAM3 with the formulas in the IMU integration paper to see how they are implemented.


> 

> If you are unfamiliar with nonlinear optimization theory, you may want to take a look at section 03. Non-linear optimization theorem in my book [Understanding and Implementing SLAM with NVIDIA Jetson Nano](https://dongwonshin.oopy.io/53261df4-e506-4afb-8039-bc29e6a6ec40):-)

## Code Analysis

### Definition of Residual Function

As we briefly explained earlier, the residual function is the difference between the measurement from the sensor and the prediction of the state. The state of the system where this residual value is minimized is calculated using nonlinear optimization. The residual function for IMU preintegration defined in the paper is described in Equation (45). In order, they represent the residuals $\mathbf{r}_{\Delta R_{ij}}$ for the rotation parameter, $\mathbf{r}_{\Delta \mathbf{v}_{ij}}$ for the velocity parameter, and $\mathbf{r}_{\Delta \mathbf{p}_{ij}}$for the translation parameter.

$$
\begin{align}\mathbf{r}_{\Delta \mathbf{R}_{ij}} &\doteq \text{Log}\left( \left( {\Delta \tilde{\mathbf{R}}}_{ij}(\bar{\mathbf{b}}_i^g) \text{Exp}\left( \frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g} \delta \mathbf{b}^g \right) \right)^\top \mathbf{R}_i^\top \mathbf{R}_j \right), \notag \\\mathbf{r}_{\Delta \mathbf{v}_{ij}} &\doteq \mathbf{R}_i^\top \left( \mathbf{v}_j - \mathbf{v}_i - \mathbf{g} \Delta t_{ij} \right) - \left[ \Delta \tilde{\mathbf{v}}_{ij}(\bar{\mathbf{b}}_i^g, \bar{\mathbf{b}}_i^a) + \frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^g} \delta \mathbf{b}^g + \frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^a} \delta \mathbf{b}^a \right], \notag \\\mathbf{r}_{\Delta \mathbf{p}_{ij}} &\doteq \mathbf{R}_i^\top \left( \mathbf{p}_j - \mathbf{p}_i - \mathbf{v}_i \Delta t_{ij} - \frac{1}{2} \mathbf{g} \Delta t_{ij}^2 \right) - \left[ \Delta \bar{\mathbf{p}}_{ij}(\bar{\mathbf{b}}_i^g, \bar{\mathbf{b}}_i^a) + \frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^g} \delta \mathbf{b}^g + \frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^a} \delta \mathbf{b}^a \right]. \tag{45}\end{align}
$$

The Residual function for the IMU preintegration implemented in the code is defined in the computeError function of the EdgeInertial class. Here, the variables er, ev, and ep at the end represent $\mathbf{r}_{\Delta \mathbf{R}_{ij}}$, $\mathbf{r}_{\Delta \mathbf{v}_{ij}}$, and $\mathbf{r}_{\Delta \mathbf{p}_{ij}}$, respectively. 

```C++
void EdgeInertial::computeError()
{
    // TODO Maybe Reintegrate inertial measurments when difference between linearization point and current estimate is too big
    const VertexPose* VP1 = static_cast<const VertexPose*>(_vertices[0]);
    const VertexVelocity* VV1= static_cast<const VertexVelocity*>(_vertices[1]);
    const VertexGyroBias* VG1= static_cast<const VertexGyroBias*>(_vertices[2]);
    const VertexAccBias* VA1= static_cast<const VertexAccBias*>(_vertices[3]);
    const VertexPose* VP2 = static_cast<const VertexPose*>(_vertices[4]);
    const VertexVelocity* VV2 = static_cast<const VertexVelocity*>(_vertices[5]);
    const IMU::Bias b1(VA1->estimate()[0],VA1->estimate()[1],VA1->estimate()[2],VG1->estimate()[0],VG1->estimate()[1],VG1->estimate()[2]);
    const Eigen::Matrix3d dR = mpInt->GetDeltaRotation(b1).cast<double>();
    const Eigen::Vector3d dV = mpInt->GetDeltaVelocity(b1).cast<double>();
    const Eigen::Vector3d dP = mpInt->GetDeltaPosition(b1).cast<double>();

    const Eigen::Vector3d er = LogSO3(dR.transpose()*VP1->estimate().Rwb.transpose()*VP2->estimate().Rwb);
    const Eigen::Vector3d ev = VP1->estimate().Rwb.transpose()*(VV2->estimate() - VV1->estimate() - g*dt) - dV;
    const Eigen::Vector3d ep = VP1->estimate().Rwb.transpose()*(VP2->estimate().twb - VP1->estimate().twb
                                                               - VV1->estimate()*dt - g*dt*dt/2) - dP;

    _error << er, ev, ep;
}
```

To contrast this pictorially, it looks like this

![image](/blog/images/orb-slam3-code-review2-residual.png)


Here, the variables dR, dV, and dP are predictions of the system state in the residual function, calculated by integrating the state change between two consecutive time points based on IMU sensor data. These values are implemented as separate functions to get their values, and the code below shows where the values are assigned to the dR, dV, and dP variables.

```C++
    const Eigen::Matrix3d dR = mpInt->GetDeltaRotation(b1).cast<double>();
    const Eigen::Vector3d dV = mpInt->GetDeltaVelocity(b1).cast<double>();
    const Eigen::Vector3d dP = mpInt->GetDeltaPosition(b1).cast<double>();
```

The definitions of the functions GetDeltaRotation, GetDeltaVelocity, and GetDeltaPosition are shown in the code below, and you can see that they are implemented identically to the parts of the formula labeled dR, dV, and dP in Equation (45). Here, JRg, JVg, JVa, JPg, and JPa are the Jacobian matrices for updating the bias that we discussed in [the first post](/170cc7c3f3fb802d8d90f23d325c9135?pvs=25).

```C++
Eigen::Matrix3f Preintegrated::GetDeltaRotation(const Bias &b_)
{
    std::unique_lock<std::mutex> lock(mMutex);
    Eigen::Vector3f dbg;
    dbg << b_.bwx-b.bwx,b_.bwy-b.bwy,b_.bwz-b.bwz;
    return NormalizeRotation(dR * Sophus::SO3f::exp(JRg * dbg).matrix());
}

Eigen::Vector3f Preintegrated::GetDeltaVelocity(const Bias &b_)
{
    std::unique_lock<std::mutex> lock(mMutex);
    Eigen::Vector3f dbg, dba;
    dbg << b_.bwx-b.bwx,b_.bwy-b.bwy,b_.bwz-b.bwz;
    dba << b_.bax-b.bax,b_.bay-b.bay,b_.baz-b.baz;
    return dV + JVg * dbg + JVa * dba;
}

Eigen::Vector3f Preintegrated::GetDeltaPosition(const Bias &b_)
{
    std::unique_lock<std::mutex> lock(mMutex);
    Eigen::Vector3f dbg, dba;
    dbg << b_.bwx-b.bwx,b_.bwy-b.bwy,b_.bwz-b.bwz;
    dba << b_.bax-b.bax,b_.bay-b.bay,b_.baz-b.baz;
    return dP + JPg * dbg + JPa * dba;
}
```

This implemented Residual function is used as a key element of the IMU Factor node, which describes the state change (rotation, velocity, position) between two keyframes when performing IMU Preintegration. The Residual function defines the error between the predicted and actual state values, which is used to construct the optimization expression. By minimizing the difference between the predicted and actual state variables calculated by integrating the IMU data, the optimization process is used to incrementally improve the precision of the system state estimation.

### Defining the Jacobian matrix

Next, let's take a look at the Jacobian matrix, which is the vector derivative of a multivariate vector function, which in nonlinear optimization terms means the result of differentiating the residual function, which is a multivariate vector function, with the state variables. It represents how the residual function, which we need to minimize, changes as the state variable changes. Therefore, the Jacobian matrix can be understood as a matrix that contains important information about the direction and magnitude of the change in the residual function.

The implementation of the Jacobian matrix for IMU preintegration is implemented in the linearizeOplus function of the EdgeInertial class. In the code, the order of the partial derivatives is listed in terms of state variables, and in the paper it is listed in terms of residual functions, so it is difficult to understand at a glance. Therefore, to make the code easier to understand, I added a  comment to the existing ORB-SLAM3 code // Comment (Dongwon Shin): Added a commentary with keywords.

```C++
void EdgeInertial::linearizeOplus()
{
    const VertexPose* VP1 = static_cast<const VertexPose*>(_vertices[0]);
    const VertexVelocity* VV1= static_cast<const VertexVelocity*>(_vertices[1]);
    const VertexGyroBias* VG1= static_cast<const VertexGyroBias*>(_vertices[2]);
    const VertexAccBias* VA1= static_cast<const VertexAccBias*>(_vertices[3]);
    const VertexPose* VP2 = static_cast<const VertexPose*>(_vertices[4]);
    const VertexVelocity* VV2= static_cast<const VertexVelocity*>(_vertices[5]);
    const IMU::Bias b1(VA1->estimate()[0],VA1->estimate()[1],VA1->estimate()[2],VG1->estimate()[0],VG1->estimate()[1],VG1->estimate()[2]);
    const IMU::Bias db = mpInt->GetDeltaBias(b1);
    Eigen::Vector3d dbg;
    dbg << db.bwx, db.bwy, db.bwz;

    const Eigen::Matrix3d Rwb1 = VP1->estimate().Rwb;
    const Eigen::Matrix3d Rbw1 = Rwb1.transpose();
    const Eigen::Matrix3d Rwb2 = VP2->estimate().Rwb;

    const Eigen::Matrix3d dR = mpInt->GetDeltaRotation(b1).cast<double>();
    const Eigen::Matrix3d eR = dR.transpose()*Rbw1*Rwb2;
    const Eigen::Vector3d er = LogSO3(eR);
    const Eigen::Matrix3d invJr = InverseRightJacobianSO3(er);

    // Jacobians wrt Pose 1
    _jacobianOplus[0].setZero();
    // Comment (Dongwon Shin): derivative of rotation residual w.r.t rotation i
    _jacobianOplus[0].block<3,3>(0,0) = -invJr*Rwb2.transpose()*Rwb1; // OK
    // Comment (Dongwon Shin): derivative of velocity residual w.r.t rotation i
    _jacobianOplus[0].block<3,3>(3,0) = Sophus::SO3d::hat(Rbw1*(VV2->estimate() - VV1->estimate() - g*dt)); // OK
    // Comment (Dongwon Shin): derivative of translation residual w.r.t rotation i
    _jacobianOplus[0].block<3,3>(6,0) = Sophus::SO3d::hat(Rbw1*(VP2->estimate().twb - VP1->estimate().twb
                                                   - VV1->estimate()*dt - 0.5*g*dt*dt)); // OK
    // translation
    // Comment (Dongwon Shin): derivative of translation residual w.r.t position i
    _jacobianOplus[0].block<3,3>(6,3) = -Eigen::Matrix3d::Identity(); // OK

    // Jacobians wrt Velocity 1
    _jacobianOplus[1].setZero();
    // Comment (Dongwon Shin): derivative of velocity residual w.r.t velocity i
    _jacobianOplus[1].block<3,3>(3,0) = -Rbw1; // OK
    // Comment (Dongwon Shin): derivative of translation residual w.r.t velocity i
    _jacobianOplus[1].block<3,3>(6,0) = -Rbw1*dt; // OK

    // Jacobians wrt Gyro 1
    _jacobianOplus[2].setZero();
    // Comment (Dongwon Shin): derivative of rotation residual w.r.t gyro bias i
    _jacobianOplus[2].block<3,3>(0,0) = -invJr*eR.transpose()*RightJacobianSO3(JRg*dbg)*JRg; // OK
    // Comment (Dongwon Shin): derivative of velocity residual w.r.t gyro bias i
    _jacobianOplus[2].block<3,3>(3,0) = -JVg; // OK
    // Comment (Dongwon Shin): derivative of translation residual w.r.t gyro bias i
    _jacobianOplus[2].block<3,3>(6,0) = -JPg; // OK

    // Jacobians wrt Accelerometer 1
    _jacobianOplus[3].setZero();
    // Comment (Dongwon Shin): derivative of velocity residual w.r.t acc bias i
    _jacobianOplus[3].block<3,3>(3,0) = -JVa; // OK
    // Comment (Dongwon Shin): derivative of translation residual w.r.t acc bias i
    _jacobianOplus[3].block<3,3>(6,0) = -JPa; // OK

    // Jacobians wrt Pose 2
    _jacobianOplus[4].setZero();
    // rotation
    // Comment (Dongwon Shin): derivative of rotation residual w.r.t rotation j
    _jacobianOplus[4].block<3,3>(0,0) = invJr; // OK
    // translation
    // Comment (Dongwon Shin): derivative of translation residual w.r.t position j
    _jacobianOplus[4].block<3,3>(6,3) = Rbw1*Rwb2; // OK

    // Jacobians wrt Velocity 2
    _jacobianOplus[5].setZero();
    // Comment (Dongwon Shin): derivative of velocity residual w.r.t velocity j
    _jacobianOplus[5].block<3,3>(3,0) = Rbw1; // OK
}
```


In the IMU preintegration paper, the derivation of the formula for the Jacobian matrix is described in the C. Jacobians of Residual Errors section of the Appendix as follows. 

- 1) Jacobians of position residual $\mathbf{r}_{\Delta \mathbf{p}_{ij}} $
$$
\begin{aligned}
\frac{\partial \mathbf{r}_{\Delta \mathbf{p}_{ij}}}{\partial \delta \boldsymbol{\phi}_i} &= \left( \mathbf{R}_i^\top \left( \mathbf{p}_j - \mathbf{p}_i - \mathbf{v}_i \Delta t_{ij} - \frac{1}{2} \mathbf{g} \Delta t_{ij}^2 \right) \right)^\wedge, \\
\frac{\partial \mathbf{r}_{\Delta \mathbf{p}_{ij}}}{\partial \delta \mathbf{p}_i} &= -\mathbf{I}_{3 \times 1}, \\
\frac{\partial \mathbf{r}_{\Delta \mathbf{p}_{ij}}}{\partial \delta \mathbf{v}_i} &= -\mathbf{R}_i^\top \Delta t_{ij}, \\
\frac{\partial \mathbf{r}_{\Delta \mathbf{p}_{ij}}}{\partial \delta \tilde{\mathbf{b}}_i^a} &= -\frac{\partial \Delta \tilde{\mathbf{p}}_{ij}}{\partial \mathbf{b}_i^a},
\end{aligned}
\quad
\begin{aligned}
\frac{\partial \mathbf{r}_{\Delta \mathbf{p}_{ij}}}{\partial \delta \boldsymbol{\phi}_j} &= 0, \\
\frac{\partial \mathbf{r}_{\Delta \mathbf{p}_{ij}}}{\partial \delta \mathbf{p}_j} &= \mathbf{R}_i^\top \mathbf{R}_j, \\
\frac{\partial \mathbf{r}_{\Delta \mathbf{p}_{ij}}}{\partial \delta \mathbf{v}_j} &= 0, \\
\frac{\partial \mathbf{r}_{\Delta \mathbf{p}_{ij}}}{\partial \delta \tilde{\mathbf{b}}_i^g} &= -\frac{\partial \Delta \tilde{\mathbf{p}}_{ij}}{\partial \mathbf{b}_i^g}.
\end{aligned}
$$

- 2) Jacobians of velocity residual $\mathbf{r}_{\Delta \mathbf{v}_{ij}} $
$$
\begin{aligned}\frac{\partial \mathbf{r}_{\Delta \mathbf{v}_{ij}}}{\partial \delta \boldsymbol{\phi}_i} &= \left( \mathbf{R}_i^\top \left( \mathbf{v}_j - \mathbf{v}_i - \mathbf{g} \Delta t_{ij} \right) \right)^\wedge, \\\frac{\partial \mathbf{r}_{\Delta \mathbf{v}_{ij}}}{\partial \delta \mathbf{p}_i} &= 0, \\\frac{\partial \mathbf{r}_{\Delta \mathbf{v}_{ij}}}{\partial \delta \mathbf{v}_i} &= -\mathbf{R}_i^\top, \\\frac{\partial \mathbf{r}_{\Delta \mathbf{v}_{ij}}}{\partial \delta \tilde{\mathbf{b}}_i^a} &= -\frac{\partial \Delta \tilde{\mathbf{v}}_{ij}}{\partial \mathbf{b}_i^a},\end{aligned}\quad\begin{aligned}\frac{\partial \mathbf{r}_{\Delta \mathbf{v}_{ij}}}{\partial \delta \boldsymbol{\phi}_j} &= 0, \\\frac{\partial \mathbf{r}_{\Delta \mathbf{v}_{ij}}}{\partial \delta \mathbf{p}_j} &= 0, \\\frac{\partial \mathbf{r}_{\Delta \mathbf{v}_{ij}}}{\partial \delta \mathbf{v}_j} &= \mathbf{R}_i^\top, \\\frac{\partial \mathbf{r}_{\Delta \mathbf{v}_{ij}}}{\partial \delta \tilde{\mathbf{b}}_i^g} &= -\frac{\partial \Delta \tilde{\mathbf{v}}_{ij}}{\partial \mathbf{b}_i^g}.\end{aligned}
$$

- 3) Jacobians of rotation residual $\mathbf{r}_{\Delta \mathbf{R}_{ij}} $
$$
\begin{aligned}\frac{\partial \mathbf{r}_{\Delta \mathbf{R}_{ij}}}{\partial \delta \boldsymbol{\phi}_i} &= -\mathbf{J}_r^{-1}(\mathbf{r}_{\Delta \mathbf{R}}(\mathbf{R}_i)) \mathbf{R}_j^\top \mathbf{R}_i, \\\frac{\partial \mathbf{r}_{\Delta \mathbf{R}_{ij}}}{\partial \delta \mathbf{v}_i} &= 0, \\\frac{\partial \mathbf{r}_{\Delta \mathbf{R}_{ij}}}{\partial \delta \mathbf{p}_j} &= 0, \\\frac{\partial \mathbf{r}_{\Delta \mathbf{R}_{ij}}}{\partial \delta \tilde{\mathbf{b}}_i^a} &= 0,\end{aligned}\quad\begin{aligned}\frac{\partial \mathbf{r}_{\Delta \mathbf{R}_{ij}}}{\partial \delta \mathbf{p}_i} &= 0, \\\frac{\partial \mathbf{r}_{\Delta \mathbf{R}_{ij}}}{\partial \delta \boldsymbol{\phi}_j} &= \mathbf{J}_r^{-1}(\mathbf{r}_{\Delta \mathbf{R}}(\mathbf{R}_j)), \\\frac{\partial \mathbf{r}_{\Delta \mathbf{R}_{ij}}}{\partial \delta \mathbf{v}_j} &= 0, \\\frac{\partial \mathbf{r}_{\Delta \mathbf{R}_{ij}}}{\partial \delta \tilde{\mathbf{b}}_i^g} &= \alpha.\end{aligned} \\\text{with } \alpha = -\mathbf{J}_r^{-1} \left( \mathbf{r}_{\Delta \mathbf{R}_{ij}}(\delta \mathbf{b}_i^g) \right) \text{Exp} \left( \mathbf{r}_{\Delta \mathbf{R}_{ij}}(\delta \mathbf{b}_i^g) \right)^\top \mathbf{J}_r^b \frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g}.
$$

This summarizes the results of differentiating the residual functions for rotation, velocity, and translation with respect to the state variables below.

- Rotation state variable for keyframe i ${\partial \delta \boldsymbol{\phi}_i}$
- Rotation state variable for keyframe j ${\partial \delta \boldsymbol{\phi}_j}$
- Pan state variable for keyframe i ${\partial \delta \mathbf{p}_i}$
- Rotation state variable for keyframe j ${\partial \delta \mathbf{p}_j}$
- Vector state variable for keyframe i ${\partial \delta \mathbf{v}_i}$
- Vector state variable for keyframe j ${\partial \delta \mathbf{v}_j}$
- Acceleration bias state variable for keyframe i ${\partial \delta \tilde{\mathbf{b}}_i^a}$
- Angular Velocity Bias State Variable for Keyframe i ${\partial \delta \tilde{\mathbf{b}}_i^g}$

For example, in the Jacobian matrix code shown below, `the derivative of rotation residual w.r.t rotation i is the`rotation residual function $\mathbf{r}_{\Delta \mathbf{R}_{ij}} $at $\frac{\partial \mathbf{r}_{\Delta \mathbf{R}_{ij}}}{\partial \delta \boldsymbol{\phi}_i}$i as a function of the rotation state variable ${\partial \delta \boldsymbol{\phi}_i}$ $\frac{\partial \mathbf{r}_{\Delta \mathbf{R}_{ij}}}{\partial \delta \boldsymbol{\phi}_i}$, which in the paper means $\frac{\partial \mathbf{r}_{\Delta \mathbf{R}_{ij}}}{\partial \delta \boldsymbol{\phi}_i}$. 

```C++
    // Comment (Dongwon Shin): derivative of rotation residual w.r.t rotation i
    _jacobianOplus[0].block<3,3>(0,0) = -invJr*Rwb2.transpose()*Rwb1; // OK
```

$$
\frac{\partial \mathbf{r}_{\Delta \mathbf{R}_{ij}}}{\partial \delta \boldsymbol{\phi}_i} = -\mathbf{J}_r^{-1}(\mathbf{r}_{\Delta \mathbf{R}}(\mathbf{R}_i)) \mathbf{R}_j^\top \mathbf{R}_i
$$

Comparing between the paper and the code in this way, we can see that the formula for the Jacobian matrix in the paper is implemented verbatim. 


---

## Wrapping up

At first, I was curious about how IMU preintegration is actually implemented in ORB-SLAM3, so I searched for data, and I even wrote a post explaining it myself. It's been a long time since I posted a blog post on the homepage, but in the future, I will summarize what I often study. While studying, I found that VINS-MONO, another representative visual inertial odometry method, performs IMU preintegration in a different way from ORB-SLAM3, so I will write a post about it next time. I will also try to write about Semantic SLAM and Deep learning based visual localization if I get a chance.

I'm usually only interested in IMU sensor fusion, but I feel like I've become a little more familiar with IMU preintegration this time by studying it. Recently, Apple is also hiring VIO/SLAM engineers to make metaverse devices such as VisionPro, and I feel that it is being used more and more in addition to autonomous driving and robotics.

![image](/blog/images/orb-slam3-code-review2-outro.png)

Thank you for reading to the end :-)



