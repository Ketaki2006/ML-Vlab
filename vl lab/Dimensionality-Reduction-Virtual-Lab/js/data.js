/**
 * Dimensionality Reduction Virtual Lab - Data Manager
 * Handles loading, parsing, validation, standardization, and statistical analysis
 * for the Breast Cancer Wisconsin (Diagnostic) Dataset.
 */

class DataManager {
  constructor() {
    this.rawText = null;
    this.samples = []; // Array of { id, diagnosis, features: number[] }
    this.ids = [];
    this.labels = []; // 'M' or 'B'
    this.rawMatrix = []; // [ [f0...f29], ... ]
    this.standardizedMatrix = []; // [ [z0...z29], ... ]
    this.isLoaded = false;
    this.stats = null;

    this.featureNames = [
      'radius (mean)', 'texture (mean)', 'perimeter (mean)', 'area (mean)', 'smoothness (mean)',
      'compactness (mean)', 'concavity (mean)', 'concave points (mean)', 'symmetry (mean)', 'fractal dimension (mean)',
      'radius (SE)', 'texture (SE)', 'perimeter (SE)', 'area (SE)', 'smoothness (SE)',
      'compactness (SE)', 'concavity (SE)', 'concave points (SE)', 'symmetry (SE)', 'fractal dimension (SE)',
      'radius (worst)', 'texture (worst)', 'perimeter (worst)', 'area (worst)', 'smoothness (worst)',
      'compactness (worst)', 'concavity (worst)', 'concave points (worst)', 'symmetry (worst)', 'fractal dimension (worst)'
    ];
  }

