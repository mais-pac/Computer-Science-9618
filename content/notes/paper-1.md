# Paper 1 — Theory Fundamentals (Sections 1–8)

> TIP: Paper 1 is **75 marks in 90 minutes** — that is **1.2 minutes per mark**. Learn the definitions word-for-word; roughly half of the lost marks each year come from vague wording, not from not knowing the content.

---

## 1. Information Representation

### 1.1 Number systems and units

| Binary prefix | Value | Decimal prefix | Value |
|---|---|---|---|
| 1 kibi (Ki) | 2¹⁰ = 1024 | 1 kilo (k) | 10³ = 1000 |
| 1 mebi (Mi) | 2²⁰ | 1 mega (M) | 10⁶ |
| 1 gibi (Gi) | 2³⁰ | 1 giga (G) | 10⁹ |
| 1 tebi (Ti) | 2⁴⁰ | 1 tera (T) | 10¹² |

`1 byte = 8 bits`, `1 nibble = 4 bits`. Manufacturer storage is usually quoted in **decimal** prefixes (a "1 TB" drive is 0.91 TiB of real data).

**Converting between bases**

- Binary → denary: add the place values of the 1s (128 64 32 16 8 4 2 1).
- Denary → binary: repeatedly divide by 2 and read the remainders **bottom to top**, or subtract the largest place value repeatedly.
- Binary ↔ hex: group bits into **nibbles** (0110 = 6, 1011 = B).
- Hex is used because it is short and human-readable for long binary patterns (colours `#FF7FA0`, MAC addresses, memory addresses, error codes).

### BCD — Binary Coded Decimal

Each **denary digit** is stored in its own 4-bit group. `259` → `0010 0101 1001`.

- Wastes space (only 10 of 16 possible codes are used) and is slower for arithmetic.
- Used in **clocks, digital meters, calculators, seven-segment displays** — anywhere denary digits must be displayed directly without conversion.

### One's and two's complement

- **One's complement:** invert every bit of the positive value. Has two representations of zero — rarely used today.
- **Two's complement:** invert every bit, **then add 1**.

| Value | 8-bit two's complement |
|---|---|
| +37 | 0010 0101 |
| −37 | 1101 1011 |
| −1 | 1111 1111 |
| −128 | 1000 0000 |

Range for *n* bits: **−2ⁿ⁻¹ to +2ⁿ⁻¹ − 1** (8 bits: −128 to +127).

Two's complement is used because the CPU needs only one **addition** circuit — subtraction becomes "add the two's complement", so the same hardware does both.

### Binary addition, subtraction and overflow

Add column by column, carrying 1 when the total is 2 or more.

**Overflow** occurs when the result needs **more bits than are available** (e.g. 182 + 106 = 288 cannot fit in 8 bits). A carry out of the most significant bit, or a wrong sign, signals overflow.

> TRAP: For subtraction, convert to two's complement first, then **add**. Do not try to "borrow" — the marks are for the two's complement working.

### Character sets

- **ASCII**: 7 bits, 128 characters. **Extended ASCII**: 8 bits, 256 characters.
- **Unicode**: a huge code space covering every writing system, plus formats **UTF-8** (variable length, 1–4 bytes), UTF-16, UTF-32. Unicode allows one text file to contain many languages.
- A **character set** is the list of characters and the unique code assigned to each. The computer stores codes, not shapes — the font provides the glyph.

---

### 1.2 Multimedia — graphics and sound

**Bitmap graphics**

```
file size (bits) = width (px) × height (px) × colour depth (bits)
```

- **Resolution** = number of pixels (e.g. 1920 × 1080). **Colour depth** = bits per pixel (2ⁿ colours).
- Larger resolution or higher colour depth → better quality but bigger file.
- Vector graphics store **objects** (lines, curves, shapes with coordinates, fill, stroke). They scale without loss of quality and are smaller for simple shapes; bitmaps are better for photographs.

**Sound**

- **Sampling**: an ADC takes the amplitude of the analogue wave at regular intervals.
- **Sample rate** (Hz) = samples per second. **Sample resolution** (bit depth) = bits per sample.
- Higher rate and resolution → more accurate reproduction, bigger file. The **Nyquist** idea: sample at least at twice the highest frequency.

```
file size (bits) = sample rate × sample resolution × duration (s) × channels
```

