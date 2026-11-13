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

## Session 03 — 2026-11-12
- User requires every future agent session to create a new numbered Drive folder and save actual prompts, uploaded files and a progress snapshot, then update Drive Progress.md. See AGENTS.md. Some prior turns were not archived when they happened; Session 03 backfills visible follow-up prompts and screenshots 8/9, plus the current prompt and screenshot 10.
- Past-paper variants are grouped by series: After user clarification, May/June variants run down the left column and October/November variants run down the right; columns stack on small screens. Removed the subtitle from each card; the page notice still explains these links open external session archives, not individual PDFs. `node scripts/test-past-papers.js` passed.
- Current branch arena/0ec217d4-computer-science-9618; these changes have not been published. Previously deployed commit 814d644 on main fixed circuit self-marking and passed smoke tests. Remaining goals: individual verified papers, worked solutions, full executor and tailored study plan.

### Session 03 follow-up: teacher quizzes and AI mocks
- Current request archived in Drive Session 03 Follow-up-2.md. This is a continuation of the same session; next AI session must create Session 04.
- Exams now lists teacher quiz chapter links where reconstructions exist, with unavailable chapters labelled; AI quiz links to existing pseudocode drills; AI mocks contain five original, short, self-marked chapter 1 information-representation sets plus the existing mixed mocks. These short sets are NOT full mock papers. Five substantive mocks for each remaining chapter and a dedicated AI quiz bank remain to be created. Teacher chapter numbering is not always identical to syllabus section numbering; avoid implying missing material exists.
- Study plan includes a practical weekly schedule and cited Reddit-inspired practices; advice is anecdotal, not marking rules. ZNotes excerpts were examined previously. Two Drive textbooks were not successfully extracted, so neither full resource audit nor comprehensive accuracy review of notes is complete. Ask exam date and AS/A Level scope for tailoring.
- `npm run build`, `npm test`, `node scripts/test-past-papers.js` passed. Changes remain unpublished on active branch.

### Session 03 exam target
User specifies A Level May/June 2028 in Mongolia, no exact date. Uploaded `766283-june-2027-zone-5-timetable.pdf` is for 2027, not 2028; don't infer 2028 exam dates. Ulaanbaatar is listed as Zone 5 in secondary references; centre must confirm zone and 2028 timetable. Added provisional 2028 roadmap to study plan, acknowledging AS-only site coverage. Session 03 contains request and upload; next session must create Session 04.

User clarification: focus only on AS Level this year; full A Level target May/June 2028. Do not assume the AS exam date. Study plan updated to separate current AS-only work from later A Level preparation.

### Session 03 exam page clarification
User requested two sections Teacher and AI, with AI Quiz and AI Mock under AI; all three list AS chapters and AI Mock lists five for each chapter. Implemented visible chapter cards for 1–12 and all 60 mock labels. Only the five existing short Chapter 1 practice sets are functional; other mocks and AI chapter quizzes are explicitly marked unavailable, not fabricated. Teacher-topic reconstructions are linked where available; teacher chapter labels can differ from syllabus section numbering. Versioned exam-page scripts to avoid browser caching. npm test and past-papers test passed. Source Drive folder 10dvdu93GKU2UZEc6mdbf2sNgFVkCTl0E contains large textbooks and James Gan URL; comprehensive source audit not yet completed. AS only this year. No publication yet. Follow-up-5.md contains the user request; next session creates Session 04.

### Session 03 latest correction
Existing AI chapter practice and mixed papers are linked in AI Quiz; Chapter 1 AI Mock and all other mocks wait until teacher-quiz-inspired content exists. Teacher reconstructions stay under Teacher. User requested private login; supplied credentials in chat, which must not be stored in repository/Drive. GitHub Pages static public hosting cannot provide genuine password access; need protected server/hosting and removal of public deployment, without assuming username/password in client code secures it. Tests passed; work unpublished.

Session 03 latest: detailed existing teacher and AI exam cards moved into AI Quiz as requested; retain accurate Teacher orange / AI generated purple provenance badges beside status, removed duplicate footer badges. Teacher detail page badge orange. No password gate: GitHub Pages is public, password in browser code cannot be kept secret, and true access restriction requires server/edge authentication and removing public deployment. User accepts GitHub source being visible, but wants browser page blocked. Tests passed. Request/images 12 and 13 saved in Session 03; next session must create Session 04.

