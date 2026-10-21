(function (root) {
  function parseRows(text) {
    return String(text || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
      const [label = '', probability = '', outcome = ''] = line.split('|').map((part) => part.trim());
      return { index: index + 1, label, probability: Number(probability), outcome: Number(outcome) };
    }).filter((row) => row.label);
  }

  function validRows(rows) {
    return rows.filter((row) => Number.isFinite(row.probability) && row.probability >= 0 && row.probability <= 1 && (row.outcome === 0 || row.outcome === 1));
  }

  function summarize(text) {
    const rows = validRows(parseRows(text));
    if (!rows.length) return { rows: [], count: 0, meanPrediction: 0, observedRate: 0, brier: 0, calibrationGap: 0, verdict: 'No valid rows' };
    const meanPrediction = rows.reduce((sum, row) => sum + row.probability, 0) / rows.length;
    const observedRate = rows.reduce((sum, row) => sum + row.outcome, 0) / rows.length;
    const brier = rows.reduce((sum, row) => sum + (row.probability - row.outcome) ** 2, 0) / rows.length;
    const calibrationGap = meanPrediction - observedRate;
    const verdict = rows.length < 10 ? 'Collect more outcomes' : Math.abs(calibrationGap) > 0.12 ? 'Recalibrate before launch' : 'Calibration within review band';
    return { rows, count: rows.length, meanPrediction, observedRate, brier, calibrationGap, verdict };
  }

  function format(value) {
    return `${Math.round(value * 1000) / 10}%`;
  }

  function render(summary) {
    const output = document.querySelector('#results');
    if (!output) return;
    if (!summary.count) {
      output.innerHTML = '<p class="empty">Add rows as label | probability 0-1 | outcome 0 or 1.</p>';
      return;
    }
    output.innerHTML = `
      <article class="panel"><span>Rows</span><strong>${summary.count}</strong><p>Valid prediction/outcome pairs</p></article>
      <article class="panel"><span>Mean prediction</span><strong>${format(summary.meanPrediction)}</strong><p>What the model expected</p></article>
      <article class="panel"><span>Observed rate</span><strong>${format(summary.observedRate)}</strong><p>What happened later</p></article>
      <article class="panel"><span>Brier score</span><strong>${summary.brier.toFixed(3)}</strong><p>Lower is better</p></article>
      <article class="verdict"><h3>${summary.verdict}</h3><p>Calibration gap: ${format(summary.calibrationGap)}. A positive gap means the model is over-confident; negative means under-confident.</p></article>`;
  }

  function boot() {
    const input = document.querySelector('#predictionInput');
    const button = document.querySelector('#runButton');
    if (!input || !button) return;
    button.addEventListener('click', () => render(summarize(input.value)));
  }

  const api = { parseRows, validRows, summarize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root.document) root.ThommidhiCalibrationCheck = api;
  if (root.document) root.addEventListener('DOMContentLoaded', boot);
})(typeof window !== 'undefined' ? window : globalThis);
