# A Deep Dive into IMU Preintegration (Part 3): Residuals, Jacobians & the Gauss-Newton System

> **Series Overview:** This is Part 3 of a 3-part series on IMU Preintegration in Visual-Inertial SLAM.
> - [Part 1](/blog/imu-preintegration-part1): Motivation & Mathematical Foundations
> - [Part 2](/blog/imu-preintegration-part2): The Preintegrated Measurement Model & Covariance Propagation
> - **Part 3 (this post):** Optimization on $SO(3)$ — Residuals, Jacobians & the Gauss-Newton System

> **Note:** Throughout this series, we follow the notation and equations of **Forster et al., "On-Manifold Preintegration for Real-Time Visual-Inertial Odometry," IEEE Transactions on Robotics, 2017** [1]. This analysis aims to provide a step-by-step walkthrough of the paper's mathematical framework, making it accessible to engineers and researchers working on Visual-Inertial SLAM systems.

---

## 6. The IMU Factor: Residual Functions

### 6.1 From Preintegration to Optimization

In Parts 1 and 2, we built up the entire preintegration machinery:

- **Part 1:** Defined preintegrated measurements $\Delta \tilde{\mathbf{R}}_{ij}$, $\Delta \tilde{\mathbf{v}}_{ij}$, $\Delta \tilde{\mathbf{p}}_{ij}$ that are independent of the absolute states $\mathbf{R}_i, \mathbf{v}_i, \mathbf{p}_i$
- **Part 2:** Isolated the noise into a zero-mean Gaussian vector with covariance $\boldsymbol{\Sigma}_{ij}$, derived the iterative covariance propagation, and established bias correction formulas that avoid re-integration

Now we complete the pipeline: how do we actually **use** these preintegrated measurements in an optimizer?

In a factor graph SLAM system, the state at each keyframe $i$ is:

$$
\mathcal{X}_i = \left\{ \mathbf{R}_i,\; \mathbf{v}_i,\; \mathbf{p}_i,\; \mathbf{b}_i^g,\; \mathbf{b}_i^a \right\}
$$

where $\mathbf{R}_i \in SO(3)$ is the orientation, $\mathbf{v}_i, \mathbf{p}_i \in \mathbb{R}^3$ are velocity and position, and $\mathbf{b}_i^g, \mathbf{b}_i^a \in \mathbb{R}^3$ are the gyroscope and accelerometer biases. The full state is $\mathcal{X} = \{\mathcal{X}_0, \mathcal{X}_1, \ldots, \mathcal{X}_n\}$ across all keyframes.

The **IMU factor** between keyframes $i$ and $j$ is a constraint that says: *"the preintegrated IMU measurements should be consistent with the estimated states at $i$ and $j$."* The **residual** quantifies the mismatch — and the optimizer adjusts the states to minimize it.

### 6.2 The IMU Residual (**Eq. 45** of Forster et al.)

The preintegrated measurement model from Part 2 (**Eq. 38**) tells us the relationship between the true relative motion and the preintegrated measurements:

$$
\begin{aligned}
\Delta \tilde{\mathbf{R}}_{ij} &= \mathbf{R}_i^T \mathbf{R}_j \cdot \text{Exp}(\delta\boldsymbol{\phi}_{ij}) \\[4pt]
\Delta \tilde{\mathbf{v}}_{ij} &= \mathbf{R}_i^T(\mathbf{v}_j - \mathbf{v}_i - \mathbf{g}\Delta t_{ij}) + \delta\mathbf{v}_{ij} \\[4pt]
\Delta \tilde{\mathbf{p}}_{ij} &= \mathbf{R}_i^T(\mathbf{p}_j - \mathbf{p}_i - \mathbf{v}_i \Delta t_{ij} - \tfrac{1}{2}\mathbf{g}\Delta t_{ij}^2) + \delta\mathbf{p}_{ij}
\end{aligned}
$$

where $\delta\boldsymbol{\phi}_{ij}$, $\delta\mathbf{v}_{ij}$, $\delta\mathbf{p}_{ij}$ are zero-mean Gaussian noise. From here, the **residual** is defined as the "predicted minus measured" discrepancy, evaluated at the current state estimates:

$$
\boxed{\mathbf{r}_{\mathcal{B}_{ij}} \triangleq \begin{bmatrix} \mathbf{r}_{\Delta \mathbf{R}_{ij}} \\[4pt] \mathbf{r}_{\Delta \mathbf{v}_{ij}} \\[4pt] \mathbf{r}_{\Delta \mathbf{p}_{ij}} \end{bmatrix} = \begin{bmatrix} \text{Log}\left(\left(\Delta \tilde{\mathbf{R}}_{ij}\right)^T \mathbf{R}_i^T \mathbf{R}_j\right) \\[4pt] \mathbf{R}_i^T\left(\mathbf{v}_j - \mathbf{v}_i - \mathbf{g}\Delta t_{ij}\right) - \Delta \tilde{\mathbf{v}}_{ij} \\[4pt] \mathbf{R}_i^T\left(\mathbf{p}_j - \mathbf{p}_i - \mathbf{v}_i \Delta t_{ij} - \tfrac{1}{2}\mathbf{g}\Delta t_{ij}^2\right) - \Delta \tilde{\mathbf{p}}_{ij} \end{bmatrix}}
$$

where $\Delta \tilde{\mathbf{R}}_{ij}$, $\Delta \tilde{\mathbf{v}}_{ij}$, $\Delta \tilde{\mathbf{p}}_{ij}$ include the bias correction from Part 2 (Section 4.5, **Eqs. 65–68**).

Let us break down what each component measures:

**Rotation residual:** $\mathbf{r}_{\Delta R} = \text{Log}\left(\Delta \tilde{\mathbf{R}}_{ij}^T \, \mathbf{R}_i^T \mathbf{R}_j\right)$

The matrix $\Delta \tilde{\mathbf{R}}_{ij}^T \mathbf{R}_i^T \mathbf{R}_j$ is the **error rotation** — the discrepancy between the measured relative rotation ($\Delta \tilde{\mathbf{R}}_{ij}$) and the predicted relative rotation ($\mathbf{R}_i^T \mathbf{R}_j$). The $\text{Log}(\cdot)$ maps this error rotation from $SO(3)$ to a 3-vector in the tangent space $\mathbb{R}^3$ — this projection is necessary because the residual must be a vector for least-squares optimization. When the measurement perfectly matches the states, this matrix equals $\mathbf{I}$ and the residual is $\mathbf{0}$.

**Velocity residual:** $\mathbf{r}_{\Delta v} = \mathbf{R}_i^T(\mathbf{v}_j - \mathbf{v}_i - \mathbf{g}\Delta t_{ij}) - \Delta \tilde{\mathbf{v}}_{ij}$

