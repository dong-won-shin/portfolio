# [ENG] ORB-SLAM3 IMU Preintegration Code Review (1)

## Introduction

![image](/blog/images/orb-slam3-code-review1-intro.png)

Recently, while studying [IMU preintegration](https://rpg.ifi.uzh.ch/docs/TRO16_forster.pdf), I suddenly wondered how IMU preintegration is implemented [in ORB-SLAM3](https://github.com/UZ-SLAMLab/ORB_SLAM3), so I analyzed it. The theoretical part of IMU preintegration is already well explained [Dr. Lim's blog](https://limhyungtae.github.io/2022-04-01-IMU-Preintegration-(Easy)-1.-Introduction/), so I think it would be good to refer to it, and I compared the IMU preintegration paper with the ORB-SLAM3 code to see how the formula in the paper is implemented in the code.

It would take a lot of time to write the IMU preintegration part in one article, so I would like to write it in the following order.

1. IMU sensor measurement integration
1. Defining the residual function
1. Definition of Jacobian matrix

This article will cover the code analysis of the first of them, IMU sensor measurement integration.


---

## Code analysis

### Integrating IMU Sensor Measurements

First, let's look at the part of the code that integrates the measurements between keyframe i and keyframe j by accumulating the acceleration and angular velocity measurements from the IMU sensor as they come in. During this process, the following values are computed

1. The relative state (rotation, translation, velocity) values between the two keyframes.
1. The covariance matrix used for noise propagation to perform optimization later on
1. A Jacobian matrix for updating the bias.
The overall calculation is performed in the IntegrateNewMeasurement function of the Preintegrated class. The complete function code is shown below.

```C++
void Preintegrated::IntegrateNewMeasurement(const Eigen::Vector3f &acceleration, const Eigen::Vector3f &angVel, const float &dt)
{
    mvMeasurements.push_back(integrable(acceleration,angVel,dt));

    // Position is updated firstly, as it depends on previously computed velocity and rotation.
    // Velocity is updated secondly, as it depends on previously computed rotation.
    // Rotation is the last to be updated.

    //Matrices to compute covariance
    Eigen::Matrix<float,9,9> A;
    A.setIdentity();
    Eigen::Matrix<float,9,6> B;
    B.setZero();

    Eigen::Vector3f acc, accW;
    acc << acceleration(0)-b.bax, acceleration(1)-b.bay, acceleration(2)-b.baz;
    accW << angVel(0)-b.bwx, angVel(1)-b.bwy, angVel(2)-b.bwz;

    avgA = (dT*avgA + dR*acc*dt)/(dT+dt);
    avgW = (dT*avgW + accW*dt)/(dT+dt);

    // Update delta position dP and velocity dV (rely on no-updated delta rotation)
    dP = dP + dV*dt + 0.5f*dR*acc*dt*dt;
    dV = dV + dR*acc*dt;

    // Compute velocity and position parts of matrices A and B (rely on non-updated delta rotation)
    Eigen::Matrix<float,3,3> Wacc = Sophus::SO3f::hat(acc);

    A.block<3,3>(3,0) = -dR*dt*Wacc;
    A.block<3,3>(6,0) = -0.5f*dR*dt*dt*Wacc;
    A.block<3,3>(6,3) = Eigen::DiagonalMatrix<float,3>(dt, dt, dt);
    B.block<3,3>(3,3) = dR*dt;
    B.block<3,3>(6,3) = 0.5f*dR*dt*dt;


    // Update position and velocity jacobians wrt bias correction
    JPa = JPa + JVa*dt -0.5f*dR*dt*dt;
    JPg = JPg + JVg*dt -0.5f*dR*dt*dt*Wacc*JRg;
    JVa = JVa - dR*dt;
    JVg = JVg - dR*dt*Wacc*JRg;

    // Update delta rotation
    IntegratedRotation dRi(angVel,b,dt);
    dR = NormalizeRotation(dR*dRi.deltaR);

    // Compute rotation parts of matrices A and B
    A.block<3,3>(0,0) = dRi.deltaR.transpose();
    B.block<3,3>(0,0) = dRi.rightJ*dt;

    // Update covariance
    C.block<9,9>(0,0) = A * C.block<9,9>(0,0) * A.transpose() + B*Nga*B.transpose();
    C.block<6,6>(9,9) += NgaWalk;

    // Update rotation jacobian wrt bias correction
    JRg = dRi.deltaR.transpose()*JRg - dRi.rightJ*dt;

    // Total integrated time
    dT += dt;
}
```

It's hard to understand at a glance because it's a jumbled mess of calculations, so let's take a look at the three parts mentioned above in order.


#### Relative motion increments

In the Imu preintegration paper, formula (33) defines the formula for relative motion increments.

$$
\begin{aligned}
\Delta \mathbf{R}_{ij} &\doteq \mathbf{R}_i^\top \mathbf{R}_j = \prod_{k=i}^{j-1} \mathrm{Exp} \left( \left( \tilde{\boldsymbol{\omega}}_k - \mathbf{b}_k^g - \boldsymbol{\eta}_k^{gd} \right) \Delta t \right) \\
\Delta \mathbf{v}_{ij} &\doteq \mathbf{R}_i^\top \left( \mathbf{v}_j - \mathbf{v}_i - \mathbf{g} \Delta t_{ij} \right) = \sum_{k=i}^{j-1} \Delta \mathbf{R}_{ik} \left( \tilde{\mathbf{a}}_k - \mathbf{b}_k^a - \boldsymbol{\eta}_k^{ad} \right) \Delta t \\
\Delta \mathbf{p}_{ij} &\doteq \mathbf{R}_i^\top \left( \mathbf{p}_j - \mathbf{p}_i - \mathbf{v}_i \Delta t_{ij} - \frac{1}{2} \sum_{k=i}^{j-1} \mathbf{g} \Delta t^2 \right) \\
&= \sum_{k=i}^{j-1} \left[ \Delta \mathbf{v}_{ik} \Delta t + \frac{1}{2} \Delta \mathbf{R}_{ik} \left( \tilde{\mathbf{a}}_k - \mathbf{b}_k^a - \boldsymbol{\eta}_k^{ad} \right) \Delta t^2 \right] \tag{33}
\end{aligned}
$$


First, the term for position during relative motion increments $\Delta \mathbf{p}_{ij} \doteq  \sum_{k=i}^{j-1} \left[ \Delta \mathbf{v}_{ik} \Delta t + \frac{1}{2} \Delta \mathbf{R}_{ik} \left( \tilde{\mathbf{a}}_k - \mathbf{b}^a_k - \boldsymbol{\eta}^{ad}_k \right) \Delta t^2 \right]$in the code.

```C++
    dP = dP + dV*dt + 0.5f*dR*acc*dt*dt;
```

Where acc represents the acceleration value in the form with the bias $\mathbf{b}^a_k$removed. The noise $\boldsymbol{\eta}^{ad}_k$is modeled separately and used to create the covariance matrix, so we don't need to consider it here. And you'll notice that the $\Sigma$ symbol, which represents the sum, is expressed in the code as dP = dP + something.


Next, we need to add the terms for velocity, $\Delta \mathbf{v}_{ij} \doteq \sum_{k=i}^{j-1} \Delta \mathbf{R}{ik} \left( \tilde{\mathbf{a}}_k - \mathbf{b}^a_k - \boldsymbol{\eta}^{ad}_k \right) \Delta t$in the code looks like this, where acc can also be thought of as the expression mentioned above.

```C++
    dV = dV + dR*acc*dt;
```


Next, we need to find the term for rotation, $\Delta \mathbf{R}_{ij} \doteq \mathbf{R}_i^\top \mathbf{R}_j = \prod_{k=i}^{j-1} \mathrm{Exp} \left( \left( \tilde{\boldsymbol{\omega}}_k - \mathbf{b}^g_k - \boldsymbol{\eta}^{gd}_k \right) \Delta t \right)$in the code. 

```C++
    IntegratedRotation dRi(angVel,b,dt);
    dR = NormalizeRotation(dR*dRi.deltaR);
```

This part looks a little different from the code in the paper, but if you look at the constructor part of the IntegratedRotation class, you can see that the formula is written in the paper.

```C++
IntegratedRotation::IntegratedRotation(const Eigen::Vector3f &angVel, const Bias &imuBias, const float &time) {
    const float x = (angVel(0)-imuBias.bwx)*time;
    const float y = (angVel(1)-imuBias.bwy)*time;
    const float z = (angVel(2)-imuBias.bwz)*time;

    const float d2 = x*x+y*y+z*z;
    const float d = sqrt(d2);

    Eigen::Vector3f v;
    v << x, y, z;
    Eigen::Matrix3f W = Sophus::SO3f::hat(v);
    if(d<eps)
    {
        deltaR = Eigen::Matrix3f::Identity() + W;
        rightJ = Eigen::Matrix3f::Identity();
    }
    else
    {
        deltaR = Eigen::Matrix3f::Identity() + W*sin(d)/d + W*W*(1.0f-cos(d))/d2;
        rightJ = Eigen::Matrix3f::Identity() - W*(1.0f-cos(d))/d2 + W*W*(d-sin(d))/(d2*d);
    }
}
```

Here, the $\left( \tilde{\boldsymbol{\omega}}_k - \mathbf{b}^g_k - \boldsymbol{\eta}^{gd}_k \right)$) part of the formula is the code below, and the

