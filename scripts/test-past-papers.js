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
  assert(doc.querySelector('.papers-card').href.startsWith('https://'));
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
