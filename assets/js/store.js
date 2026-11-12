/* store.js — global namespace + storage + helpers
   CS9618 Topical Quiz — personal exam platform
   Everything is local-first: no server, no login, your data stays in your browser. */
window.CS = window.CS || {};

(function (CS) {
  'use strict';

  const KEYS = {
    results: 'cs9618.results.v1',   // array of attempt objects
    notes: 'cs9618.notes.v1',       // { noteId: { done:bool, updatedAt } }
    prefs: 'cs9618.prefs.v1',       // theme, flags, filters
    drafts: 'cs9618.drafts.v1',     // in-progress attempts (resume support)
    custom: 'cs9618.custom.v1',     // user-added questions / exams (local)
    bookmarks: 'cs9618.bookmarks.v1'// flagged questions
  };

  CS.KEYS = KEYS;

  const read = (k, fallback) => {
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  };
  const write = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { console.warn('storage write failed', e); return false; }
  };

  CS.load = read;
  CS.save = write;

  /* ---------- prefs ---------- */
  const DEFAULT_PREFS = { theme: 'dark', defaultMode: 'exam', shuffleQuestions: false, showTimer: true, instantFeedback: false };
  CS.prefs = () => Object.assign({}, DEFAULT_PREFS, read(KEYS.prefs, {}));
  CS.setPref = (k, v) => { const p = CS.prefs(); p[k] = v; write(KEYS.prefs, p); };

  /* ---------- ids ---------- */
  CS.uid = (p = 'id') => p + '-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

  /* ---------- text helpers ---------- */
  CS.esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* Tiny inline markdown: **bold**, *italic*, `code`, _sub_, ^sup^, ==mark== */
  CS.md = (s) => {
    // Protect code and math before applying the small Markdown dialect.
    const saved = [];
    const hold = html => { const key = '\u0001' + saved.length + '\u0002'; saved.push(html); return key; };
    const source = String(s == null ? '' : s).replace(/`([^`]+)`|\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, (match, code, display, inline) => {
      if (code != null) return hold('<code>' + CS.esc(code) + '</code>');
      const tex = display != null ? display : inline;
      if (!window.katex) return hold(CS.esc(match));
      try { return hold(window.katex.renderToString(tex, { displayMode: display != null, throwOnError: false, trust: false })); }
      catch (_) { return hold(CS.esc(match)); }
    });
    return CS.esc(source)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/==([^=]+)==/g, '<mark>$1</mark>')
      .replace(/_([^_\n]+)_/g, '<sub>$1</sub>')
      .replace(/\^([^\^\n]+)\^/g, '<sup>$1</sup>')
      .replace(/\n/g, '<br>')
      .replace(/\u0001(\d+)\u0002/g, (_, i) => saved[Number(i)]);
  };

  /* ---------- dates ---------- */
  CS.fmtDate = (iso, opts) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString(undefined, opts || { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };
  CS.fmtDay = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
  };
  CS.relTime = (iso) => {
    const t = new Date(iso).getTime();
    if (isNaN(t)) return '—';
    const diff = Date.now() - t;
    const m = Math.round(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + ' min ago';
    const h = Math.round(m / 60);
    if (h < 24) return h + ' h ago';
    const d = Math.round(h / 24);
    if (d < 30) return d + ' d ago';
    return CS.fmtDay(iso);
  };

  /* ---------- misc ---------- */
  CS.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  CS.clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  CS.pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  CS.plural = (n, s, p) => n + ' ' + (n === 1 ? s : (p || s + 's'));
  CS.mmss = (secs) => {
    secs = Math.max(0, Math.round(secs));
    const m = Math.floor(secs / 60), s = secs % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  };
  CS.debounce = (fn, ms) => {
    let t;
    return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(() => fn.apply(c, a), ms || 200); };
  };

  /* toast */
  CS.toast = (msg, kind) => {
    let host = document.getElementById('toasts');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toasts';
      document.body.appendChild(host);
    }
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' toast-' + kind : '');
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 2600);
  };

  /* copy to clipboard with fallback */
  CS.copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (_) {}
      ta.remove();
      return ok;
    }
  };

  /* ---------- data loading ---------- */
  CS.state = { index: null, exams: {}, notes: [], loaded: false };

  CS.loadIndex = async function () {
    if (CS.state.loaded) return CS.state.index;
    if (!window.CS_EMBEDDED || !window.CS_EMBEDDED.index) {
      throw new Error('Content index not found. Run `node scripts/build-content.js` first.');
    }
    CS.state.index = window.CS_EMBEDDED.index;
    CS.state.loaded = true;
    return CS.state.index;
  };

  CS.getExam = async function (id) {
    if (CS.state.exams[id]) return CS.state.exams[id];
    const custom = read(KEYS.custom, {});
    if (custom[id]) { CS.state.exams[id] = custom[id]; return custom[id]; }
    const emb = (window.CS_EMBEDDED && window.CS_EMBEDDED.exams) || {};
    if (emb[id]) { CS.state.exams[id] = emb[id]; return emb[id]; }
    // fallback: fetch (works when served over http)
    try {
      const res = await fetch('content/exams/' + id + '.json', { cache: 'no-store' });
      if (res.ok) { const j = await res.json(); CS.state.exams[id] = j; return j; }
    } catch (e) { /* offline */ }
    return null;
  };

  CS.getAllExams = async function () {
    const idx = await CS.loadIndex();
    const out = [];
    for (const e of idx.exams) {
      const full = await CS.getExam(e.id);
      if (full) out.push(full);
    }
    // local custom exams
    const custom = read(KEYS.custom, {});
    Object.values(custom).forEach((e) => out.push(e));
    return out;
  };

  CS.getNotesIndex = function () {
    return (window.CS_EMBEDDED && window.CS_EMBEDDED.notes) || [];
  };

  CS.getPaperNotes = async function (paper) {
    const all = CS.getNotesIndex();
    const entry = all.find((n) => n.paper === paper);
    if (entry && entry.html) return entry;
    if (entry && entry.file) {
      try {
        const res = await fetch(entry.file, { cache: 'no-store' });
        if (res.ok) return Object.assign({}, entry, { html: await res.text() });
      } catch (e) { /* ignore */ }
    }
    return entry || null;
  };

  /* ---------- results ---------- */
  CS.results = () => read(KEYS.results, []);
  CS.addResult = (r) => {
    const all = read(KEYS.results, []);
    all.push(r);
    write(KEYS.results, all);
    CS.renderChrome && CS.renderChrome();
    return r;
  };
  CS.resultsFor = (examId) => CS.results().filter((r) => r.examId === examId)
    .sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));
  CS.bestResult = (examId) => {
    const rs = CS.resultsFor(examId);
    if (!rs.length) return null;
    return rs.reduce((a, b) => (b.marks / (b.total || 1) > a.marks / (a.total || 1) ? b : a));
  };

  /* ---------- notes progress ---------- */
  CS.noteProgress = () => read(KEYS.notes, {});
  CS.toggleNoteDone = (id) => {
    const p = read(KEYS.notes, {});
    if (p[id] && p[id].done) delete p[id];
    else p[id] = { done: true, updatedAt: new Date().toISOString() };
    write(KEYS.notes, p);
    return !!(p[id] && p[id].done);
  };

  /* ---------- drafts ---------- */
  CS.saveDraft = (attempt) => {
    const d = read(KEYS.drafts, {});
    d[attempt.examId] = attempt;
    write(KEYS.drafts, d);
  };
  CS.getDraft = (examId) => read(KEYS.drafts, {})[examId] || null;
  CS.clearDraft = (examId) => {
    const d = read(KEYS.drafts, {});
    delete d[examId];
    write(KEYS.drafts, d);
  };

  /* ---------- bookmarks ---------- */
  CS.bookmarks = () => read(KEYS.bookmarks, []);
  CS.toggleBookmark = (key) => {
    const b = read(KEYS.bookmarks, []);
    const i = b.indexOf(key);
    if (i >= 0) b.splice(i, 1); else b.push(key);
    write(KEYS.bookmarks, b);
    return i < 0;
  };
  CS.isBookmarked = (key) => read(KEYS.bookmarks, []).includes(key);

  /* ---------- custom content ---------- */
  CS.customExams = () => read(KEYS.custom, {});
  CS.saveCustomExam = (exam) => {
    const c = read(KEYS.custom, {});
    c[exam.id] = exam;
    write(KEYS.custom, c);
  };
  CS.deleteCustomExam = (id) => {
    const c = read(KEYS.custom, {});
    delete c[id];
    write(KEYS.custom, c);
  };

  /* ---------- export / import ---------- */
  CS.exportAll = () => ({
    app: 'cs9618-topical-quiz',
    version: 1,
    exportedAt: new Date().toISOString(),
    results: CS.results(),
    notes: CS.noteProgress(),
    bookmarks: CS.bookmarks(),
    custom: CS.customExams(),
    prefs: CS.prefs()
  });
  CS.importAll = (data, mode) => {
    if (!data || data.app !== 'cs9618-topical-quiz') throw new Error('Not a CS9618 backup file');
    if (mode === 'replace') {
      write(KEYS.results, data.results || []);
      write(KEYS.notes, data.notes || {});
      write(KEYS.bookmarks, data.bookmarks || []);
      write(KEYS.custom, data.custom || {});
      write(KEYS.prefs, data.prefs || {});
    } else {
      const byKey = new Map(CS.results().map((r) => [r.id, r]));
      (data.results || []).forEach((r) => byKey.set(r.id, r));
      write(KEYS.results, Array.from(byKey.values()));
      write(KEYS.notes, Object.assign({}, data.notes || {}, CS.noteProgress()));
      write(KEYS.bookmarks, Array.from(new Set(CS.bookmarks().concat(data.bookmarks || []))));
      write(KEYS.custom, Object.assign({}, data.custom || {}, CS.customExams()));
    }
    CS.renderChrome && CS.renderChrome();
  };
  CS.resetAll = () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    CS.renderChrome && CS.renderChrome();
  };

  /* ---------- theme ---------- */
  CS.applyTheme = () => {
    const t = CS.prefs().theme || 'dark';
    document.documentElement.setAttribute('data-theme', t);
  };
  CS.toggleTheme = () => {
    CS.setPref('theme', CS.prefs().theme === 'dark' ? 'light' : 'dark');
    CS.applyTheme();
  };

  /* ---------- top nav (injected) ---------- */
  CS.renderChrome = function () {
    const host = document.getElementById('nav');
    if (!host) return;
    const path = location.pathname.split('/').pop() || 'index.html';
    const items = [
      { href: 'index.html', label: 'Home', icon: 'home' },
      { href: 'exams.html', label: 'Exams', icon: 'clipboard' },
      { href: 'notes.html', label: 'Notes', icon: 'book' },
      { href: 'code.html', label: 'Pseudo Code', icon: 'code' },
      { href: 'past-papers.html', label: 'Past papers', icon: 'clipboard' },
      { href: 'study-plan.html', label: 'Study plan', icon: 'book' },
      { href: 'progress.html', label: 'Progress', icon: 'chart' }
    ];
    const unread = CS.results().length;
    host.innerHTML = `
      <div class="nav-inner">
        <a class="brand" href="index.html">
          <span class="brand-mark">96<span>18</span></span>
          <span class="brand-text">CS9618 <em>Topical Quiz</em></span>
        </a>
        <nav class="nav-links">
          ${items.map((i) => `<a href="${i.href}" class="${path === i.href ? 'on' : ''}">
            ${CS.icon(i.icon)}<span>${i.label}</span></a>`).join('')}
        </nav>
        <div class="nav-right">
          <button class="icon-btn" id="themeBtn" title="Toggle theme" aria-label="Toggle theme">${CS.icon('moon')}</button>
          <button class="icon-btn" id="exportBtn" title="Backup / restore" aria-label="Backup">${CS.icon('download')}</button>
          ${unread ? `<span class="pill" title="Attempts recorded">${unread}</span>` : ''}
        </div>
      </div>`;
    const tb = document.getElementById('themeBtn');
    if (tb) tb.onclick = () => { CS.toggleTheme(); CS.renderChrome(); };
    const eb = document.getElementById('exportBtn');
    if (eb) eb.onclick = () => CS.openBackup();
    CS.applyTheme();
    CS.syncNavHeight();
  };

  /* ---------- pinned nav: keep body padding in sync with the bar ----------
   * The nav is position:fixed (see app.css) so it stays put regardless of
   * scroll, scroll containers or ancestor transforms. Its height varies with
   * font metrics and viewport width, so we measure it and publish it as
   * --nav-h on :root for body padding plus any sticky siblings that need to
   * sit below the bar (question navigator, notes sidebar, anchor offsets).
   */
  /* current pinned-nav height in px (fallback 61) — use for scroll offsets */
  CS.navOffset = function () {
    const cs = getComputedStyle(document.documentElement);
    const v = parseInt(cs.getPropertyValue('--nav-h'), 10);
    return isNaN(v) ? 61 : v;
  };

  CS.syncNavHeight = function () {
    const host = document.getElementById('nav');
    if (!host) return;
    const apply = () => {
      const h = Math.round(host.getBoundingClientRect().height || 0);
      if (h > 0) {
        document.documentElement.style.setProperty('--nav-h', h + 'px');
        document.body.classList.add('nav-measured');
      }
    };
    apply();
    /* re-measure after webfonts settle and whenever the bar reflows */
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(apply);
    if (typeof ResizeObserver === 'function') {
      try {
        const ro = new ResizeObserver(apply);
        ro.observe(host);
        CS._navRO = ro;
      } catch (e) { /* ignore */ }
    } else {
      window.addEventListener('resize', apply);
    }
  };

  /* ---------- tiny icon set (inline SVG) ---------- */
  const PATHS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M8.5 10h7M8.5 14h7M8.5 18h4"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/>',
    code: '<path d="m9 8-5 4 5 4"/><path d="m15 8 5 4-5 4"/>',
    chart: '<path d="M4 20V6"/><path d="M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-7"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8.2 8.2 0 1 0 10.5 10.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>',
    download: '<path d="M12 4v10"/><path d="m8 11 4 4 4-4"/><path d="M4 19h16"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    check: '<path d="m5 13 4.5 4.5L19 7"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    flag: '<path d="M5 21V4h9l-1 3h6l-1.5 4 1.5 4H13l1-3H5"/>',
    arrowLeft: '<path d="M15 5l-7 7 7 7"/>',
    arrowRight: '<path d="m9 5 7 7-7 7"/>',
    play: '<path d="M7 4.5 19 12 7 19.5z"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.5h-4.5"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 14h10l1-14"/>',
    upload: '<path d="M12 20V10"/><path d="m8 13 4-4 4 4"/><path d="M4 5h16"/>',
    spark: '<path d="M12 3v4M12 17v4M4.5 12h4M15.5 12h4"/><path d="M7 7l2.5 2.5M14.5 14.5 17 17M17 7l-2.5 2.5M9.5 14.5 7 17"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>'
  };
  CS.icon = (name, cls) => `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || ''}</svg>`;

})(window.CS);
