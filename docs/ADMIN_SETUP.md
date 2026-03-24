# Admin Setup (Cloudflare Pages + Decap CMS)

This project now includes a free admin GUI at `/admin/` powered by Decap CMS.

## What Is Already Implemented

1. Admin UI entry at `/admin/`.
1. CMS config in `public/admin/config.yml`.
1. Editable JSON content files in `public/content/`.
1. Upload target folder in `public/uploads/`.
1. Public pages wired to these content files with safe fallbacks.

## Required One-Time Auth Setup

Decap with `backend: github` needs OAuth credentials so editors can sign in and write commits.

1. Create a GitHub OAuth App.
1. Set homepage URL to your production domain.
1. Set callback URL to your OAuth proxy endpoint.
1. Deploy a free OAuth proxy endpoint (for example using a Cloudflare Worker).
1. Configure `public/admin/config.yml` with `base_url` and `auth_endpoint` for your OAuth proxy.

Example config snippet:

```yml
backend:
	name: github
	repo: Frazmcc/chatelherault-rc-club
	branch: main
	base_url: https://your-oauth-worker.your-domain.workers.dev
	auth_endpoint: /auth
```

## Editor Workflow

1. Open `/admin/`.
1. Sign in with GitHub.
1. Edit content collections (Articles, Events, Gallery, Settings).
1. Upload images through image fields.
1. Save and publish.
1. Cloudflare Pages auto-deploys from GitHub commits.

## Operational Notes

1. Keep image sizes modest to avoid repository bloat.
1. Prefer JPG or WebP for photos.
1. Require alt text for accessibility.
1. Use editorial workflow for safer multi-admin publishing.
