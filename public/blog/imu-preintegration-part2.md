# A Deep Dive into IMU Preintegration (Part 2): Measurement Model & Covariance Propagation

> **Series Overview:** This is Part 2 of a 3-part series on IMU Preintegration in Visual-Inertial SLAM.
> - Part 1: Motivation & Mathematical Foundations
> - **Part 2 (this post):** The Preintegrated Measurement Model & Covariance Propagation
> - Part 3: Optimization on $SO(3)$ — Residuals, Jacobians & Conclusion

> **Note:** Throughout this series, we follow the notation and equations of **Forster et al., "On-Manifold Preintegration for Real-Time Visual-Inertial Odometry," IEEE Transactions on Robotics, 2017** [1]. This analysis aims to provide a step-by-step walkthrough of the paper's mathematical framework, making it accessible to engineers and researchers working on Visual-Inertial SLAM systems.

---

## 3. The Preintegrated Measurement Model

### 3.1 Recap: Preintegrated Measurements with Noise

In Part 1, we derived the preintegrated measurements by changing coordinates from the world frame to the body frame at time $i$. Following **Eq. (33)** of Forster et al., these include the noise terms:

$$
\begin{aligned}
\Delta \mathbf{R}_{ij} &= \prod_{k=i}^{j-1} \text{Exp}\left((\tilde{\boldsymbol{\omega}}_k - \mathbf{b}_k^g - \boldsymbol{\eta}_k^{gd}) \Delta t\right) \\[4pt]
\Delta \mathbf{v}_{ij} &= \sum_{k=i}^{j-1} \Delta \mathbf{R}_{ik}(\tilde{\mathbf{a}}_k - \mathbf{b}_k^a - \boldsymbol{\eta}_k^{ad})\Delta t \\[4pt]
\Delta \mathbf{p}_{ij} &= \sum_{k=i}^{j-1}\left[\Delta \mathbf{v}_{ik}\Delta t + \tfrac{1}{2}\Delta \mathbf{R}_{ik}(\tilde{\mathbf{a}}_k - \mathbf{b}_k^a - \boldsymbol{\eta}_k^{ad})\Delta t^2\right]
\end{aligned}
$$

However, these expressions are "entangled" — the deterministic signal (what we actually want to measure) and the stochastic noise (sensor imperfections) are mixed together inside the $\text{Exp}(\cdot)$ and summation operators. This is a problem for optimization because:

1. **We need a probabilistic model.** In a factor graph, every constraint (factor) must come with a **covariance matrix** $\boldsymbol{\Sigma}$ that describes how uncertain the measurement is. Without separating the noise, we cannot compute this covariance.

2. **Gaussian noise enables efficient optimization.** If we can show that the separated noise is **zero-mean Gaussian**, then the negative log-likelihood becomes a **quadratic cost** (Mahalanobis distance) — exactly the form that Gauss-Newton and Levenberg-Marquardt solvers are designed to minimize.

3. **Linear noise propagation becomes possible.** Once the noise terms are isolated and expressed as a **linear function** of the primitive noise $\boldsymbol{\eta}_k^{gd}$, $\boldsymbol{\eta}_k^{ad}$, we can propagate the covariance iteratively using the standard formula $\boldsymbol{\Sigma}_{k+1} = \mathbf{A}_k \boldsymbol{\Sigma}_k \mathbf{A}_k^T + \mathbf{B}_k \boldsymbol{\Sigma}_\eta \mathbf{B}_k^T$ (Section 4).

In short, noise isolation transforms the preintegrated measurements from a "raw computation" into a proper **probabilistic measurement model** — the form required by any modern SLAM back-end.

> **💡 The "Cafe Phone Call" Analogy: Why We Isolate Noise**
> ![The Cafe Phone Call Analogy](/blog/images/imu-preintegration-part2-figure1.png)
>
> Imagine you are making a phone call in a **busy cafe** — surrounded by clinking cups, chatter, and the hiss of espresso machines.
>
> **📱 Scenario A: Noise Entangled (Eq. 33)**
>
> You hold the phone to your ear without any noise cancellation. What you hear is the caller's voice and the cafe noise **mixed together** into a single stream of sound. You can *roughly* make out what the other person is saying, but you have no idea **how much of what you're hearing is actually their voice versus background noise**. If someone asks "how reliable is this conversation?", you can only shrug.
>
> This is exactly the situation of Eq. (33): the noise $\boldsymbol{\eta}_k^{gd}$, $\boldsymbol{\eta}_k^{ad}$ is mixed into the $\text{Exp}(\cdot)$ and summations alongside the true signal. We have a result, but no way to quantify its uncertainty.
>
> **🎧 Scenario B: Noise Isolated (Eq. 38)**
>
> Now you put on **noise-cancelling earphones**. The ANC system internally separates the incoming sound into two components: (1) the **caller's voice** (the signal you want) and (2) the **cafe noise** (which it cancels out). Because the system has explicitly isolated the noise from the signal, it can also tell you *how noisy* the environment is — effectively giving the call a **confidence score**.
>
> This is what Sections 3.2–3.4 achieve. We factor each preintegrated measurement into a **clean signal** ($\Delta \tilde{\mathbf{R}}_{ij}$, $\Delta \tilde{\mathbf{v}}_{ij}$, $\Delta \tilde{\mathbf{p}}_{ij}$) plus **separated noise** ($\delta\boldsymbol{\phi}_{ij}$, $\delta\mathbf{v}_{ij}$, $\delta\mathbf{p}_{ij}$). Once separated, we can propagate the noise into a covariance matrix $\boldsymbol{\Sigma}_{ij}$ — the "confidence score" that the optimizer needs to properly weight each IMU constraint.
>

### 3.2 Isolating the Noise: Rotation (**Eq. 35**)

Let us start with the rotation increment $\Delta \mathbf{R}_{ij}$ in **(33)**:

$$
\Delta \mathbf{R}_{ij} = \prod_{k=i}^{j-1} \text{Exp}\left((\tilde{\boldsymbol{\omega}}_k - \mathbf{b}_k^g - \boldsymbol{\eta}_k^{gd})\Delta t\right)
$$

#### Step 1: First-order approximation

By the first-order approximation from Part 1 (Section 2.1.4), $\text{Exp}(\boldsymbol{\phi} + \delta\boldsymbol{\phi}) \approx \text{Exp}(\boldsymbol{\phi})\,\text{Exp}(\mathbf{J}_r(\boldsymbol{\phi})\,\delta\boldsymbol{\phi})$, we separate the noise inside each factor:

$$
= \prod_{k=i}^{j-1} \left[ \underbrace{\text{Exp}((\tilde{\boldsymbol{\omega}}_k - \mathbf{b}_i^g)\Delta t)}_{\text{signal term}} \;\cdot\; \underbrace{\text{Exp}(-\mathbf{J}_r^k \, \boldsymbol{\eta}_k^{gd} \, \Delta t)}_{\text{noise term}} \right]
$$

where $\mathbf{J}_r^k \doteq \mathbf{J}_r^k((\tilde{\boldsymbol{\omega}}_k - \mathbf{b}_i^g)\Delta t)$. Now let us write $\Delta \tilde{\mathbf{R}}_k \triangleq \text{Exp}((\tilde{\boldsymbol{\omega}}_k - \mathbf{b}_i^g)\Delta t)$ for brevity. Expanding the product:

