# Instagram data integration

**Status: architecture built, not configured, not deployed.** The site shows no live metrics until every step below is done and tested.

## What the official API can and cannot do

This is based on Meta's documentation for the **Instagram API with Facebook Login → Business Discovery** (checked 11 Oct 2026; examples there use Graph API **v25.0**):

- Your app queries **other Instagram professional accounts (Business or Creator)** by username, through *your own* professional account's ID and token.
- Account-level fields include `followers_count`, `media_count` and `id`. The `media` edge exposes `like_count`, `comments_count` and `view_count` (paid + organic) for public media.
- **Personal accounts are not available.** Age-gated professional accounts return no data. You can't GET returned media objects directly.
- The Business Discovery page doesn't list permissions or rate limits. Check the endpoint reference and current App Review requirements. Historically this needed `instagram_basic` and a Pages permission such as `pages_read_engagement` or `pages_show_list`. **Verify before applying.**
- Follower lists, audience location and demographics of *other* accounts are **not** available. Audience insights only come from a creator's own account (Instagram Insights), with their authorisation.

Sources: <https://developers.facebook.com/docs/instagram-platform/> · Business Discovery: <https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/business-discovery>

## Architecture

```
Browser (GitHub Pages)                 Cloudflare Worker                     Meta Graph API
js/creators.js ── GET ──▶  serverless/instagram-business-discovery  ──▶  /{IG_USER_ID}?fields=
   │  (only if config.creatorsApiEndpoint)   • token as secret (never in repo)      business_discovery.username(x)
   │                                         • username allowlist (consenting)      {followers_count,media_count}
   ◀── { creators: [...] } ──────────────────• cache (CACHE_SECONDS)
js/services/creator-data.js                  • 429 on rate limit, 503 on bad token
  normalizeCreator()  → validated schema
  mergeMetrics()      → only metric fields; identity stays editorial
```

Front-end behaviour:
- No endpoint configured: cards show "—" for metrics and "No verified metrics yet". No request is made.
- Endpoint configured: cards show a loading shimmer, then the values with "Metrics updated <date>" and the "Metrics via official API" badge.
- Error, timeout or rate limit: a polite status message, and profiles still render without statistics.
- **Engagement rate stays null.** If you add it, document the formula (e.g. mean likes+comments of the last N posts ÷ followers), compute it server-side from returned media, and show the method on the site.

## Setup steps

1. Convert the Cityfluence Instagram account to a **professional** account and link it to a Facebook Page.
2. Create a Meta app (type: Business) and add the Instagram product (*API setup with Facebook Login*).
3. Request the required permissions and complete App Review / Business Verification as Meta requires.
4. Generate a **long-lived** user access token. Plan for token refresh (they expire), e.g. a scheduled worker or a manual calendar reminder.
5. Get your Instagram professional account ID (`IG_USER_ID`).
6. Collect **written consent** from each creator to display their public metrics, and add their usernames to `USERNAMES`.
7. Deploy:
   ```bash
   cd serverless/instagram-business-discovery
   cp wrangler.toml.example wrangler.toml   # gitignored; fill in vars
   npx wrangler secret put IG_ACCESS_TOKEN
   npx wrangler deploy
   ```
8. Test: `curl https://<worker>.workers.dev/` returns JSON with your allowlisted creators.
9. Set `creatorsApiEndpoint` in `js/config.js` to the worker URL. Set `username` (and `profileUrl`) on matching records in `js/data/creators.js`. Rebuild and deploy.
10. Only now may the site describe metrics as coming from the official API.

## Rules

- Never scrape Instagram, never use unofficial APIs, never bypass login walls.
- Never commit tokens. `wrangler.toml`, `.env` and `.dev.vars` are gitignored.
- Respect Meta Platform Terms on data storage and caching. Keep `CACHE_SECONDS` modest and don't build historical archives without checking the terms.
- Public posts can be shown with Instagram's official embed, with the creator's permission. Embeds are content, not analytics.
