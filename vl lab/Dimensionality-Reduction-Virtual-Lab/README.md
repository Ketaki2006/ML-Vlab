# Dimensionality Reduction Virtual Laboratory
### Experiment 04: Implementation and Comparative Analysis of PCA, SVD, t-SNE and UMAP

A complete, high-performance, browser-based Machine Learning Virtual Laboratory and official Academic Examination Report built strictly with **HTML5, Modern CSS3, Vanilla JavaScript, Plotly.js, and LocalStorage**.

---

## 🔬 Experiment Overview

* **Experiment Title:** Implementation and Comparison of PCA, SVD, t-SNE and UMAP.
* **Target Dataset:** Breast Cancer Wisconsin (Diagnostic) Dataset (`wdbc.data`) from the UCI Machine Learning Repository.
* **Sample Count:** 569 patient biopsy instances ($N$).
* **Original Dimensionality:** 30 continuous cell nucleus morphological features ($D$).
* **Target Classes:** 2 Classes — Malignant ($M = 212$, $37.3\%$) and Benign ($B = 357$, $62.7\%$).
* **Objective:** Project high-dimensional pathological data into $\mathbb{R}^2$ and $\mathbb{R}^3$ subspaces, analyzing variance preservation, cluster discriminability, and computational latency.

---

## 📁 Project Structure

```text
Dimensionality-Reduction-Virtual-Lab/
│
├── index.html              # Main Virtual Lab Single-Page Application (6 Sections)
├── report.html             # Official Academic Examination Report (A4 Print-Ready)
├── README.md               # Documentation and Run Instructions
│
├── css/
│   └── style.css           # Modern Dark Navy SaaS Theme with Violet Accents
│
├── js/
│   ├── app.js              # Application Controller & LocalStorage State Sync
│   ├── algorithms.js       # Mathematical Engines for PCA, SVD, t-SNE & UMAP
│   ├── charts.js           # Plotly.js 2D/3D Scatter & Scree Plot Manager
│   └── data.js             # Data Ingestion, Z-Score Standardization & Statistics
│
├── data/
│   └── wdbc.data           # UCI Wisconsin Diagnostic Dataset (569 samples, 30 features)
│
└── assets/
    └── logo.svg            # Custom High-Dim Projection Vector Logo
```

---

## 🚀 Exact Instructions to Run via VS Code Live Server

This project requires **NO** npm installs, Node backend, Python runtime, or build tools. It runs natively in any modern web browser.

### Step 1: Open VS Code
1. Open **Visual Studio Code**.
2. Select **File &rarr; Open Folder...** and choose either:
   * `c:\Users\Ketaki Amit Patil\4th Sem folder\ML\vl lab`
   * or directly `c:\Users\Ketaki Amit Patil\4th Sem folder\ML\vl lab\Dimensionality-Reduction-Virtual-Lab`

### Step 2: Install Live Server (if not already installed)
1. In VS Code, click on the **Extensions** icon on the left sidebar (or press `Ctrl + Shift + X`).
2. Search for **Live Server** (by *Ritwick Dey*).
3. Click **Install**.

### Step 3: Launch the Virtual Lab
1. In the VS Code file explorer, right-click on `index.html` (inside `Dimensionality-Reduction-Virtual-Lab`).
2. Click **"Open with Live Server"** (or click **"Go Live"** on the bottom status bar).
3. The Virtual Lab will open in your default browser at:
   ```text
   http://127.0.0.1:5500/Dimensionality-Reduction-Virtual-Lab/index.html
   ```

---

## 🧪 Laboratory Workflow & Features

### 1. Aim / Home Section
* Detailed experiment objective, dataset breakdown, and statistics preview table.
* Quick-navigation cards to jump straight into simulation or theory.

