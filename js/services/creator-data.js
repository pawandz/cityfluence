/**
 * Creator data adapter.
 *
 * Maps any source — the editorial data file, or the serverless endpoint in
 * serverless/instagram-business-discovery/ — onto ONE consistent, validated
 * shape. Unknown or invalid values become null; nothing is ever guessed.
 *
 * Expected endpoint response:
 *   { generatedAt: ISO string, creators: [{ username, followerCount, mediaCount,
 *     profileImage?, name?, source, lastUpdated }] }
 */

const SCHEMA_KEYS = [
  'id', 'name', 'username', 'platform', 'profileUrl', 'profileImage', 'niche', 'location',
  'followerCount', 'engagementRate', 'verificationStatus', 'source', 'lastUpdated',
  'featured', 'collaborationAvailable',
];

const ALLOWED_PROFILE_HOSTS = ['instagram.com', 'www.instagram.com', 'youtube.com', 'www.youtube.com'];
const VERIFICATION = new Set(['demo', 'unverified', 'editorial-verified', 'api-verified']);

const str = (v, max = 200) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const count = (v) => (Number.isFinite(v) && v >= 0 ? Math.round(v) : null);
const pct = (v) => (Number.isFinite(v) && v >= 0 && v <= 100 ? v : null);
const isoDate = (v) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v.slice(0, 10) : null);
const username = (v) => {
  const s = str(v, 60)?.replace(/^@/, '');
  return s && /^[A-Za-z0-9._]{1,60}$/.test(s) ? s : null;
};

function safeUrl(v, hosts) {
  const s = str(v, 500);
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:') return null;
    if (hosts && !hosts.includes(u.hostname)) return null;
    return u.href;
  } catch {
    return null;
  }
}

/** Normalise one raw record into the creator schema. */
export function normalizeCreator(raw = {}) {
  const out = {
    id: str(raw.id, 80),
    name: str(raw.name, 120),
    username: username(raw.username),
    platform: str(raw.platform, 40),
    profileUrl: safeUrl(raw.profileUrl, ALLOWED_PROFILE_HOSTS),
    // Remote images must be https; local paths are kept as relative strings.
    profileImage: raw.profileImage?.startsWith?.('assets/') ? raw.profileImage : safeUrl(raw.profileImage),
    niche: str(raw.niche, 80),
    location: str(raw.location, 80),
    followerCount: count(raw.followerCount),
    engagementRate: pct(raw.engagementRate),
    verificationStatus: VERIFICATION.has(raw.verificationStatus) ? raw.verificationStatus : 'unverified',
    source: str(raw.source, 160),
    lastUpdated: isoDate(raw.lastUpdated),
    featured: raw.featured === true,
    collaborationAvailable: raw.collaborationAvailable === true,
  };
  return Object.fromEntries(SCHEMA_KEYS.map((k) => [k, out[k]]));
}

export class CreatorApiError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code; // 'timeout' | 'rate_limited' | 'unavailable' | 'invalid'
  }
}

/** Fetch verified metrics from the (optional) serverless endpoint. */
export async function fetchCreatorMetrics(endpoint, { timeoutMs = 6000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (res.status === 429) throw new CreatorApiError('Rate limited', 'rate_limited');
    if (!res.ok) throw new CreatorApiError(`HTTP ${res.status}`, 'unavailable');
    const json = await res.json().catch(() => null);
    if (!json || !Array.isArray(json.creators)) throw new CreatorApiError('Malformed response', 'invalid');
    return json.creators.map((c) => normalizeCreator({ ...c, verificationStatus: 'api-verified' })).filter((c) => c.username);
  } catch (err) {
    if (err.name === 'AbortError') throw new CreatorApiError('Timed out', 'timeout');
    if (err instanceof CreatorApiError) throw err;
    throw new CreatorApiError(err.message, 'unavailable');
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Merge API metrics into editorial records, matched by username.
 * Only metric fields are taken from the API — identity stays editorial.
 */
export function mergeMetrics(editorial, metrics) {
  const byUser = new Map(metrics.map((m) => [m.username.toLowerCase(), m]));
  return editorial.map((c) => {
    const m = c.username && byUser.get(c.username.toLowerCase());
    if (!m) return c;
    return {
      ...c,
      followerCount: m.followerCount ?? c.followerCount,
      engagementRate: m.engagementRate ?? c.engagementRate,
      verificationStatus: 'api-verified',
      source: m.source ?? 'Instagram Graph API — Business Discovery',
      lastUpdated: m.lastUpdated ?? c.lastUpdated,
    };
  });
}
