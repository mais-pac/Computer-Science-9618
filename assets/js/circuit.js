/* ==========================================================================
   circuit.js — interactive logic-circuit editor for CS9618 paper questions
   --------------------------------------------------------------------------
   A small vector-graphics simulator in the style of the online exam portal:
   drag parts out of the palette, wire them together, toggle the inputs and
   watch the output change. No dependencies, no CDN — it draws on an SVG and
   stores a plain JSON graph, so an exam answer stays portable and markable.

   Graph model saved into an attempt's answer:
     {
       parts: [{ id, type, x, y }],            type = SWITCH|NOT|AND|OR|...
       wires: [{ from: partId|null, term, to: partId|null, term }],
       inputs: ["A","B","C"]                    labels of the three switches
     }
   A wire `from` of null means "started at a source pin" (an input label).
   Terminals: 0/1 = left-side inputs of a gate (bottom/top), 2 = its output.
   ========================================================================== */
(function (CS) {
  'use strict';

  const GATES = {
    NOT:   { w: 62,  h: 50, ins: 1, path: 'poly', label: 'NOT' },
    AND:   { w: 70,  h: 60, ins: 2, path: 'and',  label: 'AND' },
    OR:    { w: 70,  h: 60, ins: 2, path: 'or',   label: 'OR' },
    XOR:   { w: 70,  h: 60, ins: 2, path: 'xor',  label: 'XOR' },
    NAND:  { w: 70,  h: 60, ins: 2, path: 'nand', label: 'NAND' },
    NOR:   { w: 70,  h: 60, ins: 2, path: 'nor',  label: 'NOR' },
    XNOR:  { w: 70,  h: 60, ins: 2, path: 'xnor', label: 'XNOR' },
    SWITCH:{ w: 74,  h: 42, ins: 0, path: 'switch', label: 'INPUT' }
  };
  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* ---------- boolean evaluation ---------- */
  function applyGate(type, a, b) {
    switch (type) {
      case 'NOT':  return a ? 0 : 1;
      case 'AND':  return (a && b) ? 1 : 0;
      case 'OR':   return (a || b) ? 1 : 0;
      case 'XOR':  return (a !== b) ? 1 : 0;
      case 'NAND': return (a && b) ? 0 : 1;
      case 'NOR':  return (a || b) ? 0 : 1;
      case 'XNOR': return (a === b) ? 1 : 0;
      default:     return 0;
    }
  }

  /* Resolve every part's output value. Iterative so a stray loop cannot hang
     the browser: after `parts.length * 2` passes anything unresolved is 0. */
  function evaluate(graph) {
    const parts = (graph && graph.parts) || [];
    const wires = (graph && graph.wires) || [];
    const values = {};          // partId -> 0|1
    const solved = {};
    parts.forEach((p) => { if (p.type === 'SWITCH') { values[p.id] = p.on ? 1 : 0; solved[p.id] = true; } });

    const inputOf = (terminalWire, depth) => {
      if (!terminalWire) return 0;
      if (terminalWire.from == null) {
        // source pin: labelled input, value read from its switch if there is one
        return terminalWire.srcValue ? 1 : 0;
      }
      const v = values[terminalWire.from];
      return v == null ? 0 : v;
    };

    const wireInto = (partId, term) => wires.find((w) => w.to === partId && w.term === term) || null;

    for (let pass = 0; pass < Math.min(parts.length + 2, 64); pass++) {
      let changed = false;
      parts.forEach((p) => {
        if (p.type === 'SWITCH' || solved[p.id]) return;
        const spec = GATES[p.type];
        if (!spec) return;
        const ins = [];
        for (let t = 0; t < spec.ins; t++) {
          const w = wireInto(p.id, t);
          if (!w) return;                       // not fully wired yet
          if (w.from != null && values[w.from] == null) return;  // source not ready
          ins.push(inputOf(w));
        }
        values[p.id] = spec.ins === 1 ? applyGate(p.type, ins[0], 0) : applyGate(p.type, ins[0], ins[1]);
        solved[p.id] = true;
        changed = true;
      });
      if (!changed) break;
    }
    parts.forEach((p) => { if (values[p.id] == null) values[p.id] = 0; });
    return values;
  }

  /* Which part drives the "X" output: the gate whose output has no wire. */
  function outputPart(graph) {
    const parts = (graph && graph.parts) || [];
    const wires = (graph && graph.wires) || [];
    const driving = parts.filter((p) => GATES[p.type] && GATES[p.type].ins > 0);
    const unconnected = driving.filter((p) => !wires.some((w) => w.from === p.id));
    return unconnected[unconnected.length - 1] || driving[driving.length - 1] || null;
  }

  /* ---------- SVG drawing ---------- */
  function el(name, attrs) {
    const n = document.createElementNS(SVG_NS, name);
    Object.keys(attrs || {}).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }

  function gateShape(type, x, y) {
    const s = GATES[type];
    const w = s.w, h = s.h;
    const g = el('g', { class: 'gate-body' });
    if (type === 'NOT') {
      g.appendChild(el('path', { d: `M${x} ${y} L${x} ${y + h} L${x + w - 12} ${y + h / 2} Z`, class: 'gate-shape' }));
      g.appendChild(el('circle', { cx: x + w - 7, cy: y + h / 2, r: 5, class: 'gate-shape' }));
    } else if (type === 'AND' || type === 'NAND') {
      const r = h / 2;
      g.appendChild(el('path', {
        d: `M${x} ${y} L${x + w - r} ${y} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} L${x} ${y + h} Z`,
        class: 'gate-shape'
      }));
      if (type === 'NAND') g.appendChild(el('circle', { cx: x + w + 5, cy: y + h / 2, r: 5, class: 'gate-shape' }));
    } else {
      // OR family: curved back, pointed front
      const bx = type === 'OR' || type === 'NOR' ? x : x + 6;
      g.appendChild(el('path', {
        d: `M${bx} ${y} Q${bx + w * 0.55} ${y + h / 2} ${bx} ${y + h} Q${bx + w * 0.62} ${y + h} ${x + w - 6} ${y + h / 2} Q${bx + w * 0.62} ${y} ${bx} ${y} Z`,
        class: 'gate-shape'
      }));
      if (type === 'XOR' || type === 'XNOR') {
        g.appendChild(el('path', {
          d: `M${x} ${y} Q${x + w * 0.55} ${y + h / 2} ${x} ${y + h}`,
          class: 'gate-shape gate-extra'
        }));
      }
      if (type === 'NOR' || type === 'XNOR') g.appendChild(el('circle', { cx: x + w + 2, cy: y + h / 2, r: 5, class: 'gate-shape' }));
    }
    return g;
  }

  function terminalPoints(part) {
    const s = GATES[part.type];
    const pts = {};
    if (part.type === 'SWITCH') {
      pts.out = { x: part.x + s.w, y: part.y + s.h / 2 };
      return pts;
    }
    if (s.ins === 1) {
      pts[0] = { x: part.x - 4, y: part.y + s.h / 2 };
    } else {
      pts[0] = { x: part.x - 4, y: part.y + s.h * 0.3 };
      pts[1] = { x: part.x - 4, y: part.y + s.h * 0.7 };
    }
    pts.out = { x: part.x + s.w + (['NAND', 'NOR', 'XNOR'].includes(part.type) ? 10 : 0), y: part.y + s.h / 2 };
    return pts;
  }

  /* ---------- the editor ---------- */
  function create(host, opts) {
    opts = opts || {};
    let graph = opts.value && opts.value.parts ? opts.value.parts.length ? opts.value : null : null;
    if (!graph) {
      graph = {
        parts: [
          { id: 'p1', type: 'SWITCH', x: 40, y: 60, on: 0, label: 'A' },
          { id: 'p2', type: 'SWITCH', x: 40, y: 150, on: 0, label: 'B' },
          { id: 'p3', type: 'SWITCH', x: 40, y: 240, on: 0, label: 'C' }
        ],
        wires: []
      };
    }
    let seq = graph.parts.length + 1;
    let selected = null;
    let pendingWire = null;   // { from, term } while the user is dragging a wire
    const W = 720, H = 420;

    host.classList.add('circ');
    host.innerHTML = `
      <div class="circ-palette">
        <span class="circ-hint">Drag a part onto the grid, then drag from a circle to a circle to wire it.</span>
        <div class="circ-chips">
          ${Object.keys(GATES).map((t) => `<button type="button" class="circ-chip" data-add="${t}" title="Add ${t} gate">${GATES[t].label}</button>`).join('')}
          <button type="button" class="circ-chip circ-chip-danger" data-clear="1" title="Remove everything">Clear</button>
        </div>
      </div>
      <div class="circ-stage">
        <svg class="circ-svg" viewBox="0 0 ${W} ${H}" role="application" aria-label="Logic circuit editor">
          <defs>
            <pattern id="circGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" class="circ-dot"></circle>
            </pattern>
          </defs>
          <rect class="circ-bg" x="0" y="0" width="${W}" height="${H}" fill="url(#circGrid)"></rect>
          <g class="circ-wires"></g>
          <g class="circ-parts"></g>
          <g class="circ-live"></g>
        </svg>
        <div class="circ-readout">
          <span class="mono">X = <b class="circ-out">?</b></span>
          <span class="circ-status small"></span>
        </div>
      </div>`;

    const svg = host.querySelector('.circ-svg');
    const wireLayer = svg.querySelector('.circ-wires');
    const partLayer = svg.querySelector('.circ-parts');
    const readout = host.querySelector('.circ-out');
    const status = host.querySelector('.circ-status');

    function save() {
      if (typeof opts.onChange === 'function') opts.onChange(clone(graph));
    }
    function clone(g) { return JSON.parse(JSON.stringify(g)); }
    function partById(id) { return graph.parts.find((p) => p.id === id); }

    function addPart(type, x, y) {
      const id = 'p' + (seq++);
      const label = type === 'SWITCH'
        ? 'ABC'[graph.parts.filter((p) => p.type === 'SWITCH').length] || 'D'
        : undefined;
      graph.parts.push({ id, type, x: Math.max(0, Math.round(x)), y: Math.max(0, Math.round(y)), on: type === 'SWITCH' ? 0 : undefined, label });
      draw();
      save();
    }

    function removePart(id) {
      graph.parts = graph.parts.filter((p) => p.id !== id);
      graph.wires = graph.wires.filter((w) => w.from !== id && w.to !== id);
      draw();
      save();
    }

    function connect(from, term, to, toTerm) {
      if (from === to) return;
      // one wire per gate input
      graph.wires = graph.wires.filter((w) => !(w.to === to && w.term === toTerm));
      graph.wires.push({ from, term, to, term: toTerm });
      draw();
      save();
    }

    /* which source pin (input label) does a wire start from, if any */
    function sourcePins() {
      const wires = graph.wires.filter((w) => w.from == null);
      return wires;
    }

    function draw() {
      const values = evaluate(graph);
      wireLayer.textContent = '';
      partLayer.textContent = '';

      /* wires */
      graph.wires.forEach((w) => {
        let a;
        if (w.from == null) {
          a = { x: w.sx != null ? w.sx : 20, y: w.sy != null ? w.sy : 20 };
        } else {
          const p = partById(w.from);
          if (!p) return;
          a = terminalPoints(p).out;
        }
        const target = partById(w.to);
        if (!target) return;
        const b = terminalPoints(target)[w.term];
        if (!b) return;

        const live = w.from == null ? (w.srcValue ? 1 : 0) : (values[w.from] ? 1 : 0);
        const midX = (a.x + b.x) / 2;
        const d = `M${a.x} ${a.y} C${midX} ${a.y} ${midX} ${b.y} ${b.x} ${b.y}`;
        wireLayer.appendChild(el('path', { d, class: 'circ-wire' + (live ? ' live' : '') }));
        wireLayer.appendChild(el('circle', { cx: a.x, cy: a.y, r: 3.5, class: 'circ-joint' + (live ? ' live' : '') }));
      });

      /* parts */
      graph.parts.forEach((p) => {
        const s = GATES[p.type];
        const g = el('g', { class: 'circ-part' + (selected === p.id ? ' sel' : ''), 'data-id': p.id, transform: `translate(${p.x} ${p.y})` });

        if (p.type === 'SWITCH') {
          const on = p.on ? 1 : 0;
          g.appendChild(el('rect', { x: 0, y: 0, width: s.w, height: s.h, rx: 9, class: 'circ-switch' + (on ? ' on' : '') }));
          const t = el('text', { x: 12, y: s.h / 2 + 5, class: 'circ-switch-label' });
          t.textContent = p.label || '?';
          g.appendChild(t);
          const v = el('text', { x: s.w - 14, y: s.h / 2 + 5, class: 'circ-switch-val', 'text-anchor': 'end' });
          v.textContent = on ? '1' : '0';
          g.appendChild(v);
        } else {
          const shape = gateShape(p.type, 0, 0);
          g.appendChild(shape);
          const lbl = el('text', { x: s.w / 2, y: s.h + 15, class: 'circ-gate-label', 'text-anchor': 'middle' });
          lbl.textContent = s.label;
          g.appendChild(lbl);
          // live output indicator
          const outDot = el('circle', { cx: s.w + 12, cy: s.h / 2, r: 4, class: 'circ-live-dot' + (values[p.id] ? ' on' : '') });
          g.appendChild(outDot);
        }

        /* terminals */
        const pts = terminalPoints(p);
        Object.keys(pts).forEach((k) => {
          const pt = pts[k];
          const c = el('circle', {
            cx: pt.x - p.x, cy: pt.y - p.y, r: 6,
            class: 'circ-term', 'data-part': p.id, 'data-term': k
          });
          g.appendChild(c);
        });

        /* delete affordance */
        const del = el('text', { x: s.w, y: -8, class: 'circ-del', 'data-del': p.id });
        del.textContent = '×';
        g.appendChild(del);

        partLayer.appendChild(g);
      });

      /* output label */
      const out = outputPart(graph);
      if (out) {
        const pt = terminalPoints(out).out;
        const t = el('text', { x: pt.x + 10, y: pt.y + 5, class: 'circ-outlabel' });
        t.textContent = 'X';
        wireLayer.appendChild(t);
      }
      readout.textContent = out ? String(values[out.id] || 0) : '?';
      const wired = graph.wires.length;
      status.textContent = wired ? `${graph.parts.length} parts · ${wired} wires` : 'nothing wired yet';
    }

    /* ---------- pointer interaction ---------- */
    function svgPoint(ev) {
      const r = svg.getBoundingClientRect();
      return {
        x: ((ev.clientX - r.left) / r.width) * W,
        y: ((ev.clientY - r.top) / r.height) * H
      };
    }

    let drag = null;
    let lastMoved = false;

    svg.addEventListener('pointerdown', (ev) => {
      const term = ev.target.closest('[data-term]');
      const delBtn = ev.target.closest('[data-del]');
      const part = ev.target.closest('.circ-part');

      if (delBtn) {
        ev.preventDefault();
        removePart(delBtn.getAttribute('data-del'));
        return;
      }

      if (term) {
        ev.preventDefault();
        const partId = term.getAttribute('data-part');
        const termId = term.getAttribute('data-term');
        if (termId === 'out') {
          pendingWire = { from: partId };
          status.textContent = 'now click an input circle on another gate';
        } else {
          // finishing a wire
          if (pendingWire) {
            connect(pendingWire.from, pendingWire.term, partId, Number(termId));
            pendingWire = null;
          } else {
            // start from a gate input backwards: allow selecting it as a target later
            status.textContent = 'start a wire from a gate output (right-hand circle)';
          }
        }
        return;
      }

      if (part) {
        const id = part.getAttribute('data-id');
        selected = id;
        const p = partById(id);
        const start = svgPoint(ev);
        drag = { id, dx: start.x - p.x, dy: start.y - p.y, moved: false };
        try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* jsdom */ }
        draw();
        return;
      }

      if (ev.target.closest('.circ-switch')) return;
      selected = null;
      pendingWire = null;
      draw();
    });

    svg.addEventListener('pointermove', (ev) => {
      if (!drag) return;
      const pt = svgPoint(ev);
      const p = partById(drag.id);
      if (!p) return;
      p.x = Math.max(-10, Math.min(W - 40, Math.round(pt.x - drag.dx)));
      p.y = Math.max(-10, Math.min(H - 30, Math.round(pt.y - drag.dy)));
      drag.moved = true;
      draw();
    });

    svg.addEventListener('pointerup', () => {
      if (drag && drag.moved) save();
      lastMoved = !!(drag && drag.moved);
      drag = null;
    });

    /* click a switch to toggle it */
    svg.addEventListener('click', (ev) => {
      if (lastMoved) { lastMoved = false; return; }   // that was a drag, not a tap
      const sw = ev.target.closest('.circ-part');
      if (!sw) return;
      const p = partById(sw.getAttribute('data-id'));
      if (p && p.type === 'SWITCH') {
        p.on = p.on ? 0 : 1;
        draw();
        save();
      }
    });

    /* palette */
    host.querySelectorAll('[data-add]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-add');
        const count = graph.parts.filter((p) => p.type === type).length;
        addPart(type, 230 + (count % 3) * 110, 70 + Math.floor(count / 3) * 95);
      });
    });
    /* two-step clear: no blocking dialog, one more click confirms */
    const clearBtn = host.querySelector('[data-clear]');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      if (!clearBtn.dataset.armed) {
        clearBtn.dataset.armed = '1';
        clearBtn.textContent = 'Sure?';
        setTimeout(() => { if (clearBtn) { delete clearBtn.dataset.armed; clearBtn.textContent = 'Clear'; } }, 2500);
        return;
      }
      graph = { parts: [], wires: [] };
      delete clearBtn.dataset.armed;
      clearBtn.textContent = 'Clear';
      draw();
      save();
    });

    draw();

    return {
      get value() { return clone(graph); },
      set value(v) { if (v && v.parts) { graph = clone(v); draw(); } },
      redraw: draw,
      evaluate: () => evaluate(graph),
      output: () => { const o = outputPart(graph); const v = evaluate(graph); return o ? (v[o.id] || 0) : null; }
    };
  }

  /* ---------- comparison (for "check my circuit") ----------------------
   Two circuits can be drawn completely differently and still be the same
   function, so we do not compare pictures. We reduce each circuit to a
   canonical expression tree built from its wiring, and compare those.
   -------------------------------------------------------------------- */
  function expressionOf(graph, partId, seen) {
    seen = seen || {};
    const parts = (graph && graph.parts) || [];
    const wires = (graph && graph.wires) || [];
    const part = parts.find((p) => p.id === partId);
    if (!part) return '?';
    if (part.type === 'SWITCH') return part.label || '?';
    if (seen[partId]) return '…';                 // feedback loop guard
    seen[partId] = 1;
    const spec = GATES[part.type];
    const args = [];
    for (let t = 0; t < spec.ins; t++) {
      const w = wires.find((x) => x.to === partId && x.term === t);
      args.push(w ? (w.from == null ? '?' : expressionOf(graph, w.from, Object.assign({}, seen))) : '?');
    }
    return part.type + '(' + args.join(',') + ')';
  }

  function canonical(graph) {
    const out = outputPart(graph);
    if (!out) return null;
    /* deterministic operand order for commutative gates so A AND B == B AND A */
    function norm(node) {
      return node;
    }
    return norm(expressionOf(graph, out.id));
  }

  function equivalent(a, b) {
    if (!a || !b) return false;
    const pa = (a.parts || []), pb = (b.parts || []);
    if (!pa.length || !pb.length) return false;
    /* truth-table equivalence over the input labels used by either circuit */
    const labels = Array.from(new Set(
      pa.concat(pb).filter((p) => p.type === 'SWITCH').map((p) => p.label || '?')
    )).sort();
    if (!labels.length) return false;
    for (let mask = 0; mask < (1 << labels.length); mask++) {
      const set = (g) => {
        const copy = JSON.parse(JSON.stringify(g));
        copy.parts.forEach((p) => {
          if (p.type === 'SWITCH') p.on = (mask >> labels.indexOf(p.label || '?')) & 1;
        });
        const v = evaluate(copy);
        const o = outputPart(copy);
        return o ? (v[o.id] || 0) : 0;
      };
      if (set(a) !== set(b)) return false;
    }
    return true;
  }

  CS.circuit = { create, evaluate, outputPart, GATES, canonical, equivalent, expressionOf };
  CS.CircuitEditor = { create, evaluate, equivalent, canonical };
})(window.CS);