- **MIDI** stores instructions (note, pitch, duration, instrument) rather than the waveform — tiny files, editable, but not a recording.

> TRAP: Units. `× 8` → bits to bytes, `÷ 1024` → KiB, `÷ 1024²` → MiB. Read whether the question wants KiB, MiB or bytes before you start.

### 1.3 Compression

| | Lossless | Lossy |
|---|---|---|
| Data | Fully reconstructable | Permanently removed |
| Ratio | Modest | Large |
| Formats | PNG, GIF, FLAC, ZIP, TIFF(LZW) | JPEG, MP3, MP4, AAC |
| Use | Text, code, medical images, archives | Photos, music, video |

- **RLE (run-length encoding)** — lossless; stores `AAAABB` as `4A 2B`. Excellent for images with large blocks of the same colour.
- **Dictionary-based (LZW)** — lossless; repeated patterns are replaced by a code that indexes a dictionary built as the file is read.
- Lossy works because human perception ignores some detail (auditory masking, chroma subsampling).

---

## 2. Communication

### 2.1 Networks and the internet

**LAN vs WAN**

| | LAN | WAN |
|---|---|---|
| Area | Single site | Country / global |
| Owner | The organisation | Third-party / telecoms |
| Media | Own cabling (UTP, fibre), Wi-Fi | Leased lines, satellite, public infrastructure |
| Speed & cost | Faster, cheaper | Slower, more expensive, higher error rate |

**Client–server vs peer-to-peer**

- **Client–server:** a central server holds data and services; clients request them. Central control of security and backup, but the server is a **single point of failure** and expensive.
- **Peer-to-peer:** every node is equal and can serve data; cheap, no central admin, but security and consistency are weaker.

**Thin vs thick clients:** a thin client does almost no processing itself (server does it) — cheap, easy to manage, but totally dependent on the network. A thick client is a normal PC with local processing and storage.

**Topologies**

- **Star** — all devices connect to a central switch. Easy to add a device, fault isolation, but the switch is a single point of failure.
- **Bus** — one backbone cable; cheap, but a single break stops everything and collisions are common.
- **Mesh** — every node links to others; resilient (many routes) but expensive to cable.

**Media:** UTP/STP twisted pair (cheap, limited distance), coaxial (older, good shielding), **fibre optic** (very high bandwidth, immune to EMI, long distance, expensive), wireless (radio, microwave, satellite — convenient but interference and security issues).

**LAN hardware**

- **NIC** — connects a device to the medium; has a unique **MAC address**.
- **Switch** — forwards frames to a specific port using MAC addresses (no wasted traffic).
- **Hub** — broadcasts to every port (outdated, collisions).
- **Router** — forwards packets **between networks** using IP addresses.
- **Repeater** — regenerates a weak signal. **Bridge** — joins two segments. **WAP** — wireless access point.

**Bit streaming:** real-time streaming sends data as a continuous stream and plays it as it arrives (a buffer absorbs jitter); on-demand streaming allows pause and seek. Downloading requires the whole file before use.

**The internet's infrastructure:** the internet is the global network of networks; the **WWW** is a service on it. Data travels between ISPs over high-speed **backbone** links. A **URL** identifies a resource (`protocol://domain/path`), **DNS** converts domain names to IP addresses, and **ISPs** provide access.

**IP addressing:** IPv4 is 32-bit (4 billion addresses, exhausted); IPv6 is 128-bit. **Public** addresses are globally routable; **private** addresses (192.168.x.x, 10.x.x.x, 172.16–31.x.x) are used inside a LAN and reach the internet via NAT. **Static** addresses are fixed (servers); **dynamic** addresses are leased by DHCP.

**Cloud computing:** storage/services on third-party servers. Advantages: access anywhere, no hardware purchase, automatic backup, elastic scaling. Disadvantages: dependence on the internet, ongoing cost, security/privacy trust, limited control.

---

## 3. Hardware

### 3.1 Computers and their components

**Input devices** — keyboard, mouse, touchpad, tracker ball, joystick, touch screen, microphone, camera, scanner, barcode reader, QR scanner, RFID reader, OMR (exam marks), OCR (text), MICR (cheques), magnetic stripe reader, sensors.