$$
= \underbrace{\Delta \tilde{\mathbf{R}}_i}_{\text{signal}} \cdot \underbrace{\text{Exp}(-\mathbf{J}_r^i \, \boldsymbol{\eta}_i^{gd}\Delta t)}_{\text{noise}} \cdot \underbrace{\Delta \tilde{\mathbf{R}}_{i+1}}_{\text{signal}} \cdot \underbrace{\text{Exp}(-\mathbf{J}_r^{i+1} \boldsymbol{\eta}_{i+1}^{gd}\Delta t)}_{\text{noise}} \cdot \; \cdots
$$

The signal and noise terms are interleaved. We want to collect all noise terms to the right.

#### Step 2: Moving one signal rotation to the left via the Adjoint identity

Using the **Adjoint identity** from Part 1 (Section 2.1.5), $\text{Exp}(\boldsymbol{\phi})\,\mathbf{R} = \mathbf{R}\,\text{Exp}(\mathbf{R}^T \boldsymbol{\phi})$, we can swap the order of a noise exponential and a rotation matrix. Let us focus on the **first noise term** $\text{Exp}(-\mathbf{J}_r^i \boldsymbol{\eta}_i^{gd}\Delta t)$ and push it past the adjacent signal rotation $\Delta \tilde{\mathbf{R}}_{i+1}$:

$$
\text{Exp}(-\mathbf{J}_r^i \boldsymbol{\eta}_i^{gd}\Delta t) \cdot \Delta \tilde{\mathbf{R}}_{i+1} = \Delta \tilde{\mathbf{R}}_{i+1} \cdot \text{Exp}(-\Delta \tilde{\mathbf{R}}_{i+1}^T \mathbf{J}_r^i \, \boldsymbol{\eta}_i^{gd}\Delta t)
$$

After this single swap, the signal rotation $\Delta \tilde{\mathbf{R}}_{i+1}$ has moved to the left, joining $\Delta \tilde{\mathbf{R}}_i$:

$$
= \Delta \tilde{\mathbf{R}}_i \cdot \overbrace{\Delta \tilde{\mathbf{R}}_{i+1} \cdot \text{Exp}(-\Delta \tilde{\mathbf{R}}_{i+1}^T \mathbf{J}_r^i \, \boldsymbol{\eta}_i^{gd}\Delta t)}^{\text{swapped via Adjoint identity}} \cdot \text{Exp}(-\mathbf{J}_r^{i+1} \boldsymbol{\eta}_{i+1}^{gd}\Delta t) \cdot \Delta \tilde{\mathbf{R}}_{i+2} \cdot \text{Exp}(-\mathbf{J}_r^{i+2} \boldsymbol{\eta}_{i+2}^{gd}\Delta t) \cdot \; \cdots
$$

Now apply the same trick again — push the two noise exponentials past $\Delta \tilde{\mathbf{R}}_{i+2}$. Each noise term picks up a factor of $\Delta \tilde{\mathbf{R}}_{i+2}^T$:

$$
= \Delta \tilde{\mathbf{R}}_i \cdot \Delta \tilde{\mathbf{R}}_{i+1} \cdot \Delta \tilde{\mathbf{R}}_{i+2} \cdot \text{Exp}(-\Delta \tilde{\mathbf{R}}_{i+2}^T \Delta \tilde{\mathbf{R}}_{i+1}^T \mathbf{J}_r^i \, \boldsymbol{\eta}_i^{gd}\Delta t) \cdot \text{Exp}(-\Delta \tilde{\mathbf{R}}_{i+2}^T \mathbf{J}_r^{i+1} \boldsymbol{\eta}_{i+1}^{gd}\Delta t) \cdot \text{Exp}(-\mathbf{J}_r^{i+2} \boldsymbol{\eta}_{i+2}^{gd}\Delta t) \cdot \; \cdots
$$

The pattern is now clear: after two rounds of swaps, three signal rotations have collected on the left, and three noise exponentials sit on the right — each carrying the accumulated $\Delta \tilde{\mathbf{R}}^T$ factors from every signal rotation it passed through.

::adjoint-swap-animation::

#### Step 3: Repeating for all remaining terms

By repeating this process — pushing each noise exponential past all subsequent signal rotations — **every signal rotation migrates to the left** and **every noise term collects on the right**. Each time a noise exponential passes through a signal rotation $\Delta \tilde{\mathbf{R}}_l$, it picks up a factor of $\Delta \tilde{\mathbf{R}}_l^T$ in front of its argument. After all swaps are complete:

$$
= \underbrace{\Delta \tilde{\mathbf{R}}_i \cdot \Delta \tilde{\mathbf{R}}_{i+1} \cdots \Delta \tilde{\mathbf{R}}_{j-1}}_{\Delta \tilde{\mathbf{R}}_{ij}} \;\cdot\; \prod_{k=i}^{j-1} \text{Exp}\left(-\Delta \tilde{\mathbf{R}}_{k+1,j}^T \, \mathbf{J}_r^k \, \boldsymbol{\eta}_k^{gd} \, \Delta t\right)
$$

where $\Delta \tilde{\mathbf{R}}_{k+1,j} = \Delta \tilde{\mathbf{R}}_{k+1} \cdots \Delta \tilde{\mathbf{R}}_{j-1}$ is the product of all signal rotations that the $k$-th noise term had to pass through.

#### Step 4: Collapsing into a single Exp via BCH approximation

Since $\boldsymbol{\eta}_k^{gd}$ is small, each noise argument is a small vector. Recall the BCH first-order approximation from Part 1 (Section 2.1.4): $\text{Exp}(\boldsymbol{\phi}) \cdot \text{Exp}(\delta\boldsymbol{\phi}) \approx \text{Exp}(\boldsymbol{\phi} + \mathbf{J}_r^{-1}(\boldsymbol{\phi})\,\delta\boldsymbol{\phi})$. When **both** arguments are small, $\mathbf{J}_r^{-1} \approx \mathbf{I}$, so this simplifies to $\text{Exp}(\boldsymbol{\phi}_1)\,\text{Exp}(\boldsymbol{\phi}_2) \approx \text{Exp}(\boldsymbol{\phi}_1 + \boldsymbol{\phi}_2)$. Applying this repeatedly to collapse the product of noise exponentials:

$$
\approx \Delta \tilde{\mathbf{R}}_{ij} \prod_{k=i}^{j-1} \text{Exp}\!\left(-\Delta \tilde{\mathbf{R}}_{k+1,j}^T \, \mathbf{J}_r^k \, \boldsymbol{\eta}_k^{gd} \, \Delta t\right) = \Delta \tilde{\mathbf{R}}_{ij} \, \text{Exp}\!\left(-\underbrace{\sum_{k=i}^{j-1} \Delta \tilde{\mathbf{R}}_{k+1,j}^T \, \mathbf{J}_r^k \, \boldsymbol{\eta}_k^{gd} \, \Delta t}_{\delta \boldsymbol{\phi}_{ij}}\right)
$$

#### Summary: preintegrated rotation measurement model

Rearranging **(35)**, we get the **preintegrated rotation measurement model** (**Eq. 38**, rotation):

$$
\boxed{\Delta \tilde{\mathbf{R}}_{ij} = \Delta \mathbf{R}_{ij} \cdot \text{Exp}(\delta \boldsymbol{\phi}_{ij})}
$$

