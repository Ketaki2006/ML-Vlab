/**
 * Dimensionality Reduction Virtual Lab - Charts Manager
 * Handles responsive 2D and 3D Plotly.js visualizations with dark navy SaaS aesthetics.
 */

class ChartsManager {
  constructor() {
    this.benignColor = '#10B981'; // Emerald Green
    this.malignantColor = '#F43F5E'; // Vivid Rose / Red
    this.accentPurple = '#8B5CF6';
    this.accentPink = '#EC4899';
    this.accentCyan = '#06B6D4';
    
    this.darkLayoutBase = {
      paper_bgcolor: '#111827',
      plot_bgcolor: '#0B0F19',
      font: {
        family: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#E2E8F0',
        size: 12
      },
      margin: { l: 55, r: 25, t: 45, b: 50 },
      legend: {
        orientation: 'h',
        x: 0.5,
        xanchor: 'center',
        y: 1.12,
        font: { color: '#E2E8F0', size: 12 },
        bgcolor: 'rgba(17, 24, 39, 0.7)',
        bordercolor: '#334155',
        borderwidth: 1
      },
      xaxis: {
        gridcolor: '#1E293B',
        zerolinecolor: '#334155',
        tickcolor: '#64748B',
        tickfont: { color: '#94A3B8' },
        linecolor: '#334155'
      },
      yaxis: {
        gridcolor: '#1E293B',
        zerolinecolor: '#334155',
        tickcolor: '#64748B',
        tickfont: { color: '#94A3B8' },
        linecolor: '#334155'
      }
    };

    this.defaultConfig = {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      toImageButtonOptions: {
        format: 'png',
        filename: 'dr_lab_plot',
        height: 650,
        width: 900,
        scale: 2
      }
    };
  }

  /**
   * Split data into Benign and Malignant groups for Plotly traces
   */
  _splitTraces2D(embedding, labels, ids) {
    const benign = { x: [], y: [], custom: [] };
    const malignant = { x: [], y: [], custom: [] };

    for (let i = 0; i < embedding.length; i++) {
      const pt = embedding[i];
      const lbl = labels[i];
      const id = ids && ids[i] ? ids[i] : `Sample-${i + 1}`;

      if (lbl === 'B') {
        benign.x.push(pt[0]);
        benign.y.push(pt[1]);
        benign.custom.push([id, 'Benign']);
      } else {
        malignant.x.push(pt[0]);
        malignant.y.push(pt[1]);
        malignant.custom.push([id, 'Malignant']);
      }
    }

    const traceBenign = {
      x: benign.x,
      y: benign.y,
      customdata: benign.custom,
      mode: 'markers',
      type: 'scatter',
      name: 'Benign (Non-Cancerous)',
      marker: {
        color: this.benignColor,
        size: 7,
        opacity: 0.85,
        line: { color: '#FFFFFF', width: 0.5 }
      },
      hovertemplate: '<b>Sample ID:</b> %{customdata[0]}<br>' +
                     '<b>Diagnosis:</b> %{customdata[1]}<br>' +
                     '<b>Dim 1:</b> %{x:.2f}<br>' +
                     '<b>Dim 2:</b> %{y:.2f}<extra></extra>'
    };

    const traceMalignant = {
      x: malignant.x,
      y: malignant.y,
      customdata: malignant.custom,
      mode: 'markers',
      type: 'scatter',
      name: 'Malignant (Cancerous)',
      marker: {
        color: this.malignantColor,
        size: 7,
        opacity: 0.85,
        line: { color: '#FFFFFF', width: 0.5 }
      },
      hovertemplate: '<b>Sample ID:</b> %{customdata[0]}<br>' +
                     '<b>Diagnosis:</b> %{customdata[1]}<br>' +
                     '<b>Dim 1:</b> %{x:.2f}<br>' +
                     '<b>Dim 2:</b> %{y:.2f}<extra></extra>'
    };

    return [traceBenign, traceMalignant];
  }

