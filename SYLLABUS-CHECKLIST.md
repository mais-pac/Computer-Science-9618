# 9618 AS syllabus checklist — what this platform already covers

Syllabus: **Cambridge International AS & A Level Computer Science 9618** (2026, and 2027–2029 — the AS
structure is unchanged). Paper 1 = Sections 1–8 (75 marks / 90 min). Paper 2 = Sections 9–12
(75 marks / 120 min, pseudocode answers).

Legend: ✅ covered in an exam · 🟡 partially / lightly examined · 📓 in the notes

| Section | Sub-topic | Exam coverage | Notes |
|---|---|---|---|
| **1** | 1.1 Data representation — binary/denary/hex, BCD, one's & two's complement, addition/subtraction, overflow, character sets | ✅ Ch 1 & 2 test, AI P1 | 📓 |
| **1** | 1.2 Multimedia — graphics (resolution, colour depth, file size), sound (sampling, resolution, file size), vector vs bitmap | ✅ Ch 1 & 2 test, AI P1 | 📓 |
| **1** | 1.3 Compression — lossy vs lossless, RLE, dictionary | ✅ Ch 1 & 2 test, AI P1 | 📓 |
| **2** | 2.1 Networks incl. internet — LAN/WAN, client–server, P2P, thin/thick client, topologies, media, NIC/switch/router, Ethernet, bit streaming, IP/DNS/URL, cloud | ✅ Ch 1 & 2 test, AI P1 | 📓 |
| **3** | 3.1 Computers & components — input/output/storage devices, buffers, embedded systems, memory types, monitoring & control, virtual memory | ✅ Ch 3, AI P1 | 📓 |
| **3** | 3.2 Logic gates & circuits — NOT/AND/OR/NAND/NOR/XOR, truth tables, K-maps, half/full adder, D-type flip-flop, SR latch | ✅ Ch 3, Ch 4 assessment | 📓 |
| **4** | 4.1 CPU architecture — Von Neumann, registers, buses, FDE, register transfer, interrupts, RISC/CISC, pipelining, parallel processing, GPU, VM | ✅ Assembly paper, Processor + parameter passing | 📓 |
| **4** | 4.2 Assembly language — instruction set, addressing modes (immediate/direct/indirect/indexed), tracing, assembler | ✅ Assembly paper | 📓 |
| **4** | 4.3 Bit manipulation — AND/OR/XOR masks, shifts, uses | ✅ Assembly paper, AI P1 | 📓 |
| **5** | 5.1 Operating systems — process/memory/file/IO management, scheduling, interrupts, utilities, BIOS, virtual machine | 🟡 (in notes + builder template; no class test yet) | 📓 |
| **5** | 5.2 Language translators — compiler vs interpreter vs assembler, stages of compilation, linker/loader/DLL, IDE features | 🟡 (in notes) | 📓 |
| **6** | 6.1 Data security — threats, malware, phishing, firewalls, encryption, authentication, backup, VPN, access rights | 🟡 (in notes) | 📓 |
| **6** | 6.2 Data integrity — validation (range/format/length/check digit…), verification (double entry, parity, checksum) | 🟡 (in notes) | 📓 |
| **7** | 7.1 Ethics & ownership — codes of conduct, copyright, patents, trademarks, licences, ethical issues | 🟡 (in notes) | 📓 |
| **8** | 8.1 Database concepts — relational model, keys, indexing, flat-file problems, normalisation 1NF–3NF | 🟡 (in notes) | 📓 |
| **8** | 8.2 DBMS — data independence, security, concurrency, backup/recovery, journaling | 🟡 (in notes) | 📓 |
| **8** | 8.3 DDL & DML — CREATE/ALTER/DROP, SELECT/INSERT/UPDATE/DELETE, functions, GROUP BY | 🟡 (in notes) | 📓 |
| **9** | 9.1 Computational thinking — abstraction, decomposition, pattern recognition, program design tools | ✅ AI P2 | 📓 |
| **9** | 9.2 Algorithms — linear/binary search, bubble/insertion/selection sort, standard algorithms, trace tables | ✅ AI P2 | 📓 |
| **10** | 10.1 Data types & records — primitive types, user-defined types, enumerated, pointers, records, sets | ✅ Ch 4 assessment | 📓 |
| **10** | 10.2 Arrays — 1D/2D, arrays of records, traversal, searching in arrays | ✅ Ch 4 assessment, AI P2 | 📓 |
| **10** | 10.3 Files — text vs binary, open/read/write/close, EOF | ✅ AI P2 | 📓 |
| **10** | 10.4 Intro to ADTs — stack (LIFO), queue (FIFO), linked list | 🟡 (in notes) | 📓 |
| **11** | 11.1 Programming basics — identifiers, variables, constants, assignment, types, built-in functions | ✅ AI P2 | 📓 |
| **11** | 11.2 Constructs — sequence, selection (IF/CASE), iteration (FOR/WHILE/REPEAT), nesting | ✅ Ch 4 assessment, AI P2 | 📓 |
| **11** | 11.3 Structured programming — procedures vs functions, parameters BYVAL/BYREF, local/global, structure charts | ✅ Ch 4 assessment, Processor + parameter passing | 📓 |
| **12** | 12.1 Program development life cycle — analysis, design, coding, testing, maintenance; waterfall/agile | ✅ AI P2 | 📓 |
| **12** | 12.2 Program design — top-down design, structure charts, state-transition diagrams, data dictionary | 🟡 | 📓 |
| **12** | 12.3 Testing & maintenance — test types, normal/abnormal/extreme data, test plans, maintenance types, documentation | ✅ AI P2 | 📓 |

## Gaps to fill next (suggested order)

1. **Section 5 (System Software)** — very common class-test chapter; a builder template already exists in
   `content/exams/_TEMPLATE.json`, ready to overwrite with real questions.
2. **Section 8 (Databases + SQL)** — the SQL paper questions always cost marks; add a Paper 1 exam with 3–4
   SQL writing questions plus normalisation.
3. **Section 6 (Security) & 7 (Ethics)** — 6–8 mark "discuss" questions; good candidates for `text`
   questions with 4-point mark schemes.
4. **A full mock**: 75 marks / 90 min for Paper 1 and 75 marks / 120 min for Paper 2 — build them once you
   have covered all sections, from your own mistakes.

## Where the class portal fits

The class portal shows each test with *marks · duration*, an *Opens:* date and a status
(`Ready` / `Result available` / `Closed`). This platform keeps exactly that vocabulary on the exam cards so
it feels like the same place — but every exam here is always open, re-takeable and paired with a mark scheme.