  /**
   * Load dataset from URL or relative path
   */
  async loadDefaultDataset(path = 'data/wdbc.data') {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: Unable to fetch ${path}`);
      }
      const text = await response.text();
      return this.parseDataset(text);
    } catch (err) {
      console.warn('Dataset fetch failed, attempting alternate path...', err);
      try {
        const altResponse = await fetch('../data/wdbc.data');
        if (altResponse.ok) {
          const text = await altResponse.text();
          return this.parseDataset(text);
        }
      } catch (altErr) {
        // Fallback for file:// or offline environments
      }
      throw err;
    }
  }

  /**
   * Parse CSV / raw data text
   */
  parseDataset(csvText) {
    if (!csvText || typeof csvText !== 'string') {
      throw new Error('Invalid dataset content provided.');
    }

    this.rawText = csvText;
    const lines = csvText.trim().split(/\r?\n/);
    const validSamples = [];
    const ids = [];
    const labels = [];
    const rawMatrix = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const tokens = line.split(',');
      if (tokens.length < 32) continue; // ID, Diagnosis, 30 features

      const id = tokens[0].trim();
      const diagnosis = tokens[1].trim().toUpperCase();

      if (diagnosis !== 'M' && diagnosis !== 'B') continue;

      const features = [];
      let hasInvalid = false;
      for (let j = 2; j < 32; j++) {
        const val = parseFloat(tokens[j]);
        if (isNaN(val)) {
          hasInvalid = true;
          break;
        }
        features.push(val);
      }

      if (!hasInvalid && features.length === 30) {
        validSamples.push({ id, diagnosis, features });
        ids.push(id);
        labels.push(diagnosis);
        rawMatrix.push(features);
      }
    }

    if (validSamples.length === 0) {
      throw new Error('No valid samples found in dataset.');
    }

    this.samples = validSamples;
    this.ids = ids;
    this.labels = labels;
    this.rawMatrix = rawMatrix;

    // Standardize all numerical features
    this.standardizedMatrix = this.computeStandardization(this.rawMatrix);

    // Compute comprehensive descriptive statistics
    this.stats = this.computeStatistics();
    this.isLoaded = true;

    return {
      samplesCount: this.samples.length,
      featuresCount: this.featureNames.length,
      malignantCount: this.stats.malignantCount,
      benignCount: this.stats.benignCount,
      stats: this.stats
    };
  }

  /**
   * Standardize numerical features using z-score: z = (x - mu) / sigma
   */
  computeStandardization(matrix) {
    const N = matrix.length;
    const D = matrix[0].length;
    const means = new Array(D).fill(0);
    const stds = new Array(D).fill(0);

    // Compute Column Means
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < D; j++) {
        means[j] += matrix[i][j];
      }
    }
    for (let j = 0; j < D; j++) {
      means[j] /= N;
    }

    // Compute Sample Standard Deviations
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < D; j++) {
        stds[j] += Math.pow(matrix[i][j] - means[j], 2);
      }
    }
    for (let j = 0; j < D; j++) {
      stds[j] = N > 1 ? Math.sqrt(stds[j] / (N - 1)) : 1;
      if (stds[j] === 0 || isNaN(stds[j])) stds[j] = 1;
    }

    this.featureMeans = means;
    this.featureStds = stds;

    // Standardize matrix
    const standardized = new Array(N);
    for (let i = 0; i < N; i++) {
      const row = new Array(D);
      for (let j = 0; j < D; j++) {
        row[j] = (matrix[i][j] - means[j]) / stds[j];
      }
      standardized[i] = row;
    }

    return standardized;
  }

  /**
   * Compute comprehensive dataset statistics
   */
  computeStatistics() {
    const N = this.samples.length;
    const D = this.featureNames.length;
    let malignantCount = 0;
    let benignCount = 0;

    for (let i = 0; i < N; i++) {
      if (this.labels[i] === 'M') malignantCount++;
      else if (this.labels[i] === 'B') benignCount++;
    }

    const featureStats = [];
    for (let j = 0; j < D; j++) {
      let min = Infinity;
      let max = -Infinity;
      let sum = 0;

      for (let i = 0; i < N; i++) {
        const val = this.rawMatrix[i][j];
        if (val < min) min = val;
        if (val > max) max = val;
        sum += val;
      }
      const mean = sum / N;

      let varianceSum = 0;
      for (let i = 0; i < N; i++) {
        varianceSum += Math.pow(this.rawMatrix[i][j] - mean, 2);
      }
      const std = Math.sqrt(varianceSum / (N - 1));

      featureStats.push({
        index: j,
        name: this.featureNames[j],
        mean: parseFloat(mean.toFixed(4)),
        std: parseFloat(std.toFixed(4)),
        min: parseFloat(min.toFixed(4)),
        max: parseFloat(max.toFixed(4))
      });
    }

    return {
      totalSamples: N,
      featureCount: D,
      malignantCount,
      benignCount,
      malignantPercent: parseFloat(((malignantCount / N) * 100).toFixed(1)),
      benignPercent: parseFloat(((benignCount / N) * 100).toFixed(1)),
      featureStats
    };
  }

  /**
   * Return stratified sample of data for faster non-linear algorithms
   */
  getSample(requestedCount, useStandardized = true) {
    const N = this.samples.length;
    const matrix = useStandardized ? this.standardizedMatrix : this.rawMatrix;

    if (!requestedCount || requestedCount >= N) {
      return {
        features: matrix,
        labels: this.labels,
        ids: this.ids,
        indices: Array.from({ length: N }, (_, i) => i)
      };
    }

    // Stratified sampling based on diagnosis
    const mIndices = [];
    const bIndices = [];
    for (let i = 0; i < N; i++) {
      if (this.labels[i] === 'M') mIndices.push(i);
      else bIndices.push(i);
    }

    const ratioM = mIndices.length / N;
    const targetM = Math.round(requestedCount * ratioM);
    const targetB = requestedCount - targetM;

    // Pick evenly spaced indices
    const selectedIndices = [];
    const stepM = mIndices.length / targetM;
    for (let k = 0; k < targetM; k++) {
      const idx = Math.min(Math.floor(k * stepM), mIndices.length - 1);
      selectedIndices.push(mIndices[idx]);
    }

    const stepB = bIndices.length / targetB;
    for (let k = 0; k < targetB; k++) {
      const idx = Math.min(Math.floor(k * stepB), bIndices.length - 1);
      selectedIndices.push(bIndices[idx]);
    }

    // Sort to maintain original ordering
    selectedIndices.sort((a, b) => a - b);

    const sampledFeatures = selectedIndices.map(idx => matrix[idx]);
    const sampledLabels = selectedIndices.map(idx => this.labels[idx]);
    const sampledIds = selectedIndices.map(idx => this.ids[idx]);

    return {
      features: sampledFeatures,
      labels: sampledLabels,
      ids: sampledIds,
      indices: selectedIndices
    };
  }
}

// Global instance attached to window for browser access
window.dataManager = new DataManager();
