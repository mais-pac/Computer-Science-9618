const assert = require('assert');
require('../assets/js/pseudo/engine.js');
const {Machine} = globalThis.PseudoEngine;
function run(src, input=[]) { const m=new Machine(src,input); while(m.step()); return m; }
const m=run('DECLARE X : INTEGER\nX ← 0\nWHILE X < 3 DO\nX ← X + 1\nENDWHILE\nIF X = 3 THEN\nOUTPUT X\nELSE\nOUTPUT 0\nENDIF');
assert.deepStrictEqual(m.output,['3']); assert.strictEqual(m.trace.length,15);
assert.deepStrictEqual(run('DECLARE A : INTEGER\nINPUT A\nOUTPUT A DIV 2',['8']).output,['4']);
assert.deepStrictEqual(run('DECLARE S : STRING\nS ← "hi // there" & "!"\nOUTPUT S').output,['hi // there!']);
assert.throws(()=>run('OUTPUT 1 / 0'),/Line 1: Division by zero/);
assert.throws(()=>run('WHILE TRUE DO\nENDWHILE'),/instruction limit/);
assert.throws(()=>new Machine('IF TRUE THEN\nOUTPUT 1'),/missing end/);
assert.throws(()=>run('OUTPUT window.alert(1)'),/Line 1:/);
console.log('Pseudocode tests passed');