where $\delta \boldsymbol{\phi}_{ij}$ is a zero-mean Gaussian noise vector. The noise is **multiplicative** on the manifold (via $\text{Exp}$), reflecting the non-Euclidean nature of rotations.

### 3.3 Isolating the Noise: Velocity (**Eq. 36**)

Starting from the velocity preintegration in **(33)**:

$$
\Delta \mathbf{v}_{ij} = \sum_{k=i}^{j-1} \Delta \mathbf{R}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}_k^a - \boldsymbol{\eta}_k^{ad}) \Delta t
$$

#### Step 1: Substitute the rotation result from Eq. (35)

From Section 3.2, we know $\Delta \mathbf{R}_{ik} = \Delta \tilde{\mathbf{R}}_{ik} \, \text{Exp}(-\delta\boldsymbol{\phi}_{ik})$. Substituting:

$$
= \sum_{k=i}^{j-1} \Delta \tilde{\mathbf{R}}_{ik} \, \text{Exp}(-\delta\boldsymbol{\phi}_{ik}) \, (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a - \boldsymbol{\eta}_k^{ad}) \, \Delta t
$$

#### Step 2: First-order approximation of Exp

Since $\delta\boldsymbol{\phi}_{ik}$ is small, we use the first-order approximation of the exponential map from Part 1 (Section 2.1.3) $\text{Exp}(-\delta\boldsymbol{\phi}_{ik}) \approx \mathbf{I} - \delta\boldsymbol{\phi}_{ik}^\wedge$:

$$
= \sum_{k=i}^{j-1} \Delta \tilde{\mathbf{R}}_{ik} \, (\mathbf{I} - \delta\boldsymbol{\phi}_{ik}^\wedge) \, (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a - \boldsymbol{\eta}_k^{ad}) \, \Delta t
$$

#### Step 3: Expand and separate signal from noise

Expanding the product and splitting signal vs. noise terms:

$$
= \sum_{k=i}^{j-1} \Delta \tilde{\mathbf{R}}_{ik} \, (\mathbf{I} - \delta\boldsymbol{\phi}_{ik}^\wedge) \, (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a) \, \Delta t \;-\; \sum_{k=i}^{j-1} \Delta \tilde{\mathbf{R}}_{ik} \, (\mathbf{I} - \delta\boldsymbol{\phi}_{ik}^\wedge) \, \boldsymbol{\eta}_k^{ad} \, \Delta t
$$

The second-order term $\Delta \tilde{\mathbf{R}}_{ik} \delta\boldsymbol{\phi}_{ik}^\wedge \boldsymbol{\eta}_k^{ad} \Delta t$ (product of two small noise quantities) is negligible by the **linearization principle**, so we drop it:

$$
\approx \sum_{k=i}^{j-1} \Delta \tilde{\mathbf{R}}_{ik} \, (\mathbf{I} - \delta\boldsymbol{\phi}_{ik}^\wedge) \, (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a) \, \Delta t \;-\; \sum_{k=i}^{j-1} \Delta \tilde{\mathbf{R}}_{ik} \, \boldsymbol{\eta}_k^{ad} \, \Delta t
$$

#### Step 4: Separate into measurement + noise

Expanding the first sum and collecting terms:

$$
= \sum_{k=i}^{j-1} \Delta \tilde{\mathbf{R}}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a) \Delta t + \sum_{k=i}^{j-1} \left[ \Delta \tilde{\mathbf{R}}_{ik} \, (-\delta\boldsymbol{\phi}_{ik}^\wedge) \, (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a) \Delta t - \Delta \tilde{\mathbf{R}}_{ik} \, \boldsymbol{\eta}_k^{ad} \, \Delta t \right]
$$

Using the skew-symmetric identity from Part 1 (Section 2.1.2), $\mathbf{a}^\wedge \mathbf{b} = -\mathbf{b}^\wedge \mathbf{a}$ for all $\mathbf{a}, \mathbf{b} \in \mathbb{R}^3$:

$$
= \underbrace{\sum_{k=i}^{j-1} \Delta \tilde{\mathbf{R}}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a) \Delta t}_{\Delta \tilde{\mathbf{v}}_{ij}} - \underbrace{\sum_{k=i}^{j-1} \left[ -\Delta \tilde{\mathbf{R}}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a)^\wedge \, \delta\boldsymbol{\phi}_{ik} \, \Delta t + \Delta \tilde{\mathbf{R}}_{ik} \, \boldsymbol{\eta}_k^{ad} \, \Delta t \right]}_{\delta \mathbf{v}_{ij}}
$$

#### Summary: preintegrated velocity measurement model

This gives us (**Eq. 36**):

$$
\Delta \mathbf{v}_{ij} = \Delta \tilde{\mathbf{v}}_{ij} - \delta \mathbf{v}_{ij}
$$

Rearranging to match the measurement model form (**Eq. 38**, velocity):

$$
\boxed{\Delta \tilde{\mathbf{v}}_{ij} = \Delta \mathbf{v}_{ij} + \delta \mathbf{v}_{ij}}
$$

where the noise $\delta \mathbf{v}_{ij}$ is **additive** in $\mathbb{R}^3$ — unlike the multiplicative rotation noise. It depends on both the accelerometer noise $\boldsymbol{\eta}_k^{ad}$ and the rotation noise $\delta\boldsymbol{\phi}_{ik}$ (since rotation uncertainty affects the direction in which acceleration is integrated).

### 3.4 Isolating the Noise: Position (**Eq. 37**)

Starting from the position preintegration in **(33)**:

$$
\Delta \mathbf{p}_{ij} = \sum_{k=i}^{j-1} \left[ \Delta \mathbf{v}_{ik} \, \Delta t + \tfrac{1}{2} \Delta \mathbf{R}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}_k^a - \boldsymbol{\eta}_k^{ad}) \Delta t^2 \right]
$$

#### Step 1: Substitute the velocity and rotation results

From Sections 3.2–3.3, we have $\Delta \mathbf{v}_{ik} = \Delta \tilde{\mathbf{v}}_{ik} - \delta \mathbf{v}_{ik}$ and $\Delta \mathbf{R}_{ik} = \Delta \tilde{\mathbf{R}}_{ik} \, \text{Exp}(-\delta\boldsymbol{\phi}_{ik})$. Substituting:

$$
= \sum_{k=i}^{j-1} \left[ (\Delta \tilde{\mathbf{v}}_{ik} - \delta \mathbf{v}_{ik}) \Delta t + \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{ik} \, \text{Exp}(-\delta\boldsymbol{\phi}_{ik}) \, (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a - \boldsymbol{\eta}_k^{ad}) \, \Delta t^2 \right]
$$

#### Step 2: First-order approximation and expand

Applying the first-order exponential map approximation from Part 1 (Section 2.1.3), $\text{Exp}(-\delta\boldsymbol{\phi}_{ik}) \approx \mathbf{I} - \delta\boldsymbol{\phi}_{ik}^\wedge$, and expanding:

$$
= \sum_{k=i}^{j-1} \left[ (\Delta \tilde{\mathbf{v}}_{ik} - \delta \mathbf{v}_{ik}) \Delta t + \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{ik} (\mathbf{I} - \delta\boldsymbol{\phi}_{ik}^\wedge)(\tilde{\mathbf{a}}_k - \mathbf{b}_i^a) \Delta t^2 - \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{ik} \, \boldsymbol{\eta}_k^{ad} \, \Delta t^2 \right]
$$

