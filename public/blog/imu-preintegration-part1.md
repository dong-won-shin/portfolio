# A Deep Dive into IMU Preintegration (Part 1): Why Preintegration & the Math Behind It

> **Series Overview:** This is Part 1 of a 3-part series on IMU Preintegration in Visual-Inertial SLAM.
> - **Part 1 (this post):** Motivation & Mathematical Foundations
> - Part 2: The Preintegrated Measurement Model & Covariance Propagation
> - Part 3: Optimization on $SO(3)$ — Residuals, Jacobians & Conclusion

> **Note:** Throughout this series, we follow the notation and equations of **Forster et al., "On-Manifold Preintegration for Real-Time Visual-Inertial Odometry," IEEE Transactions on Robotics, 2017** [1]. This analysis aims to provide a step-by-step walkthrough of the paper's mathematical framework, making it accessible to engineers and researchers working on Visual-Inertial SLAM systems.

---

## 1. Introduction: Why IMU Preintegration?

### 1.1 Beyond Vision-Only SLAM

Visual SLAM (V-SLAM) systems that rely solely on camera data face several well-known limitations:

- **Scale ambiguity:** A monocular camera cannot recover the absolute scale of the scene. A hallway could be 3 meters or 30 meters wide — the reprojection error wouldn't tell the difference.
- **Motion blur:** During fast rotations or sudden accelerations, image features become smeared, causing tracking failures.
- **Low-texture environments:** Parking garages, white walls, and highways offer very few visual features to track.

An IMU (Inertial Measurement Unit) provides a complementary data source. It measures **angular velocity** $\boldsymbol{\omega}$ and **linear acceleration** $\mathbf{a}$ at high frequency (typically 200–1000 Hz), which directly addresses these weaknesses:

| Problem | How IMU Helps |
|---------|--------------|
| Scale ambiguity | Accelerometer provides metric-scale information |
| Motion blur | High-rate gyroscope maintains orientation during fast motion |
| Low-texture | IMU propagates state even when visual tracking is lost |

This is why modern V-SLAM systems like **ORB-SLAM3**, **VINS-Mono**, and **OKVIS** fuse camera and IMU data in a tightly-coupled manner.

### 1.2 The Naive Approach and Its Problem

Suppose we have a graph-based SLAM back-end. The state at each keyframe $i$ consists of:

$$
\mathbf{x}_i = \left\{ \mathbf{R}_i, \mathbf{v}_i, \mathbf{p}_i, \mathbf{b}_i^g, \mathbf{b}_i^a \right\}
$$

where $\mathbf{R}_i \in SO(3)$ is the rotation, $\mathbf{v}_i \in \mathbb{R}^3$ is the velocity, $\mathbf{p}_i \in \mathbb{R}^3$ is the position, and $\mathbf{b}_i^g, \mathbf{b}_i^a \in \mathbb{R}^3$ are the gyroscope and accelerometer biases.

Between two consecutive keyframes $i$ and $j$, we may have hundreds of IMU measurements. The **naive approach** would be to integrate all these measurements in the **world frame**:

$$
\begin{aligned}
\mathbf{R}_j &= \mathbf{R}_i \prod_{k=i}^{j-1} \text{Exp}\left( (\tilde{\boldsymbol{\omega}}_k - \mathbf{b}_k^g - \boldsymbol{\eta}_k^{gd}) \Delta t \right) \\
\mathbf{v}_j &= \mathbf{v}_i + \mathbf{g} \Delta t_{ij} + \sum_{k=i}^{j-1} \mathbf{R}_k (\tilde{\mathbf{a}}_k - \mathbf{b}_k^a - \boldsymbol{\eta}_k^{ad}) \Delta t \\
\mathbf{p}_j &= \mathbf{p}_i + \sum_{k=i}^{j-1} \left[ \mathbf{v}_k \Delta t + \frac{1}{2} \mathbf{g} \Delta t^2 + \frac{1}{2} \mathbf{R}_k (\tilde{\mathbf{a}}_k - \mathbf{b}_k^a - \boldsymbol{\eta}_k^{ad}) \Delta t^2 \right]
\end{aligned}
$$