```C++
    const float x = (angVel(0)-imuBias.bwx)*time;
    const float y = (angVel(1)-imuBias.bwy)*time;
    const float z = (angVel(2)-imuBias.bwz)*time;
```

The code below is where the $\mathrm{Exp}()$function is written to represent the exponential map.

```C++
    Eigen::Matrix3f W = Sophus::SO3f::hat(v);
    if(d<eps)
    {
        deltaR = Eigen::Matrix3f::Identity() + W;
        rightJ = Eigen::Matrix3f::Identity();
    }
    else
    {
        deltaR = Eigen::Matrix3f::Identity() + W*sin(d)/d + W*W*(1.0f-cos(d))/d2;
        rightJ = Eigen::Matrix3f::Identity() - W*(1.0f-cos(d))/d2 + W*W*(d-sin(d))/(d2*d);
    }
```

Exponential maps are well described in the paper in equation (3).

$$
\exp(\boldsymbol{\phi}^{\wedge}) = \mathbf{I} + \frac{\sin(\lVert \boldsymbol{\phi} \rVert)}{\lVert \boldsymbol{\phi} \rVert} \boldsymbol{\phi}^{\wedge} + \frac{1 - \cos(\lVert \boldsymbol{\phi} \rVert)}{\lVert \boldsymbol{\phi} \rVert^2} \left( \boldsymbol{\phi}^{\wedge} \right)^2 \tag{3}
$$