where we again dropped the second-order term $\delta\boldsymbol{\phi}_{ik}^\wedge \boldsymbol{\eta}_k^{ad}$.

#### Step 3: Separate into measurement + noise

Collecting the noise-free terms and the noise-dependent terms:

$$
= \sum_{k=i}^{j-1} \left[ \Delta \tilde{\mathbf{v}}_{ik} \Delta t + \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a) \Delta t^2 \right] + \sum_{k=i}^{j-1} \left[ -\delta \mathbf{v}_{ik} \Delta t + \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{ik} (-\delta\boldsymbol{\phi}_{ik}^\wedge)(\tilde{\mathbf{a}}_k - \mathbf{b}_i^a) \Delta t^2 - \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{ik} \, \boldsymbol{\eta}_k^{ad} \, \Delta t^2 \right]
$$

Applying the skew-symmetric identity from Part 1 (Section 2.1.2), $\mathbf{a}^\wedge \mathbf{b} = -\mathbf{b}^\wedge \mathbf{a}$, to the skew-symmetric term:

$$
= \underbrace{\sum_{k=i}^{j-1} \left[ \Delta \tilde{\mathbf{v}}_{ik} \Delta t + \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a) \Delta t^2 \right]}_{\Delta \tilde{\mathbf{p}}_{ij}} - \underbrace{\sum_{k=i}^{j-1} \left[ \delta \mathbf{v}_{ik} \Delta t - \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a)^\wedge \, \delta\boldsymbol{\phi}_{ik} \, \Delta t^2 + \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{ik} \, \boldsymbol{\eta}_k^{ad} \, \Delta t^2 \right]}_{\delta \mathbf{p}_{ij}}
$$

#### Summary: preintegrated position measurement model

This gives us (**Eq. 37**):

$$
\Delta \mathbf{p}_{ij} = \Delta \tilde{\mathbf{p}}_{ij} - \delta \mathbf{p}_{ij}
$$

Rearranging to match the measurement model form (**Eq. 38**, position):

$$
\boxed{\Delta \tilde{\mathbf{p}}_{ij} = \Delta \mathbf{p}_{ij} + \delta \mathbf{p}_{ij}}
$$

where the noise $\delta \mathbf{p}_{ij}$ is also **additive** in $\mathbb{R}^3$. It depends on the accelerometer noise $\boldsymbol{\eta}_k^{ad}$, the rotation noise $\delta\boldsymbol{\phi}_{ik}$, and the velocity noise $\delta \mathbf{v}_{ik}$ — reflecting the cascading coupling: rotation error affects velocity, and both affect position.

### 3.5 The Complete Noise Model (**Eq. 38–39**)

Collecting the results, the noise of the preintegrated measurements is:

$$
\begin{bmatrix} \delta \boldsymbol{\phi}_{ij} \\ \delta \mathbf{v}_{ij} \\ \delta \mathbf{p}_{ij} \end{bmatrix} \sim \mathcal{N}\left(\mathbf{0}_{9\times1}, \; \boldsymbol{\Sigma}_{ij}\right)
$$

Since $\delta\boldsymbol{\phi}_{ij}$, $\delta\mathbf{v}_{ij}$, and $\delta\mathbf{p}_{ij}$ are all **linear combinations** of zero-mean Gaussian noise (**Eqs. 42–43**), they are themselves zero-mean Gaussian. This is a key property: it makes the **negative log-likelihood** of the measurements a **quadratic** function — exactly what we need for least-squares optimization.

The advantage of Eq. (38) compared to the original Eq. (33) is that it **separates the noise** from the measurement. The noisy preintegrated measurements $\Delta \tilde{\mathbf{R}}_{ij}$, $\Delta \tilde{\mathbf{v}}_{ij}$, $\Delta \tilde{\mathbf{p}}_{ij}$ can be computed once; the noise terms define their stochastic properties via the covariance $\boldsymbol{\Sigma}_{ij}$.

---

## 4. Error-State & Covariance Propagation

### 4.1 Why We Need Covariance

The covariance $\boldsymbol{\Sigma}_{ij}$ tells us how uncertain the preintegrated measurement is. In the factor graph, its inverse $\boldsymbol{\Sigma}_{ij}^{-1}$ serves as the **information matrix** — the weight of the IMU factor. Without it, we cannot properly balance IMU constraints against visual constraints.

A preintegration over 10ms (a few IMU samples) has small uncertainty; one over 500ms has much more accumulated noise. The covariance captures this automatically.

### 4.2 Iterative Noise Propagation (Appendix A, **Eqs. 59–62**)

The noise vectors $\delta\boldsymbol{\phi}_{ij}$, $\delta\mathbf{v}_{ij}$, $\delta\mathbf{p}_{ij}$ were defined as **summations** over all IMU steps. To propagate the covariance $\boldsymbol{\Sigma}_{ij}$ efficiently, we need to convert these summations into **recursive (iterative) form**. The key idea is to separate the last term ($k = j-1$) from the sum and recognize the remaining sum as the previous noise state.

#### Rotation error (**Eq. 59**)

Starting from the rotation noise (derived in Section 3.2):

$$
\delta\boldsymbol{\phi}_{ij} \simeq \sum_{k=i}^{j-1} \Delta \tilde{\mathbf{R}}_{k+1,j}^T \, \mathbf{J}_r^k \, \boldsymbol{\eta}_k^{gd} \, \Delta t
$$

Separate the last term ($k = j-1$) from the sum. Note that $\Delta \tilde{\mathbf{R}}_{j,j}^T = \mathbf{I}_{3 \times 3}$:

$$
= \sum_{k=i}^{j-2} \Delta \tilde{\mathbf{R}}_{k+1,j}^T \, \mathbf{J}_r^k \, \boldsymbol{\eta}_k^{gd} \, \Delta t \;+\; \overbrace{\Delta \tilde{\mathbf{R}}_{j,j}^T}^{=\,\mathbf{I}_{3\times3}} \, \mathbf{J}_r^{j-1} \, \boldsymbol{\eta}_{j-1}^{gd} \, \Delta t
$$

Expanding $\Delta \tilde{\mathbf{R}}_{k+1,j}$ in the remaining sum:

$$
= \sum_{k=i}^{j-2} \overbrace{(\Delta \tilde{\mathbf{R}}_{k+1,j-1} \cdot \Delta \tilde{\mathbf{R}}_{j-1,j})}^{=\,\Delta \tilde{\mathbf{R}}_{k+1,j}}{}^T \, \mathbf{J}_r^k \, \boldsymbol{\eta}_k^{gd} \, \Delta t \;+\; \mathbf{J}_r^{j-1} \, \boldsymbol{\eta}_{j-1}^{gd} \, \Delta t
$$

Factor out $\Delta \tilde{\mathbf{R}}_{j-1,j}^T$ using $(\mathbf{A}\mathbf{B})^T = \mathbf{B}^T\mathbf{A}^T$:

