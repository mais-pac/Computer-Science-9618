#!/usr/bin/env node
/**
 * build-content.js
 * ---------------------------------------------------------------
 * 1. Converts content/notes/*.md into HTML (there is no CDN/markdown
 *    library at run time on purpose — the site must work offline).
 * 2. Validates every exam JSON against the schema.
 * 3. Writes content/data.js, which the pages load directly.
 *
 * Usage:  node scripts/build-content.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const OUT = path.join(CONTENT, 'data.js');

/* ------------------------------------------------------------------ *
 * Mini markdown -> HTML
 * Supports: headings, fenced code, tables, blockquotes (TIP / TRAP),
 * unordered + ordered lists, hr, bold/italic/inline code, paragraphs.
 * ------------------------------------------------------------------ */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s) {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/==([^=]+)==/g, '<mark>$1</mark>');
  return out;
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

function markdownToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let i = 0;
  let inList = null;      // 'ul' | 'ol' | null

  const closeList = () => { if (inList) { html.push('</' + inList + '>'); inList = null; } };

  while (i < lines.length) {
    let line = lines[i];

    /* fenced code */
    if (/^```/.test(line)) {
      closeList();
      const lang = line.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      html.push('<pre' + (lang ? ' data-lang="' + esc(lang) + '"' : '') + '><code>' + esc(buf.join('\n')) + '</code></pre>');
      continue;
    }

    /* headings */
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeList();
      const level = h[1].length;
      const text = h[2].trim();
      const id = slug(text.replace(/[*`]/g, ''));
      html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    /* horizontal rule */
    if (/^---+$/.test(line.trim())) { closeList(); html.push('<hr>'); i++; continue; }

    /* table */
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      closeList();
      const header = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i].trim())) {
        rows.push(lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
        i++;
      }
      html.push('<table><thead><tr>' + header.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>' +
        rows.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
        '</tbody></table>');
      continue;
    }

    /* blockquote */
    if (/^>\s?/.test(line)) {
      closeList();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      const body = buf.join(' ');
      let cls = '';
      if (/^TIP:/i.test(body)) cls = 'tip';
      if (/^TRAP:/i.test(body)) cls = 'trap';
      html.push(`<blockquote${cls ? ` class="${cls}"` : ''}><p>${inline(body.replace(/^(TIP|TRAP):/i, '').trim())}</p></blockquote>`);
      continue;
    }

    /* lists */
    const ul = line.match(/^[-*]\s+(.*)$/);
    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ul || ol) {
      const want = ul ? 'ul' : 'ol';
      if (inList !== want) { closeList(); html.push('<' + want + '>'); inList = want; }
      html.push('<li>' + inline((ul || ol)[1]) + '</li>');
      i++;
      continue;
    }

    /* blank */
    if (!line.trim()) { closeList(); i++; continue; }

    /* paragraph */
    closeList();
    const buf = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|>|\||[-*]\s|\d+\.\s|---)/.test(lines[i])) {
      buf.push(lines[i].trim());
      i++;
    }
    html.push('<p>' + inline(buf.join(' ')) + '</p>');
  }
  closeList();
  return html.join('\n');
}

/* ------------------------------------------------------------------ *
 * Exam validation
 * ------------------------------------------------------------------ */
const problems = [];
const okTypes = ['mcq', 'text', 'numeric', 'trace', 'circuit'];