The first term is the predicted velocity change (expressed in frame $i$), and the second is the measured velocity change from preintegration. No $\text{Log}$ map is needed since velocity lives in $\mathbb{R}^3$ — the residual is simply a vector subtraction.

**Position residual:** $\mathbf{r}_{\Delta p} = \mathbf{R}_i^T(\mathbf{p}_j - \mathbf{p}_i - \mathbf{v}_i \Delta t_{ij} - \frac{1}{2}\mathbf{g}\Delta t_{ij}^2) - \Delta \tilde{\mathbf{p}}_{ij}$

Same structure as velocity: predicted minus measured position change, expressed in frame $i$.

> **💡 Understanding Residuals and Jacobians: The Shower Analogy**
> ![The Shower Analogy](/blog/images/imu-preintegration-part3-figure1.png)
>
> Imagine you are standing in a dark shower, eyes closed, trying to adjust the water temperature to your target (e.g., a perfect 38°C).
>
> **1. The Residual ($\mathbf{r}$): "How far am I from the goal?"**
> The residual is simply the error — the difference between where you are and where you want to be. You want 38°C, but the water hitting your back is currently 30°C. The residual is $38°\text{C} - 30°\text{C} = 8°\text{C}$. In optimization (like Visual-Inertial SLAM), the goal is to minimize this value until it reaches near zero. If the residual is large, the system knows it has a lot of "correcting" to do.
>
> **2. The Jacobian ($\mathbf{J}$): "How sensitive is the handle?"**
> The Jacobian represents *sensitivity*. It tells you how a tiny change in the input (the handle) leads to a change in the output (the temperature). You nudge the shower handle by just 1 degree — if the temperature jumps by 5°C, the Jacobian is **large** (high sensitivity); if the temperature only moves by 0.1°C, the Jacobian is **small** (low sensitivity). The Jacobian is the matrix of first-order partial derivatives. It provides the "gradient" — the direction of steepest descent. Without it, the optimizer wouldn't know if it should turn the handle a lot or just a tiny bit to fix the residual.
>
> **3. The Optimization Loop (putting it together):**
> This is how an algorithm (like Gauss-Newton or Levenberg-Marquardt) uses these two pieces of information to reach the goal:
> - **Check Residual:** "I am 8°C too cold. I need to get warmer."
> - **Consult Jacobian:** "Based on my last move, I know that turning the handle 10° right usually raises the temperature by 8°C."
> - **The Update (the nudge):** You turn the handle exactly 10°.
> - **Repeat:** You check the temperature again. If it's now 38.2°C, your new residual is $-0.2°\text{C}$. You use the Jacobian again to make a tiny micro-adjustment.
>
> This iterative loop — *measure error, compute sensitivity, nudge, repeat* — is exactly what happens in the Gauss-Newton system we assemble in Section 8.

### 6.3 The Bias Random Walk Residual

In addition to the IMU preintegration residual, the factor graph includes a **bias evolution constraint** between consecutive keyframes. The biases are modeled as a random walk:

$$
\mathbf{b}_j = \mathbf{b}_i + \boldsymbol{\eta}^{bd}
$$

where $\boldsymbol{\eta}^{bd} \sim \mathcal{N}(\mathbf{0}, \boldsymbol{\Sigma}_{b} \Delta t_{ij})$ models the slow drift of the biases. The corresponding residual is:

$$
\mathbf{r}_{\mathbf{b}_{ij}} = \begin{bmatrix} \mathbf{b}_j^g - \mathbf{b}_i^g \\ \mathbf{b}_j^a - \mathbf{b}_i^a \end{bmatrix} \in \mathbb{R}^6
$$

The Jacobians of this residual are trivial: $+\mathbf{I}$ with respect to $\mathbf{b}_j$ and $-\mathbf{I}$ with respect to $\mathbf{b}_i$. We will therefore focus our attention on the much more interesting IMU preintegration Jacobians.

---

## 7. Jacobians of the IMU Residual

### 7.1 Why We Need Jacobians

The Gauss-Newton algorithm minimizes the cost function by iteratively **linearizing** the residual around the current state estimate:

$$
\mathbf{r}(\mathcal{X} \oplus \delta\mathcal{X}) \approx \mathbf{r}(\hat{\mathcal{X}}) + \mathbf{J} \, \delta\mathcal{X}
$$

where $\oplus$ denotes the manifold update (right multiplication via $\text{Exp}$ for $SO(3)$, addition for $\mathbb{R}^n$), and $\mathbf{J}$ is the **Jacobian matrix** of the residual with respect to the state perturbation.

Computing these Jacobians is the most mathematically involved part of the entire preintegration framework. We will need all three $SO(3)$ tools from Part 1:

- **Adjoint identity** (Section 2.1.5): $\text{Exp}(\boldsymbol{\phi}) \cdot \mathbf{R} = \mathbf{R} \cdot \text{Exp}(\mathbf{R}^T \boldsymbol{\phi})$
- **BCH approximation** (Section 2.1.4): $\text{Log}(\text{Exp}(\boldsymbol{\phi}) \cdot \text{Exp}(\delta\boldsymbol{\phi})) \approx \boldsymbol{\phi} + \mathbf{J}_r^{-1}(\boldsymbol{\phi}) \, \delta\boldsymbol{\phi}$
- **First-order Exp** (Section 2.1.3): $\text{Exp}(\delta\boldsymbol{\phi}) \approx \mathbf{I} + \delta\boldsymbol{\phi}^\wedge$ for small $\delta\boldsymbol{\phi}$

### 7.2 The Perturbation Model

To compute the Jacobians, we apply small perturbations to each state variable and observe the first-order effect on the residual. The perturbation model is:

$$
\begin{aligned}
\mathbf{R}_i &\leftarrow \mathbf{R}_i \, \text{Exp}(\delta\boldsymbol{\phi}_i) & &\text{(right perturbation on } SO(3)\text{)} \\
\mathbf{v}_i &\leftarrow \mathbf{v}_i + \delta\mathbf{v}_i & &\text{(additive in world frame)} \\
\mathbf{p}_i &\leftarrow \mathbf{p}_i + \mathbf{R}_i \, \delta\mathbf{p}_i & &\text{(body-frame perturbation)} \\
\mathbf{b}_i^g &\leftarrow \mathbf{b}_i^g + \delta\mathbf{b}_i^g & &\text{(additive in } \mathbb{R}^3\text{)} \\
\mathbf{b}_i^a &\leftarrow \mathbf{b}_i^a + \delta\mathbf{b}_i^a & &\text{(additive in } \mathbb{R}^3\text{)}
\end{aligned}
$$