$$
= \Delta \tilde{\mathbf{R}}_{j-1,j}^T \underbrace{\sum_{k=i}^{j-2} \Delta \tilde{\mathbf{R}}_{k+1,j-1}^T \, \mathbf{J}_r^k \, \boldsymbol{\eta}_k^{gd} \, \Delta t}_{\delta\boldsymbol{\phi}_{i,j-1}} \;+\; \mathbf{J}_r^{j-1} \, \boldsymbol{\eta}_{j-1}^{gd} \, \Delta t
$$

This gives the recursion (**Eq. 59**):

$$
\boxed{\delta\boldsymbol{\phi}_{ij} \simeq \Delta \tilde{\mathbf{R}}_{j-1,j}^T \, \delta\boldsymbol{\phi}_{i,j-1} + \mathbf{J}_r^{j-1} \, \boldsymbol{\eta}_{j-1}^{gd} \, \Delta t}
$$

The rotation error propagates **independently** — it depends only on the previous rotation error (via $\Delta \tilde{\mathbf{R}}_{j-1,j}^T$) and the new gyroscope noise.

#### Velocity error (**Eq. 60**)

Starting from the velocity noise (derived in Section 3.3):

$$
\delta\mathbf{v}_{ij} = \sum_{k=i}^{j-1} \left[ -\Delta \tilde{\mathbf{R}}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a)^\wedge \, \delta\boldsymbol{\phi}_{ik} \, \Delta t + \Delta \tilde{\mathbf{R}}_{ik} \, \boldsymbol{\eta}_k^{ad} \, \Delta t \right]
$$

Separate the last term ($k = j-1$):

$$
\begin{aligned}
= \; &\underbrace{\sum_{k=i}^{j-2} \left[ -\Delta \tilde{\mathbf{R}}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a)^\wedge \, \delta\boldsymbol{\phi}_{ik} \, \Delta t + \Delta \tilde{\mathbf{R}}_{ik} \, \boldsymbol{\eta}_k^{ad} \, \Delta t \right]}_{\delta\mathbf{v}_{i,j-1}} \\
&-\; \Delta \tilde{\mathbf{R}}_{i,j-1} (\tilde{\mathbf{a}}_{j-1} - \mathbf{b}_i^a)^\wedge \, \delta\boldsymbol{\phi}_{i,j-1} \, \Delta t \;+\; \Delta \tilde{\mathbf{R}}_{i,j-1} \, \boldsymbol{\eta}_{j-1}^{ad} \, \Delta t
\end{aligned}
$$

This gives the recursion (**Eq. 60**):

$$
\boxed{\delta\mathbf{v}_{ij} = \delta\mathbf{v}_{i,j-1} - \Delta \tilde{\mathbf{R}}_{i,j-1} (\tilde{\mathbf{a}}_{j-1} - \mathbf{b}_i^a)^\wedge \, \delta\boldsymbol{\phi}_{i,j-1} \, \Delta t + \Delta \tilde{\mathbf{R}}_{i,j-1} \, \boldsymbol{\eta}_{j-1}^{ad} \, \Delta t}
$$

The coupling term $-\Delta \tilde{\mathbf{R}}_{i,j-1}(\tilde{\mathbf{a}}_{j-1} - \mathbf{b}_i^a)^\wedge \delta\boldsymbol{\phi}_{i,j-1}$ arises because rotation noise affects the direction in which acceleration is integrated. Mathematically, it comes from $\text{Exp}(\delta\boldsymbol{\phi}) \approx \mathbf{I} + \delta\boldsymbol{\phi}^\wedge$ applied to the acceleration vector.

#### Position error (**Eq. 61**)

Starting from the position noise (derived in Section 3.4):

$$
\delta\mathbf{p}_{ij} = \sum_{k=i}^{j-1} \left[ \delta\mathbf{v}_{ik} \, \Delta t - \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a)^\wedge \, \delta\boldsymbol{\phi}_{ik} \, \Delta t^2 + \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{ik} \, \boldsymbol{\eta}_k^{ad} \, \Delta t^2 \right]
$$

Separate the last term ($k = j-1$):

$$
\begin{aligned}
= \; &\underbrace{\sum_{k=i}^{j-2} \left[ \delta\mathbf{v}_{ik} \, \Delta t - \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{ik} (\tilde{\mathbf{a}}_k - \mathbf{b}_i^a)^\wedge \, \delta\boldsymbol{\phi}_{ik} \, \Delta t^2 + \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{ik} \, \boldsymbol{\eta}_k^{ad} \, \Delta t^2 \right]}_{\delta\mathbf{p}_{i,j-1}} \\
&+\; \delta\mathbf{v}_{i,j-1} \, \Delta t - \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{i,j-1} (\tilde{\mathbf{a}}_{j-1} - \mathbf{b}_i^a)^\wedge \, \delta\boldsymbol{\phi}_{i,j-1} \, \Delta t^2 + \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{i,j-1} \, \boldsymbol{\eta}_{j-1}^{ad} \, \Delta t^2
\end{aligned}
$$

This gives the recursion (**Eq. 61**):

$$
\boxed{\delta\mathbf{p}_{ij} = \delta\mathbf{p}_{i,j-1} + \delta\mathbf{v}_{i,j-1} \, \Delta t - \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{i,j-1} (\tilde{\mathbf{a}}_{j-1} - \mathbf{b}_i^a)^\wedge \, \delta\boldsymbol{\phi}_{i,j-1} \, \Delta t^2 + \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{i,j-1} \, \boldsymbol{\eta}_{j-1}^{ad} \, \Delta t^2}
$$

The position error depends on the previous position error, previous velocity error, previous rotation error, and new accelerometer noise — reflecting the cascading coupling structure.

### 4.3 Error-State Propagation in Matrix Form (**Eq. 62**)

Recalling that $\boldsymbol{\eta}_{ik}^{\Delta} \doteq [\delta\boldsymbol{\phi}_{ik},\; \delta\mathbf{v}_{ik},\; \delta\mathbf{p}_{ik}]$ and defining the IMU measurement noise $\boldsymbol{\eta}_k^d \doteq [\boldsymbol{\eta}_k^{gd} \quad \boldsymbol{\eta}_k^{ad}]$, we can write the three propagation equations (Eqs. 59–61) in compact matrix form:

$$
\boxed{\boldsymbol{\eta}_{ij}^{\Delta} = \mathbf{A}_{j-1} \, \boldsymbol{\eta}_{i,j-1}^{\Delta} + \mathbf{B}_{j-1} \, \boldsymbol{\eta}_{j-1}^d} \hspace{4em}
$$

where:

$$
\mathbf{A}_{j-1} = \begin{bmatrix}
\Delta \tilde{\mathbf{R}}_{j-1,j}^T & \mathbf{0} & \mathbf{0} \\[4pt]
-\Delta \tilde{\mathbf{R}}_{i,j-1} (\tilde{\mathbf{a}}_{j-1} - \mathbf{b}_i^a)^\wedge \Delta t & \mathbf{I} & \mathbf{0} \\[4pt]
-\frac{1}{2}\Delta \tilde{\mathbf{R}}_{i,j-1} (\tilde{\mathbf{a}}_{j-1} - \mathbf{b}_i^a)^\wedge \Delta t^2 & \mathbf{I} \Delta t & \mathbf{I}
\end{bmatrix}
$$

