const assert = require('assert');
const fs = require('fs');
const {JSDOM} = require('jsdom');
const data = JSON.parse(fs.readFileSync('content/data.js','utf8').match(/window\.CS_EMBEDDED = ([\s\S]*);\n/)[1]);
const ids = ['teacher-ch1-2','teacher-ch3','teacher-ch4','teacher-ch5','teacher-ch6'];
for (const [i,id] of ids.entries()) {
  const exam = data.exams[id];
  assert(exam && exam.origin === 'teacher');
  assert.equal(exam.questions.length,[24,20,15,32,16][i]);
  assert.equal(exam.totalMarks,[40,40,50,45,46][i]);
  assert(exam.questions.every(q => q.type === 'text' && q.answer.every(p => /no mark scheme supplied/.test(p.text))));
}
(async()=>{
  const dom = new JSDOM(fs.readFileSync('exam.html','utf8'),{url:'https://example.test/exam.html?id=teacher-ch1-2',runScripts:'dangerously'});
  const w=dom.window; let active=false, requested=0;
  Object.defineProperty(w.document,'fullscreenElement',{get:()=>active ? w.document.documentElement : null});
  w.document.documentElement.requestFullscreen=()=>{requested++; active=true; w.document.dispatchEvent(new w.Event('fullscreenchange')); return Promise.resolve();};
  for (const file of ['content/data.js','assets/js/store.js','assets/js/exam.js','assets/js/app.js']) w.eval(fs.readFileSync(file,'utf8'));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded')); await new Promise(r=>setTimeout(r,80));
  assert(w.document.body.textContent.includes('Leaving fullscreen during the exam is recorded.'));
  w.document.querySelector('#startBtn').click(); assert.equal(requested,1);
  active=false; w.document.dispatchEvent(new w.Event('fullscreenchange'));
  const draft=w.CS.getDraft('teacher-ch1-2'); assert.equal(draft.fullscreenExits.length,1);
  w.document.querySelector('#submitBtn').click(); w.document.querySelector('[data-submit]').click();
  const result=w.CS.results()[0]; assert.equal(result.fullscreenExits.length,1); assert.equal(result.total,40);
  dom.window.close(); console.log('Teacher transcription and fullscreen recording passed');
})().catch(e=>{console.error(e);process.exitCode=1});
