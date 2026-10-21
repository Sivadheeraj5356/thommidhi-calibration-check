const test = require('node:test');
const assert = require('node:assert/strict');
const { parseRows, validRows, summarize } = require('./app.js');

test('parses prediction rows', () => {
  const rows = parseRows('A | 0.7 | 1\nB | 0.2 | 0');
  assert.equal(rows.length, 2);
  assert.equal(rows[0].outcome, 1);
});

test('drops invalid probabilities and outcomes', () => {
  const rows = validRows(parseRows('bad | 1.4 | 1\ngood | 0.4 | 0'));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].label, 'good');
});

test('reports over-confidence from predictions and outcomes', () => {
  const summary = summarize('A | 0.9 | 0\nB | 0.8 | 0\nC | 0.7 | 1');
  assert.ok(summary.calibrationGap > 0);
  assert.ok(summary.brier > 0);
});