  /**
   * Split data into Benign and Malignant groups for 3D traces
   */
  _splitTraces3D(embedding, labels, ids) {
    const benign = { x: [], y: [], z: [], custom: [] };
    const malignant = { x: [], y: [], z: [], custom: [] };

    for (let i = 0; i < embedding.length; i++) {
      const pt = embedding[i];
      const lbl = labels[i];
      const id = ids && ids[i] ? ids[i] : `Sample-${i + 1}`;

      if (lbl === 'B') {
        benign.x.push(pt[0]);
        benign.y.push(pt[1]);
        benign.z.push(pt[2] || 0);
        benign.custom.push([id, 'Benign']);
      } else {
        malignant.x.push(pt[0]);
        malignant.y.push(pt[1]);
        malignant.z.push(pt[2] || 0);
        malignant.custom.push([id, 'Malignant']);
      }
    }

    const traceBenign = {
      x: benign.x,
      y: benign.y,
      z: benign.z,
      customdata: benign.custom,
      mode: 'markers',
      type: 'scatter3d',
      name: 'Benign (Non-Cancerous)',
      marker: {
        color: this.benignColor,
        size: 4,
        opacity: 0.85,
        line: { color: '#FFFFFF', width: 0.3 }
      },
      hovertemplate: '<b>Sample ID:</b> %{customdata[0]}<br>' +
                     '<b>Diagnosis:</b> %{customdata[1]}<br>' +
                     '<b>Dim 1:</b> %{x:.2f}<br>' +
                     '<b>Dim 2:</b> %{y:.2f}<br>' +
                     '<b>Dim 3:</b> %{z:.2f}<extra></extra>'
    };

    const traceMalignant = {
      x: malignant.x,
      y: malignant.y,
      z: malignant.z,
      customdata: malignant.custom,
      mode: 'markers',
      type: 'scatter3d',
      name: 'Malignant (Cancerous)',
      marker: {
        color: this.malignantColor,
        size: 4,
        opacity: 0.85,
        line: { color: '#FFFFFF', width: 0.3 }
      },
      hovertemplate: '<b>Sample ID:</b> %{customdata[0]}<br>' +
                     '<b>Diagnosis:</b> %{customdata[1]}<br>' +
                     '<b>Dim 1:</b> %{x:.2f}<br>' +
                     '<b>Dim 2:</b> %{y:.2f}<br>' +
                     '<b>Dim 3:</b> %{z:.2f}<extra></extra>'
    };

    return [traceBenign, traceMalignant];
  }

  /**
   * Render 2D Scatter Plot
   */
  renderScatter2D(containerId, embedding, labels, ids, title, xLabel = 'Dimension 1', yLabel = 'Dimension 2') {
    const el = document.getElementById(containerId);
    if (!el || typeof Plotly === 'undefined') return;

    const traces = this._splitTraces2D(embedding, labels, ids);
    const layout = JSON.parse(JSON.stringify(this.darkLayoutBase));
    
    layout.title = {
      text: title,
      font: { size: 14, color: '#F1F5F9', weight: 600 }
    };
    layout.xaxis.title = { text: xLabel, font: { color: '#94A3B8', size: 12 } };
    layout.yaxis.title = { text: yLabel, font: { color: '#94A3B8', size: 12 } };

    Plotly.react(containerId, traces, layout, this.defaultConfig);
  }

  /**
   * Render 3D Scatter Plot
   */
  renderScatter3D(containerId, embedding, labels, ids, title, xLabel = 'Dim 1', yLabel = 'Dim 2', zLabel = 'Dim 3') {
    const el = document.getElementById(containerId);
    if (!el || typeof Plotly === 'undefined') return;

    const traces = this._splitTraces3D(embedding, labels, ids);
    const layout = {
      paper_bgcolor: '#111827',
      font: {
        family: 'Inter, system-ui, sans-serif',
        color: '#E2E8F0',
        size: 11
      },
      margin: { l: 0, r: 0, t: 40, b: 0 },
      title: {
        text: title,
        font: { size: 14, color: '#F1F5F9', weight: 600 }
      },
      legend: {
        orientation: 'h',
        x: 0.5,
        xanchor: 'center',
        y: 1.05,
        bgcolor: 'rgba(17, 24, 39, 0.7)',
        bordercolor: '#334155',
        borderwidth: 1
      },
      scene: {
        xaxis: {
          title: xLabel,
          backgroundcolor: '#0B0F19',
          gridcolor: '#1E293B',
          showbackground: true,
          zerolinecolor: '#334155',
          color: '#94A3B8'
        },
        yaxis: {
          title: yLabel,
          backgroundcolor: '#0B0F19',
          gridcolor: '#1E293B',
          showbackground: true,
          zerolinecolor: '#334155',
          color: '#94A3B8'
        },
        zaxis: {
          title: zLabel,
          backgroundcolor: '#0B0F19',
          gridcolor: '#1E293B',
          showbackground: true,
          zerolinecolor: '#334155',
          color: '#94A3B8'
        },
        camera: {
          eye: { x: 1.35, y: 1.35, z: 1.15 }
        }
      }
    };

    Plotly.react(containerId, traces, layout, this.defaultConfig);
  }