$$
\mathbf{B}_{j-1} = \begin{bmatrix}
\mathbf{J}_r^{j-1} \Delta t & \mathbf{0} \\[4pt]
\mathbf{0} & \Delta \tilde{\mathbf{R}}_{i,j-1} \Delta t \\[4pt]
\mathbf{0} & \frac{1}{2}\Delta \tilde{\mathbf{R}}_{i,j-1} \Delta t^2
\end{bmatrix}
$$

The **lower-triangular structure** of $\mathbf{A}_{j-1}$ reveals the physical coupling:
- Rotation error propagates **independently** (top-left block)
- Velocity error depends on **rotation error** (through the skew-symmetric acceleration coupling)
- Position error depends on **both rotation and velocity errors**

### 4.4 Covariance Propagation (**Eq. 63**)

From the linear model (Eq. 62) and given the covariance $\boldsymbol{\Sigma}_\eta \in \mathbb{R}^{6 \times 6}$ of the raw IMU measurement noise $\boldsymbol{\eta}_k^d$, the preintegrated measurement covariance propagates iteratively as:

$$
\boldsymbol{\Sigma}_{ij} = \mathbf{A}_{j-1} \, \boldsymbol{\Sigma}_{i,j-1} \, \mathbf{A}_{j-1}^T + \mathbf{B}_{j-1} \, \boldsymbol{\Sigma}_\eta \, \mathbf{B}_{j-1}^T \hspace{4em}
$$

where $\boldsymbol{\Sigma}_\eta \in \mathbb{R}^{6 \times 6}$ is the discrete-time IMU noise covariance:

$$
\boldsymbol{\Sigma}_\eta = \begin{bmatrix}
\sigma_{gd}^2 \, \mathbf{I}_3 & \mathbf{0} \\
\mathbf{0} & \sigma_{ad}^2 \, \mathbf{I}_3
\end{bmatrix}
$$

The discrete-time noise variances are related to the continuous-time noise densities by $\sigma_{gd}^2 = \sigma_g^2 / \Delta t$ and $\sigma_{ad}^2 = \sigma_a^2 / \Delta t$, where $\sigma_g$ and $\sigma_a$ come from the sensor datasheet or Allan variance analysis.

Starting from $\boldsymbol{\Sigma}_{ii} = \mathbf{0}_{9\times9}$, we propagate this recursively alongside the preintegrated measurements. After all IMU samples from $i$ to $j$ are processed:

$$
\boldsymbol{\Sigma}_{ij} \in \mathbb{R}^{9 \times 9}
$$

In the factor graph, the cost function uses the **Mahalanobis distance**:

$$
\left\| \mathbf{r}_{ij} \right\|^2_{\boldsymbol{\Sigma}_{ij}} = \mathbf{r}_{ij}^T \boldsymbol{\Sigma}_{ij}^{-1} \mathbf{r}_{ij}
$$

where $\mathbf{r}_{ij}$ is the residual (to be defined in Part 3). This naturally down-weights long preintegration intervals (more noise) and up-weights short, precise segments.

### 4.5 Bias Correction via First-Order Updates (Appendix B, **Eqs. 64–68**)

The preintegrated measurements depend on the bias estimate $\bar{\mathbf{b}}$ at which they were computed. During optimization, the bias is updated. Must we re-integrate?

The answer is **No.** Let $\bar{\mathbf{b}}$ be the bias at preintegration time, and $\delta \mathbf{b}$ the small update from the optimizer. The paper uses a **first-order correction**.

#### Rotation bias correction (**Eq. 65–68**)

The preintegrated rotation measurement is a function of the bias estimate $\hat{\mathbf{b}}_i$:

$$
\Delta \tilde{\mathbf{R}}_{ij}(\hat{\mathbf{b}}_i) = \prod_{k=i}^{j-1} \text{Exp}\left((\tilde{\boldsymbol{\omega}}_k - \hat{\mathbf{b}}_i^g)\Delta t\right)
$$

Substituting $\hat{\mathbf{b}}_i^g = \bar{\mathbf{b}}_i^g + \delta \mathbf{b}_i^g$, where $\bar{\mathbf{b}}_i^g$ is the bias at preintegration time and $\delta \mathbf{b}_i^g$ is the small update from the optimizer:

$$
= \prod_{k=i}^{j-1} \text{Exp}\left((\tilde{\boldsymbol{\omega}}_k - \bar{\mathbf{b}}_i^g - \delta \mathbf{b}_i^g)\Delta t\right)
$$

Since $\delta \mathbf{b}_i^g$ is small, apply the BCH first-order approximation from Part 1 (Section 2.1.4) to each factor:

$$
\simeq \prod_{k=i}^{j-1} \text{Exp}\left((\tilde{\boldsymbol{\omega}}_k - \bar{\mathbf{b}}_i^g)\Delta t\right) \cdot \text{Exp}\left(-\mathbf{J}_r^k \, \delta \mathbf{b}_i^g \, \Delta t\right)
$$

This has the same structure as the noise isolation in Section 3.2 — signal and perturbation terms are interleaved. Using the **Adjoint identity** from Part 1 (Section 2.1.5) repeatedly to push all perturbation exponentials to the right (exactly as in Steps 2–3 of Section 3.2):

$$
= \Delta \bar{\mathbf{R}}_{ij} \prod_{k=i}^{j-1} \text{Exp}\left(-\Delta \tilde{\mathbf{R}}_{k+1,j}^T(\bar{\mathbf{b}}_i) \, \mathbf{J}_r^k \, \delta \mathbf{b}_i^g \, \Delta t\right)
$$

Since $\delta \mathbf{b}_i^g$ is small, collapse the product of exponentials via BCH (Part 1, Section 2.1.4):

$$
\approx \Delta \bar{\mathbf{R}}_{ij} \cdot \text{Exp}\left(\sum_{k=i}^{j-1} -\Delta \tilde{\mathbf{R}}_{k+1,j}^T(\bar{\mathbf{b}}_i) \, \mathbf{J}_r^k \, \delta \mathbf{b}_i^g \, \Delta t\right)
$$

Defining the **rotation bias Jacobian** $\frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g} \triangleq \sum_{k=i}^{j-1} -\Delta \tilde{\mathbf{R}}_{k+1,j}^T(\bar{\mathbf{b}}_i) \, \mathbf{J}_r^k \, \Delta t$, we arrive at (**Eq. 68**):

$$
\boxed{\Delta \tilde{\mathbf{R}}_{ij}(\hat{\mathbf{b}}_i) \approx \Delta \bar{\mathbf{R}}_{ij} \cdot \text{Exp}\left(\frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g} \, \delta \mathbf{b}_i^g\right)}
$$

This means we can correct the preintegrated rotation **without re-integrating** — just multiply by a small rotation computed from the bias Jacobian and the bias update.

#### Velocity bias correction

The preintegrated velocity measurement is a function of both bias estimates $\hat{\mathbf{b}}_i^g$ and $\hat{\mathbf{b}}_i^a$:

$$
\Delta \tilde{\mathbf{v}}_{ij}(\hat{\mathbf{b}}_i) = \sum_{k=i}^{j-1} \Delta \tilde{\mathbf{R}}_{ik}(\hat{\mathbf{b}}_i) \, (\tilde{\mathbf{a}}_k - \hat{\mathbf{b}}_i^a) \, \Delta t
$$

Substituting $\hat{\mathbf{b}}_i^a = \bar{\mathbf{b}}_i^a + \delta \mathbf{b}_i^a$:

