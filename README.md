# Chatelherault RC Club Site

Club website built with React, TypeScript, and Vite, deployed on Cloudflare Pages.

## Local Development

```bash
npm install
npm run dev
```

## Build and Lint

```bash
npm run build
npm run lint
```

## Admin CMS (Free Stack)

The project includes a Decap CMS admin UI for non-technical editors.

1. Admin URL: `/admin/`
1. Editable content files: `public/content/`
1. Upload destination: `public/uploads/`
1. Public pages read managed content and fall back to built-in defaults if unavailable.

### Included editable areas

1. Articles
1. Events
1. Gallery
1. Builds
1. Home/About/Meetups content
1. Navigation and social/footer links

## Live Sunday Weather (Meetups Page)

The meetups page can pull a live Met Office forecast for next Sunday between 09:00 and 13:00.

1. Copy `.env.example` to `.env`.
1. Default frontend target is `/api/metoffice-forecast`.
1. In Cloudflare Pages, set environment variable `METOFFICE_API_KEY` for the Pages Function.
1. Optional: set `METOFFICE_HOURLY_URL` in Cloudflare if your DataHub endpoint path differs.
1. For local fallback testing only, set `VITE_METOFFICE_API_KEY` in `.env`.

### Hard usage cap (keep under 900 MB)

To enforce a strict monthly API budget, configure these Cloudflare Pages Function variables/bindings:

1. `METOFFICE_API_KEY` (required)
1. `METOFFICE_MONTHLY_BUDGET_BYTES=943718400` (900 MB)
1. `METOFFICE_BUDGET_SAFETY_BYTES=10485760` (10 MB safety buffer)
1. `METOFFICE_DAILY_CALL_LIMIT=350` (strict daily upstream call cap)
1. `METOFFICE_CACHE_TTL_SECONDS=10800` (3 hour cache)
1. KV binding named `METOFFICE_BUDGET_KV` (stores monthly byte counter)

With this setup, the proxy pauses upstream calls before the monthly byte cap or daily call cap is reached.

## Important Setup Step

To use GitHub login in Decap CMS on Cloudflare Pages, you must configure an OAuth endpoint.

Setup guide: `docs/ADMIN_SETUP.md`
