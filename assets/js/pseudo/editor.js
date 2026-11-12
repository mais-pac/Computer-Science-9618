(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  let machine=null, timer=null;
  function pause() { if (timer !== null) clearTimeout(timer); timer=null; }
  function reset() { pause(); machine=null; $('variables').textContent='—'; $('output').textContent='—'; $('trace').replaceChildren(); $('status').textContent='Ready'; }
  function init() { if (!machine) machine=new PseudoEngine.Machine($('source').value, $('inputs').value ? $('inputs').value.split(/\r?\n/) : []); }
  function render() {
    $('variables').textContent=Object.entries(machine.vars).map(([k,v])=>k+' = '+(v===null?'uninitialised':JSON.stringify(v))).join('\n') || '—';
    $('output').textContent=machine.output.join('\n') || '—';
    const last=machine.trace[machine.trace.length-1];
    if (last) { const row=document.createElement('tr'); [machine.trace.length,last.line,JSON.stringify(last.vars)].forEach(v=>{ const cell=document.createElement('td'); cell.textContent=v; row.appendChild(cell); }); $('trace').appendChild(row); }
    $('status').textContent=machine.pc >= machine.code.length ? 'Finished' : 'Next: line '+machine.code[machine.pc].line;
  }
  function step() { try { init(); if (machine.step()) render(); else { $('status').textContent='Finished'; pause(); } } catch(e) { pause(); $('status').textContent=e.message; } }
  function run() { if (timer!==null) return; function tick() { timer=null; step(); if (machine && machine.pc < machine.code.length && !$('status').textContent.startsWith('Line ')) timer=setTimeout(tick,Number($('speed').value)); } tick(); }
  $('run').onclick=run; $('step').onclick=()=>{pause(); step();}; $('pause').onclick=()=>{pause(); $('status').textContent='Paused';}; $('reset').onclick=reset;
  $('source').addEventListener('input',reset); $('inputs').addEventListener('input',reset);
})();
