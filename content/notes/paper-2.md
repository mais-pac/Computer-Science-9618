# Paper 2 — Pseudocode & Programming (Sections 9–12)

> TIP: Paper 2 is marked **against the mark scheme, not for a running program**. Every variable you use must be **declared** with a type, every loop must terminate, and every answer must be in **Cambridge pseudocode** — *never* Python, Java or VB syntax.

---

## The Cambridge pseudocode you must write perfectly

```text
DECLARE Count : INTEGER
DECLARE Name  : STRING
DECLARE Temp  : REAL
DECLARE Flag  : BOOLEAN
DECLARE Marks : ARRAY[1:10] OF INTEGER
DECLARE Grid  : ARRAY[1:5, 1:5] OF STRING

CONSTANT MaxSize = 100

// assignment (papers print ←; a plain = is also accepted)
Count ← 0
Name ← "Ariun"

// input / output
INPUT Name
OUTPUT "Result: ", Count

// selection
IF Count > 10 THEN
    OUTPUT "high"
ELSE
    OUTPUT "low"
ENDIF

CASE OF Grade
    "A": OUTPUT "Excellent"
    "B": OUTPUT "Good"
    OTHERWISE: OUTPUT "Study more"
ENDCASE

// count-controlled loop
FOR Index ← 1 TO 10
    OUTPUT Marks[Index]
NEXT Index

FOR Index ← 10 TO 1 STEP -1
    OUTPUT Marks[Index]
NEXT Index

// condition-controlled loops
WHILE Count < 10 DO
    Count ← Count + 1
ENDWHILE

REPEAT
    Count ← Count + 1
UNTIL Count = 10
```

**Subroutines**

```text
PROCEDURE PrintLine(LineText : STRING)
    OUTPUT LineText
ENDPROCEDURE

FUNCTION Square(Number : INTEGER) RETURNS INTEGER
    RETURN Number * Number
ENDFUNCTION

PROCEDURE Swap(BYREF A : INTEGER, BYREF B : INTEGER)
    DECLARE Temp : INTEGER
    Temp ← A
    A ← B
    B ← Temp
ENDPROCEDURE

CALL PrintLine("hello")
OUTPUT Square(5)
```

**Files**

```text
DECLARE MyFile : STRING
MyFile ← "data.txt"

OPENFILE MyFile FOR READ
WHILE NOT EOF(MyFile) DO
    READFILE MyFile, LineOfText
    OUTPUT LineOfText
ENDWHILE
CLOSEFILE MyFile

OPENFILE "out.txt" FOR WRITE
WRITEFILE "out.txt", "hello"
CLOSEFILE "out.txt"

OPENFILE "data.txt" FOR APPEND
```

**Records and user-defined types**

```text
TYPE Student
    DECLARE ID : INTEGER
    DECLARE Name : STRING
    DECLARE Age : INTEGER
ENDTYPE

DECLARE Pupil : Student
Pupil.ID ← 101
Pupil.Name ← "Ariun"
OUTPUT Pupil.Name

TYPE Colour = (Red, Green, Blue)      // enumerated type
DECLARE Chosen : Colour
```

**Common built-in functions**

| Function | Use |
|---|---|
| `LENGTH(s)` | number of characters in a string |
| `LCASE(s)` / `UCASE(s)` | change case |
| `LEFT(s, n)` / `RIGHT(s, n)` / `MID(s, start, n)` | substring |
| `INT(x)` | integer part (truncate) |
| `ROUND(x, n)` | round to n decimal places |
| `RAND(x)` | random integer from 1 to x |
| `NUM_TO_STR(n)` / `STR_TO_NUM(s)` | type conversion (9618 style is `STRING_TO_NUM`) |
| `EOF(file)` | TRUE at end of file |
| `ASC(c)` / `CHR(n)` | character ↔ code |

> TRAP: `←` vs `=`. Use `←` for assignment and `=` **only** for comparison (`IF X = 5 THEN`). Using `=` for both is the single most common pseudocode mark-loss.