and similarly for keyframe $j$. The **right perturbation** for rotation is a deliberate choice — it means the perturbation is expressed in the **body frame** at time $i$, which is consistent with how we defined the preintegrated measurements. Following Forster et al., the **position perturbation** is also expressed in the body frame: $\delta\mathbf{p}_i$ is a displacement in the body frame, and $\mathbf{R}_i \delta\mathbf{p}_i$ transforms it to the world frame. This convention simplifies the resulting Jacobians (as we will see, $\frac{\partial \mathbf{r}_{\Delta p}}{\partial \delta\mathbf{p}_i} = -\mathbf{I}$ instead of $-\mathbf{R}_i^T$).

The full perturbation vector for the IMU factor between keyframes $i$ and $j$ is:

$$
\delta\boldsymbol{\xi} = \begin{bmatrix} \delta\boldsymbol{\phi}_i \\ \delta\mathbf{v}_i \\ \delta\mathbf{p}_i \\ \delta\mathbf{b}_i^g \\ \delta\mathbf{b}_i^a \\ \delta\boldsymbol{\phi}_j \\ \delta\mathbf{v}_j \\ \delta\mathbf{p}_j \end{bmatrix} \in \mathbb{R}^{24}
$$

The Jacobian we seek is the $9 \times 24$ matrix:

$$
\mathbf{J} = \frac{\partial \mathbf{r}_{\mathcal{B}_{ij}}}{\partial \delta\boldsymbol{\xi}}
$$

We now derive each block, row by row.

### 7.3 Rotation Residual Jacobians

The rotation residual is:

$$
\mathbf{r}_{\Delta R} = \text{Log}\left(\Delta \tilde{\mathbf{R}}_{ij}^T \, \mathbf{R}_i^T \, \mathbf{R}_j\right)
$$

This is the most technically interesting case because it requires working entirely on the $SO(3)$ manifold.

#### With respect to $\delta\boldsymbol{\phi}_i$ (rotation at keyframe $i$)

Perturb $\mathbf{R}_i \to \mathbf{R}_i \, \text{Exp}(\delta\boldsymbol{\phi}_i)$:

$$
\mathbf{r}_{\Delta R}' = \text{Log}\left(\Delta \tilde{\mathbf{R}}_{ij}^T \, \text{Exp}(\delta\boldsymbol{\phi}_i)^T \, \mathbf{R}_i^T \, \mathbf{R}_j\right)
$$

Since $\text{Exp}(\delta\boldsymbol{\phi}_i)^T = \text{Exp}(-\delta\boldsymbol{\phi}_i)$:

$$
= \text{Log}\left(\Delta \tilde{\mathbf{R}}_{ij}^T \, \text{Exp}(-\delta\boldsymbol{\phi}_i) \, \mathbf{R}_i^T \mathbf{R}_j\right)
$$

**Step 1: Adjoint swap.** We need to move $\text{Exp}(-\delta\boldsymbol{\phi}_i)$ past $\mathbf{R}_i^T \mathbf{R}_j$ to the right. Apply the **Adjoint identity** from Part 1 (Section 2.1.5), $\text{Exp}(\boldsymbol{\phi}) \cdot \mathbf{R} = \mathbf{R} \cdot \text{Exp}(\mathbf{R}^T \boldsymbol{\phi})$:

$$
\text{Exp}(-\delta\boldsymbol{\phi}_i) \cdot \mathbf{R}_i^T \mathbf{R}_j = \mathbf{R}_i^T \mathbf{R}_j \cdot \text{Exp}\left(-\mathbf{R}_j^T \mathbf{R}_i \, \delta\boldsymbol{\phi}_i\right)
$$

Substituting back:

$$
= \text{Log}\left(\underbrace{\Delta \tilde{\mathbf{R}}_{ij}^T \, \mathbf{R}_i^T \mathbf{R}_j}_{\text{Exp}(\mathbf{r}_{\Delta R})} \cdot \text{Exp}\left(-\mathbf{R}_j^T \mathbf{R}_i \, \delta\boldsymbol{\phi}_i\right)\right)
$$

**Step 2: BCH linearization.** Apply the **BCH approximation** from Part 1 (Section 2.1.4), $\text{Log}(\text{Exp}(\boldsymbol{\phi}) \cdot \text{Exp}(\delta\boldsymbol{\phi})) \approx \boldsymbol{\phi} + \mathbf{J}_r^{-1}(\boldsymbol{\phi}) \, \delta\boldsymbol{\phi}$:

$$
\approx \mathbf{r}_{\Delta R} + \mathbf{J}_r^{-1}(\mathbf{r}_{\Delta R}) \left(-\mathbf{R}_j^T \mathbf{R}_i\right) \delta\boldsymbol{\phi}_i
$$

Reading off the Jacobian:

$$
\boxed{\frac{\partial \mathbf{r}_{\Delta R}}{\partial \delta\boldsymbol{\phi}_i} = -\mathbf{J}_r^{-1}(\mathbf{r}_{\Delta R}) \, \mathbf{R}_j^T \mathbf{R}_i}
$$

#### With respect to $\delta\boldsymbol{\phi}_j$ (rotation at keyframe $j$)

Perturb $\mathbf{R}_j \to \mathbf{R}_j \, \text{Exp}(\delta\boldsymbol{\phi}_j)$:

$$
\mathbf{r}_{\Delta R}' = \text{Log}\left(\Delta \tilde{\mathbf{R}}_{ij}^T \, \mathbf{R}_i^T \, \mathbf{R}_j \, \text{Exp}(\delta\boldsymbol{\phi}_j)\right) = \text{Log}\left(\text{Exp}(\mathbf{r}_{\Delta R}) \cdot \text{Exp}(\delta\boldsymbol{\phi}_j)\right)
$$

This is already in the form required by the BCH approximation — the perturbation $\text{Exp}(\delta\boldsymbol{\phi}_j)$ appears on the **right**, so no Adjoint swap is needed:

$$
\approx \mathbf{r}_{\Delta R} + \mathbf{J}_r^{-1}(\mathbf{r}_{\Delta R}) \, \delta\boldsymbol{\phi}_j
$$

$$
\boxed{\frac{\partial \mathbf{r}_{\Delta R}}{\partial \delta\boldsymbol{\phi}_j} = \mathbf{J}_r^{-1}(\mathbf{r}_{\Delta R})}
$$

