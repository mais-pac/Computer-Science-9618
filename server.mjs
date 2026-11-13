import http from 'node:http';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('build/worker-site');
const sessions = new Map();
const failures = [];
const duration = 12 * 60 * 60 * 1000;
const securityHeaders = {
  'Cache-Control': 'no-store, private',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
};
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8' };
const same = (a, b) => timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
const page = (message = '') => `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in — Computer Science 9618</title><style>body{background:#0b1220;color:#e8eefb;font:16px system-ui;display:grid;place-items:center;min-height:100vh;margin:0}main{background:#17243a;padding:2rem;border-radius:1rem;width:min(20rem,80vw)}label{display:block;margin:1rem 0 .4rem}input,button{box-sizing:border-box;width:100%;padding:.75rem;border-radius:.5rem;border:0;font:inherit}button{background:#6ba7ff;margin-top:1.2rem;font-weight:bold;cursor:pointer}.error{color:#ffb5ae}</style><main><h1>Computer Science 9618</h1><p>Sign in to your study site.</p>${message ? `<p class="error">${message}</p>` : ''}<form method="post" action="/login"><label for="username">Username</label><input id="username" name="username" autocomplete="username" required><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required><button>Sign in</button></form></main></html>`;
function send(res, status, body, headers = {}) { res.writeHead(status, { ...securityHeaders, ...headers }); res.end(body); }
function cookie(req) { const item = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('site_session=')); return item?.slice('site_session='.length) || ''; }
function loggedIn(req) { const token = cookie(req); const expires = sessions.get(token); if (!expires) return false; if (expires <= Date.now()) { sessions.delete(token); return false; } return true; }
async function formData(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk.toString();
    if (body.length > 4096) throw new Error('Form too large');
  }
  return new URLSearchParams(body);
}
export function createServer(config = process.env) {
  return http.createServer(async (req, res) => {
    try {
      if (!config.SITE_USERNAME || !config.SITE_PASSWORD) return send(res, 503, 'Site login is not configured.');
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/login' && req.method === 'GET') return send(res, 200, page(), { 'Content-Type': 'text/html; charset=utf-8' });
      if (url.pathname === '/login' && req.method === 'POST') {
        const now = Date.now();
        while (failures.length && failures[0] < now - 15 * 60 * 1000) failures.shift();
        if (failures.length >= 20) return send(res, 429, page('Too many attempts. Please wait 15 minutes.'), { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '900' });
        const form = await formData(req);
        const user = form.get('username') || ''; const password = form.get('password') || '';
        const userOK = same(user, config.SITE_USERNAME); const passwordOK = same(password, config.SITE_PASSWORD);
        if (!userOK || !passwordOK) { failures.push(now); return send(res, 401, page('Incorrect username or password.'), { 'Content-Type': 'text/html; charset=utf-8' }); }
        const token = randomBytes(32).toString('hex');
        for (const [key, expiry] of sessions) if (expiry <= now) sessions.delete(key);
        sessions.set(token, now + duration);
        return send(res, 303, '', { Location: '/', 'Set-Cookie': `site_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200` });
      }
      if (!loggedIn(req)) return send(res, 303, '', { Location: '/login' });
      if (!['GET', 'HEAD'].includes(req.method)) return send(res, 405, 'Method not allowed');
      let name;
      try { name = decodeURIComponent(url.pathname); } catch { return send(res, 400, 'Bad request'); }
      if (name.includes('\0') || name.includes('\\')) return send(res, 400, 'Bad request');
      const target = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
      if (!target.startsWith(root + path.sep)) return send(res, 404, 'Not found');
      let real;
      try { real = await realpath(target); } catch { return send(res, 404, 'Not found'); }
      if (!real.startsWith(root + path.sep) || !(await stat(real)).isFile()) return send(res, 404, 'Not found');
      const data = await readFile(real);
      return send(res, 200, req.method === 'HEAD' ? '' : data, { 'Content-Type': types[path.extname(real).toLowerCase()] || 'application/octet-stream' });
    } catch { if (!res.headersSent) send(res, 400, 'Bad request'); else res.end(); }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  createServer().listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Private site listening'));
}
