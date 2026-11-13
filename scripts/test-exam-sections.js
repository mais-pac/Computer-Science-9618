const assert = require('assert');
const fs = require('fs');
const {JSDOM} = require('jsdom');
(async () => {
  const dom = new JSDOM(fs.readFileSync('exams.html','utf8'), {url:'https://example.test/exams.html',runScripts:'dangerously'});
  for (const file of ['content/data.js','assets/js/store.js','assets/js/exam.js','assets/js/app.js']) dom.window.eval(fs.readFileSync(file,'utf8'));
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  await new Promise(resolve => setTimeout(resolve,100));
  const teacher = dom.window.document.querySelector('#teacher-quizzes');
  assert.equal(teacher.querySelectorAll('.card').length,15);
  assert.equal((teacher.textContent.match(/No teacher quiz available yet/g)||[]).length,9);
  for (const [chapter,id] of [[1,'teacher-ch1-2'],[2,'teacher-ch1-2'],[3,'teacher-ch3'],[4,'teacher-ch4'],[5,'teacher-ch5'],[6,'teacher-ch6']]) assert(teacher.querySelectorAll('.card')[chapter-1].querySelector(`a[href="exam.html?id=${id}"]`));
  const cards = dom.window.document.querySelectorAll('#ai-quizzes .grid .card');
  for (const [chapter, id] of [[1,'as-chapters-1-2-test-2026-09-21'],[2,'as-chapters-1-2-test-2026-09-21'],[3,'ch3-hardware-hardware-2026-09-30'],[4,'ch4-record-data-types-subroutines-logic-2026-10-08'],[5,'processor-fundamentals-parameter-passing-2026-10-26'],[6,'assembly-language-question-paper-2026-10-10']]) {
    assert(cards[chapter-1].querySelector(`a[href="exam.html?id=${id}"]`),`Chapter ${chapter}`);
  }
  dom.window.close(); console.log('Teacher and AI Quiz chapter placement passed');
})().catch(e => { console.error(e); process.exitCode=1; });