Using these terms, we can accumulate the continuously incoming IMU sensor acceleration and angular velocity values and estimate the relative motion between keyframes i and j. This relative motion is later used to perform bundle adjustment using keyframes, or to perform pose estimation for a single camera frame.


#### Covariance from noise propagation

Next, we need matrices A and B for noise propagation, which we talk about in the paper in equation (62).

$$
\boldsymbol{\eta}_{ij}^\Delta = \mathbf{A}_{j-1} \boldsymbol{\eta}_{ij-1}^\Delta + \mathbf{B}_{j-1} \boldsymbol{\eta}_{j-1}^d, \tag{62}
$$

However, the paper doesn't explicitly say how the matrices A and B are constructed; instead, the paper says that they are

Recalling that $\boldsymbol{\eta}_{ik}^{\Delta} \doteq [\delta \boldsymbol{\phi}_{ik},\, \delta \mathbf{v}_{ik},\, \delta \mathbf{p}_{ik}]$, and defining the IMU measurement noise $\boldsymbol{\eta}_k^d = [\boldsymbol{\eta}_k^{gd} \;\; \boldsymbol{\eta}_k^{ad}]$, we can finally write Eqs. (59)-(61) in compact matrix form as:

Therefore, by the definitions of $\boldsymbol{\eta}_{ij}^\Delta$ $\boldsymbol{\eta}_{j-1}^d$it follows from equations (59)-(61) that $[\delta \boldsymbol{\phi}_{ij-1}, \delta \mathbf{v}_{ij-1}, \delta \mathbf{p}_{ij-1}]$and $[\boldsymbol{\eta}_{j-1}^{gd}, \boldsymbol{\eta}_{j-1}^{ad}]$], and the coefficient terms multiplied by $[\boldsymbol{\eta}_{j-1}^{gd}, \boldsymbol{\eta}_{j-1}^{ad}]$].

$$
\begin{bmatrix}\delta \boldsymbol{\phi}_{ij} \\\delta \mathbf{v}_{ij} \\\delta \mathbf{p}_{ij}\end{bmatrix}=\begin{bmatrix}\Delta \tilde{\mathbf{R}}_{j-1j}^\top & \mathbf{0} & \mathbf{0} \\-\Delta \tilde{\mathbf{R}}_{ij-1} \left( \tilde{\mathbf{a}}_{j-1} - \mathbf{b}^a_i \right) \Delta t & \mathbf{I} & \mathbf{0} \\-\frac{1}{2} \Delta \tilde{\mathbf{R}}_{ij-1} \left( \tilde{\mathbf{a}}_{j-1} - \mathbf{b}^a_i \right) \Delta t^2 & \Delta t \mathbf{I} & \mathbf{I}\end{bmatrix}\begin{bmatrix}\delta \boldsymbol{\phi}_{ij-1} \\\delta \mathbf{v}_{ij-1} \\\delta \mathbf{p}_{ij-1}\end{bmatrix}+\begin{bmatrix}\mathbf{J}_{r}^{j-1} & \mathbf{0} \\\mathbf{0} & \Delta \tilde{\mathbf{R}}_{ij-1} \Delta t \\\mathbf{0} & \frac{1}{2}\Delta \tilde{\mathbf{R}}_{ij-1} \Delta t^2\end{bmatrix}\begin{bmatrix}\boldsymbol{\eta}_{j-1}^{gd} \\\boldsymbol{\eta}_{j-1}^{ad}\end{bmatrix}
$$