  /**
   * Render Scree Plot for PCA (Bars for individual EVR + Line for Cumulative EVR)
   */
  renderScreePlot(containerId, explainedVarianceRatio, cumulativeVariance, maxComponents = 10) {
    const el = document.getElementById(containerId);
    if (!el || typeof Plotly === 'undefined') return;

    const k = Math.min(maxComponents, explainedVarianceRatio.length);
    const xLabels = Array.from({ length: k }, (_, i) => `PC${i + 1}`);
    const individualValues = explainedVarianceRatio.slice(0, k);
    const cumulativeValues = cumulativeVariance.slice(0, k);

    const barTrace = {
      x: xLabels,
      y: individualValues,
      type: 'bar',
      name: 'Individual EVR (%)',
      marker: {
        color: this.accentPurple,
        opacity: 0.85
      },
      hovertemplate: '<b>%{x}:</b> %{y:.2f}% explained<extra></extra>'
    };

    const lineTrace = {
      x: xLabels,
      y: cumulativeValues,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Cumulative EVR (%)',
      yaxis: 'y2',
      marker: {
        color: this.accentPink,
        size: 7
      },
      line: {
        color: this.accentPink,
        width: 2.5
      },
      hovertemplate: '<b>Cumulative %{x}:</b> %{y:.2f}%<extra></extra>'
    };

    const layout = JSON.parse(JSON.stringify(this.darkLayoutBase));
    layout.title = {
      text: 'PCA Scree Plot (Explained Variance Ratio)',
      font: { size: 14, color: '#F1F5F9', weight: 600 }
    };
    layout.yaxis.title = { text: 'Individual Variance (%)', font: { color: '#A78BFA' } };
    layout.yaxis.range = [0, Math.max(...individualValues) * 1.15];
    
    layout.yaxis2 = {
      title: { text: 'Cumulative Variance (%)', font: { color: '#F472B6' } },
      overlaying: 'y',
      side: 'right',
      range: [0, 105],
      gridcolor: 'transparent',
      tickfont: { color: '#F472B6' }
    };

    layout.margin.r = 55;
    Plotly.react(containerId, [barTrace, lineTrace], layout, this.defaultConfig);
  }

  /**
   * Render SVD Singular Value Spectrum
   */
  renderSingularSpectrum(containerId, singularValues, energyRatios, maxComponents = 10) {
    const el = document.getElementById(containerId);
    if (!el || typeof Plotly === 'undefined') return;

    const k = Math.min(maxComponents, singularValues.length);
    const xLabels = Array.from({ length: k }, (_, i) => `SV-${i + 1}`);
    const sValues = singularValues.slice(0, k);

    const trace = {
      x: xLabels,
      y: sValues,
      type: 'bar',
      marker: {
        color: this.accentCyan,
        opacity: 0.85
      },
      hovertemplate: '<b>%{x} (σ):</b> %{y:.2f}<br>Energy Ratio: ' +
                     energyRatios.slice(0, k).map(e => e.toFixed(1) + '%') + '<extra></extra>'
    };

    const layout = JSON.parse(JSON.stringify(this.darkLayoutBase));
    layout.title = {
      text: 'SVD Singular Values Spectrum (σ)',
      font: { size: 14, color: '#F1F5F9', weight: 600 }
    };
    layout.xaxis.title = { text: 'Singular Component', font: { color: '#94A3B8' } };
    layout.yaxis.title = { text: 'Singular Value (σ)', font: { color: '#38BDF8' } };

    Plotly.react(containerId, [trace], layout, this.defaultConfig);
  }

  /**
   * Render Mini Thumbnail Scatter for 4-Way Comparison Grid
   */
  renderMiniComparisonPlot(containerId, embedding, labels, title) {
    const el = document.getElementById(containerId);
    if (!el || typeof Plotly === 'undefined') return;

    const benignX = [];
    const benignY = [];
    const malX = [];
    const malY = [];

    for (let i = 0; i < embedding.length; i++) {
      if (labels[i] === 'B') {
        benignX.push(embedding[i][0]);
        benignY.push(embedding[i][1]);
      } else {
        malX.push(embedding[i][0]);
        malY.push(embedding[i][1]);
      }
    }

    const traces = [
      {
        x: benignX,
        y: benignY,
        mode: 'markers',
        type: 'scatter',
        name: 'Benign',
        marker: { color: this.benignColor, size: 4.5, opacity: 0.8 }
      },
      {
        x: malX,
        y: malY,
        mode: 'markers',
        type: 'scatter',
        name: 'Malignant',
        marker: { color: this.malignantColor, size: 4.5, opacity: 0.8 }
      }
    ];

    const layout = {
      paper_bgcolor: '#111827',
      plot_bgcolor: '#0B0F19',
      margin: { l: 25, r: 15, t: 30, b: 25 },
      showlegend: false,
      title: {
        text: title,
        font: { size: 12, color: '#F1F5F9', weight: 600 }
      },
      xaxis: {
        gridcolor: '#1E293B',
        zerolinecolor: '#334155',
        showticklabels: false
      },
      yaxis: {
        gridcolor: '#1E293B',
        zerolinecolor: '#334155',
        showticklabels: false
      }
    };

    Plotly.react(containerId, traces, layout, { responsive: true, displayModeBar: false });
  }

  /**
   * Resize all active Plotly charts
   */
  resizeAll() {
    if (typeof Plotly === 'undefined') return;
    const plots = document.querySelectorAll('.js-plotly-plot');
    plots.forEach(plot => {
      Plotly.Plots.resize(plot);
    });
  }
}

// Global instance attached to window for browser access
window.chartsManager = new ChartsManager();
window.addEventListener('resize', () => {
  window.chartsManager.resizeAll();
});