### 2. Theory & Mathematics
* Rigorous explanations with KaTeX LaTeX formulas:
  * The **Curse of Dimensionality** & Distance Concentration phenomenon.
  * **PCA**: Sample covariance matrix $\mathbf{C} = \frac{1}{N-1}\mathbf{Z}^T\mathbf{Z}$, Jacobi eigendecomposition $\mathbf{C}\mathbf{v}_i = \lambda_i \mathbf{v}_i$, Explained Variance Ratios ($\text{EVR}_i$).
  * **SVD**: Factorization $\mathbf{X} = \mathbf{U}\mathbf{\Sigma}\mathbf{V}^T$, Gram matrix $\mathbf{X}^T\mathbf{X} = \mathbf{V}\mathbf{\Sigma}^2\mathbf{V}^T$, and Frobenius energy.
  * **t-SNE**: Gaussian affinities $p_{j|i}$, Student-t similarities $q_{ij}$, and Kullback-Leibler divergence minimization $\mathcal{L}_{\text{KL}}$.
  * **UMAP**: Local Riemannian metric spaces, fuzzy simplicial set memberships $p_{ij}$, and fuzzy cross-entropy loss $\mathcal{L}_{\text{CE}}$.
* Comprehensive comparison table detailing linearity, determinism, preserved structure, and time complexity.

### 3. Procedure
* 10 numbered procedural steps from dataset loading and z-score standardization to comparative evaluation.

### 4. Interactive Simulation Dashboard
* **Four Dedicated Algorithm Tabs**: [PCA], [SVD], [t-SNE], [UMAP].
* **2D & 3D Projections**: Toggle between interactive 2D plane and full 3D rotatable WebGL scatter plots.
* **Master Action**: Click **"⚡ Run All 4 Algorithms"** to execute the complete suite in sequence.
* **Live Mathematical Metrics**:
  * Exact execution times in milliseconds.
  * PCA Scree plot displaying individual and cumulative explained variance ($63.18\%$ for 2D, $72.47\%$ for 3D).
  * SVD singular value spectrum chart ($\sigma_1 = 86.84, \sigma_2 = 56.78$).
  * Objective Fisher cluster separability score ($S = \frac{\|\boldsymbol{\mu}_M - \boldsymbol{\mu}_B\|^2}{s_M^2 + s_B^2}$).
  * Diagnostic tumor interpretations explaining the clinical meaning of the projection.

### 5. Dynamic Observations
* Comparison table automatically populated with actual computed metrics from the simulation runs.
* Synchronized 4-way visual thumbnail grid showing PCA, SVD, t-SNE, and UMAP scatter plots side-by-side.
* One-click **"Export Results as CSV"** to download raw experimental metrics.

### 6. Student Profile & Academic Report (`report.html`)
* Enter student name, roll number, department, semester, guide, and date.
* Automatically persists to `LocalStorage` (`dr_lab_contributors`).
* Click **"Academic Report"** to open a comprehensive 14-section formal laboratory report formatted for university examinations and A4 printing (`window.print()`).

---

## 📊 Canonical Experimental Results on WDBC

| Algorithm | Type | Dimensions | Key Metrics | Execution Time | Cluster Separation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PCA** | Linear | $569 \times 30 \to 2\text{D}$ | Cumulative EVR: **63.18%** (PC1: 44.26%, PC2: 18.92%) | $\approx 10 - 20\text{ ms}$ | Distinct linear boundary |
| **SVD** | Linear | $569 \times 30 \to 2\text{D}$ | Retained Energy: **63.18%** ($\sigma_1 = 86.84, \sigma_2 = 56.78$) | $\approx 10 - 20\text{ ms}$ | Equivalent to centered PCA |
| **t-SNE** | Non-Linear | $300 \times 30 \to 2\text{D}$ | $\text{Perplexity} = 30$, $\text{Iterations} = 250$, $\mathcal{L}_{\text{KL}} \approx 0.14$ | $\approx 200 - 300\text{ ms}$ | High local cluster separation |
| **UMAP** | Non-Linear | $569 \times 30 \to 2\text{D}$ | $k = 15$, $\text{min\_dist} = 0.1$, Fuzzy Cross-Entropy | $\approx 350 - 500\text{ ms}$ | High separation + macro-topology |

---

## 🔒 Verification & Offline Compatibility
* Standalone mathematical fallback solvers are built directly into `algorithms.js` so the lab functions even if external CDNs are restricted by institutional firewalls.
* Full compatibility with Chrome, Edge, Firefox, and Safari.