> **Observation:** The $\delta\boldsymbol{\phi}_j$ Jacobian has the simplest form — it is just $\mathbf{J}_r^{-1}$ applied to the identity. This is because the perturbation at $j$ enters the residual in exactly the "right" position, without needing to pass through any other rotations. By contrast, the $\delta\boldsymbol{\phi}_i$ perturbation must be moved through $\mathbf{R}_i^T \mathbf{R}_j$ via the Adjoint identity, picking up the factor $\mathbf{R}_j^T \mathbf{R}_i$.

#### With respect to $\delta\mathbf{b}_i^g$ (gyroscope bias)

From the bias correction formula (Part 2, Section 4.5, **Eq. 68**):

$$
\Delta \tilde{\mathbf{R}}_{ij}(\hat{\mathbf{b}}_i^g) \approx \Delta \bar{\mathbf{R}}_{ij} \cdot \text{Exp}\left(\frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g} \, \delta\mathbf{b}_i^g\right)
$$

Taking the transpose:

$$
\Delta \tilde{\mathbf{R}}_{ij}^T = \text{Exp}\left(-\frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g} \, \delta\mathbf{b}_i^g\right) \, \Delta \bar{\mathbf{R}}_{ij}^T
$$

Substituting into the residual:

$$
\mathbf{r}_{\Delta R}' = \text{Log}\left(\text{Exp}\left(-\frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g} \, \delta\mathbf{b}_i^g\right) \, \underbrace{\Delta \bar{\mathbf{R}}_{ij}^T \, \mathbf{R}_i^T \mathbf{R}_j}_{\text{Exp}(\bar{\mathbf{r}}_{\Delta R})}\right)
$$

**Step 1: Adjoint swap.** Apply the Adjoint identity to move the bias perturbation past $\text{Exp}(\bar{\mathbf{r}}_{\Delta R})$. Let $\mathbf{d} = \frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g} \delta\mathbf{b}_i^g$ and $\mathbf{M} = \text{Exp}(\bar{\mathbf{r}}_{\Delta R})$:

$$
\text{Exp}(-\mathbf{d}) \cdot \mathbf{M} = \mathbf{M} \cdot \text{Exp}\left(-\mathbf{M}^T \mathbf{d}\right)
$$

Since $\mathbf{M}^T = \text{Exp}(\bar{\mathbf{r}}_{\Delta R})^T = \text{Exp}(-\bar{\mathbf{r}}_{\Delta R})$:

$$
= \text{Log}\left(\text{Exp}(\bar{\mathbf{r}}_{\Delta R}) \cdot \text{Exp}\left(-\text{Exp}(-\bar{\mathbf{r}}_{\Delta R}) \, \frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g} \, \delta\mathbf{b}_i^g\right)\right)
$$

**Step 2: BCH linearization.**

$$
\approx \bar{\mathbf{r}}_{\Delta R} - \mathbf{J}_r^{-1}(\bar{\mathbf{r}}_{\Delta R}) \, \text{Exp}(-\bar{\mathbf{r}}_{\Delta R}) \, \frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g} \, \delta\mathbf{b}_i^g
$$

$$
\boxed{\frac{\partial \mathbf{r}_{\Delta R}}{\partial \delta\mathbf{b}_i^g} = -\mathbf{J}_r^{-1}(\mathbf{r}_{\Delta R}) \, \text{Exp}(-\mathbf{r}_{\Delta R}) \, \frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g}}
$$

where $\frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g}$ is the rotation-bias Jacobian computed during preintegration (Part 2, Section 4.5).

> **Practical simplification:** Near convergence, $\mathbf{r}_{\Delta R} \approx \mathbf{0}$, so $\mathbf{J}_r^{-1}(\mathbf{r}_{\Delta R}) \approx \mathbf{I}$ and $\text{Exp}(-\mathbf{r}_{\Delta R}) \approx \mathbf{I}$. The bias Jacobian simplifies to $-\frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g}$. Many practical implementations (including GTSAM and ORB-SLAM3) use this approximation.

#### Zero blocks

The rotation residual does not depend on $\mathbf{v}_i$, $\mathbf{p}_i$, $\mathbf{b}_i^a$, $\mathbf{v}_j$, or $\mathbf{p}_j$, so all corresponding Jacobian blocks are **zero**.

### 7.4 Velocity Residual Jacobians

The velocity residual is:

$$
\mathbf{r}_{\Delta v} = \mathbf{R}_i^T\left(\mathbf{v}_j - \mathbf{v}_i - \mathbf{g}\Delta t_{ij}\right) - \Delta \tilde{\mathbf{v}}_{ij}
$$

#### With respect to $\delta\boldsymbol{\phi}_i$ (rotation at keyframe $i$)

Perturb $\mathbf{R}_i \to \mathbf{R}_i \, \text{Exp}(\delta\boldsymbol{\phi}_i)$:

$$
\mathbf{r}_{\Delta v}' = \text{Exp}(-\delta\boldsymbol{\phi}_i) \, \mathbf{R}_i^T (\mathbf{v}_j - \mathbf{v}_i - \mathbf{g}\Delta t_{ij}) - \Delta \tilde{\mathbf{v}}_{ij}
$$

Using the **first-order Exp approximation** (Part 1, Section 2.1.3), $\text{Exp}(-\delta\boldsymbol{\phi}_i) \approx \mathbf{I} - \delta\boldsymbol{\phi}_i^\wedge$:

$$
\approx (\mathbf{I} - \delta\boldsymbol{\phi}_i^\wedge) \, \mathbf{R}_i^T(\mathbf{v}_j - \mathbf{v}_i - \mathbf{g}\Delta t_{ij}) - \Delta \tilde{\mathbf{v}}_{ij}
$$

$$
= \mathbf{r}_{\Delta v} - \delta\boldsymbol{\phi}_i^\wedge \, \mathbf{R}_i^T(\mathbf{v}_j - \mathbf{v}_i - \mathbf{g}\Delta t_{ij})
$$

Applying the **skew-symmetric identity** (Part 1, Section 2.1.2), $\mathbf{a}^\wedge \mathbf{b} = -\mathbf{b}^\wedge \mathbf{a}$:

$$
= \mathbf{r}_{\Delta v} + \left[\mathbf{R}_i^T(\mathbf{v}_j - \mathbf{v}_i - \mathbf{g}\Delta t_{ij})\right]^\wedge \delta\boldsymbol{\phi}_i
$$

$$
\boxed{\frac{\partial \mathbf{r}_{\Delta v}}{\partial \delta\boldsymbol{\phi}_i} = \left[\mathbf{R}_i^T(\mathbf{v}_j - \mathbf{v}_i - \mathbf{g}\Delta t_{ij})\right]^\wedge}
$$

