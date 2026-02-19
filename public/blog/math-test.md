# KaTeX Math Rendering Test

> This is a template page to verify that all math rendering works correctly before writing the full blog post.

---

## 1. Inline Math

The rotation matrix $\mathbf{R} \in SO(3)$ satisfies $\mathbf{R}^T \mathbf{R} = \mathbf{I}$ and $\det(\mathbf{R}) = 1$.

The IMU provides angular velocity $\boldsymbol{\omega}$ and linear acceleration $\mathbf{a}$ measurements.

Greek letters: $\alpha, \beta, \gamma, \delta, \epsilon, \phi, \psi, \theta, \lambda, \mu, \sigma, \omega$

---

## 2. Block Math (Display Mode)

### Simple equation

$$
\tilde{\boldsymbol{\omega}}(t) = \boldsymbol{\omega}(t) + \mathbf{b}^g(t) + \boldsymbol{\eta}^g(t)
$$

### Fractions and subscripts

$$
\Delta \mathbf{p}_{ij} = \sum_{k=i}^{j-1} \left[ \Delta \mathbf{v}_{ik} \Delta t + \frac{1}{2} \Delta \mathbf{R}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}^a_i) \Delta t^2 \right]
$$

---

## 3. Aligned Equations

$$
\begin{aligned}
\Delta \mathbf{R}_{ij} &= \prod_{k=i}^{j-1} \text{Exp}\left((\tilde{\boldsymbol{\omega}}_k - \mathbf{b}^g_i) \Delta t\right) \\
\Delta \mathbf{v}_{ij} &= \sum_{k=i}^{j-1} \Delta \mathbf{R}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}^a_i) \Delta t \\
\Delta \mathbf{p}_{ij} &= \sum_{k=i}^{j-1} \left[ \Delta \mathbf{v}_{ik} \Delta t + \frac{1}{2} \Delta \mathbf{R}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}^a_i) \Delta t^2 \right]
\end{aligned}
$$

---

## 4. Matrix Notation

$$
SO(3) = \left\{ \mathbf{R} \in \mathbb{R}^{3 \times 3} \mid \mathbf{R}^T \mathbf{R} = \mathbf{I}, \det(\mathbf{R}) = 1 \right\}
$$

### Skew-symmetric matrix

$$
[\boldsymbol{\phi}]_\times = \begin{bmatrix} 0 & -\phi_3 & \phi_2 \\ \phi_3 & 0 & -\phi_1 \\ -\phi_2 & \phi_1 & 0 \end{bmatrix}
$$

### State transition matrix

$$
\mathbf{A}_k = \begin{bmatrix}
\Delta \tilde{\mathbf{R}}_{k,k+1}^T & \mathbf{0} & \mathbf{0} \\
-\Delta \tilde{\mathbf{R}}_{ik} [\tilde{\mathbf{a}}_k - \mathbf{b}^a_i]_\times \Delta t & \mathbf{I} & \mathbf{0} \\
-\frac{1}{2} \Delta \tilde{\mathbf{R}}_{ik} [\tilde{\mathbf{a}}_k - \mathbf{b}^a_i]_\times \Delta t^2 & \Delta t \mathbf{I} & \mathbf{I}
\end{bmatrix}
$$

---

## 5. Lie Group Operations

### Exponential map

$$
\mathbf{R} = \text{Exp}(\boldsymbol{\phi}) = \exp([\boldsymbol{\phi}]_\times) = \mathbf{I} + \frac{\sin\|\boldsymbol{\phi}\|}{\|\boldsymbol{\phi}\|} [\boldsymbol{\phi}]_\times + \frac{1 - \cos\|\boldsymbol{\phi}\|}{\|\boldsymbol{\phi}\|^2} [\boldsymbol{\phi}]_\times^2
$$

### Right Jacobian of $SO(3)$

$$
\mathbf{J}_r(\boldsymbol{\phi}) = \mathbf{I} - \frac{1 - \cos\|\boldsymbol{\phi}\|}{\|\boldsymbol{\phi}\|^2} [\boldsymbol{\phi}]_\times + \frac{\|\boldsymbol{\phi}\| - \sin\|\boldsymbol{\phi}\|}{\|\boldsymbol{\phi}\|^3} [\boldsymbol{\phi}]_\times^2
$$

