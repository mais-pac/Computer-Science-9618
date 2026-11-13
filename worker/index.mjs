// Temporary public deployment. Restore server-side authentication before adding private data.
export default {
  async fetch(request, env) {
    if (!env.ASSETS) return new Response('Site assets are not configured.', { status: 503 });
    return env.ASSETS.fetch(request);
  }
};