> **Physical intuition:** A small rotation perturbation $\delta\boldsymbol{\phi}_i$ changes the coordinate frame in which the velocity difference is expressed. The skew-symmetric matrix $[\cdot]^\wedge$ captures this cross-product coupling — rotating the frame by $\delta\boldsymbol{\phi}_i$ introduces a velocity error proportional to the cross product of $\delta\boldsymbol{\phi}_i$ with the velocity difference vector.

#### With respect to $\delta\mathbf{v}_i$ and $\delta\mathbf{v}_j$

These are straightforward since velocity perturbations are additive:

Perturb $\mathbf{v}_i \to \mathbf{v}_i + \delta\mathbf{v}_i$:

$$
\mathbf{r}_{\Delta v}' = \mathbf{R}_i^T(\mathbf{v}_j - \mathbf{v}_i - \delta\mathbf{v}_i - \mathbf{g}\Delta t_{ij}) - \Delta \tilde{\mathbf{v}}_{ij} = \mathbf{r}_{\Delta v} - \mathbf{R}_i^T \delta\mathbf{v}_i
$$

Perturb $\mathbf{v}_j \to \mathbf{v}_j + \delta\mathbf{v}_j$:

$$
\mathbf{r}_{\Delta v}' = \mathbf{R}_i^T(\mathbf{v}_j + \delta\mathbf{v}_j - \mathbf{v}_i - \mathbf{g}\Delta t_{ij}) - \Delta \tilde{\mathbf{v}}_{ij} = \mathbf{r}_{\Delta v} + \mathbf{R}_i^T \delta\mathbf{v}_j
$$

$$
\boxed{\frac{\partial \mathbf{r}_{\Delta v}}{\partial \delta\mathbf{v}_i} = -\mathbf{R}_i^T, \qquad \frac{\partial \mathbf{r}_{\Delta v}}{\partial \delta\mathbf{v}_j} = \mathbf{R}_i^T}
$$

#### With respect to biases

From the bias correction formula (Part 2, Section 4.5):

$$
\Delta \tilde{\mathbf{v}}_{ij}(\hat{\mathbf{b}}_i) \approx \Delta \bar{\mathbf{v}}_{ij} + \frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^g} \, \delta\mathbf{b}_i^g + \frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^a} \, \delta\mathbf{b}_i^a
$$

Since the bias correction enters the residual with a minus sign ($\mathbf{r}_{\Delta v} = \ldots - \Delta \tilde{\mathbf{v}}_{ij}$):

$$
\boxed{\frac{\partial \mathbf{r}_{\Delta v}}{\partial \delta\mathbf{b}_i^g} = -\frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^g}, \qquad \frac{\partial \mathbf{r}_{\Delta v}}{\partial \delta\mathbf{b}_i^a} = -\frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^a}}
$$

where the bias Jacobians $\frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^g}$ and $\frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^a}$ were defined in Part 2 (Section 4.5).

#### Zero blocks

The velocity residual does not depend on $\mathbf{p}_i$, $\boldsymbol{\phi}_j$, or $\mathbf{p}_j$, so all corresponding blocks are **zero**.

### 7.5 Position Residual Jacobians

The position residual is:

$$
\mathbf{r}_{\Delta p} = \mathbf{R}_i^T\left(\mathbf{p}_j - \mathbf{p}_i - \mathbf{v}_i \Delta t_{ij} - \tfrac{1}{2}\mathbf{g}\Delta t_{ij}^2\right) - \Delta \tilde{\mathbf{p}}_{ij}
$$

#### With respect to $\delta\boldsymbol{\phi}_i$

By the same technique as the velocity case (first-order Exp followed by the skew-symmetric identity):

$$
\boxed{\frac{\partial \mathbf{r}_{\Delta p}}{\partial \delta\boldsymbol{\phi}_i} = \left[\mathbf{R}_i^T\left(\mathbf{p}_j - \mathbf{p}_i - \mathbf{v}_i \Delta t_{ij} - \tfrac{1}{2}\mathbf{g}\Delta t_{ij}^2\right)\right]^\wedge}
$$

#### With respect to $\delta\mathbf{v}_i$

Perturb $\mathbf{v}_i \to \mathbf{v}_i + \delta\mathbf{v}_i$ (additive in world frame):

$$
\mathbf{r}_{\Delta p}' = \mathbf{R}_i^T(\mathbf{p}_j - \mathbf{p}_i - (\mathbf{v}_i + \delta\mathbf{v}_i) \Delta t_{ij} - \tfrac{1}{2}\mathbf{g}\Delta t_{ij}^2) - \Delta \tilde{\mathbf{p}}_{ij} = \mathbf{r}_{\Delta p} - \mathbf{R}_i^T \delta\mathbf{v}_i \Delta t_{ij}
$$

$$
\boxed{\frac{\partial \mathbf{r}_{\Delta p}}{\partial \delta\mathbf{v}_i} = -\mathbf{R}_i^T \Delta t_{ij}}
$$

#### With respect to $\delta\mathbf{p}_i$ and $\delta\mathbf{p}_j$

Recall from Section 7.2 that the position perturbation is in the **body frame**: $\mathbf{p}_i \to \mathbf{p}_i + \mathbf{R}_i \, \delta\mathbf{p}_i$.

Perturb $\mathbf{p}_i \to \mathbf{p}_i + \mathbf{R}_i \, \delta\mathbf{p}_i$:

$$
\mathbf{r}_{\Delta p}' = \mathbf{R}_i^T(\mathbf{p}_j - \mathbf{p}_i - \mathbf{R}_i \, \delta\mathbf{p}_i - \mathbf{v}_i \Delta t_{ij} - \tfrac{1}{2}\mathbf{g}\Delta t_{ij}^2) - \Delta \tilde{\mathbf{p}}_{ij} = \mathbf{r}_{\Delta p} - \underbrace{\mathbf{R}_i^T \mathbf{R}_i}_{=\,\mathbf{I}} \delta\mathbf{p}_i
$$

Perturb $\mathbf{p}_j \to \mathbf{p}_j + \mathbf{R}_j \, \delta\mathbf{p}_j$:

$$
\mathbf{r}_{\Delta p}' = \mathbf{R}_i^T(\mathbf{p}_j + \mathbf{R}_j \, \delta\mathbf{p}_j - \mathbf{p}_i - \mathbf{v}_i \Delta t_{ij} - \tfrac{1}{2}\mathbf{g}\Delta t_{ij}^2) - \Delta \tilde{\mathbf{p}}_{ij} = \mathbf{r}_{\Delta p} + \mathbf{R}_i^T \mathbf{R}_j \, \delta\mathbf{p}_j
$$

