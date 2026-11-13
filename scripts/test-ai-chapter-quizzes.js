const assert = require('assert');
const fs = require('fs');
const {JSDOM} = require('jsdom');
const embedded=JSON.parse(fs.readFileSync('content/data.js','utf8').match(/window\.CS_EMBEDDED = ([\s\S]*);\n/)[1]);
for (let n=1;n<=12;n++) {
 const mapped = ({4:5,5:8,6:9,7:10,8:11,9:12,10:13,11:14,12:15})[n] || n; const id=`ai-chapter-quiz-${String(n).padStart(2,'0')}`, e=embedded.exams[id], section=embedded.index.sections.find(x=>x.n===n);
 assert(e && e.chapter===mapped && e.origin==='ai'); assert.equal(e.paper,section.paper); assert.equal(e.questions.length,6);
 assert.equal(e.totalMarks,e.questions.reduce((a,q)=>a+q.marks,0));
 assert(e.questions.every(q=>q.topic===section.topic));
 assert(e.questions.some(q=>q.type==='mcq') && e.questions.some(q=>q.type==='text'));
 for(const q of e.questions) if(q.type==='mcq') assert(q.options.some(o=>o.id===q.answer)); else assert.equal(q.answer.reduce((a,p)=>a+p.marks,0),q.marks);
}
(async()=>{
 const dom=new JSDOM(fs.readFileSync('exams.html','utf8'),{url:'https://example.test/exams.html',runScripts:'dangerously'});
 for(const f of ['content/data.js','assets/js/store.js','assets/js/exam.js','assets/js/app.js']) dom.window.eval(fs.readFileSync(f,'utf8'));
 dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
 await new Promise(r=>setTimeout(r,100));
 const cards=dom.window.document.querySelectorAll('#ai-quizzes .grid .card');
 for(let n=1;n<=12;n++) assert(cards[({4:5,5:8,6:9,7:10,8:11,9:12,10:13,11:14,12:15})[n] ? ({4:5,5:8,6:9,7:10,8:11,9:12,10:13,11:14,12:15})[n]-1 : n-1].querySelector(`a[href="exam.html?id=ai-chapter-quiz-${String(n).padStart(2,'0')}"]`));
 dom.window.close();console.log('All 12 AI chapter quizzes validated and linked');
})().catch(e=>{console.error(e);process.exitCode=1});
