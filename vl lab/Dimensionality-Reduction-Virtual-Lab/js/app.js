/**
 * Dimensionality Reduction Virtual Lab - Application Controller
 * Manages UI interactions, navigation, simulations, local storage persistence,
 * dynamic observation tables, and CSV exports.
 */

document.addEventListener('DOMContentLoaded', () => {
  const App = {
    currentSection: 'aim',
    activeTab: 'pca',
    isRunning: false,
    results: {
      pca: null,
      svd: null,
      tsne: null,
      umap: null
    },

    // Default simulation parameters
    params: {
      pca: { components: 2, standardize: true },
      svd: { components: 2, standardize: true },
      tsne: { components: 2, sampleSize: 300, perplexity: 30, iterations: 250, epsilon: 100 },
      umap: { components: 2, sampleSize: 569, nNeighbors: 15, minDist: 0.1 }
    },

    init() {
      this.bindNavigation();
      this.bindAlgorithmTabs();
      this.bindParameterControls();
      this.bindActionButtons();
      this.bindContributors();
      this.loadCachedData();
      this.loadDataset();
    },

    // -----------------------------------------------------------------------
    // DATASET LOADING & STATUS
    // -----------------------------------------------------------------------
    async loadDataset() {
      this.updateStatusBadge('Loading dataset...', 'warning');
      try {
        const stats = await window.dataManager.loadDefaultDataset();
        this.onDatasetLoaded(stats);
      } catch (err) {
        console.warn('Dataset auto-fetch failed:', err);
        this.updateStatusBadge('Ready for upload', 'danger');
        this.showToast('Please upload wdbc.data or select sample data.', 'info');
      }
    },

    onDatasetLoaded(stats) {
      this.updateStatusBadge(`Dataset Loaded: ${stats.samplesCount} samples, 30 features`, 'success');
      this.renderDatasetStats(stats);
      this.showToast('Breast Cancer Wisconsin Dataset loaded successfully!', 'success');

      // Auto-run PCA on first visit if no cache exists to display immediate interactive visual
      if (!this.results.pca) {
        this.runSimulation('pca', false);
      } else {
        this.restoreActiveView();
      }
      this.updateObservationsSection();
    },

    updateStatusBadge(text, type = 'info') {
      const badge = document.getElementById('globalStatusBadge');
      if (!badge) return;
      badge.textContent = text;
      badge.className = `status-badge status-${type}`;
    },

    renderDatasetStats(stats) {
      const elSamples = document.getElementById('statTotalSamples');
      const elFeatures = document.getElementById('statTotalFeatures');
      const elMalignant = document.getElementById('statMalignant');
      const elBenign = document.getElementById('statBenign');

      if (elSamples) elSamples.textContent = stats.samplesCount;
      if (elFeatures) elFeatures.textContent = stats.featuresCount;
      if (elMalignant) elMalignant.textContent = `${stats.malignantCount} (${stats.stats.malignantPercent}%)`;
      if (elBenign) elBenign.textContent = `${stats.benignCount} (${stats.stats.benignPercent}%)`;

      // Render summary feature table in dataset preview section
      const tbody = document.getElementById('datasetFeatureTableBody');
      if (tbody && stats.stats && stats.stats.featureStats) {
        tbody.innerHTML = stats.stats.featureStats.slice(0, 10).map((f, i) => `
          <tr>
            <td><code>${i + 1}</code></td>
            <td><strong>${f.name}</strong></td>
            <td>${f.mean}</td>
            <td>${f.std}</td>
            <td>${f.min}</td>
            <td>${f.max}</td>
          </tr>
        `).join('');
      }
    },

    // -----------------------------------------------------------------------
    // NAVIGATION
    // -----------------------------------------------------------------------
    bindNavigation() {
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetSection = link.getAttribute('data-section');
          if (targetSection) this.switchSection(targetSection);
        });
      });

      // Quick-action jump links
      document.querySelectorAll('[data-jump]').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const jumpTarget = el.getAttribute('data-jump');
          if (jumpTarget) this.switchSection(jumpTarget);
        });
      });
    },

    switchSection(sectionId) {
      this.currentSection = sectionId;

      // Update sidebar active link
      document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-section') === sectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Show target content section, hide others
      document.querySelectorAll('.content-section').forEach(sec => {
        if (sec.id === `section-${sectionId}`) {
          sec.classList.add('active');
        } else {
          sec.classList.remove('active');
        }
      });

      // Scroll main area to top
      const mainContainer = document.querySelector('.main-content');
      if (mainContainer) mainContainer.scrollTop = 0;

      // If switched to observations, update table and mini plots
      if (sectionId === 'observations') {
        this.updateObservationsSection();
      }

      // Resize any Plotly graphs
      setTimeout(() => {
        if (window.chartsManager) window.chartsManager.resizeAll();
      }, 50);
    },

    // -----------------------------------------------------------------------
    // SIMULATION ALGORITHM TABS
    // -----------------------------------------------------------------------
    bindAlgorithmTabs() {
      const tabs = document.querySelectorAll('.algo-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const algo = tab.getAttribute('data-algo');
          if (algo) this.switchAlgoTab(algo);
        });
      });
    },

    switchAlgoTab(algo) {
      this.activeTab = algo;
      document.querySelectorAll('.algo-tab').forEach(t => {
        if (t.getAttribute('data-algo') === algo) t.classList.add('active');
        else t.classList.remove('active');
      });

      document.querySelectorAll('.algo-panel').forEach(p => {
        if (p.id === `panel-${algo}`) p.classList.add('active');
        else p.classList.remove('active');
      });

      setTimeout(() => {
        if (window.chartsManager) window.chartsManager.resizeAll();
      }, 50);
    },

    // -----------------------------------------------------------------------
    // PARAMETER CONTROLS & BINDINGS
    // -----------------------------------------------------------------------
    bindParameterControls() {
      // PCA Controls
      this.bindSlider('pcaDim', val => { this.params.pca.components = parseInt(val); }, 'pcaDimVal', 'D');

      // SVD Controls
      this.bindSlider('svdDim', val => { this.params.svd.components = parseInt(val); }, 'svdDimVal', 'D');

      // t-SNE Controls
      this.bindSlider('tsneDim', val => { this.params.tsne.components = parseInt(val); }, 'tsneDimVal', 'D');
      this.bindSlider('tsnePerp', val => { this.params.tsne.perplexity = parseFloat(val); }, 'tsnePerpVal');
      this.bindSlider('tsneIter', val => { this.params.tsne.iterations = parseInt(val); }, 'tsneIterVal');
      this.bindSlider('tsneSamples', val => { this.params.tsne.sampleSize = parseInt(val); }, 'tsneSamplesVal');

      // UMAP Controls
      this.bindSlider('umapDim', val => { this.params.umap.components = parseInt(val); }, 'umapDimVal', 'D');
      this.bindSlider('umapNeighbors', val => { this.params.umap.nNeighbors = parseInt(val); }, 'umapNeighborsVal');
      this.bindSlider('umapMinDist', val => { this.params.umap.minDist = parseFloat(val); }, 'umapMinDistVal');
      this.bindSlider('umapSamples', val => { this.params.umap.sampleSize = parseInt(val); }, 'umapSamplesVal');

      // File upload handler
      const fileInput = document.getElementById('datasetFileInput');
      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const stats = window.dataManager.parseDataset(event.target.result);
              this.onDatasetLoaded(stats);
            } catch (err) {
              alert('Failed to parse file: ' + err.message);
            }
          };
          reader.readAsText(file);
        });
      }
    },

    bindSlider(id, updateFn, displayId, suffix = '') {
      const slider = document.getElementById(id);
      const display = document.getElementById(displayId);
      if (!slider) return;

      slider.addEventListener('input', () => {
        updateFn(slider.value);
        if (display) display.textContent = `${slider.value}${suffix}`;
      });
    },

    // -----------------------------------------------------------------------
    // ACTION BUTTONS (RUN, RESET, RUN ALL)
    // -----------------------------------------------------------------------
    bindActionButtons() {
      // Individual Run buttons
      ['pca', 'svd', 'tsne', 'umap'].forEach(algo => {
        const runBtn = document.getElementById(`btnRun${algo.toUpperCase()}`);
        if (runBtn) {
          runBtn.addEventListener('click', () => this.runSimulation(algo, true));
        }

        const resetBtn = document.getElementById(`btnReset${algo.toUpperCase()}`);
        if (resetBtn) {
          resetBtn.addEventListener('click', () => this.resetAlgorithmDefaults(algo));
        }
      });

      // Run All 4 Algorithms button
      const runAllBtn = document.getElementById('btnRunAll');
      if (runAllBtn) {
        runAllBtn.addEventListener('click', () => this.runAllAlgorithms());
      }

      // Export Buttons
      const btnExportCSV = document.getElementById('btnExportCSV');
      if (btnExportCSV) {
        btnExportCSV.addEventListener('click', () => this.exportComparisonCSV());
      }
    },

    resetAlgorithmDefaults(algo) {
      if (algo === 'pca') {
        this.params.pca = { components: 2, standardize: true };
        this.setSlider('pcaDim', 2, 'pcaDimVal', 'D');
      } else if (algo === 'svd') {
        this.params.svd = { components: 2, standardize: true };
        this.setSlider('svdDim', 2, 'svdDimVal', 'D');
      } else if (algo === 'tsne') {
        this.params.tsne = { components: 2, sampleSize: 300, perplexity: 30, iterations: 250, epsilon: 100 };
        this.setSlider('tsneDim', 2, 'tsneDimVal', 'D');
        this.setSlider('tsnePerp', 30, 'tsnePerpVal');
        this.setSlider('tsneIter', 250, 'tsneIterVal');
        this.setSlider('tsneSamples', 300, 'tsneSamplesVal');
      } else if (algo === 'umap') {
        this.params.umap = { components: 2, sampleSize: 569, nNeighbors: 15, minDist: 0.1 };
        this.setSlider('umapDim', 2, 'umapDimVal', 'D');
        this.setSlider('umapNeighbors', 15, 'umapNeighborsVal');
        this.setSlider('umapMinDist', 0.1, 'umapMinDistVal');
        this.setSlider('umapSamples', 569, 'umapSamplesVal');
      }
      this.showToast(`Reset ${algo.toUpperCase()} settings to defaults.`, 'info');
    },

    setSlider(id, val, displayId, suffix = '') {
      const slider = document.getElementById(id);
      const display = document.getElementById(displayId);
      if (slider) slider.value = val;
      if (display) display.textContent = `${val}${suffix}`;
    },

    // -----------------------------------------------------------------------
    // SIMULATION EXECUTION
    // -----------------------------------------------------------------------
    async runSimulation(algo, showNotification = true) {
      if (!window.dataManager.isLoaded) {
        alert('Please wait for the dataset to load or upload wdbc.data first.');
        return;
      }
      if (this.isRunning) return;

      this.isRunning = true;
      this.setLoader(algo, true);

      // Yield thread to allow DOM spinner to render
      await new Promise(resolve => setTimeout(resolve, 30));

      try {
        let result = null;
        const nComps = this.params[algo].components;

        if (algo === 'pca') {
          const X = window.dataManager.standardizedMatrix;
          result = window.algorithmsEngine.runPCA(X, nComps);
          result.labels = window.dataManager.labels;
          result.ids = window.dataManager.ids;
          result.separationScore = window.algorithmsEngine.computeSeparationScore(result.embedding, result.labels);
          this.renderPCAResults(result);
        } else if (algo === 'svd') {
          const X = window.dataManager.standardizedMatrix;
          result = window.algorithmsEngine.runSVD(X, nComps);
          result.labels = window.dataManager.labels;
          result.ids = window.dataManager.ids;
          result.separationScore = window.algorithmsEngine.computeSeparationScore(result.embedding, result.labels);
          this.renderSVDResults(result);
        } else if (algo === 'tsne') {
          const sample = window.dataManager.getSample(this.params.tsne.sampleSize);
          result = await window.algorithmsEngine.runTSNE(sample.features, {
            dim: nComps,
            perplexity: this.params.tsne.perplexity,
            iterations: this.params.tsne.iterations,
            epsilon: this.params.tsne.epsilon
          });
          result.labels = sample.labels;
          result.ids = sample.ids;
          result.separationScore = window.algorithmsEngine.computeSeparationScore(result.embedding, result.labels);
          this.renderTSNEResults(result);
        } else if (algo === 'umap') {
          const sample = window.dataManager.getSample(this.params.umap.sampleSize);
          result = await window.algorithmsEngine.runUMAP(sample.features, {
            nComponents: nComps,
            nNeighbors: this.params.umap.nNeighbors,
            minDist: this.params.umap.minDist
          });
          result.labels = sample.labels;
          result.ids = sample.ids;
          result.separationScore = window.algorithmsEngine.computeSeparationScore(result.embedding, result.labels);
          this.renderUMAPResults(result);
        }

        this.results[algo] = result;
        this.saveResultsToStorage();
        this.updateObservationsSection();

        if (showNotification) {
          this.showToast(`${algo.toUpperCase()} completed in ${result.executionTimeMs} ms!`, 'success');
        }
      } catch (err) {
        console.error(`Error executing ${algo}:`, err);
        alert(`Algorithm execution failed: ${err.message}`);
      } finally {
        this.setLoader(algo, false);
        this.isRunning = false;
      }
    },

    setLoader(algo, show) {
      const loader = document.getElementById(`${algo}Loader`);
      const plot = document.getElementById(`${algo}Plot`);
      if (loader) loader.style.display = show ? 'flex' : 'none';
      if (plot) plot.style.opacity = show ? '0.35' : '1';
    },

    async runAllAlgorithms() {
      if (this.isRunning) return;
      this.showToast('Executing all 4 dimensionality reduction algorithms...', 'info');

      const algos = ['pca', 'svd', 'tsne', 'umap'];
      for (const algo of algos) {
        this.switchAlgoTab(algo);
        await this.runSimulation(algo, false);
      }
      this.showToast('All 4 simulations completed successfully! Data ready for observations & report.', 'success');
      this.switchSection('observations');
    },

    // -----------------------------------------------------------------------
    // RENDER ALGORITHM OUTPUTS
    // -----------------------------------------------------------------------
    renderPCAResults(res) {
      const is3D = res.nComponents === 3;
      if (is3D) {
        window.chartsManager.renderScatter3D('pcaPlot', res.embedding, res.labels, res.ids,
          `PCA 3D Projection (EVR: ${res.cumulativeVariance[2]}%)`, 'PC1', 'PC2', 'PC3');
      } else {
        window.chartsManager.renderScatter2D('pcaPlot', res.embedding, res.labels, res.ids,
          `PCA 2D Projection (EVR: ${res.cumulativeVariance[1]}%)`, 'Principal Component 1', 'Principal Component 2');
      }

      // Render Scree Plot
      window.chartsManager.renderScreePlot('pcaScreePlot', res.explainedVarianceRatio, res.cumulativeVariance);

      // Update Metric Badges
      this.setText('pcaTime', `${res.executionTimeMs} ms`);
      this.setText('pcaEVR1', `${res.explainedVarianceRatio[0]}%`);
      this.setText('pcaEVR2', `${res.explainedVarianceRatio[1]}%`);
      this.setText('pcaCumEVR', `${res.cumulativeVariance[res.nComponents - 1]}%`);
      this.setText('pcaSepScore', res.separationScore);
    },

    renderSVDResults(res) {
      const is3D = res.nComponents === 3;
      if (is3D) {
        window.chartsManager.renderScatter3D('svdPlot', res.embedding, res.labels, res.ids,
          `SVD 3D Projection (Retained Energy: ${res.cumulativeEnergy[2]}%)`, 'Right SV1', 'Right SV2', 'Right SV3');
      } else {
        window.chartsManager.renderScatter2D('svdPlot', res.embedding, res.labels, res.ids,
          `SVD 2D Projection (Retained Energy: ${res.cumulativeEnergy[1]}%)`, 'Right SV1 (Dimension 1)', 'Right SV2 (Dimension 2)');
      }

      // Render Spectrum
      window.chartsManager.renderSingularSpectrum('svdSpectrumPlot', res.singularValues, res.energyRatios);

      // Update Metric Badges
      this.setText('svdTime', `${res.executionTimeMs} ms`);
      this.setText('svdVal1', res.singularValues[0]);
      this.setText('svdVal2', res.singularValues[1]);
      this.setText('svdCumEnergy', `${res.cumulativeEnergy[res.nComponents - 1]}%`);
      this.setText('svdSepScore', res.separationScore);
    },

    renderTSNEResults(res) {
      const is3D = res.nComponents === 3;
      if (is3D) {
        window.chartsManager.renderScatter3D('tsnePlot', res.embedding, res.labels, res.ids,
          `t-SNE 3D Embedding (Perp: ${res.perplexity}, Iter: ${res.iterations})`, 't-SNE 1', 't-SNE 2', 't-SNE 3');
      } else {
        window.chartsManager.renderScatter2D('tsnePlot', res.embedding, res.labels, res.ids,
          `t-SNE 2D Embedding (Perp: ${res.perplexity}, Iter: ${res.iterations})`, 't-SNE Dimension 1', 't-SNE Dimension 2');
      }

      this.setText('tsneTime', `${res.executionTimeMs} ms`);
      this.setText('tsneSamplesCount', `${res.sampleSize} / 569`);
      this.setText('tsnePerpBadge', res.perplexity);
      this.setText('tsneIterBadge', res.iterations);
      this.setText('tsneSepScore', res.separationScore);
    },

    renderUMAPResults(res) {
      const is3D = res.nComponents === 3;
      if (is3D) {
        window.chartsManager.renderScatter3D('umapPlot', res.embedding, res.labels, res.ids,
          `UMAP 3D Embedding (Neighbors: ${res.nNeighbors}, MinDist: ${res.minDist})`, 'UMAP 1', 'UMAP 2', 'UMAP 3');
      } else {
        window.chartsManager.renderScatter2D('umapPlot', res.embedding, res.labels, res.ids,
          `UMAP 2D Embedding (Neighbors: ${res.nNeighbors}, MinDist: ${res.minDist})`, 'UMAP Dimension 1', 'UMAP Dimension 2');
      }

      this.setText('umapTime', `${res.executionTimeMs} ms`);
      this.setText('umapNeighborsBadge', res.nNeighbors);
      this.setText('umapMinDistBadge', res.minDist);
      this.setText('umapSamplesCount', `${res.sampleSize} / 569`);
      this.setText('umapSepScore', res.separationScore);
    },

    setText(id, text) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    },

    // -----------------------------------------------------------------------
    // OBSERVATIONS & COMPARISON GENERATOR
    // -----------------------------------------------------------------------
    updateObservationsSection() {
      const tbody = document.getElementById('comparisonTableBody');
      if (!tbody) return;

      const rows = [];
      const algos = ['pca', 'svd', 'tsne', 'umap'];
      let fastestAlgo = '-';
      let minTime = Infinity;
      let highestSep = 0;
      let bestSepAlgo = '-';

      algos.forEach(name => {
        const r = this.results[name];
        if (!r) {
          rows.push(`
            <tr class="row-pending">
              <td><strong>${name.toUpperCase()}</strong></td>
              <td>${name === 'pca' || name === 'svd' ? 'Linear (Matrix Factorization)' : 'Non-Linear (Manifold Learning)'}</td>
              <td>569 × 30</td>
              <td>-</td>
              <td>Pending Execution</td>
              <td><span class="badge badge-warning">Not Run</span></td>
              <td>-</td>
              <td>-</td>
            </tr>
          `);
          return;
        }

        // Fastest check
        if (r.executionTimeMs < minTime) {
          minTime = r.executionTimeMs;
          fastestAlgo = `${r.algorithm} (${r.executionTimeMs} ms)`;
        }

        // Separation score check
        if (r.separationScore > highestSep) {
          highestSep = r.separationScore;
          bestSepAlgo = `${r.algorithm} (${r.separationScore})`;
        }

        let keyParam = '';
        let metricInfo = '';

        if (name === 'pca') {
          keyParam = `Components: ${r.nComponents}`;
          metricInfo = `Cumulative EVR: <strong>${r.cumulativeVariance[r.nComponents - 1]}%</strong>`;
        } else if (name === 'svd') {
          keyParam = `Components: ${r.nComponents}`;
          metricInfo = `Retained Energy: <strong>${r.cumulativeEnergy[r.nComponents - 1]}%</strong>`;
        } else if (name === 'tsne') {
          keyParam = `Perp: ${r.perplexity}, Iter: ${r.iterations}`;
          metricInfo = `KL Div / Cost: <strong>${r.finalCost || 'Optimized'}</strong>`;
        } else if (name === 'umap') {
          keyParam = `Neighbors: ${r.nNeighbors}, MinDist: ${r.minDist}`;
          metricInfo = `Topology Loss: <strong>Fuzzy CE</strong>`;
        }

        rows.push(`
          <tr>
            <td><strong class="text-accent">${r.algorithm}</strong></td>
            <td>${name === 'pca' || name === 'svd' ? 'Linear (Global Variance)' : 'Non-Linear (Local Topology)'}</td>
            <td>569 × 30</td>
            <td>${r.embedding.length} × ${r.nComponents}D</td>
            <td><code>${keyParam}</code></td>
            <td><span class="badge badge-success">${r.executionTimeMs} ms</span></td>
            <td>${metricInfo}</td>
            <td><strong class="text-emerald">${r.separationScore}</strong></td>
          </tr>
        `);

        // Render mini plot in thumbnail comparison grid
        const miniContainer = `miniPlot${name.toUpperCase()}`;
        window.chartsManager.renderMiniComparisonPlot(miniContainer, r.embedding, r.labels, `${r.algorithm} 2D`);
      });

      tbody.innerHTML = rows.join('');

      // Update summary cards
      this.setText('obsFastestAlgo', fastestAlgo);
      this.setText('obsBestSeparation', bestSepAlgo);
      if (this.results.pca) {
        this.setText('obsMaxVariance', `PCA (${this.results.pca.cumulativeVariance[this.results.pca.nComponents - 1]}%)`);
      }
    },

    exportComparisonCSV() {
      const algos = ['pca', 'svd', 'tsne', 'umap'];
      const lines = [
        ['Algorithm', 'Technique Type', 'Input Dimensions', 'Reduced Dimensions', 'Parameters', 'Execution Time (ms)', 'Key Metric', 'Separation Score']
      ];

      algos.forEach(name => {
        const r = this.results[name];
        if (r) {
          const params = name === 'pca' ? `k=${r.nComponents}` :
                         name === 'svd' ? `k=${r.nComponents}` :
                         name === 'tsne' ? `perp=${r.perplexity},iter=${r.iterations}` :
                         `k=${r.nNeighbors},min_dist=${r.minDist}`;
          const metric = name === 'pca' ? `EVR=${r.cumulativeVariance[r.nComponents - 1]}%` :
                         name === 'svd' ? `Energy=${r.cumulativeEnergy[r.nComponents - 1]}%` :
                         name === 'tsne' ? `KL=${r.finalCost}` : 'Fuzzy CE';
          lines.push([r.algorithm, name === 'pca' || name === 'svd' ? 'Linear' : 'Non-Linear', '569x30', `${r.embedding.length}x${r.nComponents}`, params, r.executionTimeMs, metric, r.separationScore]);
        }
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + lines.map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'dimensionality_reduction_comparison.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    // -----------------------------------------------------------------------
    // CONTRIBUTORS
    // -----------------------------------------------------------------------
    bindContributors() {
      const fields = ['contribName', 'contribRoll', 'contribDept', 'contribClass', 'contribGuide', 'contribDate'];
      const saved = JSON.parse(localStorage.getItem('dr_lab_contributors') || '{}');

      fields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (saved[id]) el.value = saved[id];

        el.addEventListener('input', () => {
          saved[id] = el.value;
          localStorage.setItem('dr_lab_contributors', JSON.stringify(saved));
        });
      });
    },

    // -----------------------------------------------------------------------
    // LOCALSTORAGE PERSISTENCE
    // -----------------------------------------------------------------------
    saveResultsToStorage() {
      try {
        // Save execution metrics and lightweight summary without megabytes of raw matrices
        const storagePayload = {
          timestamp: new Date().toISOString(),
          dataset: {
            name: 'Breast Cancer Wisconsin (Diagnostic)',
            samples: 569,
            features: 30
          },
          pca: this.results.pca ? {
            algorithm: 'PCA',
            nComponents: this.results.pca.nComponents,
            executionTimeMs: this.results.pca.executionTimeMs,
            explainedVarianceRatio: this.results.pca.explainedVarianceRatio,
            cumulativeVariance: this.results.pca.cumulativeVariance,
            eigenvalues: this.results.pca.eigenvalues,
            separationScore: this.results.pca.separationScore
          } : null,
          svd: this.results.svd ? {
            algorithm: 'SVD',
            nComponents: this.results.svd.nComponents,
            executionTimeMs: this.results.svd.executionTimeMs,
            singularValues: this.results.svd.singularValues,
            energyRatios: this.results.svd.energyRatios,
            cumulativeEnergy: this.results.svd.cumulativeEnergy,
            separationScore: this.results.svd.separationScore
          } : null,
          tsne: this.results.tsne ? {
            algorithm: 't-SNE',
            nComponents: this.results.tsne.nComponents,
            executionTimeMs: this.results.tsne.executionTimeMs,
            perplexity: this.results.tsne.perplexity,
            iterations: this.results.tsne.iterations,
            sampleSize: this.results.tsne.sampleSize,
            finalCost: this.results.tsne.finalCost,
            separationScore: this.results.tsne.separationScore
          } : null,
          umap: this.results.umap ? {
            algorithm: 'UMAP',
            nComponents: this.results.umap.nComponents,
            executionTimeMs: this.results.umap.executionTimeMs,
            nNeighbors: this.results.umap.nNeighbors,
            minDist: this.results.umap.minDist,
            sampleSize: this.results.umap.sampleSize,
            separationScore: this.results.umap.separationScore
          } : null
        };

        localStorage.setItem('dr_lab_results', JSON.stringify(storagePayload));
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
    },

    loadCachedData() {
      try {
        const cached = localStorage.getItem('dr_lab_results');
        if (cached) {
          const parsed = JSON.parse(cached);
          console.log('Found cached experiment results from:', parsed.timestamp);
        }
      } catch (err) {
        console.warn('Error reading cache:', err);
      }
    },

    restoreActiveView() {
      if (this.results.pca) this.renderPCAResults(this.results.pca);
      if (this.results.svd) this.renderSVDResults(this.results.svd);
      if (this.results.tsne) this.renderTSNEResults(this.results.tsne);
      if (this.results.umap) this.renderUMAPResults(this.results.umap);
    },

    // -----------------------------------------------------------------------
    // TOAST NOTIFICATIONS
    // -----------------------------------------------------------------------
    showToast(msg, type = 'info') {
      const container = document.getElementById('toastContainer');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `<span>${msg}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
      }, 3500);
    }
  };

  // Attach to window and initialize
  window.VirtualLabApp = App;
  App.init();
});