$$
\boxed{\frac{\partial \mathbf{r}_{\Delta p}}{\partial \delta\mathbf{p}_i} = -\mathbf{I}, \qquad \frac{\partial \mathbf{r}_{\Delta p}}{\partial \delta\mathbf{p}_j} = \mathbf{R}_i^T \mathbf{R}_j}
$$

> **Why $-\mathbf{I}$ and not $-\mathbf{R}_i^T$?** Because the perturbation $\delta\mathbf{p}_i$ is defined in the body frame (via $\mathbf{p}_i + \mathbf{R}_i \delta\mathbf{p}_i$), and the residual is also expressed in the body frame at time $i$. The rotation $\mathbf{R}_i^T$ that transforms world-frame quantities into frame $i$ exactly cancels with the $\mathbf{R}_i$ that transforms the body-frame perturbation into the world frame: $\mathbf{R}_i^T \mathbf{R}_i = \mathbf{I}$. Similarly, for $\delta\mathbf{p}_j$ expressed in frame $j$, the Jacobian picks up $\mathbf{R}_i^T \mathbf{R}_j$ — the relative rotation between the two frames.

#### With respect to biases

By the same reasoning as the velocity case:

$$
\boxed{\frac{\partial \mathbf{r}_{\Delta p}}{\partial \delta\mathbf{b}_i^g} = -\frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^g}, \qquad \frac{\partial \mathbf{r}_{\Delta p}}{\partial \delta\mathbf{b}_i^a} = -\frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^a}}
$$

#### Zero blocks

The position residual does not depend on $\boldsymbol{\phi}_j$ or $\mathbf{v}_j$, so those blocks are **zero**.

### 7.6 The Complete Jacobian Matrix

Collecting all results from Sections 7.3–7.5, the Jacobian of the IMU residual $\mathbf{r}_{\mathcal{B}_{ij}} \in \mathbb{R}^9$ with respect to the perturbation vector $\delta\boldsymbol{\xi} \in \mathbb{R}^{24}$ splits naturally into two blocks — one for each keyframe. These results correspond to the Jacobians listed in **Appendix B** of Forster et al. [1] (specifically Eqs. 71–80):

**Jacobian with respect to state $i$:** $\;\frac{\partial \mathbf{r}_{\mathcal{B}_{ij}}}{\partial \delta\boldsymbol{\xi}_i} \in \mathbb{R}^{9 \times 15}$

| | $\delta\boldsymbol{\phi}_i$ | $\delta\mathbf{v}_i$ | $\delta\mathbf{p}_i$ | $\delta\mathbf{b}_i^g$ | $\delta\mathbf{b}_i^a$ |
|:---:|:---:|:---:|:---:|:---:|:---:|
| $\mathbf{r}_{\Delta R}$ | $-\mathbf{J}_r^{-1}(\mathbf{r}_{\Delta R})\,\mathbf{R}_j^T\mathbf{R}_i$ | $\mathbf{0}$ | $\mathbf{0}$ | $-\mathbf{J}_r^{-1}\,\text{Exp}(-\mathbf{r}_{\Delta R})\,\frac{\partial \Delta \bar{\mathbf{R}}}{\partial \mathbf{b}^g}$ | $\mathbf{0}$ |
| $\mathbf{r}_{\Delta v}$ | $[\mathbf{R}_i^T(\mathbf{v}_j - \mathbf{v}_i - \mathbf{g}\Delta t)]^\wedge$ | $-\mathbf{R}_i^T$ | $\mathbf{0}$ | $-\frac{\partial \Delta \bar{\mathbf{v}}}{\partial \mathbf{b}^g}$ | $-\frac{\partial \Delta \bar{\mathbf{v}}}{\partial \mathbf{b}^a}$ |
| $\mathbf{r}_{\Delta p}$ | $[\mathbf{R}_i^T(\mathbf{p}_j - \mathbf{p}_i - \mathbf{v}_i \Delta t - \frac{1}{2}\mathbf{g}\Delta t^2)]^\wedge$ | $-\mathbf{R}_i^T \Delta t$ | $-\mathbf{I}$ | $-\frac{\partial \Delta \bar{\mathbf{p}}}{\partial \mathbf{b}^g}$ | $-\frac{\partial \Delta \bar{\mathbf{p}}}{\partial \mathbf{b}^a}$ |

**Jacobian with respect to state $j$:** $\;\frac{\partial \mathbf{r}_{\mathcal{B}_{ij}}}{\partial \delta\boldsymbol{\xi}_j} \in \mathbb{R}^{9 \times 9}$

| | $\delta\boldsymbol{\phi}_j$ | $\delta\mathbf{v}_j$ | $\delta\mathbf{p}_j$ |
|:---:|:---:|:---:|:---:|
| $\mathbf{r}_{\Delta R}$ | $\mathbf{J}_r^{-1}(\mathbf{r}_{\Delta R})$ | $\mathbf{0}$ | $\mathbf{0}$ |
| $\mathbf{r}_{\Delta v}$ | $\mathbf{0}$ | $\mathbf{R}_i^T$ | $\mathbf{0}$ |
| $\mathbf{r}_{\Delta p}$ | $\mathbf{0}$ | $\mathbf{0}$ | $\mathbf{R}_i^T \mathbf{R}_j$ |

Several patterns are worth noting:

1. **Sparsity.** Most blocks are zero — each residual component depends on only a few state variables. This sparsity is inherited by the Hessian matrix, making the optimization system efficient to solve.

2. **The role of $\mathbf{R}_i^T$.** This rotation matrix appears throughout, transforming world-frame quantities into frame $i$. This is consistent with the preintegration philosophy: everything is measured relative to the body frame at time $i$.

3. **Bias Jacobians come from preintegration.** The $\frac{\partial \Delta \bar{\mathbf{R}}}{\partial \mathbf{b}^g}$, $\frac{\partial \Delta \bar{\mathbf{v}}}{\partial \mathbf{b}}$, $\frac{\partial \Delta \bar{\mathbf{p}}}{\partial \mathbf{b}}$ terms are not computed here — they were accumulated during the preintegration loop (Part 2, Section 4.5) and are simply plugged in.

4. **Skew-symmetric coupling.** The $[\cdot]^\wedge$ blocks in the velocity and position rows show how rotation uncertainty couples into translational quantities — a rotation error changes the direction in which we project the velocity/position differences.

---

## 8. Assembling the Gauss-Newton System

### 8.1 The MAP Estimation Problem

The full VIO optimization problem minimizes the sum of all factor costs:

