// Private relay for Yahoo Finance: forwards requests to Yahoo only,
// and only lets the Investments site read the responses.
const ALLOWED_ORIGINS = ['https://awaltoniep.github.io'];
const ALLOWED_HOSTS = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com'];

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin');
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Accept',
      'Vary': 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const target = new URL(request.url).searchParams.get('url');
    let host;
    try { host = new URL(target).hostname; } catch { host = null; }
    if (!host || !ALLOWED_HOSTS.includes(host)) {
      return new Response('{"error":"bad url"}', { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const r = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      cf: { cacheTtl: 30, cacheEverything: true },
    });
    return new Response(r.body, {
      status: r.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};
