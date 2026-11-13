const encoder = new TextEncoder();
const username = 'MN01428025';
const privateHeaders = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
async function matches(a, b) {
  const hashes = await Promise.all([a, b].map(x => crypto.subtle.digest('SHA-256', encoder.encode(x))));
  return crypto.subtle.timingSafeEqual(hashes[0], hashes[1]);
}
function parse(header) {
  if (!header || !/^Basic [A-Za-z0-9+/]+={0,2}$/i.test(header)) return null;
  try {
    const value = new TextDecoder('utf-8', {fatal:true}).decode(Uint8Array.from(atob(header.slice(6)), c => c.charCodeAt(0)));
    const separator = value.indexOf(':');
    return separator < 0 ? null : [value.slice(0, separator), value.slice(separator + 1)];
  } catch { return null; }
}
export default {
  async fetch(request, env) {
    if (!env.SITE_PASSWORD || !env.ASSETS) return new Response('Site login is not configured.', { status:503, headers:privateHeaders });
    const supplied = parse(request.headers.get('Authorization'));
    const [userOK, passwordOK] = await Promise.all([matches(supplied?.[0] ?? '', username), matches(supplied?.[1] ?? '', env.SITE_PASSWORD)]);
    if (!supplied || !userOK || !passwordOK) return new Response('Sign in to access this site.', { status:401, headers: { ...privateHeaders, 'WWW-Authenticate':'Basic realm="Computer Science 9618", charset="UTF-8"' } });
    const asset = await env.ASSETS.fetch(request);
    const result = new Response(asset.body, asset);
    for (const [key,value] of Object.entries(privateHeaders)) result.headers.set(key,value);
    return result;
  }
};
