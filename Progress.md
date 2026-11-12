# CS9618 project handoff — 2026-11-12

## How to continue
Read this file, inspect the current branch and git status, then continue from the priority queue. The repository branch is managed by Arena; do not rely on an old branch-status statement. Preserve offline operation and do not publish personal-use source PDFs.

## User's goals
- Bespoke Education-inspired 9618 past-paper index, grouped by year/series with actual papers and worked solutions, not copied branding.
- Accurate, concise AS/A Level preparation informed by uploaded master resources and exam-technique research; tailor to confirmed exam date.
- Live Cambridge pseudocode executor comparable to Pseudocode Pro: run/pause/step/reset, speed, variables, call stack, trace, errors, bounded execution, Cambridge control structures, arrays, subroutines, records and simulated files.
- Offline LaTeX in notes and questions; maintain a persistent Drive handoff and requests so future sessions can continue without re-pasting.
- Chapter 3 needs source screenshots/question text to verify reconstruction.

## Done this session (branch arena/7fff4a20-computer-science-9618, base bfba8a4)
- Added study-plan.html, a rolling diagnostic/retrieval/timed-practice plan with section priorities and syntax checklist; linked it from navigation. Consulted excerpts of uploaded ZNotes AS Theory and Practical PDFs and two Reddit threads cited on the page. Their 2023–25 edition and some statements may be outdated; verify against current Cambridge documentation.
- Added past-papers.html: an intentionally empty, clearly labelled index shell and link to existing practice exams. The checked-in papers are teacher-topic reconstructions/AI mocks, not authentic 9618 past papers. No fabricated paper links or solutions.
- Vendored KaTeX 0.16.22 with licence/fonts and added inline $...$ and display $$...$$ support to CS.md where used by notes/questions. Test edge cases and expand to other render paths as needed.
- Did not implement executor. Existing code.html contains reference and drills, not live execution.

## Next actions
1. Implement and test the pseudocode interpreter safely without eval, including step/run/pause/reset, bounded loops and trace; document supported syntax and errors. Add navigation.
2. Locate verified 9618 papers/mark schemes and add real year/series entries and independently authored solutions; do not mislabel reconstructions or copy restricted material.
3. Cross-check all syllabus sections against current Cambridge syllabus and full uploaded resources, refine plan, and request exam date/year and AS/A Level scope for a dated schedule. The uploaded ZNotes are explicitly licensed for personal use.
4. Obtain Chapter 3 source screenshots before treating the reconstruction as accurate.
5. Extend KaTeX tests and ensure every question/notes render path supports it, including code blocks and currency edge cases.
6. Update this Drive handoff after each session, explicitly distinguish completed from pending work, and preserve existing Drive material.

## Testing
npm test exercises pages and exam flow in jsdom. The initial run flagged a pre-existing harness mismatch for jsdom's `window.scrollTo` spelling; adjusted its ignore regex. After that adjustment, the run still fails on one existing Chapter 4 self-marking assertion (40/50 rather than 50/50); investigate.

## Numbered handoff Session 01 — 2026-11-12
- First numbered handoff, not a claim about the total number of historical sessions. Folder is under Project Requests and Handoffs. Shortcuts point to the existing master resources and screenshots without moving or duplicating the originals. A prompt record and this handoff are saved there.
- Past papers navigation was already added in the preceding turn and points to the empty, honestly labelled index shell.
- Added pseudocode.html and assets/js/pseudo/{engine,editor}.js: an experimental offline interpreter with Run/Pause/Step/Reset, speed, variables, output and trace, line errors and 10,000 instruction limit. It does not use eval. Supports scalar declarations and assignments, INPUT/OUTPUT of one expression, IF/ELSE and WHILE, arithmetic, comparisons, AND/OR/NOT and concatenation. Source or input edits reset execution.
- Not implemented: arrays, FOR, REPEAT, CASE, functions/procedures and BYREF, records, simulated files, built-ins, call stack. The editor is not equivalent to Pseudocode Pro. Extend the interpreter incrementally and add semantic tests.
- Tested node scripts/test-pseudo.js and an editor run in jsdom; both passed. Existing npm test still has the previously recorded Chapter 4 self-marking failure; not re-run in this session.
- Future sessions: create Session 02, 03, etc. under Project Requests and Handoffs; save each new prompt and a dated progress snapshot, add shortcuts to any relevant uploads rather than moving originals, and update root Progress.md. Full historical prompts are not available beyond the text visible in this conversation and existing Drive records.

## Session 02 — 2026-11-12
- Redesigned Past Papers with the user's screenshot-inspired blue grid, breadcrumb, responsive two-column accent cards and four 9618 paper categories. Each category lists 2021–2026 by year, with links to external session archives. Archives require internet; cards do not link to individual variants or on-site worked solutions. October/November 2026 is not indexed. Do not claim complete variant coverage or that links have been independently checked as PDF downloads.
- Linked the Cambridge 2027–2029 syllabus and recorded each paper's title, duration, marks and syllabus coverage. Earlier series may have different syllabuses. External links and source collections can change.
- Checked the four category routes and year group counts with jsdom. Earlier test results and executor limitations above remain unchanged.
- Outstanding: per-variant verified question paper and mark-scheme links, individually authored worked solutions, remaining full interpreter features, syllabus cross-check and dated personalized study plan. User requested all 2021–2026 papers; session archive links are a partial implementation only.

## Theme correction — 2026-11-12
- Restyled the Past Papers pages using the site's original dark/light theme variables and green/cyan accent. The reference is inspiration for the layout, not the colour scheme; retained the four categories, year grouping and responsive cards. No archive content was changed.

## Past paper variants and theme — 2026-11-12
- Follow-up request: show individual paper codes grouped by year/series (as in Drive Session 02 reference images), make both headings the site's accent colour, and make dark mode work. Added variant cards for session archives. Cards explicitly open external session collections, not individual PDFs; 2021 Oct/Nov advanced/practical variant 3 omitted because the linked archive does not list it, and Oct/Nov 2026 is not indexed. Coverage and individual links need further verification.
- CSS uses the site's theme variables and is cache-busted via a versioned stylesheet URL. The dark/light toggle applies on Past Papers as elsewhere. `node scripts/test-past-papers.js` passes for paper routes, headings, links and toggle. External PDFs are not tested by that script.

## Publication check — 2026-11-12
- Fixed a pre-existing results-page issue: circuit questions now display mark-scheme checkboxes, allowing the self-marked circuit marks to be awarded. `npm test`, `node scripts/test-past-papers.js`, `node scripts/test-pseudo.js` and `npm run build` passed. The build regenerates a timestamp in content/data.js; no substantive content change was intended.
- GitHub Pages deploys from main via .github/workflows/pages.yml; the 9618 past-paper cards open external session archives, not on-site worked solutions, and the pseudocode editor remains a limited subset.