Session 03 latest: user asked to undo previous turn; reverted card relocation and orange badge changes. Assembly Language teacher quiz corrected to Chapter 6 in index and exam JSON. Study plan links the user's two book PDFs on Drive; no copies republished and no complete review yet. User reiterated browser URL needs actual authentication; no secure login implemented, public GitHub Pages remains accessible. Password supplied in chat is redacted from handoff; do not store it, request a new secret via host's own secure settings. Need protected hosting and disable public deployment after confirmation. npm build and smoke tests pass; changes unpublished. Next session Session 04.

Worker protection prepared locally: wrangler.jsonc, worker/index.mjs, scripts/build-worker.mjs and scripts/test-worker.mjs. Every asset request must pass Worker Basic authentication; missing secret fails closed; preview URLs disabled in config. Local unit and smoke tests pass; deployment and public endpoint verification not performed. Existing GitHub Pages and public repository remain accessible; making repository private, disabling Pages and inspecting Drive sharing must be done separately. This implementation has no built-in rate limiting/MFA; a long unique password and platform-level rate limiting recommended. Do not store credentials in repo.

User made repository private; gh confirmed isPrivate=true. Pages settings shows upgrade or make public to enable Pages, suggesting Pages disabled, but Pages API returned 403; old URL should be checked externally. User asked how to set Cloudflare password; Worker code still not deployed.

Latest: user chose Render and requested implementation, without Cloudflare. Removed the uncommitted Cloudflare implementation. Prepared server.mjs, render.yaml and scripts/build-private-site.mjs for Render free web service; secret SITE_PASSWORD must be set privately in Render, username is configured in render.yaml. Login gates all assets, uses Secure HttpOnly SameSite cookies, in-memory sessions and an in-memory global attempt limit. Missing secrets fail closed. Sessions and attempt limits reset on restart and aren't shared across instances; this is not MFA or a substitute for managed authentication. Local private-server and smoke tests passed. Not deployed or verified in public; user must connect Render and set secret. Repository confirmed private; Pages API inaccessible (403), screenshot suggests disabled; user should verify old URL.

Past-paper redesign (local only, not pushed or deployed): inspected Bespoke Maths example (question navigation and stepwise explanations), but no 9618 collection was identified there. Created 130 individual paper HTML routes for the previously indexed sessions; preserved two-column paper index and removed paper archive links. 66 AS Paper 1/2 entries now link by filename-matched IDs to existing question paper and mark scheme PDFs in user's Drive; no PDF sharing permissions were changed and no PDFs were copied. A Level files not yet indexed. No actual interactive exams or worked solutions have been transcribed; yellow and blue panels intentionally disabled, no worked solutions uploaded. Added generated app icon as favicon and apple-touch-icon. Tests: node scripts/test-past-papers.js, node scripts/test-private-server.mjs, npm test passed. Repo and live site are not the same; Cloudflare worker deployment/access status unverified. Real server-level privacy still needs end-to-end verification. Next: verify every mapped PDF's content and permissions, map remaining papers, transcribe and test interactive questions, later add worked solutions only when requested. Individual pages are paths, not subdomains.

User made repository public and requested publish/merge. Worker authentication temporarily removed to allow public access, as discussed; site is explicitly public, not private. Restore and test server-side protection before adding private data or assuming confidentiality. Git-connected Cloudflare production branch was reportedly changed to this branch. Worked solutions and interactive past-paper tests remain unfinished.

## Session 05 — 2026-11-12
Moved the five class-topic reconstructions into AI Quiz, including the shared Chapter 1–2 test and Chapter 6 Assembly. Teacher chapters 1–12 now have no quiz links; existing AI practice and mixed papers retained. Provenance is explicitly marked as reconstruction. Added scripts/test-exam-sections.js; that test, past-paper tests, npm build and npm test passed. The current branch is arena/ef02384a-computer-science-9618. The live paper fix remains blocked by failed Cloudflare build 93e70df7-1baa-4e6b-a529-fc39f6ca9d03; need its build log, then verify production deployment. Site is temporarily public. Interactive past papers and worked papers remain unavailable. The exact current prompt was not present in condensed session context and cannot be archived verbatim; do not invent it.
