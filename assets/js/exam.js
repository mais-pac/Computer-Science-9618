/* exam.js — exam player, result/review screen, local exam builder */
(function (CS) {
  'use strict';

  /* ---------- rich text for question bodies (code fences + tables) ---------- */
  CS.rich = function (text) {
    const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (/^```/.test(line)) {
        const buf = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        out.push('<pre>' + CS.esc(buf.join('\n')) + '</pre>');
        continue;
      }
      if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
        const head = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        i += 2;
        const rows = [];
        while (i < lines.length && /^\|/.test(lines[i].trim())) {
          rows.push(lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
          i++;
        }
        out.push('<table><thead><tr>' + head.map((h) => '<th>' + CS.md(h) + '</th>').join('') + '</tr></thead><tbody>' +
          rows.map((r) => '<tr>' + r.map((c) => '<td>' + CS.md(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>');
        continue;
      }
      if (!line.trim()) { i++; continue; }
      out.push('<p>' + CS.md(line) + '</p>');
      i++;
    }
    return out.join('');
  };

  /* ---------- scoring ---------- */
  function normNumber(v, tol) {
    const n = parseFloat(String(v).replace(/[,\s]/g, ''));
    if (isNaN(n)) return null;
    return n;
  }

  function scoreQuestion(q, ans, opts) {
    opts = opts || {};
    if (ans == null || ans === '') return 0;
    if (q.type === 'mcq') return ans === q.answer ? q.marks : 0;
    if (q.type === 'numeric') {
      const n = normNumber(ans);
      if (n == null) return 0;
      const tol = q.tolerance != null ? q.tolerance : 0.005;
      return Math.abs(n - q.answer) <= Math.max(tol, Math.abs(q.answer) * 0.0005) ? q.marks : 0;
    }
    if (q.type === 'trace') {
      let cells = 0, correct = 0;
      (q.answer || []).forEach((row, r) => {
        const givenRow = (q.given && q.given[r]) || [];
        row.forEach((cell, c) => {
          if (givenRow[c] != null && String(givenRow[c]).trim() !== '') return; // pre-filled
          cells++;
          const mine = String(((ans || [])[r] || [])[c] == null ? '' : ans[r][c]).trim().toUpperCase().replace(/\s+/g, '');
          const want = String(cell).trim().toUpperCase().replace(/\s+/g, '');
          if (mine === want) correct++;
        });
      });
      if (!cells) return 0;
      return Math.round((q.marks * (correct / cells)) * 10) / 10;
    }
    // text — self marked
    if (typeof ans === 'object' && Array.isArray(ans.ticks)) {
      const ticks = ans.ticks.filter(Boolean).length;
      return Math.min(q.marks, ticks);
    }
    return 0;
  }
  CS.scoreQuestion = scoreQuestion;

  function hasAnswer(q, ans) {
    if (ans == null) return false;
    if (q.type === 'trace') return Array.isArray(ans) && ans.some((r) => (r || []).some((c) => String(c || '').trim() !== ''));
    if (q.type === 'text') return String(ans).trim().length > 0 || (Array.isArray(ans.ticks) && ans.ticks.some(Boolean));
    return String(ans).trim() !== '';
  }

  /* ---------- attempt helpers ---------- */
  function newAttempt(exam) {
    return {
      id: CS.uid('att'),
      examId: exam.id,
      examTitle: exam.title,
      startedAt: new Date().toISOString(),
      endsAt: Date.now() + exam.durationMin * 60000,
      order: exam.questions.map((q) => q.id),
      answers: {},
      flags: [],
      index: 0
    };
  }

  /* written question: each mark-scheme point carries its marks; scaled to the
     question's total so ticking everything always awards full marks. */
  function selfMarkScore(q, ticks) {
    const pts = q.answer || [];
    const maxPoints = pts.reduce((n, p) => n + (p.marks || 1), 0) || 1;
    const got = pts.reduce((n, p, i) => n + ((ticks && ticks[i]) ? (p.marks || 1) : 0), 0);
    return Math.round((q.marks * got / maxPoints) * 10) / 10;
  }
  CS.selfMarkScore = selfMarkScore;

  function summarise(attempt, exam, selfTicks) {
    let total = 0, autoTotal = 0, selfTotal = 0, autoMarks = 0, selfMarks = 0;
    const scores = {};
    const perTopic = {};
    exam.questions.forEach((q) => {
      const ans = attempt.answers[q.id];
      const ticked = selfTicks ? selfTicks[q.id] : (Array.isArray(ans && ans.ticks) ? ans.ticks : null);
      const scored = (q.type === 'text') ? selfMarkScore(q, ticked) : scoreQuestion(q, ans);
      scores[q.id] = scored;
      total += q.marks;
      if (q.type === 'text') { selfTotal += q.marks; selfMarks += scored; }
      else { autoTotal += q.marks; autoMarks += scored; }
      const t = q.topic || 'other';
      perTopic[t] = perTopic[t] || { got: 0, tot: 0 };
      perTopic[t].got += scored;
      perTopic[t].tot += q.marks;
    });
    return { scores, total, autoTotal, selfTotal, autoMarks, selfMarks, marks: autoMarks + selfMarks, perTopic };
  }
  CS.summarise = summarise;

  /* ================================================================== *
   *  PLAYER
   * ================================================================== */
  async function initPlayer() {
    const params = new URLSearchParams(location.search);
    const examId = params.get('id');
    const host = document.getElementById('player');
    const exam = await CS.getExam(examId);
    if (!exam) {
      host.innerHTML = '<div class="empty"><h3>Exam not found</h3><p>This exam is not in your content folder.</p>' +
        '<a class="btn" href="exams.html">Back to exams</a></div>';
      return;
    }

    document.title = exam.title + ' · CS9618';
    const draftKey = exam.id;
    let attempt = null;
    let timerId = null;

    /* ---------- intro screen ---------- */
    const past = CS.resultsFor(exam.id);
    const best = CS.bestResult(exam.id);
    const draft = CS.getDraft(draftKey);

    function intro() {
      const pct = best ? CS.pct(best.marks, best.total) : null;
      host.innerHTML = `
        <div class="stack">
          <div class="row" style="gap:8px">
            <a class="btn btn-sm btn-ghost" href="exams.html">${CS.icon('arrowLeft')} All exams</a>
            <span class="badge ${exam.origin === 'teacher' ? 'outline' : 'purple'}">${exam.origin === 'teacher' ? 'Teacher test' : 'AI generated'}</span>
            ${exam.chapter ? `<span class="badge outline">Chapter ${exam.chapter}</span>` : ''}
            <span class="badge outline">${exam.paper === 'paper-1' ? 'Paper 1 · Theory' : 'Paper 2 · Programming'}</span>
          </div>
          <div>
            <h1>${CS.esc(exam.title)}</h1>
            <p style="color:var(--fg-dim);max-width:70ch">${CS.esc(exam.description || '')}</p>
          </div>
          <div class="grid grid-2">
            <div class="card">
              <h3>Exam details</h3>
              <table class="tbl" style="margin-top:8px">
                <tr><td>Questions</td><td class="mono">${exam.questions.length}</td></tr>
                <tr><td>Total marks</td><td class="mono">${exam.totalMarks}</td></tr>
                <tr><td>Time allowed</td><td class="mono">${exam.durationMin} min</td></tr>
                <tr><td>Exam date</td><td class="mono">${exam.examDate ? CS.fmtDay(exam.examDate) : 'Always available'}</td></tr>
                <tr><td>Your attempts</td><td class="mono">${past.length}${pct != null ? ` · best ${best.marks}/${best.total} (${pct}%)` : ''}</td></tr>
              </table>
            </div>
            <div class="card">
              <h3>Instructions</h3>
              <p style="color:var(--fg-dim);font-size:.9rem">${CS.md(exam.instructions || 'Answer all questions.')}</p>
              <ul style="font-size:.88rem;color:var(--fg-dim);padding-left:18px">
                <li>Answers are saved automatically — you can close the tab and resume.</li>
                <li>Written answers are <strong>self-marked</strong> against the mark scheme after you submit.</li>
                <li>Timer: <span class="mono">${exam.durationMin}:00</span> — when it runs out the exam submits itself.</li>
              </ul>
              <div class="row" style="margin-top:10px">
                <button class="btn btn-primary btn-lg" id="startBtn">${CS.icon(draft ? 'refresh' : 'play')} ${draft ? 'Resume exam' : 'Start exam'}</button>
                ${draft ? '<button class="btn btn-ghost" id="discardBtn">Discard saved attempt</button>' : ''}
              </div>
            </div>
          </div>
          ${past.length ? `<div class="card">
            <h3>Previous attempts</h3>
            <table class="tbl" style="margin-top:8px"><thead><tr><th>Finished</th><th>Marks</th><th>%</th><th>Time used</th><th></th></tr></thead><tbody>
              ${past.map((r) => `<tr>
                <td>${CS.fmtDate(r.finishedAt)}</td>
                <td class="mono">${r.marks}/${r.total}</td>
                <td class="mono">${CS.pct(r.marks, r.total)}%</td>
                <td class="mono">${CS.mmss(r.durationUsedSec || 0)}</td>
                <td><a class="btn btn-sm" href="result.html?attempt=${r.id}">View result</a></td>
              </tr>`).join('')}
            </tbody></table></div>` : ''}
        </div>`;

      document.getElementById('startBtn').onclick = () => {
        attempt = CS.getDraft(draftKey) || newAttempt(exam);
        startTimer();
        render();
      };
      const dbtn = document.getElementById('discardBtn');
      if (dbtn) dbtn.onclick = () => {
        CS.clearDraft(draftKey); CS.toast('Saved attempt discarded'); intro();
      };
    }

    /* ---------- timer ---------- */
    function startTimer() {
      clearInterval(timerId);
      timerId = setInterval(() => {
        const left = Math.round((attempt.endsAt - Date.now()) / 1000);
        const el = document.getElementById('timer');
        if (el) {
          el.innerHTML = CS.icon('clock') + ' <span>' + CS.mmss(left) + '</span>';
          el.className = 'timer ' + (left <= 60 ? 'crit' : left <= 300 ? 'warn' : '');
        }
        if (left <= 0) { clearInterval(timerId); CS.toast('Time is up — submitting', 'warn'); submit(true); }
      }, 1000);
    }

    /* ---------- question renderers ---------- */
    function qById(id) { return exam.questions.find((q) => q.id === id); }

    function renderQuestion(q, ans, reveal) {
      const num = attempt.order.indexOf(q.id) + 1;
      const opts = (q.options || []);
      let body = '';
      let foot = '';

      if (q.type === 'mcq') {
        body = '<div class="opts">' + opts.map((o) => {
          let cls = 'opt';
          if (reveal) {
            if (o.id === q.answer) cls += ' correct';
            else if (ans === o.id) cls += ' wrong';
            cls += ' disabled';
          } else if (ans === o.id) cls += ' sel';
          return `<div class="${cls}" data-opt="${o.id}" role="radio" tabindex="0" aria-checked="${ans === o.id}">
            <span class="letter">${o.id}</span><span>${CS.md(o.text)}</span></div>`;
        }).join('') + '</div>';
      } else if (q.type === 'numeric') {
        body = `<div class="row" style="align-items:flex-end;max-width:360px">
          <label class="field" style="flex:1;margin:0"><span>Your answer ${q.unit ? '(in ' + CS.esc(q.unit) + ')' : ''}</span>
          <input type="text" inputmode="decimal" id="numAns" value="${ans == null ? '' : CS.esc(ans)}" placeholder="number" ${reveal ? 'disabled' : ''}></label>
        </div>`;
        if (reveal) body += `<div class="explain"><h4>Correct answer</h4><p class="mono">${q.answer}${q.unit ? ' ' + CS.esc(q.unit) : ''}</p></div>`;
      } else if (q.type === 'text') {
        const val = typeof ans === 'string' ? ans : '';
        body = `<label class="field"><span>Your answer</span>
          <textarea id="textAns" placeholder="Write your answer in full sentences (Cambridge mark scheme style)…" ${reveal ? 'disabled' : ''}>${CS.esc(val)}</textarea></label>`;
      } else if (q.type === 'trace') {
        body = '<div class="trace-wrap"><table class="trace"><thead><tr>' +
          q.columns.map((c) => '<th>' + CS.esc(c) + '</th>').join('') + '</tr></thead><tbody>' +
          (q.given || q.answer).map((row, r) => '<tr>' + q.columns.map((c, ci) => {
            const given = (q.given && q.given[r] && String(q.given[r][ci] || '').trim() !== '') ? q.given[r][ci] : null;
            if (given != null) return `<td class="mono">${CS.esc(given)}</td>`;
            const mine = (ans && ans[r] && ans[r][ci] != null) ? ans[r][ci] : '';
            if (reveal) {
              const want = String((q.answer[r] || [])[ci] || '');
              const ok = String(mine).trim().toUpperCase() === want.trim().toUpperCase();
              return `<td class="${ok ? 'ok' : 'bad'}"><input value="${CS.esc(mine)}" disabled>
                ${ok ? '' : `<div class="mono" style="font-size:.72rem;color:var(--red)">${CS.esc(want)}</div>`}</td>`;
            }
            return `<td><input data-r="${r}" data-c="${ci}" value="${CS.esc(mine)}" inputmode="text"></td>`;
          }).join('') + '</tr>').join('') + '</tbody></table></div>';
      }

      return `<div class="qcard" data-qid="${q.id}">
        <div class="qhead">
          <span class="qnum">Q${num}</span>
          <span class="qmarks">${q.marks} ${q.marks === 1 ? 'mark' : 'marks'}</span>
          ${q.section ? `<span class="chap-tag">Section ${q.section}</span>` : ''}
          <span class="spacer"></span>
          <button class="icon-btn" id="flagBtn" title="Flag for review">${CS.icon('flag')}</button>
        </div>
        <div class="qtext">${CS.rich(q.text)}</div>
        ${body}
        ${foot}
      </div>`;
    }

    /* ---------- main exam UI ---------- */
    function answeredCount() {
      return exam.questions.filter((q) => hasAnswer(q, attempt.answers[q.id])).length;
    }

    function render() {
      const qid = attempt.order[attempt.index];
      const q = qById(qid);
      const ans = attempt.answers[qid];
      const total = exam.questions.length;
      const done = answeredCount();

      host.innerHTML = `
        <div class="exam-top">
          <a class="btn btn-sm btn-ghost" href="exams.html">${CS.icon('arrowLeft')}</a>
          <h1>${CS.esc(exam.title)}</h1>
          <span class="spacer"></span>
          ${CS.prefs().showTimer ? '<span class="timer" id="timer"></span>' : ''}
          <button class="btn btn-primary" id="submitBtn">Submit exam</button>
        </div>
        <div class="row" style="margin:10px 0 16px">
          <div class="progress-bar" style="flex:1"><i style="width:${CS.pct(done, total)}%"></i></div>
          <span class="mono small" style="color:var(--fg-dim)">${done}/${total} answered</span>
        </div>
        <div class="split">
          <aside class="qnav card tight">
            <div class="card-meta" style="margin-bottom:8px">QUESTIONS</div>
            <div class="qgrid" id="qgrid">
              ${attempt.order.map((id, i) => {
                const qq = qById(id);
                return `<button data-i="${i}" class="${i === attempt.index ? 'cur' : ''} ${hasAnswer(qq, attempt.answers[id]) ? 'answered' : ''} ${attempt.flags.includes(id) ? 'flagged' : ''}">${i + 1}</button>`;
              }).join('')}
            </div>
            <div class="legend">
              <span><i style="background:var(--primary)"></i>answered</span>
              <span><i style="background:var(--yellow)"></i>flagged</span>
            </div>
            <hr style="border:0;border-top:1px solid var(--border);margin:12px 0">
            <button class="btn btn-sm btn-ghost" id="pauseBtn" style="width:100%">Save & exit</button>
          </aside>
          <section>
            ${renderQuestion(q, ans, false)}
            <div class="qfoot">
              <button class="btn" id="prevBtn" ${attempt.index === 0 ? 'disabled' : ''}>${CS.icon('arrowLeft')} Previous</button>
              <button class="btn ${attempt.flags.includes(qid) ? 'btn-danger' : ''}" id="flagToggle">${CS.icon('flag')} ${attempt.flags.includes(qid) ? 'Flagged' : 'Flag'}</button>
              <span class="spacer"></span>
              ${attempt.index === total - 1
                ? '<button class="btn btn-primary" id="nextBtn">Review & submit</button>'
                : `<button class="btn btn-primary" id="nextBtn">Next ${CS.icon('arrowRight')}</button>`}
            </div>
            <p class="small" style="color:var(--fg-dim);margin-top:10px">
              <span class="kbd">←</span> <span class="kbd">→</span> move between questions · <span class="kbd">F</span> flag · answers save automatically
            </p>
          </section>
        </div>`;

      /* qnav */
      document.getElementById('qgrid').onclick = (e) => {
        const b = e.target.closest('button[data-i]');
        if (!b) return;
        attempt.index = Number(b.dataset.i); save(); render();
      };
      /* navigation */
      document.getElementById('prevBtn').onclick = () => { attempt.index = Math.max(0, attempt.index - 1); save(); render(); };
      document.getElementById('nextBtn').onclick = () => {
        if (attempt.index === total - 1) askSubmit();
        else { attempt.index = Math.min(total - 1, attempt.index + 1); save(); render(); }
      };
      document.getElementById('flagToggle').onclick = () => { toggleFlag(qid); render(); };
      const fb = document.getElementById('flagBtn'); if (fb) fb.onclick = () => { toggleFlag(qid); render(); };
      document.getElementById('submitBtn').onclick = askSubmit;
      document.getElementById('pauseBtn').onclick = () => { save(); CS.toast('Attempt saved — resume any time', 'ok'); location.href = 'exams.html'; };

      /* answer widgets */
      const card = host.querySelector('.qcard');
      if (q.type === 'mcq') {
        card.querySelectorAll('.opt').forEach((el) => {
          const pick = () => { attempt.answers[qid] = el.dataset.opt; save(); render(); };
          el.onclick = pick;
          el.onkeydown = (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); } };
        });
      }
      if (q.type === 'numeric') {
        const inp = document.getElementById('numAns');
        inp.oninput = () => { attempt.answers[qid] = inp.value; saveLight(); };
        inp.onblur = () => save();
        inp.focus();
      }
      if (q.type === 'text') {
        const ta = document.getElementById('textAns');
        ta.oninput = () => { attempt.answers[qid] = ta.value; saveLight(); };
        ta.onblur = () => save();
      }
      if (q.type === 'trace') {
        card.querySelectorAll('input[data-r]').forEach((inp) => {
          inp.oninput = () => {
            const r = Number(inp.dataset.r), c = Number(inp.dataset.c);
            const rows = Array.isArray(attempt.answers[qid]) ? attempt.answers[qid] : (q.answer || []).map(() => []);
            rows[r] = rows[r] || [];
            rows[r][c] = inp.value;
            attempt.answers[qid] = rows;
            saveLight();
          };
        });
      }
      if (CS.prefs().showTimer) {
        const el = document.getElementById('timer');
        const left = Math.round((attempt.endsAt - Date.now()) / 1000);
        if (el) {
          el.innerHTML = CS.icon('clock') + ' <span>' + CS.mmss(left) + '</span>';
          el.className = 'timer ' + (left <= 60 ? 'crit' : left <= 300 ? 'warn' : '');
        }
      }
    }

    function toggleFlag(qid) {
      const i = attempt.flags.indexOf(qid);
      if (i >= 0) attempt.flags.splice(i, 1); else attempt.flags.push(qid);
      save();
    }

    let saveTimer = null;
    function save() { CS.saveDraft(attempt); }
    function saveLight() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => CS.saveDraft(attempt), 400);
    }

    /* keyboard */
    document.addEventListener('keydown', (e) => {
      if (!attempt || !document.getElementById('qgrid')) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'ArrowRight') { document.getElementById('nextBtn').click(); }
      if (e.key === 'ArrowLeft') { document.getElementById('prevBtn').click(); }
      if (e.key.toLowerCase() === 'f') { document.getElementById('flagToggle').click(); }
      if (/^[a-dA-D]$/.test(e.key)) {
        const q = qById(attempt.order[attempt.index]);
        if (q.type === 'mcq') {
          const el = document.querySelector(`.opt[data-opt="${e.key.toUpperCase()}"]`);
          if (el) el.click();
        }
      }
    });

    /* submit flow */
    function askSubmit() {
      const done = answeredCount(), total = exam.questions.length;
      const left = Math.round((attempt.endsAt - Date.now()) / 1000);
      const modal = document.createElement('div');
      modal.className = 'modal-back';
      modal.innerHTML = `<div class="modal">
        <h3>Submit exam?</h3>
        <p style="color:var(--fg-dim)">You have answered <strong>${done}</strong> of <strong>${total}</strong> questions
        and have <span class="mono">${CS.mmss(left)}</span> left. ${done < total ? 'Unanswered questions score 0.' : ''}</p>
        <p class="small" style="color:var(--fg-dim)">Written questions will be self-marked on the next screen using the mark scheme.</p>
        <div class="row" style="justify-content:flex-end;margin-top:14px">
          <button class="btn btn-ghost" data-close>Keep working</button>
          <button class="btn btn-primary" data-submit>Submit now</button>
        </div></div>`;
      document.body.appendChild(modal);
      modal.querySelector('[data-close]').onclick = () => modal.remove();
      modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
      modal.querySelector('[data-submit]').onclick = () => { modal.remove(); submit(false); };
    }

    function submit(auto) {
      clearInterval(timerId);
      const finishedAt = new Date().toISOString();
      const durationUsedSec = Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
      const ticks = {};
      exam.questions.filter((q) => q.type === 'text').forEach((q) => { ticks[q.id] = new Array((q.answer || []).length).fill(false); });
      const sum = summarise(attempt, exam, ticks);
      const result = {
        id: attempt.id,
        examId: exam.id,
        examTitle: exam.title,
        paper: exam.paper,
        chapter: exam.chapter,
        origin: exam.origin,
        startedAt: attempt.startedAt,
        finishedAt,
        autoSubmitted: !!auto,
        durationUsedSec,
        answers: attempt.answers,
        flags: attempt.flags,
        order: attempt.order,
        ticks,
        scores: sum.scores,
        marks: sum.autoMarks,      // written questions pending self-mark
        autoMarks: sum.autoMarks,
        autoTotal: sum.autoTotal,
        selfMarks: 0,
        selfTotal: sum.selfTotal,
        total: sum.total,
        perTopic: sum.perTopic
      };
      CS.addResult(result);
      CS.clearDraft(exam.id);
      location.href = 'result.html?attempt=' + encodeURIComponent(result.id);
    }

    /* boot */
    if (CS.getDraft(draftKey)) {
      attempt = CS.getDraft(draftKey);
      if (attempt.endsAt && attempt.endsAt < Date.now()) { CS.clearDraft(draftKey); attempt = null; }
    }
    intro();
  }

  /* ================================================================== *
   *  RESULT / REVIEW
   * ================================================================== */
  async function initResult() {
    const host = document.getElementById('result');
    const id = new URLSearchParams(location.search).get('attempt');
    const result = CS.results().find((r) => r.id === id);
    if (!result) {
      host.innerHTML = '<div class="empty"><h3>Result not found</h3><p>It may have been cleared from this browser.</p><a class="btn" href="progress.html">Progress</a></div>';
      return;
    }
    const exam = await CS.getExam(result.examId);
    if (!exam) { host.innerHTML = '<div class="empty"><h3>Exam content missing</h3></div>'; return; }

    document.title = 'Result · ' + result.examTitle;

    function recompute() {
      const s = CS.summarise({ answers: result.answers }, exam, result.ticks);
      result.scores = s.scores;
      result.autoMarks = s.autoMarks;
      result.selfMarks = s.selfMarks;
      result.marks = s.autoMarks + s.selfMarks;
      result.total = s.total;
      result.perTopic = s.perTopic;
      const all = CS.results();
      const i = all.findIndex((r) => r.id === result.id);
      if (i >= 0) { all[i] = result; CS.save(CS.KEYS.results, all); }
    }

    function render() {
      recompute();
      const pct = CS.pct(result.marks, result.total);
      const grade = pct >= 90 ? ['A', 'green'] : pct >= 80 ? ['A', 'green'] : pct >= 70 ? ['B', 'purple'] : pct >= 60 ? ['C', 'yellow'] : pct >= 50 ? ['D', 'yellow'] : ['U', 'red'];
      const prev = CS.resultsFor(result.examId).filter((r) => r.id !== result.id)
        .sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt))[0];

      host.innerHTML = `
        <div class="stack">
          <div class="row">
            <a class="btn btn-sm btn-ghost" href="exams.html">${CS.icon('arrowLeft')} Exams</a>
            <span class="badge ${result.autoSubmitted ? 'yellow' : 'outline'}">${result.autoSubmitted ? 'Auto-submitted (time up)' : 'Submitted'}</span>
            <span class="badge outline">${CS.fmtDate(result.finishedAt)}</span>
          </div>
          <h1>${CS.esc(result.examTitle)}</h1>
          <div class="grid grid-2">
            <div class="card row" style="gap:20px;align-items:center">
              <div class="score-ring" style="--p:${pct}"><div>
                <div class="big">${pct}%</div><div class="lbl">${result.marks} / ${result.total}</div>
              </div></div>
              <div class="stack" style="flex:1">
                <div><span class="badge ${grade[1]}">Grade ${grade[0]}</span></div>
                <div class="small" style="color:var(--fg-dim)">
                  MCQs &amp; traces: <span class="mono">${result.autoMarks}/${result.autoTotal}</span><br>
                  Written (self-marked): <span class="mono">${result.selfMarks}/${result.selfTotal}</span><br>
                  Time used: <span class="mono">${CS.mmss(result.durationUsedSec || 0)}</span>
                  ${prev ? `<br>Previous: <span class="mono">${prev.marks}/${prev.total}</span> (${CS.pct(prev.marks, prev.total)}%)` : ''}
                </div>
                <div class="row">
                  <a class="btn btn-sm" href="exam.html?id=${encodeURIComponent(result.examId)}">${CS.icon('refresh')} Retake</a>
                  <a class="btn btn-sm btn-ghost" href="notes.html?paper=${result.paper}">${CS.icon('book')} Revise notes</a>
                </div>
              </div>
            </div>
            <div class="card">
              <h3>Topic breakdown</h3>
              <div class="bars" style="margin-top:10px">
                ${Object.entries(result.perTopic).map(([t, v]) => {
                  const p = CS.pct(v.got, v.tot);
                  const col = p >= 75 ? 'var(--green)' : p >= 50 ? 'var(--yellow)' : 'var(--red)';
                  return `<div class="bar"><div><div class="track"><i style="width:${p}%;background:${col}"></i></div>
                    <div class="small" style="color:var(--fg-dim);margin-top:3px">${topicLabel(t)}</div></div>
                    <div class="mono small" style="text-align:right">${Math.round(v.got * 10) / 10}/${v.tot}</div></div>`;
                }).join('')}
              </div>
            </div>
          </div>
          ${result.selfTotal ? `<div class="card" style="border-color:color-mix(in srgb,var(--yellow) 45%,transparent)">
            <h3>${CS.icon('check')} Self-mark your written answers</h3>
            <p class="small" style="color:var(--fg-dim)">Tick every mark-scheme point you actually wrote (not what you meant). Your total updates instantly — this is how you find the difference between "I knew it" and "I can score it".</p>
          </div>` : ''}
          <div class="section-head"><h2>Question review</h2><span class="sub">${exam.questions.length} questions · ${result.total} marks</span></div>
          <div class="stack" id="reviewList">${exam.questions.map((q, i) => reviewCard(q, i)).join('')}</div>
        </div>`;

      /* self-mark checkboxes */
      host.onchange = (ev) => {
        const cb = ev.target.closest('input[data-tick]');
        if (!cb) return;
        const qid = cb.dataset.qid, i = Number(cb.dataset.tick);
        result.ticks[qid] = result.ticks[qid] || [];
        result.ticks[qid][i] = cb.checked;
        const scrollY = window.scrollY;
        render();
        try { window.scrollTo(0, scrollY); } catch (e2) { /* jsdom */ }
      };
    }

    function reviewCard(q, i) {
      const ans = result.answers[q.id];
      const score = result.scores[q.id] || 0;
      const full = score >= q.marks;
      const zero = score === 0;
      let body = '';

      if (q.type === 'mcq') {
        body = '<div class="opts">' + (q.options || []).map((o) => {
          let cls = 'opt disabled';
          if (o.id === q.answer) cls += ' correct';
          else if (ans === o.id) cls += ' wrong';
          return `<div class="${cls}"><span class="letter">${o.id}</span><span>${CS.md(o.text)}</span></div>`;
        }).join('') + '</div>';
      } else if (q.type === 'numeric') {
        body = `<p class="mono small">Your answer: <strong style="color:${full ? 'var(--green)' : 'var(--red)'}">${CS.esc(ans == null ? '—' : ans)}</strong>
          &nbsp;·&nbsp; Correct: <strong style="color:var(--green)">${q.answer}${q.unit ? ' ' + CS.esc(q.unit) : ''}</strong></p>`;
      } else if (q.type === 'text') {
        body = `<div class="card tight" style="background:var(--bg-2)"><div class="card-meta">YOUR ANSWER</div>
          <p style="white-space:pre-wrap;margin:6px 0 0;font-size:.9rem">${CS.esc(ans || '(no answer)')}</p></div>
          <div class="msbox"><h4>Mark scheme — tick what you wrote (${q.marks} marks)</h4>
            ${(q.answer || []).map((pt, ti) => `<label class="row" style="align-items:flex-start;gap:9px;margin:6px 0;cursor:pointer">
              <input type="checkbox" data-qid="${q.id}" data-tick="${ti}" ${((result.ticks[q.id] || [])[ti] ? 'checked' : '')}
                style="width:auto;margin-top:3px">
              <span style="font-size:.9rem">${CS.md(pt.text)} <span class="mono small" style="color:var(--fg-dim)">[${pt.marks}]</span></span>
            </label>`).join('')}
          </div>`;
      } else if (q.type === 'trace') {
        body = '<div class="trace-wrap"><table class="trace"><thead><tr>' + q.columns.map((c) => `<th>${CS.esc(c)}</th>`).join('') + '</tr></thead><tbody>' +
          q.answer.map((row, r) => '<tr>' + q.columns.map((c, ci) => {
            const given = (q.given && q.given[r] && String(q.given[r][ci] || '').trim() !== '') ? q.given[r][ci] : null;
            const mine = (ans && ans[r] && ans[r][ci] != null) ? ans[r][ci] : '';
            if (given != null) return `<td class="mono">${CS.esc(given)}</td>`;
            const want = String(row[ci] || '');
            const ok = String(mine).trim().toUpperCase() === want.trim().toUpperCase();
            return `<td class="${ok ? 'ok' : 'bad'}"><span class="mono">${CS.esc(mine || '—')}</span>
              ${ok ? '' : `<div class="mono" style="font-size:.72rem;color:var(--red)">${CS.esc(want)}</div>`}</td>`;
          }).join('') + '</tr>').join('') + '</tbody></table></div>';
      }

      return `<div class="qcard" id="r-${q.id}">
        <div class="qhead">
          <span class="qnum">Q${i + 1}</span>
          <span class="badge ${full ? 'green' : zero ? 'red' : 'yellow'}">${Math.round(score * 10) / 10} / ${q.marks}</span>
          <span class="spacer"></span>
          ${q.section ? `<span class="chap-tag">Section ${q.section}</span>` : ''}
        </div>
        <div class="qtext">${CS.rich(q.text)}</div>
        ${body}
        ${q.explanation ? `<div class="explain"><h4>Why</h4><p>${CS.rich(q.explanation)}</p></div>` : ''}
      </div>`;
    }

    render();
  }

  const TOPIC_LABELS = {
    'info-rep': '1 · Information representation',
    communication: '2 · Communication',
    hardware: '3 · Hardware',
    processor: '4 · Processor fundamentals',
    'system-software': '5 · System software',
    security: '6 · Security & integrity',
    ethics: '7 · Ethics & ownership',
    databases: '8 · Databases',
    algorithms: '9 · Algorithms',
    'data-types': '10 · Data types & structures',
    programming: '11 · Programming',
    'software-dev': '12 · Software development',
    other: 'Other'
  };
  function topicLabel(t) { return TOPIC_LABELS[t] || t; }
  CS.topicLabel = topicLabel;

  /* ================================================================== *
   *  LOCAL EXAM BUILDER (paste your teacher's questions)
   * ================================================================== */
  function initBuilder() {
    const host = document.getElementById('builder');
    host.innerHTML = `
      <div class="stack">
        <div class="card">
          <h3>1 · Copy the template</h3>
          <p class="small" style="color:var(--fg-dim)">Open <span class="mono">content/exams/_TEMPLATE.json</span> in the repo (or download it below),
          paste your teacher's questions into it, then either commit the file and run <span class="mono">node scripts/build-content.js</span>,
          or paste the finished JSON into the box below to keep it in this browser only.</p>
          <div class="row"><a class="btn btn-sm" href="content/exams/_TEMPLATE.json" download>${CS.icon('download')} Download template</a>
          <a class="btn btn-sm btn-ghost" href="https://github.com/" target="_blank" rel="noopener">${CS.icon('upload')} Commit to GitHub</a></div>
        </div>
        <div class="card">
          <h3>2 · Paste your exam JSON</h3>
          <label class="field"><span>Exam object (same shape as the template)</span>
          <textarea id="jsonIn" style="min-height:240px" placeholder='{"id":"my-test-1","title":"Chapter 5 Test", ...}'></textarea></label>
          <div class="row">
            <button class="btn btn-primary" id="saveLocal">${CS.icon('plus')} Save to this browser</button>
            <button class="btn btn-ghost" id="validateBtn">${CS.icon('check')} Validate only</button>
            <button class="btn btn-ghost" id="exportCustom">${CS.icon('download')} Export my custom exams</button>
          </div>
          <div id="builderMsg" class="small" style="margin-top:10px"></div>
        </div>
        <div class="card">
          <h3>3 · Your custom exams</h3>
          <div id="customList"></div>
        </div>
      </div>`;

    const msg = (t, kind) => { document.getElementById('builderMsg').innerHTML = `<span class="badge ${kind || 'outline'}">${t}</span>`; };

    function validate(exam) {
      const errs = [];
      if (!exam.id) errs.push('missing "id"');
      if (!exam.title) errs.push('missing "title"');
      if (!exam.durationMin) errs.push('missing "durationMin"');
      if (!Array.isArray(exam.questions) || !exam.questions.length) errs.push('"questions" must be a non-empty array');
      let marks = 0;
      (exam.questions || []).forEach((q, i) => {
        if (!q.id) errs.push(`question ${i + 1}: missing "id"`);
        if (!q.type) errs.push(`question ${i + 1}: missing "type"`);
        if (typeof q.marks !== 'number') errs.push(`question ${i + 1}: "marks" must be a number`);
        if (!q.text) errs.push(`question ${i + 1}: missing "text"`);
        marks += q.marks || 0;
        if (q.type === 'mcq' && (!Array.isArray(q.options) || !q.answer)) errs.push(`question ${i + 1}: mcq needs options + answer`);
        if (q.type === 'numeric' && typeof q.answer !== 'number') errs.push(`question ${i + 1}: numeric answer must be a number`);
        if (q.type === 'trace' && (!Array.isArray(q.columns) || !Array.isArray(q.answer))) errs.push(`question ${i + 1}: trace needs columns + answer`);
      });
      exam.totalMarks = marks;
      return errs;
    }

    function listCustom() {
      const c = CS.customExams();
      const keys = Object.keys(c);
      document.getElementById('customList').innerHTML = keys.length
        ? '<table class="tbl"><thead><tr><th>Title</th><th>Questions</th><th>Marks</th><th></th></tr></thead><tbody>' +
          keys.map((k) => `<tr><td>${CS.esc(c[k].title)}</td><td class="mono">${c[k].questions.length}</td>
            <td class="mono">${c[k].totalMarks}</td>
            <td class="row" style="gap:6px"><a class="btn btn-sm" href="exam.html?id=${encodeURIComponent(k)}">Open</a>
            <button class="btn btn-sm btn-danger" data-del="${CS.esc(k)}">Delete</button></td></tr>`).join('') +
          '</tbody></table>'
        : '<p class="small" style="color:var(--fg-dim)">No custom exams yet.</p>';
      document.querySelectorAll('[data-del]').forEach((b) => {
        b.onclick = () => { CS.deleteCustomExam(b.dataset.del); CS.toast('Deleted'); listCustom(); };
      });
    }

    document.getElementById('validateBtn').onclick = () => {
      try {
        const exam = JSON.parse(document.getElementById('jsonIn').value);
        const errs = validate(exam);
        msg(errs.length ? '✖ ' + errs.join(' · ') : '✔ Valid — ' + exam.questions.length + ' questions, ' + exam.totalMarks + ' marks', errs.length ? 'red' : 'green');
      } catch (e) { msg('✖ Invalid JSON: ' + e.message, 'red'); }
    };

    document.getElementById('saveLocal').onclick = () => {
      try {
        const exam = JSON.parse(document.getElementById('jsonIn').value);
        const errs = validate(exam);
        if (errs.length) { msg('✖ ' + errs.join(' · '), 'red'); return; }
        exam.origin = exam.origin || 'teacher';
        exam.local = true;
        CS.saveCustomExam(exam);
        CS.toast('Saved — find it in Exams', 'ok');
        msg('✔ Saved. It is now in your exam list.', 'green');
        listCustom();
      } catch (e) { msg('✖ Invalid JSON: ' + e.message, 'red'); }
    };

    document.getElementById('exportCustom').onclick = () => {
      const blob = new Blob([JSON.stringify(CS.customExams(), null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'custom-exams.json';
      a.click();
      URL.revokeObjectURL(a.href);
    };

    listCustom();
  }

  /* ---------- boot on the right page ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    CS.renderChrome();
    const page = document.body.dataset.page;
    if (page === 'exam') initPlayer();
    if (page === 'result') initResult();
    if (page === 'builder') initBuilder();
  });

})(window.CS);
