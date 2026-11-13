const assert = require('assert');
const fs = require('fs');
const {JSDOM,VirtualConsole} = require('jsdom');
const scripts=['content/data.js','assets/js/store.js','assets/js/exam.js','assets/js/app.js'];
const wait=()=>new Promise(r=>setTimeout(r,80));
function load(page,url,storage) {
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { if (!/Not implemented: (navigation|window.scrollTo)/.test(e.message)) throw e; });
  const dom=new JSDOM(fs.readFileSync(page,'utf8'),{url:'https://example.test/'+url,runScripts:'dangerously',virtualConsole:vc});
  if(storage) Object.entries(storage).forEach(([k,v])=>dom.window.localStorage.setItem(k,v));
  scripts.forEach(f=>dom.window.eval(fs.readFileSync(f,'utf8')));
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  return dom;
}
(async()=>{
  const dom=load('exam.html','exam.html?id=teacher-ch6'); const w=dom.window; await wait();
  w.document.querySelector('#startBtn').click();
  let i=0; const exam=w.CS_EMBEDDED.exams['teacher-ch6'];
  const index=exam.questions.findIndex(q=>q.id==='q2a');
  while(i++<index) w.document.querySelector('#nextBtn').click();
  const card=w.document.querySelector('.qcard'); assert(card.querySelector('svg.answer-grid-border'));
  const input=card.querySelector('[data-table-row="0"][data-table-col="2"]'); assert(input); assert(!card.querySelector('[data-table-row="0"][data-table-col="1"]'));
  input.value='custom response'; input.dispatchEvent(new w.Event('input',{bubbles:true}));
  w.document.querySelector('#nextBtn').click(); w.document.querySelector('#prevBtn').click();
  assert.equal(w.document.querySelector('[data-table-row="0"][data-table-col="2"]').value,'custom response');
  assert(w.document.querySelector('#qgrid button.cur').classList.contains('answered'));
  w.document.querySelector('#submitBtn').click(); w.document.querySelector('[data-submit]').click();
  const result=w.CS.results()[0]; assert.equal(result.tableAnswers.q2a[0][2],'custom response');
  const stored=Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));
  const rdom=load('result.html','result.html?attempt='+result.id,stored); await wait();
  const review=rdom.window.document.querySelector('#r-q2a'); assert(review.textContent.includes('custom response')); assert(!review.querySelector('[data-table-row]'));
  assert.equal(exam.questions.filter(q=>q.table).length,5);
  rdom.window.close(); dom.window.close(); console.log('Vector tables: inputs, draft navigation, submission and review passed');
})().catch(e=>{console.error(e);process.exitCode=1});