$$
\mathcal{X}^* = \arg\min_{\mathcal{X}} \left\{ \underbrace{\sum_{(i,j) \in \mathcal{B}} \left\|\mathbf{r}_{\mathcal{B}_{ij}}\right\|^2_{\boldsymbol{\Sigma}_{ij}}}_{\text{IMU factors}} + \underbrace{\sum_{(i,j) \in \mathcal{B}} \left\|\mathbf{r}_{\mathbf{b}_{ij}}\right\|^2_{\boldsymbol{\Sigma}_{b}}}_{\text{bias factors}} + \underbrace{\sum_{k \in \mathcal{C}} \left\|\mathbf{r}_{\mathcal{C}_k}\right\|^2_{\boldsymbol{\Sigma}_{\mathcal{C}_k}}}_{\text{visual factors}} + \underbrace{\left\|\mathbf{r}_{\text{prior}}\right\|^2_{\boldsymbol{\Sigma}_{\text{prior}}}}_{\text{prior}} \right\}
$$

where $\|\mathbf{r}\|^2_{\boldsymbol{\Sigma}} \triangleq \mathbf{r}^T \boldsymbol{\Sigma}^{-1} \mathbf{r}$ is the **Mahalanobis distance**. Each term has a natural interpretation:

- **IMU factors:** The preintegration residuals and covariances from Parts 2–3, connecting consecutive keyframes
- **Bias factors:** The random walk constraints on bias evolution
- **Visual factors:** Reprojection errors from visual feature observations
- **Prior:** An initial state constraint (e.g., from the first keyframe or a previous marginalization)

### 8.2 Linearization and the Normal Equations

At the current estimate $\hat{\mathcal{X}}$, each residual is linearized:

$$
\mathbf{r}_k(\mathcal{X} \oplus \delta\mathcal{X}) \approx \mathbf{r}_k + \mathbf{J}_k \, \delta\mathcal{X}
$$

Substituting into the Mahalanobis cost:

$$
\left\|\mathbf{r}_k + \mathbf{J}_k \, \delta\mathcal{X}\right\|^2_{\boldsymbol{\Sigma}_k^{-1}} = (\mathbf{r}_k + \mathbf{J}_k \, \delta\mathcal{X})^T \, \boldsymbol{\Sigma}_k^{-1} \, (\mathbf{r}_k + \mathbf{J}_k \, \delta\mathcal{X})
$$

Summing over all factors and taking the derivative with respect to $\delta\mathcal{X}$, setting it to zero, yields the **normal equation**:

$$
\underbrace{\left(\sum_k \mathbf{J}_k^T \, \boldsymbol{\Sigma}_k^{-1} \, \mathbf{J}_k\right)}_{\mathbf{H} \;\text{(Hessian approx.)}} \, \delta\mathcal{X}^* = \underbrace{-\sum_k \mathbf{J}_k^T \, \boldsymbol{\Sigma}_k^{-1} \, \mathbf{r}_k}_{\mathbf{g} \;\text{(gradient)}}
$$

or equivalently:

$$
\boxed{\delta\mathcal{X}^* = -\left(\mathbf{J}^T \, \boldsymbol{\Sigma}^{-1} \, \mathbf{J}\right)^{-1} \mathbf{J}^T \, \boldsymbol{\Sigma}^{-1} \, \mathbf{r}}
$$

where $\mathbf{J}$, $\boldsymbol{\Sigma}$, and $\mathbf{r}$ are the stacked Jacobian, block-diagonal covariance, and residual vector across all factors.

The matrix $\mathbf{H} = \mathbf{J}^T \boldsymbol{\Sigma}^{-1} \mathbf{J}$ is the **approximate Hessian** (or information matrix). Because each factor only connects a few state variables, $\mathbf{H}$ is **sparse** — its non-zero structure mirrors the connectivity of the factor graph. This sparsity is what makes large-scale SLAM optimization tractable, typically solved via sparse Cholesky factorization.

> **Note on Levenberg-Marquardt:** In practice, most implementations use the **Levenberg-Marquardt** (LM) variant, which adds a damping term $\lambda \mathbf{I}$ to the Hessian: $(\mathbf{H} + \lambda \mathbf{I}) \, \delta\mathcal{X}^* = \mathbf{g}$. When $\lambda$ is small, LM behaves like Gauss-Newton (fast convergence near the solution); when $\lambda$ is large, it behaves like gradient descent (more robust far from the solution).

### 8.3 State Update: Retraction on the Manifold

After solving the normal equation for the optimal perturbation $\delta\mathcal{X}^*$, we update the state using the **retraction** — the manifold-aware update rule:

$$
\begin{aligned}
\mathbf{R}_i &\leftarrow \mathbf{R}_i \cdot \text{Exp}(\delta\boldsymbol{\phi}_i^*) & &\text{(right-multiply on } SO(3)\text{)} \\
\mathbf{v}_i &\leftarrow \mathbf{v}_i + \delta\mathbf{v}_i^* & &\text{(additive in world frame)} \\
\mathbf{p}_i &\leftarrow \mathbf{p}_i + \mathbf{R}_i \, \delta\mathbf{p}_i^* & &\text{(body-frame perturbation applied to world frame)} \\
\mathbf{b}_i^g &\leftarrow \mathbf{b}_i^g + \delta\mathbf{b}_i^{g*} & &\text{(additive update in } \mathbb{R}^3\text{)} \\
\mathbf{b}_i^a &\leftarrow \mathbf{b}_i^a + \delta\mathbf{b}_i^{a*} & &\text{(additive update in } \mathbb{R}^3\text{)}
\end{aligned}
$$

The rotation update uses right-multiplication by $\text{Exp}(\delta\boldsymbol{\phi}^*)$, guaranteeing that the updated rotation remains a valid element of $SO(3)$. The position update uses $\mathbf{R}_i \delta\mathbf{p}_i^*$ to transform the body-frame perturbation into the world frame — consistent with the body-frame perturbation model in Section 7.2. The perturbation convention must be consistent between the Jacobian computation and the state update.

After the update, we re-evaluate all residuals and Jacobians, and repeat until convergence (typically 3–10 iterations).

### 8.4 Putting It All Together: The VIO Iteration Loop

Summarizing the complete pipeline that spans all three parts of this series:

**Preintegration (offline, between keyframes)** — *done once per keyframe pair*

| Step | Computed | Reference |
|------|----------|-----------|
| 1. Integrate IMU measurements | $\Delta \tilde{\mathbf{R}}_{ij}$, $\Delta \tilde{\mathbf{v}}_{ij}$, $\Delta \tilde{\mathbf{p}}_{ij}$ | Part 1, Section 2.4 |
| 2. Propagate covariance | $\boldsymbol{\Sigma}_{ij}$ via $\mathbf{A}_{j-1}$, $\mathbf{B}_{j-1}$ | Part 2, Section 4.4 |
| 3. Accumulate bias Jacobians | $\frac{\partial \Delta \bar{\mathbf{R}}}{\partial \mathbf{b}^g}$, $\frac{\partial \Delta \bar{\mathbf{v}}}{\partial \mathbf{b}}$, $\frac{\partial \Delta \bar{\mathbf{p}}}{\partial \mathbf{b}}$ | Part 2, Section 4.5 |