Here, $\tilde{\boldsymbol{\omega}}_k$ and $\tilde{\mathbf{a}}_k$ are the raw IMU measurements at time $k$, $\boldsymbol{\eta}_k^{gd}$ and $\boldsymbol{\eta}_k^{ad}$ are the discrete-time noise terms, and $\Delta t$ is the time step between consecutive IMU readings.

**The problem:** In a graph-based optimizer (e.g., Gauss-Newton or Levenberg-Marquardt), the state estimates $\mathbf{R}_i, \mathbf{v}_i, \mathbf{p}_i$ are updated at **every iteration**. Since the integrated quantities on the right-hand side depend on $\mathbf{R}_i$, $\mathbf{v}_i$, and $\mathbf{b}_i$, we would need to **re-integrate all IMU measurements from scratch** every time the optimizer updates the state. With hundreds of IMU readings between keyframes and multiple optimization iterations, this becomes computationally prohibitive.

### 1.3 The Core Idea: Preintegration

The key insight of Lupton & Sukkarieh (2012) and later refined by Forster et al. (2017) is elegant:

> **Can we separate the IMU measurements from the absolute states, so that integration needs to happen only once?**

The answer is yes. By performing a **change of reference frame** — shifting from the world frame to the body frame at time $i$ — we can define **relative motion increments** $\Delta \mathbf{R}_{ij}, \Delta \mathbf{v}_{ij}, \Delta \mathbf{p}_{ij}$ that depend **only on the IMU measurements and biases**, not on $\mathbf{R}_i$, $\mathbf{v}_i$, $\mathbf{p}_i$, or $\mathbf{g}$.

These preintegrated measurements are computed **once** between each pair of keyframes. When the optimizer updates the states, the preintegrated values remain unchanged — only the **residual** (the difference between predicted and measured relative motion) needs to be recomputed, which is a constant-time operation.

This decoupling is the foundation of IMU preintegration, and deriving it properly requires the mathematical tools we develop in the next section.

> **💡 The "Meal Kit" Analogy: Why We Preintegrate**
> ![The Meal Kit Analogy](/blog/images/imu-preintegration-part1-figure1.png)
>
> To understand why we need IMU Preintegration, let's imagine you are a **Chef** (the Optimizer) in a busy restaurant.
>
> **🍳 Scenario A: Traditional Integration (Cooking from Scratch)**
>
> Every time a customer places an order (each optimization iteration), you have to start from the very beginning: peeling the potatoes, chopping the onions, and seasoning the meat.
>
> If the customer changes their mind about the base sauce (change in initial state/bias), you have to *throw everything away* and start peeling and chopping all over again.
>
> This is exactly what happens in traditional IMU integration—whenever the optimizer updates the robot's pose or bias, you are forced to re-integrate all the high-frequency IMU raw data from scratch. It is computationally expensive and slow.
>
> **📦 Scenario B: IMU Preintegration (The Meal Kit Approach)**
>
> Instead of waiting for the final order, you prepare a **Meal Kit** in advance. Between two Keyframes ($i$ and $j$), you chop the vegetables and portion the meat based on the raw sensor data you received.
>
> This "Meal Kit" represents the **Preintegrated Measurements** ($\Delta\mathbf{R}, \Delta\mathbf{v}, \Delta\mathbf{p}$). It captures the "relative change" in motion regardless of where the restaurant is located or what the starting temperature of the pan was.
>
> Now, when the Optimizer updates the starting pose or the bias, you don't need to re-chop the vegetables. You simply take your prepared Meal Kit and "cook" it by applying a small correction (the **First-order Bias Update**).
>
> **🔑 The Engineering Insight**
>
> In mathematical terms, the "Meal Kit" allows us to isolate the internal motion increments from the external states. By doing this, we achieve:
>
> - **Constant Computational Cost:** The heavy lifting (summing up hundreds of IMU samples) is done only once.
> - **Seamless Optimization:** The Optimizer can freely adjust the trajectory without triggering a massive re-calculation of the raw IMU data.
>