**Output devices** — monitor (LCD/LED), projector, laser and inkjet printers, 3D printer, plotter, speaker, actuator, braille embosser.

**Printers:** laser — fast, high quality, high initial cost, uses toner and a drum; inkjet — cheaper, better photo colour, slower, ink can smudge; 3D — additive layer printing from a CAD model.

**How input is captured** (typical mark scheme): the device converts the physical input into electrical signals → an **ADC** converts analogue to digital → the processor interprets the digital value.

**Sensors and monitoring/control**

```
sensor → ADC → microprocessor (compares reading with stored value, runs the algorithm)
        → DAC → actuator  →  physical action
```

- **Sensor:** measures a physical quantity (temperature, light, pressure, humidity, pH, infrared, sound, gas, magnetic field).
- **Microprocessor:** compares the value with a pre-set value and decides the action.
- **Actuator:** performs the physical action (motor, valve, heater, motorised window).
- **Monitoring** = the system only reports/records. **Control** = the system takes action.

**Buffers:** temporary storage between devices of different speeds (CPU → printer). Lets the fast device continue instead of waiting, and prevents data loss.

**Embedded systems:** a computer system (microprocessor + memory + I/O) built into another device, dedicated to one task, often with real-time constraints — washing machine, microwave, engine management unit, pacemaker, traffic light.

**Memory**

| | RAM | ROM |
|---|---|---|
| Volatile | Yes | No |
| Access | Read/write | Read-only (normally) |
| Holds | Running programs and data | Start-up/bootstrap, BIOS |

- **SRAM** — flip-flops, no refresh, fast, expensive, used for cache.
- **DRAM** — capacitor charge, must be constantly refreshed, cheaper and denser, used as main memory.
- **PROM** (write once), **EPROM** (UV erase), **EEPROM** (electrically eraseable, used for firmware/BIOS).

**Secondary storage:** magnetic HDD (cheap per GB, high capacity, mechanical so slower/damaged by shock), SSD (flash, fast, silent, low power, more expensive, limited write cycles), optical (CD/DVD/Blu-ray — cheap distribution, slow, low capacity).

**Virtual memory:** when RAM is full, pages not in use are swapped to disk. Prevents crash but is much slower; too much swapping is **disk thrashing**.

### 3.2 Logic gates and circuits

| Gate | Symbol | Output 1 when… | Expression |
|---|---|---|---|
| NOT | ▷o | input is 0 | X = ¬A |
| AND | D | both inputs 1 | X = A·B |
| OR | > | at least one input 1 | X = A+B |
| NAND | D o | not both inputs 1 | X = ¬(A·B) |
| NOR | > o | all inputs 0 | X = ¬(A+B) |
| XOR | =1 | inputs differ | X = A⊕B |

**Truth tables:** *n* inputs → **2ⁿ rows**. Always list inputs in binary counting order (00, 01, 10, 11).

**Karnaugh maps** simplify a Boolean expression into the fewest gates. Group 1s in blocks of 1, 2, 4, 8 (powers of two), groups may wrap around edges, and groups can overlap. Each group removes the variable that changes.

**Half adder** — adds two bits: Sum = A XOR B, Carry = A AND B.
**Full adder** — adds three bits including carry-in (two half adders plus an OR gate), used in ripple-carry binary addition.

**D-type flip-flop** — an edge-triggered 1-bit memory: on the clock edge the value at D appears at Q. Used for registers, counters and as a debounce/latch.

**SR latch** — built from two cross-coupled NOR/NAND gates; stores 1 bit, but for a short time both outputs can be 0 (invalid state), which is why the D-type is preferred.

> TRAP: When asked "draw the circuit", count the gates in the mark scheme — one mark is usually for each correctly placed gate, one for correct connections, one for inputs/output labelled.

---

## 4. Processor Fundamentals

### 4.1 CPU architecture

**Von Neumann:** one memory holds **both** instructions and data, connected by a single set of buses (the "Von Neumann bottleneck"). **Harvard:** separate instruction and data memories (used in embedded/DSP chips).

**Registers**

| Register | Purpose |
|---|---|
| PC (program counter) | Address of the **next** instruction |
| MAR (memory address register) | Holds the address currently being read/written |
| MDR (memory data register) | Holds the data just fetched / about to be written |
| CIR (current instruction register) | Holds the instruction being decoded/executed |
| ACC (accumulator) | Stores results of ALU operations |
| Status/flag register | Holds flags: zero, negative, carry, overflow |
| IX (index register) | Used in indexed addressing (arrays) |
| GPRs | General purpose registers for temporary data |

