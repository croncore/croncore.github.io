# Sanity CMS — setup & deploy

This site uses **Sanity** as the insights CMS. You write posts in the Studio, and the static site fetches them from Sanity's public CDN at runtime. No build step on the website side.

- Project ID: `b5z10ias`
- Dataset: `production`
- Studio source: `studio/` (excluded from Cloudflare Pages deploys via `.assetsignore`)

---

## One-time setup (~10 min)

Do these once. Skip to **Daily use** below if it's already done.

### 1. Add CORS origins so the live site can read posts

This is **required** — without it, browsers see `403 CORS Origin not allowed` and posts won't render.

1. Go to <https://www.sanity.io/manage/project/b5z10ias/api>
2. Scroll to **CORS Origins** → click **Add CORS origin**
3. Add each of these, **all with "Allow credentials" UNCHECKED**:
   - `https://www.croncore.com`
   - `https://croncore.com`
   - `https://dev.croncore.com`
   - `http://localhost:8080` (or whatever port you preview locally with)

### 2. Install Studio dependencies & log in

```bash
cd studio
npm install
npx sanity login        # browser opens, log in with the Google/email that owns the project
```

### 3. Run the Studio locally

```bash
npm run dev
# Studio opens at http://localhost:3333
```

You'll land in the post editor. Create one **Author**, one or two **Categories**, then create a **Post**. Hit Publish.

### 4. Deploy the Studio (once)

So you don't need to run it locally every time you want to write a post:

```bash
npm run deploy
# Choose a hostname when prompted, e.g. `croncore`
# Studio will then live at https://croncore.sanity.studio
```

Bookmark that URL — it's where you (and anyone you invite) write posts from any device.

---

## Daily use

### Writing a post

1. Open <https://croncore.sanity.studio> (or run `npm run dev` from `studio/` for local).
2. Click **Post → Create new**.
3. Fill in title (slug auto-generates), upload a featured image, pick a category and author, write the body, set publish date, hit **Publish**.
4. The post appears on `https://www.croncore.com/insights` within ~5 seconds (Sanity CDN cache).

### Editing or deleting a post

Open it in the Studio, edit, hit Publish again. To unpublish, use the dropdown next to Publish → Unpublish. Deletions are soft and reversible from the Studio history.

---

## How the frontend talks to Sanity

- `js/sanity.js` — small wrapper around Sanity's public GROQ HTTP API + a Portable Text → HTML renderer. No npm dependencies, ~5KB.
- `js/main.js` — homepage insights preview (8 latest posts).
- `insights.html` — full listing (50 latest posts).
- `article.html` — single post by slug, parses `/insights/<slug>` from URL.

URLs:
- `/insights` — listing
- `/insights/<slug>` — single post (rewritten to `article.html` by `_redirects`)

The Cloudflare Pages `_redirects` file handles the URL rewrites that the old Apache `.htaccess` used to do. The `.htaccess` file is dead on Cloudflare Pages and is kept only for documentation.

---

## What's in this repo

```
studio/                  # Sanity Studio (CMS admin) — NOT deployed to Cloudflare
  schemaTypes/           # Document type definitions (post, category, author, blockContent)
  sanity.config.ts
  sanity.cli.ts
  package.json
js/sanity.js             # Sanity client + Portable Text renderer (loaded by all insights pages)
js/main.js               # Site-wide JS, includes homepage insights fetch
insights.html               # Insights listing
article.html             # Single article page, served at /insights/<slug>
_redirects               # Cloudflare Pages routing (replaces old .htaccess)
.assetsignore            # Tells Cloudflare not to upload studio/, .git/, etc.
```

---

## Troubleshooting

**"Error loading insights" on the live site** — almost always missing CORS origin. Check step 1 above.

**Studio won't start (`npm run dev`)** — make sure you ran `npm install` inside `studio/` first, and that `npx sanity login` completed.

**Images look low-res** — the renderer requests `?w=1200`. Upload the original full-size image; the CDN downscales as needed.

**A post I just published isn't showing up** — the public CDN caches for ~5–10 seconds. Hard refresh (Cmd+Shift+R).