---

## 2. Mathematical Foundation: Manifold & Kinematics

### 2.1 Rotation on $SO(3)$

#### 2.1.1 The Special Orthogonal Group $SO(3)$

A 3D rotation is represented by a matrix $\mathbf{R}$ that belongs to the **Special Orthogonal Group**:

$$
SO(3) = \left\{ \mathbf{R} \in \mathbb{R}^{3 \times 3} \;\middle|\; \mathbf{R}^T \mathbf{R} = \mathbf{I}, \; \det(\mathbf{R}) = 1 \right\}
$$

$SO(3)$ is a **Lie group** — it is both a smooth manifold and a group under matrix multiplication. Importantly, $SO(3)$ is **not** a vector space. You cannot simply add two rotation matrices and expect to get a valid rotation. This non-linearity is what makes working with rotations fundamentally different from working with positions and velocities.

#### 2.1.2 The Lie Algebra $\mathfrak{so}(3)$

Every Lie group has an associated **Lie algebra** that lives in the tangent space at the identity element. For $SO(3)$, the Lie algebra $\mathfrak{so}(3)$ is the set of $3 \times 3$ skew-symmetric matrices:

$$
\mathfrak{so}(3) = \left\{ \boldsymbol{\phi}^\wedge \in \mathbb{R}^{3 \times 3} \;\middle|\; \boldsymbol{\phi} \in \mathbb{R}^3 \right\}
$$

where the **hat operator** $(\cdot)^\wedge$ maps a 3-vector to a skew-symmetric matrix:

$$
\boldsymbol{\phi}^\wedge = \begin{bmatrix} 0 & -\phi_3 & \phi_2 \\ \phi_3 & 0 & -\phi_1 \\ -\phi_2 & \phi_1 & 0 \end{bmatrix}
$$

This matrix has a useful property: $\boldsymbol{\phi}^\wedge \mathbf{v} = \boldsymbol{\phi} \times \mathbf{v}$ (cross product). Another identity that will be important later is the **skew-symmetric anticommutativity**:

$$
\mathbf{a}^\wedge \mathbf{b} = -\mathbf{b}^\wedge \mathbf{a}, \quad \forall \; \mathbf{a}, \mathbf{b} \in \mathbb{R}^3
$$

This follows directly from the cross product: $\mathbf{a} \times \mathbf{b} = -\mathbf{b} \times \mathbf{a}$. We will use this in Part 2 to rearrange the noise terms when isolating velocity and position noise.

#### 2.1.3 Exponential and Logarithmic Maps

The **exponential map** connects the Lie algebra to the Lie group:

$$
\text{Exp}: \mathbb{R}^3 \to SO(3), \quad \boldsymbol{\phi} \mapsto \text{Exp}(\boldsymbol{\phi})
$$

Its closed-form expression is given by the **Rodrigues' formula**:

$$
\text{Exp}(\boldsymbol{\phi}) = \mathbf{I} + \frac{\sin\|\boldsymbol{\phi}\|}{\|\boldsymbol{\phi}\|} \boldsymbol{\phi}^\wedge + \frac{1 - \cos\|\boldsymbol{\phi}\|}{\|\boldsymbol{\phi}\|^2} (\boldsymbol{\phi}^\wedge)^2
$$

A useful **first-order approximation** of the exponential map, valid when $\boldsymbol{\phi}$ is small, is:

$$
\text{Exp}(\boldsymbol{\phi}) \approx \mathbf{I} + \boldsymbol{\phi}^\wedge
$$

The inverse is the **logarithmic map**:

$$
\text{Log}: SO(3) \to \mathbb{R}^3, \quad \mathbf{R} \mapsto \boldsymbol{\phi}
$$

Together, these maps allow us to move between the manifold $SO(3)$ (where rotations live) and the vector space $\mathbb{R}^3$ (where we can do calculus).