If we look in the code for the parts of the formula that correspond to matrices A and B, we can see that

```C++
    // Compute velocity and position parts of matrices A and B (rely on non-updated delta rotation)
    Eigen::Matrix<float,3,3> Wacc = Sophus::SO3f::hat(acc);

    A.block<3,3>(3,0) = -dR*dt*Wacc;
    A.block<3,3>(6,0) = -0.5f*dR*dt*dt*Wacc;
    A.block<3,3>(6,3) = Eigen::DiagonalMatrix<float,3>(dt, dt, dt);
    B.block<3,3>(3,3) = dR*dt;
    B.block<3,3>(6,3) = 0.5f*dR*dt*dt;
    
    (...)
    
    // Compute rotation parts of matrices A and B
    A.block<3,3>(0,0) = dRi.deltaR.transpose();
    B.block<3,3>(0,0) = dRi.rightJ*dt;
```

If we compare the matrices A and B, we can see that the code is written the same as in the paper.


With matrices A and B organized, we can now find the covariance matrix.

$$
\Sigma_{ij} = \mathbf{A}_{j-1} \Sigma_{ij-1} \mathbf{A}_{j-1}^\top + \mathbf{B}_{j-1} \Sigma_{\eta} \mathbf{B}_{j-1}^\top \tag{63}
$$

```C++
    // Update covariance
    C.block<9,9>(0,0) = A * C.block<9,9>(0,0) * A.transpose() + B*Nga*B.transpose();
    C.block<6,6>(9,9) += NgaWalk;
```

Note that the $\Sigma$for the covariance matrix is represented by C in the code.

#### Jacobians used for the a bias update

Next, we need to calculate the Jacobians for the bias update. This part is unnumbered in the paper and is located above equation (70) in the Appendix. This is the result of differentiating the residual function by the acceleration and angular velocity bias terms.

$$
\begin{aligned}\frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g} &=- \sum_{k=i}^{j-1} \left[ \Delta \tilde{\mathbf{R}}_{k+1:j} (\bar{\mathbf{b}}_i)^\top \mathbf{J}_r^k \Delta t \right], \\\frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^a} &=- \sum_{k=i}^{j-1} \Delta \bar{\mathbf{R}}_{ik} \Delta t, \\\frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^g} &=- \sum_{k=i}^{j-1} \Delta \bar{\mathbf{R}}_{ik} \left( \tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a \right)^\wedge \frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \Delta t, \\\frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^g} &=\sum_{k=i}^{j-1} \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^g} \Delta t - \frac{1}{2} \Delta \bar{\mathbf{R}}_{ik} \Delta t^2, \\\frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^a} &=\sum_{k=i}^{j-1} \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^a} \Delta t - \frac{1}{2} \Delta \bar{\mathbf{R}}_{ik} \left( \tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a \right)^\wedge \frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \Delta t^2.\end{aligned}
$$

```C++
    // Update position and velocity jacobians wrt bias correction
    JPa = JPa + JVa*dt -0.5f*dR*dt*dt;
    JPg = JPg + JVg*dt -0.5f*dR*dt*dt*Wacc*JRg;
    JVa = JVa - dR*dt;
    JVg = JVg - dR*dt*Wacc*JRg;
    
    (...)
    
    // Update rotation jacobian wrt bias correction
    JRg = dRi.deltaR.transpose()*JRg - dRi.rightJ*dt;
```

Where JPa is $\frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^a}$, JPg is $\frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^g}$, JVa is $\frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^a}$, JVg represents $\frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^g}$, and JRg represents $\frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g}$. As you can see, the rotation values are only affected by the angular velocity bias, so we only perform a partial differentiation for the angular velocity bias. However, the velocity and position values are affected by both acceleration and angular velocity biases, so we perform a partial differentiation on both terms.

The Jacobian matrices here will be used to find the residual error, which will be discussed later.


---

## Wrapping up

We have seen how the first part of the imu preintegration in the ORB-SLAM3 code, the IMU sensor measurement integration, is implemented. In the measurement integration part, we (1) compute the relative state (rotation, translation, velocity) values between two keyframes, (2) obtain the covariance matrix that is used to perform the optimization through noise propagation. We also (3) compute the Jacobian matrix for updating the bias and use these values later when performing bundle adjustment using keyframes, or when performing pose estimation for a single camera frame.

Next time, we will see how the Jacobian matrix is implemented in the paper to define and optimize the residual function between two keyframes using these defined relative motion increments. 

Thanks for reading this long post :-) 