**Optimization (iterative)** — *runs at each optimizer step*

| Step | Operation | Reference |
|------|-----------|-----------|
| 4. Apply bias correction | Update $\Delta \tilde{\mathbf{R}}$, $\Delta \tilde{\mathbf{v}}$, $\Delta \tilde{\mathbf{p}}$ with current $\delta\mathbf{b}$ | Part 2, Section 4.5 |
| 5. Compute residual | $\mathbf{r}_{\mathcal{B}_{ij}}$ from Eq. 45 | Part 3, Section 6.2 |
| 6. Compute Jacobians | $\mathbf{J}$ from the tables in Section 7.6 | Part 3, Section 7 |
| 7. Solve normal equation | $\mathbf{H}\,\delta\mathcal{X}^* = \mathbf{g}$ | Part 3, Section 8.2 |
| 8. Update states | Retraction on $SO(3)$ + additive in $\mathbb{R}^n$ | Part 3, Section 8.3 |

Steps 4–8 repeat until convergence. The preintegrated measurements from Steps 1–3 are **never recomputed** — only the bias correction (Step 4) and residual evaluation (Step 5) are updated per iteration. This is the computational advantage of preintegration.

---

## 9. Series Conclusion

### 9.1 Recap of the Three Parts

Over this three-part series, we have built up the complete IMU preintegration framework from first principles:

**Part 1 — Motivation & Mathematical Foundations**
- Identified the computational problem: naive IMU integration in the world frame requires re-integration at every optimizer iteration
- Introduced the $SO(3)$ Lie group toolkit: the exponential/logarithmic maps, the right Jacobian $\mathbf{J}_r$, the Adjoint identity, and the BCH approximation
- Derived the change-of-coordinates trick that produces preintegrated measurements independent of the absolute state

**Part 2 — The Preintegrated Measurement Model & Covariance Propagation**
- Isolated the noise from the preintegrated measurements using the Adjoint identity and BCH approximation, obtaining the measurement model (**Eq. 38**)
- Derived the iterative error-state propagation (**Eqs. 59–62**) and covariance matrix $\boldsymbol{\Sigma}_{ij}$ (**Eq. 63**)
- Established first-order bias correction formulas (**Eqs. 65–68**) that avoid re-integration when the bias estimate changes

**Part 3 — Residuals, Jacobians & the Gauss-Newton System**
- Defined the IMU residual functions (**Eq. 45**) that measure the discrepancy between optimized states and preintegrated measurements on the $SO(3)$ manifold
- Derived all Jacobians of the residuals step by step, using the Adjoint identity, BCH linearization, and the skew-symmetric identity
- Showed how these assemble into the Gauss-Newton normal equation $\mathbf{H}\,\delta\mathcal{X}^* = \mathbf{g}$, with manifold-aware state updates

### 9.2 The Big Picture

The entire preintegration framework can be summarized in one sentence:

> **Preintegration converts hundreds of high-frequency IMU measurements into a single, fixed-size probabilistic constraint** — with a mean (the preintegrated measurement), an uncertainty (the covariance $\boldsymbol{\Sigma}_{ij}$), and analytic Jacobians — **that plugs directly into a standard nonlinear least-squares optimizer.**

This elegant formulation is what makes modern Visual-Inertial SLAM systems like **ORB-SLAM3** [2], **VINS-Mono**, and **OKVIS** both accurate and real-time. The mathematical machinery is substantial — Lie groups, manifold optimization, covariance propagation — but the payoff is a system that:

1. **Integrates IMU data once** (not once per optimizer iteration)
2. **Handles bias changes** via cheap first-order corrections
3. **Provides proper uncertainty** for balancing IMU and visual constraints
4. **Yields analytic Jacobians** for fast, reliable convergence

For anyone implementing this in practice, the key takeaway is: the preintegration module (Steps 1–3) and the optimization module (Steps 4–8) are cleanly separated. The preintegration module produces a fixed-size summary that the optimizer treats as any other measurement — the optimizer doesn't need to know about IMU sampling rates, noise models, or integration schemes. This modularity is the ultimate achievement of the preintegration framework.

### 9.3 From Theory to Code: ORB-SLAM3 Implementation

If you are curious how the mathematical framework we derived throughout this series is **actually implemented in code**, I have written a separate two-part code review of the ORB-SLAM3 IMU preintegration module:

- **[ORB-SLAM3 IMU Preintegration Code Review (Part 1)](/blog/orb-slam3-imu-part1):** Covers the `IntegrateNewMeasurement` function — how the relative motion increments (Eq. 33), covariance propagation matrices $\mathbf{A}$, $\mathbf{B}$ (Eq. 62–63), and bias Jacobians are computed in a single loop.
- **[ORB-SLAM3 IMU Preintegration Code Review (Part 2)](/blog/orb-slam3-imu-part2):** Covers the residual function (`computeError`) and Jacobian matrix (`linearizeOplus`) implementation in the g2o optimization framework — showing a line-by-line correspondence between the formulas in Forster et al. and the ORB-SLAM3 C++ code.

These code reviews complement this theory series by showing exactly how each equation maps to C++ code in a production SLAM system.

---

## References

1. C. Forster, L. Carlone, F. Dellaert, and D. Scaramuzza, "[On-Manifold Preintegration for Real-Time Visual-Inertial Odometry](https://ieeexplore.ieee.org/document/7557075/)," *IEEE Transactions on Robotics*, vol. 33, no. 1, pp. 1–21, 2017.
2. C. Campos, R. Elvira, J. J. G. Rodriguez, J. M. M. Montiel, and J. D. Tardos, "[ORB-SLAM3: An Accurate Open-Source Library for Visual, Visual-Inertial, and Multimap SLAM](https://ieeexplore.ieee.org/document/9440682/)," *IEEE Transactions on Robotics*, vol. 37, no. 6, pp. 1874–1890, 2021.
3. J. Sola, "[Quaternion kinematics for the error-state Kalman filter](https://arxiv.org/abs/1711.02508)," *arXiv preprint arXiv:1711.02508*, 2017.
4. F. Dellaert and M. Kaess, "[Factor Graphs for Robot Perception](https://www.cs.cmu.edu/~kaess/pub/Dellaert17fnt.pdf)," *Foundations and Trends in Robotics*, vol. 6, no. 1-2, pp. 1–139, 2017.