#### 2.1.4 The Right Jacobian of $SO(3)$

When we compose a small perturbation with a rotation, we need the **right Jacobian** $\mathbf{J}_r$. It relates a small change in the Lie algebra to a change on the group:

$$
\text{Exp}(\boldsymbol{\phi} + \delta \boldsymbol{\phi}) \approx \text{Exp}(\boldsymbol{\phi}) \cdot \text{Exp}(\mathbf{J}_r(\boldsymbol{\phi}) \, \delta \boldsymbol{\phi})
$$

The closed-form expression is:

$$
\mathbf{J}_r(\boldsymbol{\phi}) = \mathbf{I} - \frac{1 - \cos\|\boldsymbol{\phi}\|}{\|\boldsymbol{\phi}\|^2} \boldsymbol{\phi}^\wedge + \frac{\|\boldsymbol{\phi}\| - \sin\|\boldsymbol{\phi}\|}{\|\boldsymbol{\phi}\|^3} (\boldsymbol{\phi}^\wedge)^2
$$

This Jacobian will play a critical role in Part 3 when we derive the optimization Jacobians. For now, remember this key identity that follows from the **Baker-Campbell-Hausdorff (BCH) approximation**:

$$
\text{Exp}(\boldsymbol{\phi}) \cdot \text{Exp}(\delta \boldsymbol{\phi}) \approx \text{Exp}(\boldsymbol{\phi} + \mathbf{J}_r^{-1}(\boldsymbol{\phi}) \, \delta \boldsymbol{\phi})
$$

#### 2.1.5 The Adjoint Representation

Another essential identity. Rotations and exponentials do **not** commute in general, but we can "move" a rotation past an exponential using the **Adjoint**. The fundamental relation is (**Eq. 10**):

$$
\mathbf{R} \, \text{Exp}(\boldsymbol{\phi}) \, \mathbf{R}^T = \text{Exp}(\mathbf{R} \boldsymbol{\phi})
$$

Multiplying both sides on the right by $\mathbf{R}$, or equivalently rearranging, gives the two useful forms:

$$
\mathbf{R} \cdot \text{Exp}(\boldsymbol{\phi}) = \text{Exp}(\mathbf{R} \boldsymbol{\phi}) \cdot \mathbf{R}, \qquad \text{Exp}(\boldsymbol{\phi}) \cdot \mathbf{R} = \mathbf{R} \cdot \text{Exp}(\mathbf{R}^T \boldsymbol{\phi})
$$

The second form (**Eq. 11**) is particularly useful: it lets us "push" a rotation matrix $\mathbf{R}$ through an exponential by transforming the argument with $\mathbf{R}^T$. This identity is used in Part 2 to isolate the noise terms in the preintegrated rotation (Eq. 35) and again extensively in the Jacobian derivations of Part 3.

### 2.2 IMU Measurement Model

An IMU consists of a 3-axis **gyroscope** and a 3-axis **accelerometer**. Their measurements in the body frame $B$ are:

$$
\begin{aligned}
\tilde{\boldsymbol{\omega}}(t) &= \boldsymbol{\omega}(t) + \mathbf{b}^g(t) + \boldsymbol{\eta}^g(t) \\
\tilde{\mathbf{a}}(t) &= \mathbf{R}_{WB}^T(t) \left(\mathbf{a}(t) - \mathbf{g}\right) + \mathbf{b}^a(t) + \boldsymbol{\eta}^a(t)
\end{aligned}
$$

where:
- $\boldsymbol{\omega}(t)$ is the true angular velocity in the body frame
- $\mathbf{a}(t)$ is the true acceleration in the world frame
- $\mathbf{g} = [0, 0, -9.81]^T$ is the gravity vector in the world frame
- $\mathbf{R}_{WB}(t)$ is the rotation from body to world frame
- $\mathbf{b}^g, \mathbf{b}^a$ are slowly varying **biases** (modeled as random walk)
- $\boldsymbol{\eta}^g, \boldsymbol{\eta}^a$ are **white Gaussian noise**

