# Exam JSON format

Each exam is one JSON file in `content/exams/`. `scripts/build-content.js` validates every file and
fails if anything is inconsistent.

---

## Top level

```json
{
  "id": "ch3-hardware-hardware-2026-09-30",
  "title": "Chapter 3 – Hardware",
  "origin": "teacher",
  "paper": "paper-1",
  "chapter": 3,
  "topics": ["hardware"],
  "durationMin": 50,
  "totalMarks": 40,
  "examDate": "2026-09-30",
  "instructions": "Answer all questions. Calculators are not permitted.",
  "questions": [ ... ]
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | unique; same as the filename without `.json` |
| `title` | string | shown on cards and in the exam header |
| `origin` | `"teacher"` \| `"ai"` \| `"custom"` | drives the badge and the filter chips |
| `paper` | `"paper-1"` \| `"paper-2"` | Paper 1 = Sections 1–8, Paper 2 = Sections 9–12 |
| `chapter` | number \| null | used by the "Chapter N" filter |
| `topics` | string[] | topic ids (see SYLLABUS-CHECKLIST.md) |
| `durationMin` | number | timer length in minutes |
| `totalMarks` | number | must equal the sum of `question.marks` |
| `examDate` | `YYYY-MM-DD` | display only — the exam is **always** open here |
| `instructions` | string | markdown-lite (`**bold**`, `` `code` ``) |
| `questions` | array | see below |

---

## Question objects

Every question needs `id`, `type`, `marks`, `text`, and optionally `topic`, `section`, `explanation`.

- `id` — unique inside the exam (`q1`, `q2a`, …).
- `marks` — number.
- `text` — question body. Supports:
  - `**bold**`, `*italic*`, `` `code` ``,
  - fenced code blocks with ```` ``` ```` (rendered as pseudocode boxes),
  - markdown tables (great for truth tables in the question text).
- `topic` — topic id; feeds the topic-mastery charts.
- `section` — syllabus reference shown as a small tag, e.g. `"4.2"`.
- `explanation` — shown after marking under a **Why** heading. Write the reason, not a repeat of the answer.

### 1. `mcq` — multiple choice (auto-marked)

```json
{
  "id": "q1",
  "type": "mcq",
  "marks": 1,
  "topic": "hardware",
  "section": "3.1",
  "text": "Which of the following is an example of an **embedded system**?",
  "options": [
    { "id": "A", "text": "A laptop running a word processor" },
    { "id": "B", "text": "A washing machine controller" },
    { "id": "C", "text": "A desktop PC used in a school office" },
    { "id": "D", "text": "A file server on a network" }
  ],
  "answer": "B",
  "explanation": "An embedded system is built into a larger device and dedicated to one task."
}
```

`answer` must be one of the option ids.

### 2. `numeric` — a number (auto-marked)

```json
{
  "id": "q10",
  "type": "numeric",
  "marks": 1,
  "topic": "hardware",
  "text": "A logic circuit has **three** inputs. How many rows are needed in its truth table?",
  "answer": 8,
  "unit": "rows",
  "tolerance": 0,
  "explanation": "2³ = 8 rows."
}
```

`tolerance` is optional (default 0.005, i.e. rounding-level). `unit` is display only.
Use this for values where a number is the whole answer — for "show your working", use `text`.

### 3. `trace` — trace table / truth table (auto-marked per cell, partial credit)

```json
{
  "id": "q11",
  "type": "trace",
  "marks": 6,
  "topic": "hardware",
  "text": "Complete the truth table for **X = (A AND B) OR (NOT C)**.",
  "columns": ["A", "B", "C", "X"],
  "given": [
    ["0", "0", "0", "1"],
    ["", "", "", ""],
    ["1", "1", "1", "0"]
  ],
  "answer": [
    ["0", "0", "0", "1"],
    ["0", "0", "1", "0"],
    ["1", "1", "1", "0"]
  ],
  "explanation": "NOT C is 1 whenever C is 0."
}
```

- `columns` — header labels.
- `answer` — the complete correct table (every row, every column).
- `given` — optional; the same shape, with pre-filled cells for inputs the student should not type.
  **`given` and `answer` must have the same number of rows.**
- Empty strings in `given` mean "the student types this cell".
- Scoring: marks × (correct typed cells ÷ typed cells), rounded to 0.1.

### 4. `text` — written answer (self-marked against the mark scheme)

```json
{
  "id": "q7",
  "type": "text",
  "marks": 3,
  "topic": "processor",
  "section": "4.1",
  "text": "Explain how the **fetch–decode–execute cycle** uses the PC, MAR, MDR and CIR.",
  "answer": [
    { "text": "PC holds the address of the next instruction; copied to the MAR.", "marks": 1 },
    { "text": "The instruction is fetched into the MDR and copied to the CIR; PC incremented.", "marks": 1 },
    { "text": "The control unit decodes it and issues the signals to execute it.", "marks": 1 }
  ],
  "selfMark": true,
  "explanation": "Order: PC → MAR → memory → MDR → CIR, PC + 1, decode, execute."
}
```

- One object per mark point. `marks` per point defaults to 1.
- On the result page the student ticks each point they actually wrote; the score is scaled to the
  question's `marks`, so ticking every point always gives full marks even if you wrote three points
  for a four-mark question (that's deliberate: it keeps the total honest).
- Use `explanation` for the model answer itself when it is longer than the bullets (e.g. full pseudocode).

---

## Extra fields you can use

| Field | Where | Effect |
|---|---|---|
| `instructions` | exam | markdown shown on the intro card |
| `opensAt` | `content/index.json` | the portal-style "Opens: …" line (ignored for availability here) |
| `status` | `content/index.json` | `ready` / `result` / `closed` — only affects the badge before you attempt it |

---

## Validating by hand

```bash
npm run build
```

Checks performed:

- every listed exam file exists;
- `type` is one of the four;
- `marks` present on every question;
- `mcq` has ≥ 2 options and `answer` matches an option id;
- `numeric` answer is a number;
- `text` has an `answer` array;
- `trace` has `columns`, `answer`, matching row widths, and `given` length equals `answer` length;
- `totalMarks` equals the sum of question marks (the build fixes it for you and tells you).
