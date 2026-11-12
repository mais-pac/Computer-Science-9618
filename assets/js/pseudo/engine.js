/* A deliberately small, bounded Cambridge-style interpreter. No JavaScript evaluation. */
(function (root) {
  'use strict';
  function expression(text, vars) {
    const tokens = []; let i = 0;
    while (i < text.length) {
      if (/\s/.test(text[i])) { i++; continue; }
      const part = text.slice(i);
      const m = part.match(/^(?:\d+(?:\.\d+)?|"(?:[^"\\]|\\.)*"|[A-Za-z_][A-Za-z_0-9]*|<=|>=|<>|[()+\-*/&=<>])/);
      if (!m) throw Error('Unexpected character in expression: ' + text[i]);
      tokens.push(m[0]); i += m[0].length;
    }
    let p = 0;
    const prec = { OR:1, AND:2, '=':3, '<>':3, '<':3, '>':3, '<=':3, '>=':3, '&':4, '+':4, '-':4, '*':5, '/':5, DIV:5, MOD:5 };
    function primary() {
      const t = tokens[p++]; if (!t) throw Error('Expected an expression');
      const u = t.toUpperCase();
      if (t === '(') { const v = parse(0); if (tokens[p++] !== ')') throw Error('Expected )'); return v; }
      if (t === '-') { const v = primary(); if (typeof v !== 'number') throw Error('Expected a number'); return -v; }
      if (u === 'NOT') return !primary();
      if (/^\d/.test(t)) return Number(t);
      if (t[0] === '"') { try { return JSON.parse(t); } catch (_) { throw Error('Invalid string'); } }
      if (u === 'TRUE') return true; if (u === 'FALSE') return false;
      if (!Object.prototype.hasOwnProperty.call(vars, u)) throw Error('Variable ' + t + ' is not declared');
      if (vars[u] === null) throw Error('Variable ' + t + ' has no value');
      return vars[u];
    }
    function parse(min) {
      let a = primary();
      while (p < tokens.length) {
        const op = tokens[p].toUpperCase(), level = prec[op]; if (!level || level < min) break;
        p++; const b = parse(level + 1);
        if (['+','-','*','/','DIV','MOD'].includes(op) && (typeof a !== 'number' || typeof b !== 'number')) throw Error('Arithmetic requires numbers');
        if (['/','DIV','MOD'].includes(op) && b === 0) throw Error('Division by zero');
        switch(op) { case '+': a+=b; break; case '-': a-=b; break; case '*': a*=b; break; case '/': a/=b; break; case 'DIV': a=Math.trunc(a/b); break; case 'MOD': a%=b; break; case '&': a=String(a)+String(b); break; case '=': a=a===b; break; case '<>': a=a!==b; break; case '<': a=a<b; break; case '>': a=a>b; break; case '<=': a=a<=b; break; case '>=': a=a>=b; break; case 'AND': a=Boolean(a&&b); break; case 'OR': a=Boolean(a||b); break; }
      } return a;
    }
    const result = parse(0); if (p !== tokens.length) throw Error('Unexpected token ' + tokens[p]); return result;
  }
  function compile(source) {
    const code = [], stack = [];
    source.split(/\r?\n/).forEach((raw, index) => {
      // Strip comments only outside quoted strings.
      const line = raw.replace(/("(?:[^"\\]|\\.)*")|\/\/.*$/g, (m, str) => str || '').trim();
      if (!line) return;
      const n = index+1; let m, ins;
      function add(op, extra) { code.push(Object.assign({op, line:n}, extra)); return code.length-1; }
      function top(type) { const b=stack[stack.length-1]; if (!b || b.type!==type) throw Error('Line '+n+': unexpected '+line); return b; }
      if ((m=line.match(/^DECLARE\s+([A-Za-z_]\w*)\s*:\s*(INTEGER|REAL|STRING|CHAR|BOOLEAN)$/i))) add('declare',{name:m[1].toUpperCase(),type:m[2].toUpperCase()});
      else if ((m=line.match(/^([A-Za-z_]\w*)\s*(?:←|<-)\s*(.+)$/i))) add('assign',{name:m[1].toUpperCase(),expr:m[2]});
      else if ((m=line.match(/^OUTPUT\s+(.+)$/i))) add('output',{expr:m[1]});
      else if ((m=line.match(/^INPUT\s+([A-Za-z_]\w*)$/i))) add('input',{name:m[1].toUpperCase()});
      else if ((m=line.match(/^IF\s+(.+?)\s+THEN$/i))) { ins=add('branch',{expr:m[1]}); stack.push({type:'if',at:ins}); }
      else if (/^ELSE$/i.test(line)) { const b=top('if'); if(b.other!=null) throw Error('Line '+n+': duplicate ELSE'); b.other=add('jump',{}); code[b.at].target=code.length; }
      else if (/^ENDIF$/i.test(line)) { const b=top('if'); stack.pop(); code[b.other == null ? b.at : b.other].target=code.length; }
      else if ((m=line.match(/^WHILE\s+(.+?)(?:\s+DO)?$/i))) { ins=add('branch',{expr:m[1]}); stack.push({type:'while',at:ins}); }
      else if (/^ENDWHILE$/i.test(line)) { const b=top('while'); stack.pop(); add('jump',{target:b.at}); code[b.at].target=code.length; }
      else throw Error('Line '+n+': unsupported or invalid statement');
    });
    if (stack.length) throw Error('Line '+code[stack[stack.length-1].at].line+': missing end of block');
    return code;
  }
  class Machine {
    constructor(source, inputs) { this.code=compile(source); this.inputs=inputs || []; this.vars=Object.create(null); this.types=Object.create(null); this.pc=0; this.steps=0; this.output=[]; this.trace=[]; }
    step() {
      if (this.pc >= this.code.length) return false;
      const ins=this.code[this.pc]; if (++this.steps > 10000) throw Error('Line '+ins.line+': instruction limit reached (10,000)');
      const expr = s => expression(s,this.vars);
      try {
        switch(ins.op) {
          case 'declare': if (Object.prototype.hasOwnProperty.call(this.vars,ins.name)) throw Error('Variable already declared: '+ins.name); this.vars[ins.name]=null; this.types[ins.name]=ins.type; this.pc++; break;
          case 'assign': this.set(ins.name,expr(ins.expr)); this.pc++; break;
          case 'output': this.output.push(String(expr(ins.expr))); this.pc++; break;
          case 'input': {
            if (!this.inputs.length) throw Error('Not enough input values');
            const raw=this.inputs.shift(), type=this.types[ins.name];
            let val=raw; if (type==='INTEGER'||type==='REAL') { if (!raw.trim() || !Number.isFinite(Number(raw))) throw Error('Input must be a number'); val=Number(raw); }
            if (type==='BOOLEAN') { if (!/^(true|false)$/i.test(raw.trim())) throw Error('Input must be TRUE or FALSE'); val=raw.trim().toUpperCase()==='TRUE'; }
            this.set(ins.name,val); this.pc++; break;
          }
          case 'branch': this.pc=expr(ins.expr) ? this.pc+1 : ins.target; break;
          case 'jump': this.pc=ins.target; break;
        }
      } catch (e) { throw Error('Line '+ins.line+': '+e.message); }
      this.trace.push({line:ins.line, vars:{...this.vars}, output:this.output.join('\n')}); return true;
    }
    set(name,value) {
      if (!Object.prototype.hasOwnProperty.call(this.vars,name)) throw Error('Variable '+name+' is not declared');
      const type=this.types[name];
      if ((type==='INTEGER' && !Number.isInteger(value)) || (type==='REAL' && typeof value!=='number') || ((type==='STRING'||type==='CHAR') && typeof value!=='string') || (type==='CHAR' && value.length!==1) || (type==='BOOLEAN' && typeof value!=='boolean')) throw Error('Value does not match '+type+' for '+name);
      this.vars[name]=value;
    }
  }
  root.PseudoEngine={compile,expression,Machine};
})(typeof window === 'undefined' ? globalThis : window);