---

## 9. Algorithm Design and Problem-solving

### 9.1 Computational thinking

- **Abstraction** — remove irrelevant detail, keep what matters (a tube map is an abstraction of a railway).
- **Decomposition** — break a large problem into smaller, solvable sub-problems.
- **Pattern recognition** — spot repeated structures that can reuse the same solution.
- **Algorithm design** — a precise, finite, unambiguous sequence of steps.

**Program design tools**

- **Structure/flow chart** — shows the algorithm as shapes (terminator, process, decision, input/output).
- **Pseudocode** — structured English with programming constructs.
- **State-transition diagram** — states and the events that move between them.
- **Library/module chart** — top-down decomposition showing subroutines.

Every algorithm must have **finite steps**, **unambiguous instructions**, **defined inputs** and **defined outputs**.

### 9.2 Standard algorithms

**Linear search** — check each item in turn. Works on unsorted data. Worst case *n* comparisons.

**Binary search** — data **must be sorted**. Repeatedly halve the range. At most log₂n comparisons.

```text
Low ← 1
High ← NumberOfItems
Found ← FALSE
WHILE Low <= High AND NOT Found DO
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
IF Found THEN OUTPUT "Found at ", Mid ELSE OUTPUT "Not found"
```

**Bubble sort** — compare adjacent pairs and swap; repeat until no swaps. Simple, but O(n²).

```text
REPEAT
    Swapped ← FALSE
    FOR Index ← 1 TO (NumberOfItems - 1)
        IF Data[Index] > Data[Index + 1] THEN
            Temp ← Data[Index]
            Data[Index] ← Data[Index + 1]
            Data[Index + 1] ← Temp
            Swapped ← TRUE
        ENDIF
    NEXT Index
UNTIL NOT Swapped
```

**Insertion sort** — build a sorted section one item at a time by inserting each new item in the right place; better than bubble for nearly sorted data.

**Selection sort** — repeatedly find the smallest remaining item and swap it into the next position; fewer swaps than bubble.

**Finding max/min** — start with the first item, loop from the second, replace if larger/smaller.

> TIP: For trace-table questions, write a row **per iteration**, not per line, and show the loop counter. If you run out of rows, draw extra ones — no marks are lost for that.

---

## 10. Data Types and Structures

### 10.1 Data types and records

| Type | Holds | Example |
|---|---|---|
| INTEGER | whole numbers | 42 |
| REAL | numbers with a fraction | 2.718 |
| BOOLEAN | TRUE/FALSE | TRUE |
| CHAR | a single character | 'A' |
| STRING | text | "Ariun" |
| DATE | a date | 12/11/2026 |

- **User-defined type** — a type the programmer defines: a record, an enumerated type, a pointer, a set, an array of records. Improves readability and makes the code self-documenting.
- **Enumerated type** — a named list of allowed values: `TYPE Day = (Mon, Tue, Wed, Thu, Fri)`.
- **Pointer** — a variable holding a memory address; used to build dynamic structures (linked lists, stacks, queues, trees) where memory is allocated at run time (`NEW`, dereference `^`).
- **Record** — a group of related fields of different types under one identifier; accessed with **dot notation**.
- **Set** — an unordered collection of distinct values of the same type.
- **Non-composite vs composite:** composite types are built from others (record, array, set, class).

### 10.2 Arrays

```text
DECLARE Marks : ARRAY[1:30] OF INTEGER       // 1D
DECLARE Seats : ARRAY[1:10, 1:20] OF STRING  // 2D
DECLARE People : ARRAY[1:50] OF Student      // array of records
```

- Elements are accessed by index; in pseudocode the first index is whatever the declaration says (usually 1).
- A 2D array is processed with **nested loops** — the outer loop usually walks rows, the inner loop the columns.
- Arrays are **fixed size**; the size is set at declaration. An index outside the declared range causes an error, so validate indices.