$$
= \sum_{k=i}^{j-1} \Delta \tilde{\mathbf{R}}_{ik}(\hat{\mathbf{b}}_i) \, (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a - \delta \mathbf{b}_i^a) \, \Delta t
$$

Now substitute the rotation bias correction result from **Eq. 68**: $\Delta \tilde{\mathbf{R}}_{ik}(\hat{\mathbf{b}}_i) \approx \Delta \bar{\mathbf{R}}_{ik} \cdot \text{Exp}\left(\frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g\right)$:

$$
= \sum_{k=i}^{j-1} \Delta \bar{\mathbf{R}}_{ik} \, \text{Exp}\left(\frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g\right) (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a - \delta \mathbf{b}_i^a) \, \Delta t
$$

Since $\delta \mathbf{b}_i^g$ is small, apply the first-order exponential map approximation from Part 1 (Section 2.1.3), $\text{Exp}(\boldsymbol{\phi}) \approx \mathbf{I} + \boldsymbol{\phi}^\wedge$:

$$
= \sum_{k=i}^{j-1} \Delta \bar{\mathbf{R}}_{ik} \left(\mathbf{I} + \left(\frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g\right)^\wedge\right) (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a - \delta \mathbf{b}_i^a) \, \Delta t
$$

Expanding the product:

$$
= \sum_{k=i}^{j-1} \Delta \bar{\mathbf{R}}_{ik} \, (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a - \delta \mathbf{b}_i^a) \, \Delta t \;+\; \sum_{k=i}^{j-1} \Delta \bar{\mathbf{R}}_{ik} \left(\frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g\right)^\wedge (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a - \delta \mathbf{b}_i^a) \, \Delta t
$$

In the second sum, the term involving $\delta \mathbf{b}_i^a$ produces a second-order product $\delta \mathbf{b}_i^g \cdot \delta \mathbf{b}_i^a$, which we drop:

$$
\approx \underbrace{\sum_{k=i}^{j-1} \Delta \bar{\mathbf{R}}_{ik} \, (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a) \, \Delta t}_{\Delta \bar{\mathbf{v}}_{ij}} \;-\; \sum_{k=i}^{j-1} \Delta \bar{\mathbf{R}}_{ik} \, \Delta t \cdot \delta \mathbf{b}_i^a \;+\; \sum_{k=i}^{j-1} \Delta \bar{\mathbf{R}}_{ik} \left(\frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g\right)^\wedge (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a) \, \Delta t
$$

For the last sum, apply the skew-symmetric identity from Part 1 (Section 2.1.2), $\mathbf{a}^\wedge \mathbf{b} = -\mathbf{b}^\wedge \mathbf{a}$:

$$
= \Delta \bar{\mathbf{v}}_{ij} \underbrace{-\sum_{k=i}^{j-1} \Delta \bar{\mathbf{R}}_{ik} \, \Delta t}_{\frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^a}} \cdot\, \delta \mathbf{b}_i^a \;\underbrace{-\sum_{k=i}^{j-1} \Delta \bar{\mathbf{R}}_{ik} \, (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a)^\wedge \frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \, \Delta t}_{\frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^g}} \cdot\, \delta \mathbf{b}_i^g
$$

This gives us the velocity bias correction:

$$
\boxed{\Delta \tilde{\mathbf{v}}_{ij}(\hat{\mathbf{b}}_i) \approx \Delta \bar{\mathbf{v}}_{ij} + \frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^a} \delta \mathbf{b}_i^a + \frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g}
$$

Unlike the rotation correction which is **multiplicative** (via $\text{Exp}$), the velocity correction is **additive** — consistent with velocity living in $\mathbb{R}^3$. Note that the velocity depends on **both** the gyroscope bias (through the rotation correction) and the accelerometer bias (directly).

#### Position bias correction

The preintegrated position measurement is a function of both the velocity and rotation bias corrections:

$$
\Delta \tilde{\mathbf{p}}_{ij}(\hat{\mathbf{b}}_i) = \sum_{k=i}^{j-1} \left[ \Delta \tilde{\mathbf{v}}_{ik}(\hat{\mathbf{b}}_i) \, \Delta t + \tfrac{1}{2} \Delta \tilde{\mathbf{R}}_{ik}(\hat{\mathbf{b}}_i) \, (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a - \delta \mathbf{b}_i^a) \, \Delta t^2 \right]
$$

Substitute the rotation bias correction $\Delta \tilde{\mathbf{R}}_{ik}(\hat{\mathbf{b}}_i) \approx \Delta \bar{\mathbf{R}}_{ik} \cdot \text{Exp}\left(\frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g\right)$ for the rotation term:

$$
\simeq \sum_{k=i}^{j-1} \left[ \Delta \tilde{\mathbf{v}}_{ik}(\hat{\mathbf{b}}_i) \, \Delta t + \tfrac{1}{2} \Delta \bar{\mathbf{R}}_{ik} \, \text{Exp}\left(\frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g\right) (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a - \delta \mathbf{b}_i^a) \, \Delta t^2 \right]
$$

Apply the first-order Exp approximation (Part 1, Section 2.1.3) to the rotation term, and substitute the velocity bias correction result $\Delta \tilde{\mathbf{v}}_{ik}(\hat{\mathbf{b}}_i) \approx \Delta \bar{\mathbf{v}}_{ik} + \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^a} \delta \mathbf{b}_i^a + \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g$:

$$
\simeq \sum_{k=i}^{j-1} \left[ \left(\Delta \bar{\mathbf{v}}_{ik} + \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^a} \delta \mathbf{b}_i^a + \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g\right) \Delta t + \tfrac{1}{2} \Delta \bar{\mathbf{R}}_{ik} \left(\mathbf{I} + \left(\frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g\right)^\wedge\right) (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a - \delta \mathbf{b}_i^a) \, \Delta t^2 \right]
$$

Expanding all products:

$$
= \sum_{k=i}^{j-1} \left[ \Delta \bar{\mathbf{v}}_{ik} \, \Delta t + \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^a} \delta \mathbf{b}_i^a \, \Delta t + \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g \, \Delta t + \tfrac{1}{2} \Delta \bar{\mathbf{R}}_{ik} (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a) \, \Delta t^2 - \tfrac{1}{2} \Delta \bar{\mathbf{R}}_{ik} \, \delta \mathbf{b}_i^a \, \Delta t^2 + \tfrac{1}{2} \Delta \bar{\mathbf{R}}_{ik} \left(\frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g\right)^\wedge (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a - \delta \mathbf{b}_i^a) \, \Delta t^2 \right]
$$

Identifying the noise-free terms and dropping the second-order $\delta \mathbf{b}_i^g \cdot \delta \mathbf{b}_i^a$ product in the last term:

$$
= \underbrace{\sum_{k=i}^{j-1} \left[ \Delta \bar{\mathbf{v}}_{ik} \, \Delta t + \tfrac{1}{2} \Delta \bar{\mathbf{R}}_{ik} (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a) \, \Delta t^2 \right]}_{\Delta \bar{\mathbf{p}}_{ij}} + \sum_{k=i}^{j-1} \left[ \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^a} \delta \mathbf{b}_i^a \, \Delta t - \tfrac{1}{2} \Delta \bar{\mathbf{R}}_{ik} \, \delta \mathbf{b}_i^a \, \Delta t^2 + \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g \, \Delta t + \tfrac{1}{2} \Delta \bar{\mathbf{R}}_{ik} \left(\frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g\right)^\wedge (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a) \, \Delta t^2 \right]
$$

