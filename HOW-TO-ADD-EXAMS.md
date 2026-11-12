# Adding an exam (after each class test)

You have just sat a chapter test and want it here forever. Work through this in order — it takes
about 10–15 minutes for a 40-mark paper once you get used to the format.

---

## 1. Capture the paper

Immediately after the class test, write down (in any notes app):

- the exam title, marks, duration and date;
- **every** question, including the marks in brackets;
- for MCQs: all four options and which one you think is right;
- for written questions: what the teacher's mark scheme said (ask, or reconstruct it).

Do not paraphrase a question into something easier — keep the difficulty exactly as it was.

---

## 2. Create the JSON file

```bash
cd content/exams
cp _TEMPLATE.json ch5-system-software-2026-11-20.json
```

Naming convention: `ch<chapter>-<slug>-<YYYY-MM-DD>.json`. Unique `id` inside the file must match the
filename (without `.json`).

---

## 3. Fill in the questions

Read **EXAM-FORMAT.md** for every field. The four question types:

| `type` | Use it for | Auto-marked? |
|---|---|---|
| `mcq` | multiple choice | yes, exact |
| `numeric` | a number (binary → denary, KiB, truth-table rows…) | yes, with tolerance |
| `trace` | trace tables and truth tables | yes, per cell (partial marks) |
| `text` | extended answers, pseudocode, explanations | you self-mark against the scheme |

Rules of thumb:

- **One question = one mark-earning idea.** If the class question had parts (a), (b), (c), make them
  `q1a`, `q1b`, `q1c` with their own marks — that is exactly how the real papers allocate marks.
- **Always fill `answer`** — for `text` questions use one object per mark point and say in one sentence
  what earns that mark. Your future self needs this.
- **Always fill `explanation`** — one or two sentences on *why*. Skip this and the exam becomes a
  scoreboard instead of a revision tool.
- **Copy the pseudocode exactly** in `text` fields, inside triple backticks; it renders as a code block.

---

## 4. Register it in the catalogue

Open `content/index.json` and add an entry to the `exams` array:

```json
{
  "id": "ch5-system-software-2026-11-20",
  "title": "Chapter 5 – System Software",
  "origin": "teacher",
  "paper": "paper-1",
  "chapter": 5,
  "topics": ["system-software"],
  "status": "ready",
  "opensAt": "2026-11-20T09:00:00+08:00",
  "durationMin": 40,
  "totalMarks": 40,
  "examDate": "2026-11-20",
  "description": "Class test on Sections 5.1 Operating systems and 5.2 Language translators.",
  "questionsFile": "ch5-system-software-2026-11-20.json"
}
```

`topics` must use the ids from `SYLLABUS-CHECKLIST.md` (`info-rep`, `communication`, `hardware`,
`processor`, `system-software`, `security`, `ethics`, `databases`, `algorithms`, `data-types`,
`programming`, `software-dev`) — this is what powers the per-topic mastery bars on the Progress page.

---

## 5. Build and check

```bash
npm run build     # validates everything and regenerates content/data.js
npm run test      # optional: plays every exam headlessly to be sure nothing is broken
```

`npm run build` prints exactly which question is wrong, e.g.

```
✖ problems found:
  - ch5-system-software-2026-11-20.json: question 7 (q7): mcq answer "C" not in options
  - ch5-system-software-2026-11-20.json: totalMarks says 40 but questions add to 38
```

Fix, run again until you see `✔ all exam files valid`.

---

## 6. Commit and publish

```bash
git add -A
git commit -m "add chapter 5 system software test"
git push
```

GitHub Actions republishes the site automatically (if Pages is enabled with the Actions source), so the
exam is on your phone within a minute.

---

## Faster: add it in the browser only

If you just want to re-take a test tonight and worry about the repo later:

1. Open `builder.html`.
2. Paste the exam JSON (same shape as `_TEMPLATE.json`) into the textarea.
3. Press **Validate only**, then **Save to this browser**.
4. It appears in `exams.html` immediately and survives reloads.

It lives in `localStorage`, so it does **not** sync to other devices and is lost if you clear site data —
use **Progress → Backup / restore → Export** to keep a copy.

---

## Asking an AI to do step 1–3 for you

Paste this prompt with your raw question paper:

> Convert the following 9618 AS Level class test into the JSON schema in EXAM-FORMAT.md.
> Use one question object per part (a)/(b)/(c), keep the original marks, and for every `text`
> question give one mark-scheme point per mark. Keep pseudocode inside triple backticks.
> Output only the JSON.

Then validate and read through every mark scheme yourself — the AI will sometimes give a mark point
that is technically right but not what your teacher wanted.