**Totalling, counting and averaging** — three variables: `Total`, `Count`, `Average ← Total / Count`.

### 10.3 Files

- **Text file:** human-readable lines of characters; values must be converted to be used numerically.
- **Binary file:** stored as bytes/records; faster and more compact but not human-readable.
- Typical sequence: `OPENFILE … FOR READ` → `WHILE NOT EOF(…)` → `READFILE` → `CLOSEFILE`.
- Modes: `READ`, `WRITE` (replaces the file), `APPEND` (adds to the end), `RANDOM` (seek to a record).

### 10.4 Abstract data types (intro)

- **Stack** — **LIFO**: `PUSH`, `POP`, `TOP`; used for interrupt handling, recursion, undo, expression evaluation.
- **Queue** — **FIFO**: enqueue at the **rear**, dequeue from the **front**; used for printer spooling, keyboard buffers, scheduling.
- **Linked list** — nodes with data + a pointer to the next node; easy to insert/delete, but no direct index access.

---

## 11. Programming

### 11.1 Programming basics

- **Identifier** rules: letters, digits and underscore only, must start with a letter, no spaces, cannot be a keyword.
- **Variables** can change value; **constants** are fixed with `CONSTANT` and are used so the value is written once, is self-documenting and cannot accidentally change.
- **Assignment** `X ← X + 1`. **Initialisation** sets a starting value before use (totals start at 0, products at 1).
- **Data types** must be declared; `STRING` + `INTEGER` needs explicit conversion.
- **Naming conventions:** meaningful identifiers, camelCase or underscores (`studentMark`), constants in caps.

### 11.2 Constructs

- **Sequence**, **selection** (IF / CASE) and **iteration** (FOR, WHILE, REPEAT) — every program is built from these three.
- **Definite iteration** (FOR) when the number of repeats is known **before** the loop starts.
- **Indefinite iteration** (WHILE / REPEAT) when it depends on a condition.
- `REPEAT … UNTIL` is **post-conditioned** (always runs at least once); `WHILE … DO` is **pre-conditioned** (may run zero times).
- **Nested** constructs: an IF inside a loop, or a loop inside a loop.

> TRAP: Converting between WHILE and REPEAT requires **inverting** the condition and moving the test to the other end of the loop. If you only copy the condition, you lose the mark.

### 11.3 Structured programming

**Procedures vs functions**

| Procedure | Function |
|---|---|
| Performs a task | Calculates and **returns one value** |
| Called as a statement `CALL Sort(Data)` | Used in an expression `Total ← Total + Square(4)` |
| No `RETURNS` clause | `RETURNS <type>` and must contain `RETURN` |

Both can take **parameters**, which make them general-purpose and reusable.

**Parameter passing**

- **BYVAL** — a copy of the value is passed; changes inside the subroutine do **not** affect the caller. Advantage: the original data is protected; easier to debug.
- **BYREF** — the address is passed; changes **do** affect the caller. Advantage: the subroutine can return more than one value and it is memory efficient for large arrays.
- A **call by value** swap does nothing — always use BYREF for a swap.

**How the examiner phrases it, and the keyword to answer with**

| The question says… | Use | Because |
|---|---|---|
| "must **not** change the original" | `BYVAL` | a copy is passed, the caller is protected |
| "must **permanently update** / modify the original" | `BYREF` | the address is passed, the change is written through |
| "passing a large array" | `BYREF` | no copy is made, so it is memory- and time-efficient |
| "return two or more values" | `BYREF` | a function can only `RETURN` one value |
| "swap two values" | `BYREF` ×2 | swapping copies swaps nothing |

**The mechanism, stated precisely (this is the 2-mark answer)**

| | `BYVAL` | `BYREF` |
|---|---|---|
| What is passed | a **copy of the value** | the **address** of the original variable |
| Where the procedure works | on its own **local copy** | directly on the original memory location |
| Effect on the caller's variable | **none** — the original is protected | **written through** — the original changes |
| Keyword in the header | `BYVAL` | `BYREF` |
| Use when | the subroutine must **not** change the caller's data | the subroutine must **update** the caller's data, or pass a large array cheaply |