Applying the skew-symmetric identity from Part 1 (Section 2.1.2), $\mathbf{a}^\wedge \mathbf{b} = -\mathbf{b}^\wedge \mathbf{a}$, to the last term, then grouping by $\delta \mathbf{b}_i^a$ and $\delta \mathbf{b}_i^g$:

$$
= \Delta \bar{\mathbf{p}}_{ij} + \sum_{k=i}^{j-1} \left[ \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^a} \Delta t - \tfrac{1}{2} \Delta \bar{\mathbf{R}}_{ik} \, \Delta t^2 \right] \delta \mathbf{b}_i^a + \sum_{k=i}^{j-1} \left[ \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^g} \Delta t - \tfrac{1}{2} \Delta \bar{\mathbf{R}}_{ik} \, (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a)^\wedge \frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \, \Delta t^2 \right] \delta \mathbf{b}_i^g
$$

This gives us the position bias correction:

$$
\boxed{\Delta \tilde{\mathbf{p}}_{ij}(\hat{\mathbf{b}}_i) \approx \Delta \bar{\mathbf{p}}_{ij} + \frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^a} \delta \mathbf{b}_i^a + \frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^g} \delta \mathbf{b}_i^g}
$$

where the position bias Jacobians are defined as:

$$
\begin{aligned}
\frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^a} &= \sum_{k=i}^{j-1} \left[ \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^a} \Delta t - \tfrac{1}{2} \Delta \bar{\mathbf{R}}_{ik} \, \Delta t^2 \right] \\[6pt]
\frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^g} &= \sum_{k=i}^{j-1} \left[ \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^g} \Delta t - \tfrac{1}{2} \Delta \bar{\mathbf{R}}_{ik} \, (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a)^\wedge \frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \, \Delta t^2 \right]
\end{aligned}
$$

The position correction is also **additive**, and depends on both bias updates. The Jacobians have a cascading structure: the position-bias Jacobians are built from the velocity-bias Jacobians and the rotation-bias Jacobian, reflecting the physical coupling $\text{rotation} \to \text{velocity} \to \text{position}$.

#### Summary: Bias Jacobians

Collecting the Jacobian definitions from the rotation, velocity, and position bias corrections above:

$$
\begin{aligned}
\frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g} &= -\sum_{k=i}^{j-1} \Delta \tilde{\mathbf{R}}_{k+1,j}^T(\bar{\mathbf{b}}_i) \, \mathbf{J}_r^k \, \Delta t \\[6pt]
\frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^a} &= -\sum_{k=i}^{j-1} \Delta \bar{\mathbf{R}}_{ik} \, \Delta t \\[6pt]
\frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^g} &= -\sum_{k=i}^{j-1} \Delta \bar{\mathbf{R}}_{ik} \, (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a)^\wedge \frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \, \Delta t \\[6pt]
\frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^a} &= \sum_{k=i}^{j-1} \left[ \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^a} \Delta t - \tfrac{1}{2} \Delta \bar{\mathbf{R}}_{ik} \, \Delta t^2 \right] \\[6pt]
\frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^g} &= \sum_{k=i}^{j-1} \left[ \frac{\partial \Delta \bar{\mathbf{v}}_{ik}}{\partial \mathbf{b}^g} \Delta t - \tfrac{1}{2} \Delta \bar{\mathbf{R}}_{ik} \, (\tilde{\mathbf{a}}_k - \bar{\mathbf{b}}_i^a)^\wedge \frac{\partial \Delta \bar{\mathbf{R}}_{ik}}{\partial \mathbf{b}^g} \, \Delta t^2 \right]
\end{aligned}
$$

All initialized to zero matrices. In practice, these Jacobians are computed **incrementally** during preintegration — no need to store all raw IMU data.

If $\delta\mathbf{b}$ becomes too large (the linearization breaks down), we trigger a full re-integration. In practice, this rarely happens because bias changes are small between optimizer iterations.

## 5. Summary: What Gets Stored

After processing all IMU measurements between keyframes $i$ and $j$, the preintegration module stores a fixed-size summary — regardless of how many IMU samples were collected:

| Quantity | Size | Purpose |
|----------|------|---------|
| $\Delta \tilde{\mathbf{R}}_{ij}$ | $3 \times 3$ | Preintegrated rotation measurement |
| $\Delta \tilde{\mathbf{v}}_{ij}$ | $3 \times 1$ | Preintegrated velocity measurement |
| $\Delta \tilde{\mathbf{p}}_{ij}$ | $3 \times 1$ | Preintegrated position measurement |
| $\boldsymbol{\Sigma}_{ij}$ | $9 \times 9$ | Measurement covariance (from $\mathbf{A}_{j-1}, \mathbf{B}_{j-1}$ propagation) |
| $\frac{\partial \Delta \bar{\mathbf{R}}_{ij}}{\partial \mathbf{b}^g}$ | $3 \times 3$ | Rotation-gyro bias Jacobian |
| $\frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^g}$, $\frac{\partial \Delta \bar{\mathbf{v}}_{ij}}{\partial \mathbf{b}^a}$ | $3 \times 3$ each | Velocity-bias Jacobians |
| $\frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^g}$, $\frac{\partial \Delta \bar{\mathbf{p}}_{ij}}{\partial \mathbf{b}^a}$ | $3 \times 3$ each | Position-bias Jacobians |
| $\Delta t_{ij}$ | scalar | Total integration time |

Everything above is computed in a **single pass** over the IMU data — the measurement updates, covariance propagation, and bias Jacobians are all done in the same loop.

---

## What's Next?

In **Part 3**, we will:
- Define the **residual functions** (**Eq. 45** of Forster et al.) that measure the discrepancy between the optimized states and the preintegrated measurements on the $SO(3)$ manifold
- Derive the **Jacobians of the residuals** step by step — the most mathematically involved part of the entire framework, using the Adjoint map, Right Jacobian, and BCH linearization
- Show how these are assembled into the Gauss-Newton system $\Delta \mathbf{x}^* = -(\mathbf{J}^T \boldsymbol{\Sigma}^{-1} \mathbf{J})^{-1} \mathbf{J}^T \boldsymbol{\Sigma}^{-1} \mathbf{r}$

---

## References

1. C. Forster, L. Carlone, F. Dellaert, and D. Scaramuzza, "[On-Manifold Preintegration for Real-Time Visual-Inertial Odometry](https://ieeexplore.ieee.org/document/7557075/)," *IEEE Transactions on Robotics*, vol. 33, no. 1, pp. 1–21, 2017.
2. C. Campos, R. Elvira, J. J. G. Rodriguez, J. M. M. Montiel, and J. D. Tardos, "[ORB-SLAM3: An Accurate Open-Source Library for Visual, Visual-Inertial, and Multimap SLAM](https://ieeexplore.ieee.org/document/9440682/)," *IEEE Transactions on Robotics*, vol. 37, no. 6, pp. 1874–1890, 2021.
3. J. Sola, "[Quaternion kinematics for the error-state Kalman filter](https://arxiv.org/abs/1711.02508)," *arXiv preprint arXiv:1711.02508*, 2017.
