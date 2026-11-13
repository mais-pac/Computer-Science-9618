const assert = require('assert');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('past-papers.html', 'utf8');
const js = fs.readFileSync('assets/js/past-papers.js', 'utf8');
for (const n of [1, 2, 3, 4]) {
  const dom = new JSDOM(html, { url: `https://example.test/past-papers.html?paper=${n}`, runScripts:'dangerously' });
  dom.window.eval(js);
  const doc = dom.window.document;
  assert.strictEqual(doc.querySelectorAll('.papers-year').length, 6);
  assert(doc.querySelector('#year-2025').textContent.includes(`9618/${n}1 · May/June 2025`));
  assert(doc.querySelector('#year-2025').textContent.includes(`9618/${n}3 · October/November 2025`));
  const series = doc.querySelectorAll('#year-2025 .papers-series');
  assert.strictEqual(series.length, 2);
  assert.deepStrictEqual(Array.from(series[0].querySelectorAll('strong'), el => el.textContent), [1, 2, 3].map(v => `9618/${n}${v} · May/June 2025`));
  assert.deepStrictEqual(Array.from(series[1].querySelectorAll('strong'), el => el.textContent), [1, 2, 3].map(v => `9618/${n}${v} · October/November 2025`));
  assert.strictEqual(doc.querySelectorAll('#year-2025 .papers-card small').length, 0);
  assert(doc.querySelector('.papers-year .papers-card').getAttribute('href').startsWith('papers/9618-'));
  for (const link of doc.querySelectorAll('.papers-year .papers-card')) assert(fs.existsSync(link.getAttribute('href')));
  dom.window.close();
}
const css = fs.readFileSync('assets/css/past-papers.css', 'utf8');
assert(css.includes('.papers-page h1, .papers-page h2 { color: var(--primary)'));
assert(css.includes('background: var(--bg)'));
const dom = new JSDOM(html, {url:'https://example.test/past-papers.html',runScripts:'dangerously'});
for (const f of ['content/data.js','assets/js/store.js','assets/js/exam.js','assets/js/app.js','assets/js/past-papers.js']) dom.window.eval(fs.readFileSync(f,'utf8'));
dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
const root=dom.window.document.documentElement; const before=root.dataset.theme;
dom.window.document.getElementById('themeBtn').click();
assert.notStrictEqual(root.dataset.theme,before);
dom.window.document.getElementById('themeBtn').click(); assert.strictEqual(root.dataset.theme,before);
dom.window.close();
console.log('Past paper index and theme toggle tests passed.');

const files = fs.readFileSync('assets/js/paper-files.js', 'utf8');
const detail = fs.readFileSync('assets/js/paper-page.js', 'utf8');
for (const paper of [1, 2]) for (const year of [2021,2022,2023,2024,2025,2026]) for (const series of (year === 2026 ? ['mj'] : ['mj','on'])) for (const v of [1,2,3]) {
  const filename = `papers/9618-${paper}${v}-${series}-${year}.html`;
  for (const route of [filename, filename.replace(/\.html$/, '')]) {
  const d = new JSDOM(fs.readFileSync(filename,'utf8'), {url:`https://example.test/${route}`,runScripts:'dangerously'});
  d.window.eval(files); d.window.eval(detail);
  assert.strictEqual(d.window.document.querySelectorAll('.paper-action').length, 4);
  const red = d.window.document.querySelector('.paper-action.mark-scheme');
  const green = d.window.document.querySelector('.paper-action.question-paper');
  assert(red.href?.startsWith('https://drive.google.com/file/d/'), filename + ' mark scheme');
  assert(green.href?.startsWith('https://drive.google.com/file/d/'), filename + ' question paper');
  assert.strictEqual(d.window.document.querySelector('.paper-action.exam').getAttribute('aria-disabled'), 'true');
  assert.strictEqual(d.window.document.querySelector('.paper-action.worked').getAttribute('aria-disabled'), 'true');
  assert(d.window.document.querySelector('.paper-heading .paper-actions'));
  assert(d.window.document.querySelector('.paper-content').textContent.includes('not available yet'));
  d.window.close();
  }
}
console.log('66 AS paper pages and Drive links verified against index mapping.');