The single sentence that scores both marks: *"BYVAL passes a copy, so changes inside the procedure do not affect the
original variable; BYREF passes the address, so changes are made directly to the original variable."*

**The same procedure, both ways** — your paper's Question 16 in miniature:

```text
PROCEDURE ChangeValue(BYVAL Num : INTEGER)
    Num ← Num + 5
ENDPROCEDURE

PROCEDURE ChangeValue(BYREF Num : INTEGER)
    Num ← Num + 5
ENDPROCEDURE

DECLARE A : INTEGER
A ← 5

CALL ChangeValue(A)     // BYVAL version → A is still 5
OUTPUT A                // prints 5

CALL ChangeValue(A)     // BYREF version → A becomes 10
OUTPUT A                // prints 10
```

If a question asks you to *state the change required* so a procedure modifies the original, the answer is not a
paragraph: **change `BYVAL` to `BYREF` in the parameter header**, then explain that the address is passed instead of
a copy. Two things, two marks.

**Writing a procedure from a bullet list (Q17 style)**

Bullet-list questions are almost mechanical — each bullet is worth a mark, so tick them off:

| The bullet says | What to write |
|---|---|
| "accepts an INTEGER parameter named `Score`" | `PROCEDURE Name(Score : INTEGER)` — the **type** is the mark |
| "must not change the original" | `BYVAL` |
| "must permanently update the original" | `BYREF` |
| "adds 5 and outputs the updated score" | `Score ← Score + 5` then `OUTPUT Score` |
| "does not output a value" | no `OUTPUT` at all — and it is a `PROCEDURE`, not a `FUNCTION` |
| end of procedure | `ENDPROCEDURE` |

```text
PROCEDURE DisplayBonus(BYVAL Score : INTEGER)     // must NOT change the original
    Score ← Score + 5
    OUTPUT Score
ENDPROCEDURE

PROCEDURE ApplyBonus(BYREF Score : INTEGER)       // must update the original
    Score ← Score + 10
ENDPROCEDURE

// main program
DECLARE StudentScore : INTEGER
StudentScore ← 60
CALL DisplayBonus(StudentScore)   // prints 65, StudentScore is still 60
CALL ApplyBonus(StudentScore)     // StudentScore becomes 70
OUTPUT StudentScore               // prints 70
```

**Trace it — the same code, two answers**

```
PROCEDURE Bump(BYVAL A : INTEGER)
    A ← A + 5
    OUTPUT A
ENDPROCEDURE

PROCEDURE Boost(BYREF B : INTEGER)
    B ← B + 10
ENDPROCEDURE

DECLARE Score : INTEGER
Score ← 60
CALL Bump(Score)      // prints 65, Score is still 60
CALL Boost(Score)     // Score becomes 70
OUTPUT Score          // prints 70
```

If that trace feels obvious, then the marks are already yours — this exact pattern appears in almost every 9618 Paper 2.

**Structure marks you get for free (memorise this list)**

Paper 2 marks are awarded per structural element, not only for a correct solution. On any "write a procedure/subroutine" question, these earn marks even when the logic is shaky:

1. the `PROCEDURE`/`FUNCTION` header with **typed parameters**
2. `BYVAL`/`BYREF` chosen correctly for the wording
3. the variable declaration and its initial value
4. each `INPUT`, each `OUTPUT`
5. `ENDPROCEDURE` / `ENDFUNCTION` / `ENDIF` / `NEXT` closing everything
6. correct indentation — examiners reward readable structure

**Never leave a pseudocode question blank.** A lone header plus declarations plus the closing keyword is worth about 3 marks. A blank is worth zero, every time.

```text
PROCEDURE Bump(BYREF Score : INTEGER, Bonus : INTEGER)
    Score ← Score + Bonus
    IF Score > 100 THEN
        Score ← 100
    ENDIF
ENDPROCEDURE
```

