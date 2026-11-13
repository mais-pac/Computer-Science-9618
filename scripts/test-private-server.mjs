import assert from 'node:assert/strict';
import { createServer } from '../server.mjs';
const server = createServer({ SITE_USERNAME: 'example', SITE_PASSWORD: 'test-password' });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
try {
  for (const path of ['/', '/index.html', '/content/data.js', '/assets/css/app.css', '/does-not-exist']) {
    const res = await fetch(base + path, { redirect: 'manual' });
    assert.equal(res.status, 303, path); assert.equal(res.headers.get('location'), '/login');
  }
  const bad = await fetch(base + '/login', { method: 'POST', body: new URLSearchParams({ username: 'example', password: 'wrong' }), redirect: 'manual' });
  assert.equal(bad.status, 401);
  const good = await fetch(base + '/login', { method: 'POST', body: new URLSearchParams({ username: 'example', password: 'test-password' }), redirect: 'manual' });
  assert.equal(good.status, 303);
  const cookie = good.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/); assert.match(cookie, /Secure/); assert.match(cookie, /SameSite=Strict/);
  const asset = await fetch(base + '/content/data.js', { headers: { cookie: cookie.split(';')[0] } });
  assert.equal(asset.status, 200); assert.match(asset.headers.get('cache-control'), /no-store/);
  const missing = await fetch(base + '/missing', { headers: { cookie: cookie.split(';')[0] } }); assert.equal(missing.status, 404);
  console.log('Private server tests passed');
} finally { await new Promise(resolve => server.close(resolve)); }
const unconfigured = createServer({});
await new Promise(resolve => unconfigured.listen(0, '127.0.0.1', resolve));
try { assert.equal((await fetch(`http://127.0.0.1:${unconfigured.address().port}/content/data.js`)).status, 503); } finally { await new Promise(resolve => unconfigured.close(resolve)); }