**Buses**

- **Address bus** — unidirectional, CPU → memory; width determines how many locations can be addressed (n bits → 2ⁿ).
- **Data bus** — bidirectional; width determines how many bits move at once (word length).
- **Control bus** — bidirectional; carries read/write signals, clock, interrupt requests.

**Fetch–Decode–Execute (FDE)**

1. **Fetch:** the address in the PC is copied to the MAR → the instruction is fetched from memory into the MDR → copied into the CIR → the PC is incremented.
2. **Decode:** the control unit decodes the opcode in the CIR and works out what to do.
3. **Execute:** control signals are sent; the ALU performs the operation, the result is stored in a register, and flags/memory may be updated.

**Register transfer notation** — learn the punctuation, it is worth whole marks:

| Notation | Meaning | Fetch step |
|---|---|---|
| `MAR ← [PC]` | contents of PC copied into MAR — an **address** moves | 1 |
| `PC ← [PC] + 1` | PC incremented, ready for the next instruction | 2 |
| `MDR ← [[MAR]]` | contents of the location **whose address is in the MAR** — double brackets | 3 |
| `CIR ← [MDR]` | the instruction copied into the CIR, ready to decode | 4 |
| `PC ← [PC] + 1 ; MDR ← [[MAR]]` | a **semicolon** = two transfers in the *same* clock cycle | — |

`[X]` always means *contents of* X. `[[MAR]]` therefore means *contents of the memory location pointed to by the MAR* — the double bracket is the step most candidates lose. Steps 2 and 3 are independent, so real hardware does them simultaneously, which is why they can be written on one line separated by `;`.

**Registers — the distinction the examiner tests every series**

| Register | Holds | Common wrong answer |
|---|---|---|
| PC | the **address** of the **next** instruction | "the current instruction" (that is the CIR) |
| MAR | the **address** currently being read or written | "the data" (that is the MDR) |
| MDR / MBR | the **data** read from or about to be written to memory | "the address" |
| CIR | the **instruction** being decoded/executed | "the address of the instruction" |
| SR | **flags** from the last ALU operation (carry, overflow, zero, sign) | "the status of the CPU" |

Memory aid: **MAR = address, MDR = data, PC = pointer to next, CIR = the instruction itself.**

**Interrupts**

- **Hardware interrupt** (device: key press, I/O complete, printer out of paper) or **software interrupt** (error, division by zero, service request).
- On interrupt the CPU finishes the current instruction, saves PC and register values to the **stack**, loads the address of the **ISR** from the interrupt vector table, runs the ISR, restores the registers and resumes.
- Interrupts have **priorities**; a higher priority can interrupt a lower-priority ISR.

**Performance factors — one mark each, and the *mechanism* is the mark**

| Factor | The explanation that scores | The answer that scores nothing |
|---|---|---|
| Higher clock speed | more clock cycles per second → more **F-E cycles** completed per second | "the CPU is faster" |
| Bigger cache | cache is faster than RAM; a **larger cache holds more** frequently used data/instructions, so fewer slow main-memory accesses | "cache is fast" |
| More cores | several instruction streams execute **in parallel** → higher throughput | "more cores = faster" (not true for non-parallel work) |
| Wider data bus | more bits transferred per cycle | "more memory" |
| Wider address bus | more **addressable locations** (2ⁿ) — capacity, not speed | "faster access" |
| Pipelining | fetch/decode/execute of different instructions overlap → throughput up | "queues instructions" |

**Bus direction — a classic trap**

- **Address bus: unidirectional** (CPU → memory). Nothing comes back on it.
- **Data bus: bidirectional** — data is both read and written.
- **Control bus:** individual lines are one-way, but the bus as a whole carries signals **both** ways (read/write out; interrupt request in). If asked "which bus is unidirectional", the answer is the **address bus**.

**Peripherals, ports and USB**

