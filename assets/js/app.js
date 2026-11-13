/* app.js — page controllers for home, exams, notes, pseudocode, progress */
(function (CS) {
  'use strict';

  /* ================================================================== *
   *  HOME
   * ================================================================== */
  async function initHome() {
    const idx = await CS.loadIndex();
    const exams = await CS.getAllExams();
    const results = CS.results();
    const noteProg = CS.noteProgress();

    const questionCount = exams.reduce((n, e) => n + e.questions.length, 0);
    const totalMarks = exams.reduce((n, e) => n + e.totalMarks, 0);

    /* topic mastery from all attempts */
    const topics = {};
    results.forEach((r) => Object.entries(r.perTopic || {}).forEach(([t, v]) => {
      topics[t] = topics[t] || { got: 0, tot: 0 };
      topics[t].got += v.got; topics[t].tot += v.tot;
    }));
    const topicRows = Object.entries(topics)
      .map(([t, v]) => ({ t, pct: CS.pct(v.got, v.tot), got: v.got, tot: v.tot }))
      .sort((a, b) => a.pct - b.pct);
    const weakest = topicRows.slice(0, 3);

    const attempted = new Set(results.map((r) => r.examId));
    const untouched = exams.filter((e) => !attempted.has(e.id));
    const revised = Object.keys(noteProg).length;

    document.getElementById('home').innerHTML = `
      <section class="hero">
        <div class="eyebrow">Cambridge 9618 · AS Level · Personal platform</div>
        <h1>Every chapter test, on demand.</h1>
        <p class="lede">Practice papers on every class-test topic, AI-generated mocks in the same style,
        and concise notes for both papers. No login, no closing time, no leaderboard — just you, the paper and the mark scheme.</p>
        <div class="row" style="margin-top:16px">
          <a class="btn btn-primary btn-lg" href="exams.html">${CS.icon('clipboard')} Take an exam</a>
          <a class="btn btn-lg" href="notes.html?paper=paper-1">${CS.icon('book')} Paper 1 notes</a>
          <a class="btn btn-lg btn-ghost" href="code.html">${CS.icon('code')} Pseudocode drills</a>
        </div>
      </section>

      <section class="section">
        <div class="grid grid-4">
          <div class="stat"><div class="k">Exams ready</div><div class="v">${exams.length}<small> · ${exams.filter((e) => e.provenance === 'teacher-topic-reconstruction').length} class-topic reconstructions</small></div></div>
          <div class="stat"><div class="k">Question bank</div><div class="v">${questionCount}<small> · ${totalMarks} marks</small></div></div>
          <div class="stat"><div class="k">Attempts logged</div><div class="v">${results.length}<small> · ${results.length ? CS.relTime(results[results.length - 1].finishedAt) : 'none yet'}</small></div></div>
          <div class="stat"><div class="k">Notes revised</div><div class="v">${revised}<small> sections ticked</small></div></div>
        </div>
      </section>

      ${weakest.length ? `<section class="section">
        <div class="section-head"><h2>Weakest topics</h2><span class="sub">ranked from your own attempts</span></div>
        <div class="grid grid-3">
          ${weakest.map((w) => `<a class="card hover" href="notes.html?paper=${w.t.startsWith('info') || ['communication','hardware','processor','system-software','security','ethics','databases'].includes(w.t) ? 'paper-1' : 'paper-2'}#${w.t}">
            <div class="card-title"><h3>${CS.topicLabel(w.t)}</h3><span class="badge ${w.pct >= 75 ? 'green' : w.pct >= 50 ? 'yellow' : 'red'}">${w.pct}%</span></div>
            <div class="progress-bar"><i style="width:${w.pct}%"></i></div>
            <div class="card-meta" style="margin-top:8px">${Math.round(w.got * 10) / 10} of ${w.tot} marks earned · tap to revise</div>
          </a>`).join('')}
        </div>
      </section>` : ''}

      <section class="section">
        <div class="section-head"><h2>${results.length ? 'Pick up where you left off' : 'Exam practice'}</h2>
          <span class="sub"><a href="exams.html">See all ${exams.length} →</a></span></div>
        <div class="grid grid-2">
          ${exams.slice(0, 4).map((e) => {
            const best = CS.bestResult(e.id);
            const pct = best ? CS.pct(best.marks, best.total) : null;
            return `<div class="card hover">
              <div class="card-title">
                <h3>${CS.esc(e.title)}</h3>
                <span class="badge ${pct != null ? 'result' : 'ready'}">${pct != null ? 'Result available' : 'Ready'}</span>
              </div>
              <div class="card-meta">Computer Science · ${e.totalMarks} marks · ${e.durationMin} min</div>
              <div class="card-foot row">
                <a class="btn btn-sm ${pct != null ? '' : 'btn-primary'}" href="exam.html?id=${encodeURIComponent(e.id)}">${pct != null ? 'Retake exam' : 'Start exam'}</a>
                ${best ? `<a class="btn btn-sm btn-ghost" href="result.html?attempt=${best.id}">View result</a>
                  <span class="mono small" style="color:var(--fg-dim)">best ${pct}%</span>` : ''}
              </div>
            </div>`;
          }).join('')}
        </div>
      </section>

      ${untouched.length ? `<section class="section">
        <div class="section-head"><h2>Not attempted yet</h2><span class="sub">${untouched.length} left</span></div>
        <div class="chips">
          ${untouched.map((e) => `<a class="chip" href="exam.html?id=${encodeURIComponent(e.id)}">${CS.esc(e.title)}</a>`).join('')}
        </div>
      </section>` : ''}

      <section class="section">
        <div class="section-head"><h2>What is inside</h2></div>
        <div class="grid grid-3">
          <div class="card"><h3>${CS.icon('clipboard')} Exams</h3>
            <p class="small" style="color:var(--fg-dim)">Teacher-topic reconstructions with a full mark scheme (not the original papers) — plus AI mocks for the chapters you have not been tested on.</p></div>
          <div class="card"><h3>${CS.icon('book')} Notes</h3>
            <p class="small" style="color:var(--fg-dim)">Condensed Paper 1 theory and Paper 2 programming notes, with the exam traps and rapid-recall tables that actually earn marks.</p></div>
          <div class="card"><h3>${CS.icon('code')} Pseudocode</h3>
            <p class="small" style="color:var(--fg-dim)">Cambridge pseudocode reference plus 10 graded drills with model answers — the highest-value 20 minutes of revision.</p></div>
        </div>
      </section>`;
  }

  /* ================================================================== *
   *  EXAMS LIST
   * ================================================================== */
  async function initExams() {
    const exams = await CS.getAllExams();
    const host = document.getElementById('examList');
    const filt = { q: '', kind: 'all', paper: 'all' };

    const chapters = [...new Set(exams.map((e) => e.chapter).filter(Boolean))].sort((a, b) => a - b);

    host.innerHTML = `
      <nav class="chips" aria-label="Exam sections"><a class="chip" href="#teacher-quizzes">Teacher</a><a class="chip" href="#ai-section">AI</a><a class="chip" href="#ai-quizzes">AI Quiz</a><a class="chip" href="#ai-mocks">AI Mock</a></nav>
      <section class="section" id="teacher-quizzes"><h2>Teacher</h2><h3>Teacher quizzes</h3><p class="small">No teacher quizzes are available yet. Class-topic reconstructions are listed under AI Quiz.</p><div class="grid grid-2">${Array.from({length: 12}, (_, i) => {
        const chapter = i + 1;
        const existing = []; // Teacher papers are unavailable until supplied.
        return `<div class="card"><h3>Chapter ${chapter}</h3>${existing.length ? existing.map(e => `<p><a href="exam.html?id=${encodeURIComponent(e.id)}">${CS.esc(e.title)} →</a></p>`).join('') : '<p class="small">No teacher quiz available yet</p>'}</div>`;
      }).join('')}</div></section>
      <section class="section" id="ai-section"><h2>AI</h2><div id="ai-quizzes"><h3>AI Quiz</h3><p class="small">AI practice and class-topic reconstructions are listed here. Reconstructions are not original teacher papers. Chapter 1 practice sets are short self-marked exercises, not full mocks.</p><div class="grid grid-2">${Array.from({length: 12}, (_, i) => {
        const chapter = i + 1;
        const sets = exams.filter(e => e.origin === 'ai' && (e.chapter === chapter || (chapter <= 2 && e.id === 'as-chapters-1-2-test-2026-09-21')));
        return `<div class="card"><h3>Chapter ${chapter}</h3>${sets.length ? sets.map(e => `<p><a href="exam.html?id=${encodeURIComponent(e.id)}">${CS.esc(e.title.replace('practice mock', 'practice quiz'))} →</a></p>`).join('') : '<p class="small">Quiz not available yet</p>'}</div>`;
      }).join('')}</div><div class="card" style="margin-top:16px"><h3>Mixed AI practice</h3>${exams.filter(e => e.origin === 'ai' && e.id.startsWith('mix-ai-')).map(e => `<p><a href="exam.html?id=${encodeURIComponent(e.id)}">${CS.esc(e.title)} →</a></p>`).join('')}</div>
      </div>
      <div class="section" id="ai-mocks"><h3>AI Mock</h3><p class="small">Teacher-quiz-inspired mocks are planned but not yet available, including Chapter 1. Existing short AI exercises are listed under AI Quiz above.</p><div class="grid grid-2">${Array.from({length: 12}, (_, i) => {
        const chapter = i + 1;
        return `<div class="card"><h3>Chapter ${chapter}</h3>${Array.from({length: 5}, (_, j) => `<p class="small">Chapter ${chapter} · Mock ${j + 1} — not available yet</p>`).join('')}</div>`;
      }).join('')}</div></div></section>
      <section class="section"><h2>All available exams</h2></section>
      <div class="row" style="margin-bottom:14px">
        <label class="field" style="flex:1;min-width:220px;margin:0">
          <span>Search</span>
          <input type="search" id="examSearch" placeholder="Chapter, topic or title…">
        </label>
      </div>
      <div class="row" style="margin-bottom:6px">
        <div class="chips" id="kindChips">
          <button class="chip on" data-kind="all">All exams</button>
          <button class="chip" data-kind="teacher">Teacher tests</button>
          <button class="chip" data-kind="ai">AI practice</button>
        </div>
        <span class="spacer"></span>
        <div class="chips" id="paperChips">
          <button class="chip on" data-paper="all">Both papers</button>
          <button class="chip" data-paper="paper-1">Paper 1</button>
          <button class="chip" data-paper="paper-2">Paper 2</button>
        </div>
      </div>
      <div class="chips" style="margin-bottom:18px" id="chapChips">
        <button class="chip on" data-chap="all">Any chapter</button>
        ${chapters.map((c) => `<button class="chip" data-chap="${c}">Chapter ${c}</button>`).join('')}
      </div>
      <div id="examGrid" class="grid grid-2"></div>`;

    function statusOf(e) {
      const rs = CS.resultsFor(e.id);
      const best = CS.bestResult(e.id);
      if (rs.length) return { cls: 'result', label: 'Result available', best, rs };
      if (e.status === 'closed') return { cls: 'closed', label: 'Closed in class · open here', best: null, rs };
      return { cls: 'ready', label: 'Ready', best: null, rs };
    }

    function render() {
      const q = filt.q.toLowerCase();
      const list = exams.filter((e) => {
        if (filt.kind !== 'all' && e.origin !== filt.kind) return false;
        if (filt.paper !== 'all' && e.paper !== filt.paper) return false;
        if (filt.chap && filt.chap !== 'all' && String(e.chapter) !== String(filt.chap) && !(e.id === 'as-chapters-1-2-test-2026-09-21' && ['1','2'].includes(String(filt.chap)))) return false;
        if (!q) return true;
        const hay = (e.title + ' ' + (e.description || '') + ' ' + (e.topics || []).join(' ')).toLowerCase();
        return hay.includes(q);
      });

      if (!list.length) {
        document.getElementById('examGrid').innerHTML = '<div class="empty"><h3>No exams match</h3><p>Try clearing the filters.</p></div>';
        return;
      }

      document.getElementById('examGrid').innerHTML = list.map((e) => {
        const st = statusOf(e);
        return `<div class="card hover">
          <div class="card-title">
            <h3><a href="exam.html?id=${encodeURIComponent(e.id)}" style="color:inherit">${CS.esc(e.title)}</a></h3>
            <span class="badge ${st.cls}">${st.label}</span>
          </div>
          <div class="card-meta">Computer Science · ${e.paper === 'paper-1' ? 'Paper 1' : 'Paper 2'}${e.chapter ? ' · Chapter ' + e.chapter : ''}</div>
          <div class="card-meta" style="margin-top:6px">${e.totalMarks} marks · ${e.durationMin} min</div>
          <div class="card-meta" style="margin-top:2px">${e.examDate ? 'Opens: ' + CS.fmtDate(e.opensAt || e.examDate) : 'Always available · AI mock'}</div>
          ${st.best ? `<div class="progress-bar" style="margin-top:12px"><i style="width:${CS.pct(st.best.marks, st.best.total)}%"></i></div>
            <div class="card-meta" style="margin-top:6px">Best ${st.best.marks}/${st.best.total} · ${CS.pct(st.best.marks, st.best.total)}% · ${st.rs.length} attempt${st.rs.length === 1 ? '' : 's'}</div>` : ''}
          <div class="card-foot row">
            <a class="btn btn-sm ${st.best ? '' : 'btn-primary'}" href="exam.html?id=${encodeURIComponent(e.id)}">${st.best ? 'Retake' : 'Start exam'}</a>
            ${st.best ? `<a class="btn btn-sm btn-ghost" href="result.html?attempt=${st.best.id}">View result</a>` : ''}

          </div>
        </div>`;
      }).join('');
    }

    document.getElementById('examSearch').oninput = CS.debounce((ev) => { filt.q = ev.target.value; render(); }, 120);
    document.getElementById('kindChips').onclick = (ev) => {
      const b = ev.target.closest('[data-kind]'); if (!b) return;
      filt.kind = b.dataset.kind;
      [...document.querySelectorAll('#kindChips .chip')].forEach((c) => c.classList.toggle('on', c === b));
      render();
    };
    document.getElementById('paperChips').onclick = (ev) => {
      const b = ev.target.closest('[data-paper]'); if (!b) return;
      filt.paper = b.dataset.paper;
      [...document.querySelectorAll('#paperChips .chip')].forEach((c) => c.classList.toggle('on', c === b));
      render();
    };
    document.getElementById('chapChips').onclick = (ev) => {
      const b = ev.target.closest('[data-chap]'); if (!b) return;
      filt.chap = b.dataset.chap;
      [...document.querySelectorAll('#chapChips .chip')].forEach((c) => c.classList.toggle('on', c === b));
      render();
    };

    render();
  }

  /* ================================================================== *
   *  NOTES
   * ================================================================== */
  async function initNotes() {
    const params = new URLSearchParams(location.search);
    let paper = params.get('paper') || 'paper-1';
    const host = document.getElementById('notes');
    const idx = await CS.loadIndex();

    host.innerHTML = `<div class="notes-layout">
      <aside class="notes-side card tight"><span class="skeleton" style="width:80%;height:14px"></span>
        ${'<span class="skeleton" style="width:' + '90%' + ';height:11px"></span>'.repeat(8)}</aside>
      <div class="note-body"><span class="skeleton" style="width:60%;height:26px"></span>
        ${'<span class="skeleton" style="width:100%;height:12px"></span>'.repeat(14)}</div>
    </div>`;

    async function render() {
      const note = await CS.getPaperNotes(paper);
      const other = paper === 'paper-1' ? 'paper-2' : 'paper-1';
      if (!note) {
        host.innerHTML = '<div class="empty"><h3>Notes not found</h3><p>Run <span class="mono">node scripts/build-content.js</span> to build them.</p></div>';
        return;
      }
      const prog = CS.noteProgress();
      const sections = note.toc.filter((t) => t.level === 2);
      const doneCount = sections.filter((s) => prog[paper + '#' + s.id] && prog[paper + '#' + s.id].done).length;

      host.innerHTML = `
        <div class="row" style="margin-bottom:18px">
          <div class="chips">
            <a class="chip ${paper === 'paper-1' ? 'on' : ''}" href="notes.html?paper=paper-1">Paper 1 · Theory</a>
            <a class="chip ${paper === 'paper-2' ? 'on' : ''}" href="notes.html?paper=paper-2">Paper 2 · Programming</a>
          </div>
          <span class="spacer"></span>
          <button class="btn btn-sm btn-ghost" id="printNotes">${CS.icon('download')} Print / PDF</button>
        </div>
        <div class="notes-layout">
          <aside class="notes-side card tight">
            <div class="card-meta" style="margin-bottom:8px">CONTENTS</div>
            ${sections.map((s) => `<a href="#${s.id}" data-nav="${s.id}">${CS.esc(s.title)}${prog[paper + '#' + s.id] ? '<span class="dot"></span>' : ''}</a>`).join('')}
            <hr style="border:0;border-top:1px solid var(--border);margin:14px 0">
            <div class="note-progress">
              <div class="progress-bar" style="flex:1"><i style="width:${CS.pct(doneCount, sections.length || 1)}%"></i></div>
              <span class="mono small">${doneCount}/${sections.length}</span>
            </div>
            <p class="small" style="color:var(--fg-dim);margin:8px 0 0">Tick the ✓ beside each section heading when you have revised it.</p>
            <a class="btn btn-sm btn-ghost" style="width:100%;margin-top:10px" href="notes.html?paper=${other}">Switch to ${other === 'paper-1' ? 'Paper 1' : 'Paper 2'}</a>
          </aside>
          <article class="note-body" id="noteBody">${note.html}</article>
        </div>`;

      /* add a tick button to every h2 */
      document.querySelectorAll('#noteBody h2').forEach((h) => {
        const key = paper + '#' + h.id;
        const done = !!(prog[key] && prog[key].done);
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm ' + (done ? 'btn-primary' : 'btn-ghost');
        btn.style.cssText = 'float:right;margin-left:12px;font-size:.72rem;padding:3px 8px';
        btn.innerHTML = done ? '✓ Revised' : 'Mark revised';
        btn.onclick = () => { CS.toggleNoteDone(key); render(); };
        h.appendChild(btn);
        h.style.overflow = 'hidden';
      });

      document.getElementById('printNotes').onclick = () => window.print();
      document.querySelectorAll('[data-nav]').forEach((a) => {
        a.onclick = (ev) => {
          ev.preventDefault();
          const el = document.getElementById(a.dataset.nav);
          if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (CS.navOffset() + 8), behavior: 'smooth' });
        };
      });

      /* deep link, e.g. notes.html?paper=paper-1#info-rep, or a topic id */
      const hash = decodeURIComponent(location.hash.replace('#', ''));
      if (hash) {
        const el = document.getElementById(hash) ||
          document.getElementById(hash.replace(/^(\d+)-/, '')) ||
          [...document.querySelectorAll('#noteBody h2')].find((h) => h.id.includes(hash));
        if (el) setTimeout(() => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (CS.navOffset() + 8) }), 60);
      }
    }

    render();
  }

  /* ================================================================== *
   *  PSEUDOCODE TRAINING
   * ================================================================== */
  const DRILLS = [
    {
      title: 'Total and average of 10 numbers',
      brief: 'Input 10 numbers and output the total and the average.',
      code: `DECLARE Total : INTEGER
DECLARE Number : INTEGER
DECLARE Index : INTEGER
Total ← 0
FOR Index ← 1 TO 10
    INPUT Number
    Total ← Total + Number
NEXT Index
OUTPUT "Total: ", Total
OUTPUT "Average: ", Total / 10`
    },
    {
      title: 'Positive, negative or zero',
      brief: 'Input a number and state whether it is positive, negative or zero.',
      code: `DECLARE Number : INTEGER
INPUT Number
IF Number > 0 THEN
    OUTPUT "Positive"
ELSE
    IF Number < 0 THEN
        OUTPUT "Negative"
    ELSE
        OUTPUT "Zero"
    ENDIF
ENDIF`
    },
    {
      title: 'Highest and lowest of 20 marks',
      brief: 'Input 20 marks and output the highest and the lowest.',
      code: `DECLARE Mark : INTEGER
DECLARE Highest : INTEGER
DECLARE Lowest : INTEGER
DECLARE Index : INTEGER
INPUT Mark
Highest ← Mark
Lowest ← Mark
FOR Index ← 2 TO 20
    INPUT Mark
    IF Mark > Highest THEN Highest ← Mark ENDIF
    IF Mark < Lowest THEN Lowest ← Mark ENDIF
NEXT Index
OUTPUT "Highest: ", Highest
OUTPUT "Lowest: ", Lowest`
    },
    {
      title: 'Reverse a name',
      brief: 'Read a name and output it reversed, character by character.',
      code: `DECLARE Name : STRING
DECLARE Index : INTEGER
INPUT Name
FOR Index ← LENGTH(Name) TO 1 STEP -1
    OUTPUT MID(Name, Index, 1)
NEXT Index`
    },
    {
      title: 'Count the vowels',
      brief: 'Count how many vowels are in an input string.',
      code: `DECLARE Word : STRING
DECLARE Vowels : INTEGER
DECLARE Index : INTEGER
DECLARE Ch : CHAR
INPUT Word
Vowels ← 0
FOR Index ← 1 TO LENGTH(Word)
    Ch ← LCASE(MID(Word, Index, 1))
    IF Ch = "a" OR Ch = "e" OR Ch = "i" OR Ch = "o" OR Ch = "u" THEN
        Vowels ← Vowels + 1
    ENDIF
NEXT Index
OUTPUT "Vowels: ", Vowels`
    },
    {
      title: 'Store and print in reverse',
      brief: 'Read 10 numbers into an array, then output them in reverse order.',
      code: `DECLARE Nums : ARRAY[1:10] OF INTEGER
DECLARE Index : INTEGER
FOR Index ← 1 TO 10
    INPUT Nums[Index]
NEXT Index
FOR Index ← 10 TO 1 STEP -1
    OUTPUT Nums[Index]
NEXT Index`
    },
    {
      title: 'Linear search',
      brief: 'Search an array of 15 values; output the index found, or "not found".',
      code: `DECLARE Data : ARRAY[1:15] OF INTEGER
DECLARE Target : INTEGER
DECLARE Index : INTEGER
DECLARE Found : BOOLEAN
INPUT Target
Found ← FALSE
Index ← 1
WHILE Index <= 15 AND NOT Found
    IF Data[Index] = Target THEN
        Found ← TRUE
    ELSE
        Index ← Index + 1
    ENDIF
ENDWHILE
IF Found THEN
    OUTPUT "Found at index ", Index
ELSE
    OUTPUT "Not found"
ENDIF`
    },
    {
      title: 'Binary search',
      brief: 'Binary search a sorted array of 20 elements.',
      code: `DECLARE Data : ARRAY[1:20] OF INTEGER
DECLARE Target : INTEGER
DECLARE Low : INTEGER
DECLARE High : INTEGER
DECLARE Mid : INTEGER
DECLARE Found : BOOLEAN
Low ← 1
High ← 20
Found ← FALSE
INPUT Target
WHILE Low <= High AND NOT Found
    Mid ← (Low + High) DIV 2
    IF Data[Mid] = Target THEN
        Found ← TRUE
    ELSE
        IF Target < Data[Mid] THEN
            High ← Mid - 1
        ELSE
            Low ← Mid + 1
        ENDIF
    ENDIF
ENDWHILE
IF Found THEN
    OUTPUT "Found at ", Mid
ELSE
    OUTPUT "Not found"
ENDIF`
    },
    {
      title: 'Bubble sort',
      brief: 'Sort 10 numbers into ascending order using a bubble sort.',
      code: `DECLARE Nums : ARRAY[1:10] OF INTEGER
DECLARE Index : INTEGER
DECLARE Temp : INTEGER
DECLARE Swapped : BOOLEAN
REPEAT
    Swapped ← FALSE
    FOR Index ← 1 TO 9
        IF Nums[Index] > Nums[Index + 1] THEN
            Temp ← Nums[Index]
            Nums[Index] ← Nums[Index + 1]
            Nums[Index + 1] ← Temp
            Swapped ← TRUE
        ENDIF
    NEXT Index
UNTIL NOT Swapped
FOR Index ← 1 TO 10
    OUTPUT Nums[Index]
NEXT Index`
    },
    {
      title: 'Read a CSV file into an array of records',
      brief: 'Read students.txt (id,name,mark per line), store in an array of records, output the average mark.',
      code: `TYPE Student
    DECLARE ID : INTEGER
    DECLARE Name : STRING
    DECLARE Mark : INTEGER
ENDTYPE

DECLARE Pupils : ARRAY[1:100] OF Student
DECLARE Line : STRING
DECLARE Count : INTEGER
DECLARE Total : INTEGER
DECLARE Comma1 : INTEGER
DECLARE Comma2 : INTEGER
DECLARE Index : INTEGER

Count ← 0
OPENFILE "students.txt" FOR READ
WHILE NOT EOF("students.txt")
    READFILE "students.txt", Line
    Count ← Count + 1
    Comma1 ← FIND(Line, ",")
    Comma2 ← FIND(MID(Line, Comma1 + 1, LENGTH(Line)), ",") + Comma1
    Pupils[Count].ID ← STRING_TO_NUM(LEFT(Line, Comma1 - 1))
    Pupils[Count].Name ← MID(Line, Comma1 + 1, Comma2 - Comma1 - 1)
    Pupils[Count].Mark ← STRING_TO_NUM(MID(Line, Comma2 + 1, LENGTH(Line)))
ENDWHILE
CLOSEFILE "students.txt"

Total ← 0
FOR Index ← 1 TO Count
    Total ← Total + Pupils[Index].Mark
NEXT Index
IF Count > 0 THEN
    OUTPUT "Average: ", Total / Count
ENDIF`
    }
  ];

  const REFERENCE = [
    {
      title: 'Declarations & assignment',
      code: `DECLARE Count : INTEGER
DECLARE Price : REAL
DECLARE Name : STRING
DECLARE IsDone : BOOLEAN
DECLARE Marks : ARRAY[1:30] OF INTEGER
DECLARE Grid : ARRAY[1:5, 1:5] OF CHAR
CONSTANT MaxMark = 100

Count ← 10
Name ← "Ariun"`
    },
    {
      title: 'Selection',
      code: `IF Age >= 18 THEN
    OUTPUT "adult"
ELSE
    OUTPUT "minor"
ENDIF

CASE OF Grade
    "A": OUTPUT "Excellent"
    "B": OUTPUT "Good"
    OTHERWISE: OUTPUT "Keep going"
ENDCASE`
    },
    {
      title: 'Iteration',
      code: `FOR Index ← 1 TO 10
    OUTPUT Index
NEXT Index

FOR Index ← 10 TO 1 STEP -1
    OUTPUT Index
NEXT Index

WHILE Count < 10
    Count ← Count + 1
ENDWHILE

REPEAT
    Count ← Count + 1
UNTIL Count = 10`
    },
    {
      title: 'Procedures & functions',
      code: `PROCEDURE ShowLine(Text : STRING)
    OUTPUT Text
ENDPROCEDURE

FUNCTION Square(N : INTEGER) RETURNS INTEGER
    RETURN N * N
ENDFUNCTION

CALL ShowLine("hello")
OUTPUT Square(6)`
    },
    {
      title: 'Parameter passing',
      code: `PROCEDURE Swap(BYREF A : INTEGER, BYREF B : INTEGER)
    DECLARE Temp : INTEGER
    Temp ← A
    A ← B
    B ← Temp
ENDPROCEDURE

// BYVAL protects the original; BYREF lets the subroutine change it`
    },
    {
      title: 'Records & user-defined types',
      code: `TYPE Student
    DECLARE ID : INTEGER
    DECLARE Name : STRING
    DECLARE Mark : REAL
ENDTYPE

DECLARE Pupil : Student
Pupil.ID ← 1
Pupil.Name ← "Ariun"
OUTPUT Pupil.Name

TYPE Colour = (Red, Green, Blue)
DECLARE Chosen : Colour`
    },
    {
      title: 'Files',
      code: `OPENFILE "data.txt" FOR READ
WHILE NOT EOF("data.txt")
    READFILE "data.txt", LineOfText
    OUTPUT LineOfText
ENDWHILE
CLOSEFILE "data.txt"

OPENFILE "out.txt" FOR WRITE
WRITEFILE "out.txt", "new line"
CLOSEFILE "out.txt"`
    },
    {
      title: 'String functions',
      code: `LENGTH(Name)                 // number of characters
LCASE(Name)  /  UCASE(Name)  // change case
LEFT(Name, 3)                // first 3 characters
RIGHT(Name, 3)               // last 3 characters
MID(Name, 2, 4)              // 4 characters from position 2
FIND(Name, ",")              // position of a substring
STRING_TO_NUM("42") / NUM_TO_STRING(42)`
    }
  ];

  function initCode() {
    const host = document.getElementById('codeHost');
    host.innerHTML = `<div class="grid grid-2">${'<div class="card"><span class="skeleton" style="width:40%;height:16px"></span><span class="skeleton" style="width:100%;height:120px"></span></div>'.repeat(4)}</div>`;
    host.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="row-between">
            <div>
              <h3>${CS.icon('code')} Cambridge pseudocode reference</h3>
              <p class="small" style="color:var(--fg-dim);margin:0">Copy these exactly — Paper 2 rewards Cambridge syntax, not Python.</p>
            </div>
            <label class="field" style="margin:0;min-width:200px">
              <input type="search" id="refSearch" placeholder="Filter reference…">
            </label>
          </div>
        </div>
        <div class="grid grid-2" id="refGrid">
          ${REFERENCE.map((r, i) => `<div class="card" data-ref="${r.title.toLowerCase()}" data-refpad>
            <div class="row-between" style="margin-bottom:8px">
              <h3 style="margin:0;font-size:.95rem">${r.title}</h3>
              <button class="btn btn-sm btn-ghost" data-copy="${i}">Copy</button>
            </div>
            <pre class="pre" style="margin:0">${CS.esc(r.code)}</pre>
          </div>`).join('')}
        </div>

        <div class="section-head" style="margin-top:26px"><h2>Pseudocode drills</h2>
          <span class="sub">10 drills · model answers hidden until you try</span></div>
        <div class="stack" id="drills">
          ${DRILLS.map((d, i) => `<div class="card">
            <div class="row-between">
              <div class="row" style="gap:10px">
                <span class="qnum">Drill ${i + 1}</span>
                <h3 style="margin:0;font-size:.95rem">${d.title}</h3>
              </div>
              <button class="btn btn-sm" data-reveal="${i}">Show model answer</button>
            </div>
            <p class="small" style="color:var(--fg-dim);margin:8px 0 0">${d.brief}</p>
            <div class="hide" data-answer="${i}" style="margin-top:12px">
              <pre class="pre">${CS.esc(d.code)}</pre>
              <button class="btn btn-sm btn-ghost" data-copycode="${i}">Copy answer</button>
            </div>
          </div>`).join('')}
        </div>
      </div>`;

    document.getElementById('refSearch').oninput = CS.debounce((ev) => {
      const q = ev.target.value.toLowerCase();
      document.querySelectorAll('[data-ref]').forEach((card) => {
        card.classList.toggle('hide', !!q && !card.dataset.ref.includes(q));
      });
    }, 100);

    host.querySelectorAll('[data-copy]').forEach((b) => {
      b.onclick = async () => {
        const ok = await CS.copy(REFERENCE[Number(b.dataset.copy)].code);
        CS.toast(ok ? 'Copied' : 'Copy failed', ok ? 'ok' : 'err');
      };
    });
    host.querySelectorAll('[data-reveal]').forEach((b) => {
      b.onclick = () => {
        const i = b.dataset.reveal;
        const box = host.querySelector(`[data-answer="${i}"]`);
        box.classList.toggle('hide');
        b.textContent = box.classList.contains('hide') ? 'Show model answer' : 'Hide model answer';
      };
    });
    host.querySelectorAll('[data-copycode]').forEach((b) => {
      b.onclick = async () => {
        const ok = await CS.copy(DRILLS[Number(b.dataset.copycode)].code);
        CS.toast(ok ? 'Copied' : 'Copy failed', ok ? 'ok' : 'err');
      };
    });
  }

  /* ================================================================== *
   *  PROGRESS
   * ================================================================== */
  async function initProgress() {
    const exams = await CS.getAllExams();
    const results = CS.results().slice().sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));
    const host = document.getElementById('progress');
    const noteProg = CS.noteProgress();
    const revised = Object.keys(noteProg).length;

    const marks = results.reduce((n, r) => n + r.marks, 0);
    const possible = results.reduce((n, r) => n + r.total, 0);
    const avg = CS.pct(marks, possible);
    const timeSec = results.reduce((n, r) => n + (r.durationUsedSec || 0), 0);

    const topics = {};
    results.forEach((r) => Object.entries(r.perTopic || {}).forEach(([t, v]) => {
      topics[t] = topics[t] || { got: 0, tot: 0 };
      topics[t].got += v.got; topics[t].tot += v.tot;
    }));

    const attempted = new Set(results.map((r) => r.examId));
    const coverage = CS.pct(attempted.size, exams.length || 1);

    host.innerHTML = `
      <div class="stack">
        <div class="grid grid-4">
          <div class="stat"><div class="k">Attempts</div><div class="v">${results.length}</div></div>
          <div class="stat"><div class="k">Average score</div><div class="v">${results.length ? avg + '<small>%</small>' : '—'}</div></div>
          <div class="stat"><div class="k">Marks earned</div><div class="v">${Math.round(marks * 10) / 10}<small> / ${possible}</small></div></div>
          <div class="stat"><div class="k">Time on papers</div><div class="v">${Math.round(timeSec / 60)}<small> min</small></div></div>
        </div>

        <div class="grid grid-2">
          <div class="card">
            <h3>Topic mastery</h3>
            <p class="small" style="color:var(--fg-dim)">Averaged over every question you have answered, including self-marked ones.</p>
            <div class="bars" style="margin-top:12px">
              ${Object.keys(CS.topicLabel('x')).length ? '' : ''}
              ${['info-rep','communication','hardware','processor','system-software','security','ethics','databases','algorithms','data-types','programming','software-dev'].map((t) => {
                const v = topics[t];
                const p = v ? CS.pct(v.got, v.tot) : 0;
                const col = !v ? 'var(--muted)' : p >= 75 ? 'var(--green)' : p >= 50 ? 'var(--yellow)' : 'var(--red)';
                return `<div class="bar" style="grid-template-columns:1fr 58px">
                  <div><div class="small" style="color:${v ? 'var(--fg)' : 'var(--fg-dim)'}">${CS.topicLabel(t)}</div>
                  <div class="track"><i style="width:${p}%;background:${col}"></i></div></div>
                  <div class="mono small" style="text-align:right">${v ? p + '%' : '—'}</div>
                </div>`;
              }).join('')}
            </div>
          </div>
          <div class="card">
            <h3>Exam coverage</h3>
            <div class="row" style="gap:16px;margin:12px 0">
              <div class="score-ring" style="--p:${coverage};width:104px;height:104px">
                <div><div class="big" style="font-size:1.35rem">${attempted.size}/${exams.length}</div><div class="lbl">exams tried</div></div>
              </div>
              <div class="small" style="color:var(--fg-dim)">
                Notes sections ticked: <span class="mono">${revised}</span><br>
                Questions answered: <span class="mono">${results.reduce((n, r) => n + Object.keys(r.answers || {}).length, 0)}</span><br>
                Best paper: <span class="mono">${bestPaper(results)}</span>
              </div>
            </div>
            <div class="chips">
              ${exams.map((e) => `<a class="chip ${attempted.has(e.id) ? 'on' : ''}" href="exam.html?id=${encodeURIComponent(e.id)}">${CS.esc(e.title.slice(0, 26))}${e.title.length > 26 ? '…' : ''}</a>`).join('')}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="row-between"><h3>Attempt history</h3>
            <div class="row">
              <button class="btn btn-sm btn-ghost" id="backupBtn">${CS.icon('download')} Backup / restore</button>
            </div>
          </div>
          ${results.length ? `<table class="tbl" style="margin-top:10px">
            <thead><tr><th>Finished</th><th>Exam</th><th>Marks</th><th>%</th><th>Time</th><th></th></tr></thead>
            <tbody>${results.map((r) => `<tr>
              <td>${CS.fmtDate(r.finishedAt)}</td>
              <td>${CS.esc(r.examTitle)}</td>
              <td class="mono">${r.marks}/${r.total}</td>
              <td class="mono">${CS.pct(r.marks, r.total)}%</td>
              <td class="mono">${CS.mmss(r.durationUsedSec || 0)}</td>
              <td><a class="btn btn-sm btn-ghost" href="result.html?attempt=${r.id}">Review</a></td>
            </tr>`).join('')}</tbody></table>`
            : '<p class="small" style="color:var(--fg-dim)">No attempts yet. <a href="exams.html">Start your first exam →</a></p>'}
        </div>
      </div>`;

    const bb = document.getElementById('backupBtn');
    if (bb) bb.onclick = () => CS.openBackup();
  }

  function bestPaper(results) {
    if (!results.length) return '—';
    const best = results.reduce((a, b) => (b.marks / (b.total || 1) > a.marks / (a.total || 1) ? b : a));
    return best.examTitle + ' (' + CS.pct(best.marks, best.total) + '%)';
  }

  /* ================================================================== *
   *  BACKUP MODAL
   * ================================================================== */
  CS.openBackup = function () {
    const modal = document.createElement('div');
    modal.className = 'modal-back';
    modal.innerHTML = `<div class="modal">
      <h3>Backup &amp; restore</h3>
      <p class="small" style="color:var(--fg-dim)">All results, notes ticks and custom exams live in this browser only.
      Export a JSON file so nothing is lost if you clear site data or switch device.</p>
      <div class="row" style="margin:14px 0">
        <button class="btn btn-primary" id="expBtn">${CS.icon('download')} Export backup</button>
        <label class="btn" style="cursor:pointer">${CS.icon('upload')} Import backup
          <input type="file" id="impFile" accept="application/json" style="display:none">
        </label>
        <button class="btn btn-danger" id="resetBtn">${CS.icon('trash')} Reset everything</button>
      </div>
      <div id="bkMsg" class="small"></div>
      <p class="small" style="color:var(--fg-dim);margin-top:14px">Tip: keep the backup in your repo or Drive — it is a few KB of JSON.</p>
      <div class="row" style="justify-content:flex-end"><button class="btn btn-ghost" data-close>Close</button></div>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('[data-close]').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    document.getElementById('expBtn').onclick = () => {
      const blob = new Blob([JSON.stringify(CS.exportAll(), null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'cs9618-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(a.href);
      CS.toast('Backup downloaded', 'ok');
    };
    document.getElementById('impFile').onchange = (ev) => {
      const f = ev.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          CS.importAll(data, 'merge');
          document.getElementById('bkMsg').innerHTML = '<span class="badge green">Imported and merged</span>';
          if (document.body.dataset.page === 'progress') initProgress();
        } catch (e) {
          document.getElementById('bkMsg').innerHTML = '<span class="badge red">' + CS.esc(e.message) + '</span>';
        }
      };
      reader.readAsText(f);
    };
    document.getElementById('resetBtn').onclick = () => {
      if (confirm('Delete all results, notes ticks and custom exams from this browser?')) {
        CS.resetAll();
        modal.remove();
        CS.toast('Everything cleared');
        setTimeout(() => location.reload(), 400);
      }
    };
  };

  /* ================================================================== *
   *  BOOT
   * ================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    CS.renderChrome();
    const page = document.body.dataset.page;
    const run = { home: initHome, exams: initExams, notes: initNotes, code: initCode, progress: initProgress }[page];
    if (run) {
      Promise.resolve().then(run).catch((e) => {
        console.error(e);
        const host = document.querySelector('main');
        if (host) host.innerHTML = `<div class="empty"><h3>Content not built</h3>
          <p class="mono small">${CS.esc(e.message)}</p>
          <p>Run <span class="mono">node scripts/build-content.js</span> in the repo, then reload.</p></div>`;
      });
    }
  });

})(window.CS);