**Local vs global variables:** local variables are declared inside a subroutine and exist only there (safer, no side effects); global variables are declared in the main program and can be seen everywhere (convenient but risky). **Pass parameters** rather than relying on globals.

**Why use subroutines?**

- Reusability — write once, call many times.
- Easier to read, test, debug and maintain — one change updates every use.
- Supports **decomposition** so a team can work in parallel.
- Hides detail (**abstraction**) behind a clear interface.

**Recursion** (introduced at AS through the concept, examined more at A Level) — a subroutine that calls itself, always needing a **base case** to stop:

```text
FUNCTION Factorial(N : INTEGER) RETURNS INTEGER
    IF N = 1 THEN
        RETURN 1
    ELSE
        RETURN N * Factorial(N - 1)
    ENDIF
ENDFUNCTION
```

---

## Exam technique that actually moves the grade

This section is not syllabus content — it is what repeatedly separates a C from an A on 9618 scripts.

### Before you write a line of pseudocode

1. **Underline the command word.** *State* → one line. *Explain* → reason with technical detail. *Describe* → stages in order. Answering "explain" with a fact earns half.
2. **List the modules the question names.** Parameters, their types, what is returned. This is where `BYVAL`/`BYREF` is decided, before any code.
3. **Plan in structured English first**, then translate to pseudocode. Thinking in Python is the most common way to lose syntax marks.
4. **Answer the scenario, not the textbook.** Use the names the question gave you (`StudentScore`, not `X`).

### The syntax traps that silently cost marks

| Wrong | Right | Why it matters |
|---|---|---|
| `x = 5` | `x ← 5` | Python habits are an automatic error |
| `"a" + "b"` | `"a" & "b"` | `+` is arithmetic; concatenation is `&` |
| `OPENFILE data.txt FOR READ` | `OPENFILE "data.txt" FOR READ` | filenames are **always** in quotes |
| `CLOSEFILE()` | `CLOSEFILE "data.txt"` | the filename argument is required |
| `EOF()` | `EOF("data.txt")` | same — always takes the filename |
| missing `NUM_TO_STR` / `STR_TO_NUM` | explicit conversions on file I/O | numbers written to text files must be converted |
| `RETURN` in a procedure | `FUNCTION` if it returns | a procedure cannot return a value |
| dropping `BYREF` on a modified array | `BYREF` | the caller never sees the change |

### The four habits of high scorers

- **Attempt, compare, diagnose, log.** Do a past-paper question under time, mark it against the scheme *and the examiner report*, then write down **why** you lost each mark. Re-reading notes is not revision; this loop is.
- **Keep a mistake log.** The same 5–6 errors repeat. Fixing those is worth more than learning new content.
- **Drill the standard algorithms until they are automatic** — linear search, bubble sort, and both on 2-D arrays. They appear relentlessly.
- **Use the insert paper only for panic**, not for planning. Learn the syntax beforehand.

### The night before

- Re-read this page's syntax table, not the whole syllabus.
- Do one full Paper 2 in time, on paper, with the mark scheme closed.
- Sleep. Timed practice on a tired brain teaches you to make mistakes faster.

---

## 12. Software Development

### 12.1 Development life cycle

1. **Analysis** — collect requirements from the client (interviews, questionnaires, observation, documents), produce the **requirements specification** and success criteria.
2. **Design** — hardware/software requirements, data structures, input/output design, validation rules, tested design (pseudocode, flowcharts, hierarchy charts, test plan).
3. **Coding** — write the program following the design and standards.
4. **Testing** — check against the success criteria using the test plan.
5. **Maintenance** — fix and improve the system after release.

**Methods:** **waterfall** (sequential, clear stages, poor at handling change), **iterative/incremental** (build in repeating cycles), **rapid application development** (prototypes and user feedback), **agile** (short sprints, frequent releases), **extreme programming** (pair programming, continuous testing). **Prototyping** lets the client see the system early and change requirements cheaply.