function validateExam(exam, file) {
  const bad = (m) => problems.push(`${file}: ${m}`);
  if (!exam.id) bad('missing id');
  if (!exam.title) bad('missing title');
  if (!Array.isArray(exam.questions) || !exam.questions.length) bad('no questions');
  let marks = 0;
  (exam.questions || []).forEach((q, n) => {
    const at = `question ${n + 1} (${q.id || '?'})`;
    if (!okTypes.includes(q.type)) bad(`${at}: bad type "${q.type}"`);
    if (typeof q.marks !== 'number') bad(`${at}: missing marks`);
    if (!q.text) bad(`${at}: missing text`);
    marks += q.marks || 0;
    if (q.type === 'mcq') {
      if (!Array.isArray(q.options) || q.options.length < 2) bad(`${at}: mcq needs options`);
      if (!q.answer) bad(`${at}: mcq needs answer`);
      else if (!q.options.some((o) => o.id === q.answer)) bad(`${at}: answer "${q.answer}" not in options`);
    }
    if (q.type === 'numeric' && typeof q.answer !== 'number') bad(`${at}: numeric answer must be a number`);
    if (q.type === 'text' && !Array.isArray(q.answer)) bad(`${at}: text answer should be array of points`);
    if (q.type === 'circuit') {
      if (!Array.isArray(q.answer)) bad(`${at}: circuit needs an answer array of mark-scheme points`);
      if (q.solution && (!Array.isArray(q.solution.parts) || !Array.isArray(q.solution.wires))) bad(`${at}: circuit solution must be {parts, wires}`);
    }
    if (q.type === 'trace') {
      if (!Array.isArray(q.columns)) bad(`${at}: trace needs columns`);
      if (!Array.isArray(q.answer)) bad(`${at}: trace needs answer rows`);
      else if (q.answer.some((r) => r.length !== q.columns.length)) bad(`${at}: trace row length mismatch`);
      if (q.given && q.given.length !== q.answer.length) bad(`${at}: trace given/answer row mismatch`);
    }
  });
  if (exam.totalMarks != null && exam.totalMarks !== marks) {
    problems.push(`${file}: totalMarks says ${exam.totalMarks} but questions add to ${marks}`);
  }
  exam.totalMarks = marks;
  return exam;
}

/* ------------------------------------------------------------------ *
 * Build
 * ------------------------------------------------------------------ */
function build() {
  const index = JSON.parse(fs.readFileSync(path.join(CONTENT, 'index.json'), 'utf8'));

  /* exams */
  const exams = {};
  let qTotal = 0;
  for (const meta of index.exams) {
    const file = meta.questionsFile || meta.id + '.json';
    const p = path.join(CONTENT, 'exams', file);
    if (!fs.existsSync(p)) { problems.push(`missing exam file: ${file}`); continue; }
    const exam = JSON.parse(fs.readFileSync(p, 'utf8'));
    validateExam(exam, file);
    meta.totalMarks = exam.totalMarks;
    meta.questionCount = exam.questions.length;
    qTotal += exam.questions.length;
    exams[meta.id] = exam;
  }

  /* notes */
  const notes = [];
  for (const n of index.notes) {
    const p = path.join(ROOT, n.file);
    if (!fs.existsSync(p)) { problems.push(`missing note file: ${n.file}`); continue; }
    const md = fs.readFileSync(p, 'utf8');
    const html = markdownToHtml(md);
    const toc = [];
    const re = /<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g;
    let m;
    while ((m = re.exec(html))) {
      toc.push({ level: Number(m[1]), id: m[2], title: m[3].replace(/<[^>]+>/g, '') });
    }
    notes.push({ paper: n.paper, title: n.title, html, toc, words: md.split(/\s+/).length });
  }

  const payload = { index, exams, notes, builtAt: new Date().toISOString() };
  const js = '/* AUTO-GENERATED by scripts/build-content.js — do not edit by hand */\n' +
    'window.CS_EMBEDDED = ' + JSON.stringify(payload) + ';\n';
  fs.writeFileSync(OUT, js, 'utf8');

  const kb = (Buffer.byteLength(js) / 1024).toFixed(1);
  console.log(`✔ built content/data.js  (${kb} KiB)`);
  console.log(`  exams: ${Object.keys(exams).length}   questions: ${qTotal}   notes: ${notes.length}`);
  if (problems.length) {
    console.error('\n✖ problems found:');
    problems.forEach((p) => console.error('  - ' + p));
    process.exitCode = 1;
  } else {
    console.log('✔ all exam files valid');
  }
}

build();