- A **port** is the interface/socket where a peripheral connects — the point where data enters or leaves the system. (In networking it is a numbered logical channel, e.g. 80.)
- **USB features worth two marks** (always *feature + why it helps*): **plug-and-play/hot-swap** (detected automatically, driver loaded, no reboot), **provides power** (no separate supply), **universal standard** (one connector across devices), **serial asynchronous transfer** (few wires, cheap, reliable), **backwards compatible**.
- **HDMI** carries **digital video *and* audio** on one cable. **VGA** is analogue **video only** — that contrast is the exam point.

**RISC vs CISC**

| RISC | CISC |
|---|---|
| Few, simple instructions | Many, complex instructions |
| One cycle per instruction (often) | Variable cycles |
| Fixed-length instructions | Variable-length |
| More registers, heavy pipelining | Fewer registers |
| Compiler does the work | Hardware does the work |
| Lower power — phones, embedded | Powerful desktops/servers |

**Pipelining:** while one instruction executes, the next is decoded and the next is fetched. Improves throughput; a branch/jump causes a **pipeline stall** (pipeline flush).

**Parallel processing (Flynn's taxonomy):** SISD (plain CPU), SIMD (GPU/vector — same instruction on many data items), MISD (rare/fault-tolerant), MIMD (multi-core, multi-processor).

**GPU vs CPU:** a GPU has thousands of simple cores optimised for the same operation on large data sets (graphics, ML); a CPU has few complex cores optimised for varied sequential tasks.

**Virtual machine:** software that emulates hardware, allowing one physical machine to run several operating systems. Used for testing, isolation, legacy software and servers consolidation; slower than native hardware.

### 4.2 Assembly language

Assembly is a **low-level** language with **mnemonics**; each instruction maps almost directly to one machine-code opcode, so it is translated by an **assembler**. It is used in embedded systems, device drivers and anything needing precise speed/control.

**9618 instruction set**

| Mnemonic | Meaning |
|---|---|
| `LDD <value>` | Load **immediate** value into ACC |
| `LDM <address>` | Load contents of memory address (**direct**) |
| `LDI <address>` | Load **indirect** (address of an address) |
| `LDX <address>` | Load **indexed** (address + IX) — arrays |
| `STO <address>` / `STA` | Store ACC into memory |
| `STX <address>` | Store ACC indexed |
| `ADD`, `SUB`, `MUL`, `DIV` | Arithmetic with the operand |
| `INC`, `DEC` | Add/subtract 1 |
| `AND`, `OR`, `XOR`, `NOT` | Bitwise logic |
| `SHL n`, `SHR n` | Logical shift left/right n places |
| `CMP` | Compare and set flags |
| `JPE`, `JPN`, `JPZ`, `JMP` | Jump if flag set / unconditional |
| `NOP` | No operation |

**Addressing modes**

- **Immediate** — the operand *is* the value: `LDD 20`.
- **Direct/absolute** — the operand is the memory address of the value: `LDM 300`.
- **Indirect** — the operand is the address of a pointer: `LDI 300` reads 300 to find the real address.
- **Indexed** — effective address = operand + IX: `LDX 300`, used to walk arrays.

### 4.3 Bit manipulation

Bitwise operations act on individual bits:

- **AND** with a mask → **test/clear** bits (mask `0000 1111` keeps the low nibble).
- **OR** with a mask → **set** bits.
- **XOR** with a mask → **toggle/invert** selected bits; XOR with all 1s = NOT.
- **Shifts:** left by n = ×2ⁿ; right by n = ÷2ⁿ (integer division).

Uses: colour channels, permission flags, compression, encryption, device control registers, packing many booleans into one byte.

---

## 5. System Software

### 5.1 Operating systems

An OS manages hardware and provides an interface for the user and applications. Functions:

- **Process/thread management** — allocation of CPU time, scheduling.
- **Memory management** — paging, virtual memory, protection between processes.
- **File management** — directories, access rights, allocation of disk space.
- **I/O and device drivers** — communication with peripherals.
- **Security** — user accounts, passwords, permissions, audit logs.
- **Interrupt handling** and error reporting.
- Providing a **user interface** (GUI/CLI) and a **platform** for applications (APIs, libraries).

**Process states:** running → ready → blocked/waiting, with a **scheduler** choosing which ready process runs. Scheduling aims for fairness, maximum throughput, minimum waiting time and response time. **Threads** share a process's memory; **processes** are isolated.

**Utilities:** backup, defragmentation (magnetic only — never an SSD), virus checker, disk clean-up, compression, encryption tools, task manager, format, disk repair, screensaver/lock.

**BIOS/firmware:** stored in ROM/EEPROM, runs the **bootstrap/POST** at power-on to test hardware and load the OS.

### 5.2 Language translators

| | Compiler | Interpreter | Assembler |
|---|---|---|---|
| Input | High-level source | High-level source | Assembly |
| Output | Executable machine code | No file — executes line by line | Object/machine code |
| Speed of run | Fast | Slow | Fast |
| Errors | All reported after compiling (no run) | Stops at the first error at run time | Reports syntax errors |
| Example use | Distribution | Development, scripting | Embedded systems |

**Stages of compilation:** lexical analysis (tokenising, symbol table) → syntax analysis (parse tree, syntax errors) → semantic analysis (type/scope checks, semantic errors) → code generation → optimisation.

**Linker** joins the object code with libraries into one executable; a **loader** loads it into memory at run time; a **DLL** is a library linked when the program runs (saves memory, allows updates, but a missing DLL stops the program).

**IDE features:** source editor with syntax highlighting/auto-complete, compiler/interpreter, debugger with **breakpoints**, single-stepping, watch variables, variable inspection, error diagnostics, auto-indent/pretty-printing.

> TIP: "State two features of an IDE" answers must name the feature **and** what it does for the programmer (e.g. "breakpoints let execution pause so variable values can be inspected").

---

## 6. Security, Privacy and Data Integrity

- **Data security** — protecting data from unauthorised access, modification or destruction.
- **Data integrity** — the data is accurate, consistent and complete, and has not been accidentally or maliciously altered.
- **Data privacy** — the right of individuals to control who holds and sees their personal data.

**Threats:** malware (virus, worm, trojan, spyware, keylogger, ransomware, adware, botnet), phishing/vishing/smishing, **pharming** (DNS poisoning redirects to a fake site), pharming, social engineering, brute-force attack, DoS/DDoS, man-in-the-middle interception, SQL injection, physical theft, human error, natural disasters.

**Prevention and protection**

- **Authentication:** usernames/passwords, strong password policy, **two-factor/multi-factor**, biometrics (fingerprint, iris, face — cannot be forgotten but cannot be changed if copied), CAPTCHA.
- **Firewall:** filters incoming/outgoing traffic by rules (IP, port, protocol); a **proxy server** sits between LAN and internet, filters requests and caches pages.
- **Encryption:** data is scrambled with a key; **symmetric** (same key) is fast, **asymmetric/public–private key** solves key exchange, **digital certificate/TLS** authenticates a website.
- **Anti-malware**, patching, access rights/levels, audit logs, physical security, backup (off-site/cloud, regular, tested), **VPN** (encrypted tunnel), spam filters.
- **Validation** checks the data on entry is reasonable; **verification** checks the data has been transferred/copied correctly.

**Validation checks:** range, length, format, presence, fixed value/lookup, type, consistency, **check digit** (one digit calculated from the others — catches typos).

**Verification:** double entry, visual check, parity (odd/even parity bit — detects single-bit errors), checksum (sum of bytes compared), echo check, hashing comparison, proofreading.

> TRAP: A **parity check only detects an odd number of bit errors** and cannot correct them; it is used on data transmission, not as validation of input.

---

## 7. Ethics and Ownership

**Ethics** are the moral principles guiding behaviour; **codes of conduct** (e.g. BCS) set out professional standards: competence, integrity, confidentiality, avoiding harm, no misuse of data.

**Intellectual property** is a product of the mind that is protected by law:

| Protection | What it covers | Duration/examples |
|---|---|---|
| **Copyright** | Literary, artistic, musical and software works — automatic, no registration | Life + 70 years typically; covers source/object code |
| **Patent** | New inventions and processes — must be applied for and published | ~20 years; protects the *idea* |
| **Trademark** | Brand names, logos, slogans | Renewable |
| **Design right** | Appearance of a product | Ten years |

**Software licences:** **proprietary/commercial** (closed, paid, restricted copying), **free and open source (FOSS)** (source available, may be modified/redistributed subject to the licence — GPL, Apache), **freeware** (free but closed source), **shareware** (try-then-pay), **embedded licence**.

**Ethical issues to discuss in questions:** automation and job losses, AI decisions and bias/accountability, collecting and mining personal data, surveillance and privacy, the **digital divide**, e-waste and the environmental impact of hardware manufacture, hacktivism versus whistle-blowing, use of social media data.

**Data protection principles (typical):** data is collected for a lawful purpose, kept accurate, not kept longer than needed, adequately protected, not transferred without consent, and the individual has the right to see and correct it. **Cookies** store preferences/sessions and enable tracking.

---

## 8. Databases

**Concepts:** a database stores organised data. A **DBMS** manages it: defines the schema, provides queries/views, controls concurrent access, enforces security and integrity, backs up and recovers, and hides the physical storage (**data independence**).

**Relational model**

- **Entity** → table; **attribute** → field/column; **record** → row/tuple.
- **Primary key** — uniquely identifies each record (cannot be null).
- **Foreign key** — an attribute in one table equal to the primary key of another table; enforces **referential integrity**.
- **Index** — a lookup structure on a field that speeds up searching (adds storage and update cost).
- **Flat file** problems: data redundancy, inconsistency (an update must be made in many places), insertion/deletion/update anomalies, wasted storage, no enforced relationships.

**Normalisation**

1. **1NF:** remove repeating groups — every cell holds a single atomic value, with a primary key.
2. **2NF:** 1NF **and** no partial dependency — every non-key attribute depends on the **whole** primary key (fixes issues with composite keys).
3. **3NF:** 2NF **and** no non-key attribute depends on another non-key attribute — remove transitive dependencies.

**SQL (DDL vs DML)**

```sql
-- DDL: define structures
CREATE TABLE Student (
    StudentID  INTEGER PRIMARY KEY,
    Name       VARCHAR(50) NOT NULL,
    ClassID    INTEGER,
    FOREIGN KEY (ClassID) REFERENCES Class(ClassID)
);
ALTER TABLE Student ADD DateOfBirth DATE;
DROP TABLE Student;

-- DML: manipulate data
INSERT INTO Student (StudentID, Name, ClassID) VALUES (101, 'Ariun', 3);
SELECT Name, ClassID FROM Student WHERE ClassID = 3 ORDER BY Name ASC;
SELECT COUNT(*) FROM Student;
SELECT Student.Name, Class.CName FROM Student, Class
    WHERE Student.ClassID = Class.ClassID;
UPDATE Student SET Name = 'Bataa' WHERE StudentID = 101;
DELETE FROM Student WHERE StudentID = 101;
```

**String/date functions in SQL** used by 9618: `UCASE`, `LCASE`, `ROUND`, `LENGTH`, `MID`, `DAY`, `MONTH`, `YEAR`, `SUM`, `AVG`, `MAX`, `MIN`, `COUNT`, `GROUP BY`, `HAVING`, `LIKE`, `BETWEEN`.

**Database protection and integrity:** access rights, authentication, encryption, views that hide sensitive fields, **journaling/transaction logs** and **commit points** so an interrupted transaction can be rolled back, regular backups, and referential integrity constraints.

> TRAP: In 3NF questions, stopping at 2NF is a common error. Always ask "does a non-key attribute depend on a non-key attribute?" and if so, split the table.

---

## Rapid-recall: definitions Paper 1 loves

| Term | Answer |
|---|---|
| Buffer | Temporary storage between devices of different speeds |
| Embedded system | Computer built into a device, dedicated to one task |
| Pipelining | A second instruction is fetched while the first is decoded/executed |
| RISC | Few simple fixed-length instructions, one cycle each, more registers |
| Interrupt | Signal to the CPU to stop the current program temporarily and run an ISR |
| Register | Very fast storage location inside the CPU |
| Cache | Fast memory holding frequently used data/instructions |
| Virtual memory | Pages of RAM swapped to disk when RAM is full |
| Compiler | Translates the whole program to machine code at once, producing an executable |
| Interpreter | Translates and executes, line by line, at run time |
| Validation | Checks data is sensible/allowed |
| Verification | Checks data has been copied/transferred correctly |
| Lossy | Data permanently removed, original cannot be restored |
| Overflow | Result needs more bits than are available |
| Normalisation | Progressive removal of redundancy/anomalies (1NF→2NF→3NF) |