### 12.2 Program design

- **Top-down design** — split the problem into sub-tasks, each implemented as a subroutine.
- **Structure chart / hierarchy chart** — shows the modules and how they call each other.
- **State-transition diagrams** — states and the events that change state.
- **Data-flow diagrams** — processes, data stores, external entities and data flows.
- **Data dictionary** — defines every variable: name, data type, size, validation, description.

### 12.3 Testing and maintenance

- **Types of testing:** unit testing (one subroutine), integration (modules together), system (whole system), acceptance (against the client's requirements), alpha (in-house), beta (real users), black-box (against the spec, no knowledge of code), white-box (tests every path/branch of the code).
- **Test data:** **normal** (should be accepted), **abnormal/erroneous** (wrong type or out of range — should be rejected), **extreme** (at the boundary: 0 and 100), **live** (real data).
- **Testing is not debugging:** testing finds faults, debugging fixes them.
- **Maintenance** — *corrective* (fix bugs), *adaptive* (new environment/hardware), *perfective* (improve performance/efficiency or add features), *preventive* (restructure to avoid future problems).
- **Program documentation:** user documentation (how to use it) and technical documentation (how to maintain it).
- **Evaluation** — does it meet the requirements/success criteria? Speed, usability, maintainability.

> TIP: Test plan questions want a table with columns *Test number | Test data | Type of data | Expected result | Reason*. Without the **reason/expected result**, most of the marks are lost.

---

## Pseudocode practice ladder (10 drills)

Work up the ladder; each drill should take 5–10 minutes.

1. Input 10 numbers and output the total and the average.
2. Input a number and state whether it is positive, negative or zero.
3. Input 20 marks and output the highest and lowest.
4. Read a name and output it reversed, character by character.
5. Count how many vowels are in an input string.
6. Read 10 numbers into an array, then output them in reverse order.
7. Linear search: report the index of a value or "not found".
8. Binary search a sorted array of 20 elements.
9. Bubble sort 10 numbers into ascending order and output them.
10. Read records from `students.txt` (`id,name,mark` separated by commas), store them in an array of records, and output the average mark.

**Model answer for drill 1**

```text
DECLARE Total : INTEGER
DECLARE Number : INTEGER
DECLARE Index : INTEGER
Total ← 0
FOR Index ← 1 TO 10
    INPUT Number
    Total ← Total + Number
NEXT Index
OUTPUT "Total: ", Total
OUTPUT "Average: ", Total / 10
```

**Model answer for drill 5**

```text
DECLARE Word : STRING
DECLARE Vowels : INTEGER
DECLARE Index : INTEGER
DECLARE Character : CHAR
INPUT Word
Vowels ← 0
FOR Index ← 1 TO LENGTH(Word)
    Character ← LCASE(MID(Word, Index, 1))
    IF Character = "a" OR Character = "e" OR Character = "i" OR Character = "o" OR Character = "u" THEN
        Vowels ← Vowels + 1
    ENDIF
NEXT Index
OUTPUT "Vowels: ", Vowels
```

**Model answer for drill 10**

```text
TYPE Student
    DECLARE ID : INTEGER
    DECLARE Name : STRING
    DECLARE Mark : INTEGER
ENDTYPE

DECLARE Pupils : ARRAY[1:100] OF Student
DECLARE Line : STRING
DECLARE Parts : ARRAY[1:3] OF STRING
DECLARE Count : INTEGER
DECLARE Total : INTEGER
DECLARE Comma1 : INTEGER
DECLARE Comma2 : INTEGER

Count ← 0
OPENFILE "students.txt" FOR READ
WHILE NOT EOF("students.txt") DO
    READFILE "students.txt", Line
    Count ← Count + 1
    Comma1 ← FIND(Line, ",")            // position of the first comma
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
ENDIF
```

> TRAP: Never divide by a count that could be zero — always guard `IF Count > 0 THEN` before calculating an average. Examiners give a mark for this robustness in longer questions.
