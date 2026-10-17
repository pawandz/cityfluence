/**
 * Chandigarhcitylyf — Instagram Business Discovery proxy (Cloudflare Worker).
 *
 * Returns follower/media counts for an ALLOWLIST of consenting creators'
 * Instagram professional (Business/Creator) accounts, using Meta's official
 * Instagram Graph API "Business Discovery" feature. The access token never
 * reaches the browser.
 *
 * NOT DEPLOYED. Nothing in the site claims live data until this is deployed,
 * configured, tested, and js/config.js → creatorsApiEndpoint is set.
 *
 * Environment (wrangler.toml [vars] + `wrangler secret put`):
 *   IG_USER_ID         your app user's Instagram professional account ID   (var)
 *   IG_ACCESS_TOKEN    long-lived token for that account                    (SECRET)
 *   GRAPH_VERSION      e.g. "v25.0" — check the current version in Meta docs (var)
 *   ALLOWED_ORIGIN     e.g. "https://pawandz.github.io" (origin only)       (var)
 *   USERNAMES          comma-separated allowlist of consenting usernames    (var)
 *   CACHE_SECONDS      response cache TTL, default 3600 — confirm this is
 *                      consistent with Meta Platform Terms before raising   (var)
 *
 * Response: { generatedAt, creators: [{ username, followerCount, mediaCount,
 *             source, lastUpdated }], unavailable: [username, ...] }
 */

const USERNAME_RE = /^[A-Za-z0-9._]{1,30}$/;
const RATE_LIMIT_CODES = new Set([4, 17, 32, 613]);
const TOKEN_ERROR_CODES = new Set([190]);

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || 'null',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Accept',
    Vary: 'Origin',
  };
}

const json = (body, status, env, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(env), ...extra },
  });

async function discover(username, env) {
  const version = env.GRAPH_VERSION || 'v25.0';
  const fields = `business_discovery.username(${username}){username,followers_count,media_count}`;
  const url = `https://graph.facebook.com/${version}/${encodeURIComponent(env.IG_USER_ID)}?fields=${encodeURIComponent(fields)}`;
  // Token is sent as a header so it never appears in logged URLs.
  const res = await fetch(url, { headers: { Authorization: `Bearer ${env.IG_ACCESS_TOKEN}` } });
  const body = await res.json().catch(() => ({}));

  if (body.error) {
    const err = new Error(body.error.message || 'Graph API error');
    err.code = body.error.code;
    throw err;
  }
  const bd = body.business_discovery;
  if (!bd) return null;
  const count = (v) => (Number.isFinite(v) && v >= 0 ? v : null);
  return {
    username: String(bd.username || username),
    followerCount: count(bd.followers_count),
    mediaCount: count(bd.media_count),
    source: 'Instagram Graph API — Business Discovery',
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(env) });
    if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405, env);
    if (!env.IG_USER_ID || !env.IG_ACCESS_TOKEN) return json({ error: 'not_configured' }, 503, env);

    const cache = caches.default;
    const cacheKey = new Request(new URL('/creators-v1', request.url).toString());
    const cached = await cache.match(cacheKey);
    if (cached) {
      // Headers.set replaces case-insensitively; spreading into an object would
      // duplicate Access-Control-Allow-Origin, which browsers reject.
      const headers = new Headers(cached.headers);
      for (const [k, v] of Object.entries(corsHeaders(env))) headers.set(k, v);
      return new Response(cached.body, { status: 200, headers });
    }

    const usernames = (env.USERNAMES || '')
      .split(',')
      .map((u) => u.trim().replace(/^@/, ''))
      .filter((u) => USERNAME_RE.test(u))
      .slice(0, 50);

    const creators = [];
    const unavailable = [];
    for (const username of usernames) {
      try {
        const result = await discover(username, env);
        result ? creators.push(result) : unavailable.push(username);
      } catch (err) {
        if (RATE_LIMIT_CODES.has(err.code)) return json({ error: 'rate_limited' }, 429, env, { 'Retry-After': '900' });
        if (TOKEN_ERROR_CODES.has(err.code)) return json({ error: 'token_invalid' }, 503, env);
        // Personal (non-professional) or age-gated accounts are not returned by the API.
        unavailable.push(username);
      }
    }

    const ttl = Number(env.CACHE_SECONDS) || 3600;
    const response = json({ generatedAt: new Date().toISOString(), creators, unavailable }, 200, env, {
      'Cache-Control': `public, max-age=${ttl}`,
    });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  },
};
