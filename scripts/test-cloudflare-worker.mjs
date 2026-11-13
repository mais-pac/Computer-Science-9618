import assert from 'node:assert/strict';
import { webcrypto, timingSafeEqual } from 'node:crypto';
import worker from '../worker/index.mjs';
if (!globalThis.crypto) Object.defineProperty(globalThis, 'crypto', { value: webcrypto });
crypto.subtle.timingSafeEqual = (a,b) => timingSafeEqual(Buffer.from(a),Buffer.from(b));
let calls = 0;
const env = { SITE_PASSWORD:'test-password', ASSETS:{fetch:async () => {calls++; return new Response('private data');}}};
const basic = value => 'Basic ' + Buffer.from(value).toString('base64');
for (const path of ['/', '/content/data.js', '/papers/9618-11-mj-2026.html']) {
  const request = (auth) => new Request('https://test.invalid' + path, {headers:auth ? {Authorization:auth} : {}});
  assert.equal((await worker.fetch(request(),env)).status,401);
  assert.equal((await worker.fetch(request(basic('MN01428025:wrong')),env)).status,401);
  assert.equal((await worker.fetch(request(basic('MN01428025:test-password')),{...env,SITE_PASSWORD:''})).status,503);
  const allowed = await worker.fetch(request(basic('MN01428025:test-password')),env);
  assert.equal(allowed.status,200); assert.equal(allowed.headers.get('cache-control'),'private, no-store');
}
assert.equal(calls,3);
console.log('Cloudflare authentication tests passed');