### Adjoint map

$$
\mathbf{R} \cdot \text{Exp}(\delta \boldsymbol{\phi}) = \text{Exp}(\mathbf{R} \delta \boldsymbol{\phi}) \cdot \mathbf{R}
$$

---

## 6. Jacobian Derivation (Complex)

### Residual on manifold

$$
\mathbf{r}_{\Delta \mathbf{R}_{ij}} = \text{Log}\left( \left( \Delta \tilde{\mathbf{R}}_{ij} \cdot \text{Exp}\left( \frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g} \delta \mathbf{b}^g_i \right) \right)^T \mathbf{R}_i^T \mathbf{R}_j \right)
$$

### Perturbation and BCH linearization

$$
\frac{\partial \mathbf{r}_{\Delta \mathbf{R}_{ij}}}{\partial \delta \boldsymbol{\phi}_i} = -\mathbf{J}_r^{-1}\left(\mathbf{r}_{\Delta \mathbf{R}_{ij}}\right) \cdot \mathbf{R}_j^T \mathbf{R}_i
$$

$$
\frac{\partial \mathbf{r}_{\Delta \mathbf{R}_{ij}}}{\partial \delta \boldsymbol{\phi}_j} = \mathbf{J}_r^{-1}\left(\mathbf{r}_{\Delta \mathbf{R}_{ij}}\right)
$$

---

## 7. Code Block Test

```cpp
// From ORB-SLAM3: ImuTypes.cc
void Preintegrated::IntegrateNewMeasurement(
    const Eigen::Vector3f &acceleration,
    const Eigen::Vector3f &angVel,
    const float &dt)
{
    // Rotation preintegration
    Eigen::Matrix3f deltaR = ExpSO3((angVel - b.bg) * dt);
    dR = dR * deltaR;

    // Velocity and position preintegration
    Eigen::Vector3f acc = dR * (acceleration - b.ba);
    dp = dp + dv * dt + 0.5f * acc * dt * dt;
    dv = dv + acc * dt;
}
```

---

## 8. Table Test

| Symbol | Description | Dimension |
|--------|-------------|-----------|
| $\mathbf{R}_{WB}$ | World-to-Body rotation | $3 \times 3$ |
| $\mathbf{v}$ | Velocity in world frame | $3 \times 1$ |
| $\mathbf{p}$ | Position in world frame | $3 \times 1$ |
| $\mathbf{b}^g$ | Gyroscope bias | $3 \times 1$ |
| $\mathbf{b}^a$ | Accelerometer bias | $3 \times 1$ |
| $\boldsymbol{\eta}^g$ | Gyroscope noise | $3 \times 1$ |
| $\boldsymbol{\eta}^a$ | Accelerometer noise | $3 \times 1$ |

---

## 9. Mixed Inline and Block

The Lie algebra $\mathfrak{so}(3)$ maps to the Lie group $SO(3)$ via:

$$
\text{Exp}: \mathfrak{so}(3) \to SO(3), \quad \boldsymbol{\phi} \mapsto \exp([\boldsymbol{\phi}]_\times)
$$

The inverse map $\text{Log}: SO(3) \to \mathfrak{so}(3)$ extracts the rotation vector $\boldsymbol{\phi}$ from $\mathbf{R}$.

When the bias estimate changes from $\bar{\mathbf{b}}^g$ to $\bar{\mathbf{b}}^g + \delta \mathbf{b}^g$, we apply a first-order correction:

$$
\Delta \tilde{\mathbf{R}}_{ij}(\bar{\mathbf{b}}^g + \delta \mathbf{b}^g) \approx \Delta \tilde{\mathbf{R}}_{ij}(\bar{\mathbf{b}}^g) \cdot \text{Exp}\left(\frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g} \delta \mathbf{b}^g\right)
$$

This avoids the need to re-integrate all IMU measurements when the bias is updated during optimization.
