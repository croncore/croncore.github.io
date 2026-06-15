# Croncore Sanity Studio

Admin/CMS for insights posts on https://www.croncore.com

## Local development

```bash
cd studio
npm install
npm run dev
# Studio runs at http://localhost:3333
```

First run will prompt you to log in with Sanity. Use the same Google/email account that owns the Sanity project (`b5z10ias`).

## Deploy the Studio (so anyone on the team can log in & write posts)

```bash
npm run deploy
```

You'll be asked to pick a hostname — e.g. `croncore` → Studio will live at `https://croncore.sanity.studio`.

## CORS — required so the live site can read posts

In Sanity dashboard → API → CORS Origins → **Add origin**:

- `https://www.croncore.com` (no credentials)
- `https://croncore.com` (no credentials)
- `https://dev.croncore.com` (no credentials, for staging)
- `http://localhost:8080` and any local port you preview with (no credentials)

`*` would work but is not recommended.

## Project info

- Project ID: `b5z10ias`
- Dataset: `production`
- API version used by the frontend: `2024-10-01`

## Schema

- `post` — insights post (title, slug, mainImage, excerpt, category, author, publishedAt, body)
- `category` — referenced by post
- `author` — referenced by post
- `blockContent` — rich text format for body