A key subtlety: the accelerometer measures **specific force**, not acceleration. It cannot distinguish between gravity and acceleration (Einstein's equivalence principle). The term $\mathbf{R}_{WB}^T (\mathbf{a} - \mathbf{g})$ reflects that the accelerometer measures the non-gravitational acceleration projected into the body frame.

### 2.3 IMU Kinematics in the World Frame

Given the IMU measurements, the continuous-time kinematic equations in the **world frame** are:

$$
\begin{aligned}
\dot{\mathbf{R}}_{WB}(t) &= \mathbf{R}_{WB}(t) \, \boldsymbol{\omega}(t)^\wedge \\
\dot{\mathbf{v}}(t) &= \mathbf{a}(t) \\
\dot{\mathbf{p}}(t) &= \mathbf{v}(t)
\end{aligned}
$$

Substituting the measurement model and integrating from time $i$ to time $j$ in discrete time (assuming $\tilde{\boldsymbol{\omega}}_k$ and $\tilde{\mathbf{a}}_k$ are constant in the interval $[t_k, t_{k+1})$), we obtain the equations corresponding to **Eq. (32) of Forster et al.**:

$$
\begin{aligned}
\mathbf{R}_j &= \mathbf{R}_i \prod_{k=i}^{j-1} \text{Exp}\left((\tilde{\boldsymbol{\omega}}_k - \mathbf{b}_k^g - \boldsymbol{\eta}_k^{gd}) \Delta t\right) \\[6pt]
\mathbf{v}_j &= \mathbf{v}_i + \mathbf{g} \Delta t_{ij} + \sum_{k=i}^{j-1} \mathbf{R}_k \left(\tilde{\mathbf{a}}_k - \mathbf{b}_k^a - \boldsymbol{\eta}_k^{ad} \right) \Delta t \\[6pt]
\mathbf{p}_j &= \mathbf{p}_i + \sum_{k=i}^{j-1} \left[\mathbf{v}_k \Delta t + \frac{1}{2}\mathbf{g} \Delta t^2 + \frac{1}{2}\mathbf{R}_k \left(\tilde{\mathbf{a}}_k - \mathbf{b}_k^a - \boldsymbol{\eta}_k^{ad}\right) \Delta t^2 \right]
\end{aligned}
$$

where:
- $\Delta t_{ij} = t_j - t_i$ is the total time between the two keyframes
- $\boldsymbol{\eta}_k^{gd}$ and $\boldsymbol{\eta}_k^{ad}$ are the **discrete-time** noise terms for gyroscope and accelerometer respectively (related to the continuous-time noise densities by $\boldsymbol{\eta}^{gd} \sim \mathcal{N}(\mathbf{0}, \frac{1}{\Delta t}\boldsymbol{\Sigma}_g)$ and $\boldsymbol{\eta}^{ad} \sim \mathcal{N}(\mathbf{0}, \frac{1}{\Delta t}\boldsymbol{\Sigma}_a)$)
- Biases are assumed constant between keyframes (a reasonable assumption since keyframes are typically 0.1–0.5 seconds apart, while biases change on the order of hours)

Notice the problem we discussed in Section 1.2: $\mathbf{R}_k$ appears inside the summation. Since $\mathbf{R}_k$ depends on $\mathbf{R}_i$ and all previous IMU measurements, the entire integration is coupled to the state $\mathbf{R}_i$.

### 2.4 The Change of Coordinates: From World to Body Frame

Here is where the magic happens. We **isolate the terms that depend only on IMU measurements** by rearranging the kinematic equations.

**For rotation**, we simply read off the product term:

$$
\Delta \mathbf{R}_{ij} \triangleq \mathbf{R}_i^T \mathbf{R}_j = \prod_{k=i}^{j-1} \text{Exp}\left((\tilde{\boldsymbol{\omega}}_k - \mathbf{b}_k^g - \boldsymbol{\eta}_k^{gd}) \Delta t\right)
$$

**For velocity**, we left-multiply both sides by $\mathbf{R}_i^T$ and rearrange:

$$
\Delta \mathbf{v}_{ij} \triangleq \mathbf{R}_i^T \left(\mathbf{v}_j - \mathbf{v}_i - \mathbf{g} \Delta t_{ij}\right) = \sum_{k=i}^{j-1} \Delta \mathbf{R}_{ik} \left(\tilde{\mathbf{a}}_k - \mathbf{b}_k^a - \boldsymbol{\eta}_k^{ad}\right) \Delta t
$$

**For position**, similarly:

$$
\Delta \mathbf{p}_{ij} \triangleq \mathbf{R}_i^T \left(\mathbf{p}_j - \mathbf{p}_i - \mathbf{v}_i \Delta t_{ij} - \frac{1}{2}\sum_{k=i}^{j-1}{\mathbf{g} \Delta t^2}\right) = \sum_{k=i}^{j-1} \left[\Delta \mathbf{v}_{ik} \Delta t + \frac{1}{2}\Delta \mathbf{R}_{ik} \left(\tilde{\mathbf{a}}_k - \mathbf{b}_k^a - \boldsymbol{\eta}_k^{ad}\right) \Delta t^2 \right]
$$

These correspond to **Eq. (33) of Forster et al.** The critical observation: **the right-hand sides** ($\Delta \mathbf{R}_{ij}$, $\Delta \mathbf{v}_{ij}$, $\Delta \mathbf{p}_{ij}$) depend only on:
1. The raw IMU measurements ($\tilde{\boldsymbol{\omega}}_k$, $\tilde{\mathbf{a}}_k$)
2. The bias estimates ($\mathbf{b}_k^g$, $\mathbf{b}_k^a$)
3. The noise terms ($\boldsymbol{\eta}_k^{gd}$, $\boldsymbol{\eta}_k^{ad}$)

They do **not** depend on $\mathbf{R}_i$, $\mathbf{v}_i$, $\mathbf{p}_i$, or $\mathbf{g}$. Since the noise terms are unknown but zero-mean, we compute the preintegrated measurements by **dropping the noise terms** and later model their effect through covariance propagation (detailed in Part 2).

The **left-hand sides** express the predicted relative motion in terms of the state variables. During optimization, only these left-hand sides need to be recomputed when states are updated.

---

## What's Next?

In **Part 2**, we will:
- **Isolate the noise** from the preintegrated measurements by factoring out zero-mean noise terms, obtaining the measurement model $\Delta \tilde{\mathbf{R}}_{ij}$, $\Delta \tilde{\mathbf{v}}_{ij}$, $\Delta \tilde{\mathbf{p}}_{ij}$ with explicit noise separation
- Show how to handle **bias updates** via first-order Taylor expansion (avoiding re-integration)
- Derive the **error-state propagation** and the covariance matrix $\boldsymbol{\Sigma}_{ij}$ that quantifies the uncertainty of the preintegrated measurements

---

## References

1. C. Forster, L. Carlone, F. Dellaert, and D. Scaramuzza, "[On-Manifold Preintegration for Real-Time Visual-Inertial Odometry](https://ieeexplore.ieee.org/document/7557075/)," *IEEE Transactions on Robotics*, vol. 33, no. 1, pp. 1–21, 2017.
2. T. Lupton and S. Sukkarieh, "[Visual-Inertial-Aided Navigation for High-Dynamic Motion in Built Environments Without Initial Conditions](https://ieeexplore.ieee.org/document/6092505/)," *IEEE Transactions on Robotics*, vol. 28, no. 1, pp. 61–76, 2012.
3. C. Campos, R. Elvira, J. J. G. Rodriguez, J. M. M. Montiel, and J. D. Tardos, "[ORB-SLAM3: An Accurate Open-Source Library for Visual, Visual-Inertial, and Multimap SLAM](https://ieeexplore.ieee.org/document/9440682/)," *IEEE Transactions on Robotics*, vol. 37, no. 6, pp. 1874–1890, 2021.
