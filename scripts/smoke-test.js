/* smoke test: loads each page in jsdom and exercises the exam flow */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const errors = [];

function load(pageFile, url) {
  const html = fs.readFileSync(path.join(ROOT, pageFile), 'utf8');
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => {
    const msg = e.stack || e.message || '';
    // jsdom cannot navigate or scroll — ignore those, they are not app bugs
    if (/Not implemented: (navigation|Window's scrollTo|Window's scroll)/.test(msg)) return;
    errors.push(pageFile + ' :: ' + msg);
  });
  vc.on('error', (m) => errors.push(pageFile + ' :: console.error ' + m));
  const dom = new JSDOM(html, {
    url: 'https://example.test/' + (url || pageFile),
    runScripts: 'dangerously',
    resources: undefined,
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      // inject local scripts manually (jsdom won't fetch file:// resources)
      window.__inject = true;
    }
  });
  const w = dom.window;
  const files = ['content/data.js', 'assets/js/store.js', 'assets/js/exam.js', 'assets/js/app.js'];
  for (const f of files) {
    const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
    try { w.eval(code); } catch (e) { errors.push(pageFile + ' :: script ' + f + ' :: ' + e.message); }
  }
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return dom;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // 1. every static page renders
  for (const page of ['index.html', 'exams.html', 'notes.html', 'code.html', 'progress.html', 'builder.html']) {
    const dom = load(page);
    await wait(300);
    const main = dom.window.document.querySelector('main').innerHTML.trim();
    const len = main.length;
    console.log(`${page.padEnd(14)} rendered ${String(len).padStart(6)} chars ${len < 400 ? '  <-- SUSPICIOUS' : ''}`);
    if (len < 400) errors.push(page + ' :: rendered too little');
  }

  // 2. exam player: start, answer everything, submit — for every exam
  const allExams = Object.keys((function () {
    const src = fs.readFileSync(path.join(ROOT, 'content/data.js'), 'utf8');
    return JSON.parse(src.match(/window\.CS_EMBEDDED = ([\s\S]*);\n/)[1]).exams;
  })());
  for (const examId of allExams) await playThrough(examId);

  async function playThrough(examId) {
  const dom = load('exam.html', 'exam.html?id=' + examId);
  const w = dom.window;
  await wait(400);
  const startBtn = w.document.getElementById('startBtn');
  if (!startBtn) { errors.push('exam.html :: no start button'); }
  else {
    startBtn.click();
    await wait(100);
    const data = w.CS_EMBEDDED.exams[examId];
    // walk through all questions, filling in the correct answer for each
    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      if (q.type === 'mcq') {
        const el = w.document.querySelector(`.opt[data-opt="${q.answer}"]`);
        if (!el) errors.push('exam :: mcq option missing for ' + q.id);
        else el.click();
      } else if (q.type === 'numeric') {
        const inp = w.document.getElementById('numAns');
        if (!inp) errors.push('exam :: numeric input missing ' + q.id);
        else { inp.value = String(q.answer); inp.dispatchEvent(new w.Event('input')); }
      } else if (q.type === 'text') {
        const ta = w.document.getElementById('textAns');
        if (!ta) errors.push('exam :: textarea missing ' + q.id);
        else { ta.value = 'my written answer'; ta.dispatchEvent(new w.Event('input')); }
      } else if (q.type === 'trace') {
        const inputs = [...w.document.querySelectorAll('input[data-r]')];
        let k = 0;
        (q.given || q.answer).forEach((row, r) => {
          q.columns.forEach((c, ci) => {
            const given = q.given && q.given[r] && String(q.given[r][ci] || '').trim() !== '';
            if (given) return;
            const inp = inputs[k++];
            if (!inp) { errors.push('exam :: trace input missing ' + q.id); return; }
            inp.value = String(q.answer[r][ci]);
            inp.dispatchEvent(new w.Event('input'));
          });
        });
      }
      const next = w.document.getElementById('nextBtn');
      if (i < data.questions.length - 1) next.click();
      await wait(10);
    }
    // submit
    w.document.getElementById('submitBtn').click();
    await wait(50);
    const modal = w.document.querySelector('.modal-back');
    if (!modal) errors.push('exam :: no submit confirmation modal');
    else modal.querySelector('[data-submit]').click();
    await wait(100);

    const results = JSON.parse(w.localStorage.getItem('cs9618.results.v1') || '[]');
    console.log(examId.padEnd(46).slice(0, 46), 'auto', String(results[0] && results[0].autoMarks).padStart(4) + '/' + (results[0] && results[0].autoTotal));
    if (!results.length) errors.push('exam :: result not saved');
    else if (results[0].autoMarks !== results[0].autoTotal) {
      errors.push('exam :: auto marks not full (' + results[0].autoMarks + '/' + results[0].autoTotal + ')');
    }

    // 3. result page with self marking
    const rdom = load('result.html', 'result.html?attempt=' + results[0].id);
    rdom.window.console.log = (...a) => console.log('   PAGE:', ...a);
    // copy storage across
    for (const k of Object.keys(w.localStorage)) rdom.window.localStorage.setItem(k, w.localStorage.getItem(k));
    await wait(300);
    const ticks = rdom.window.document.querySelectorAll('input[data-tick]');
    // self-mark checkboxes found
    if (!ticks.length) errors.push('result :: no self-mark checkboxes');
    else {
      // tick one mark-scheme point at a time, like a real user (the page re-renders each time)
      for (let guard = 0; guard < 60; guard++) {
        const next = [...rdom.window.document.querySelectorAll('input[data-tick]')]
          .find((t) => !t.checked);
        if (!next) break;
        next.checked = true;
        next.dispatchEvent(new rdom.window.Event('change', { bubbles: true }));
        await wait(30);
      }
      await wait(100);
      const after = JSON.parse(rdom.window.localStorage.getItem('cs9618.results.v1') || '[]')[0];
      console.log('      after self-marking:', after.marks, '/', after.total);
      if (after.marks !== after.total) errors.push('result :: self-marking did not reach full marks (' + examId + ': ' + after.marks + '/' + after.total + ')');
    }
  }
  }

  console.log('\n' + (errors.length ? '✖ ' + errors.length + ' problem(s):\n' + errors.join('\n') : '✔ all smoke tests passed'));
  process.exitCode = errors.length ? 1 : 0;
})();
