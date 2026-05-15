#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Pre-renders every published Sanity post into a real static HTML file at
 *   /insights/<slug>.html
 *
 * The generated files have full server-rendered <head> (title, description,
 * canonical, OG, Twitter, article:published_time, article:modified_time) plus
 * inline Article + BreadcrumbList JSON-LD and a pre-rendered article body.
 *
 * Why: the previous /insights/<slug> route served a single article.html shell
 * that fetched the post client-side. Crawlers and social unfurlers that do
 * not run JS saw only the hub-page placeholders, and the canonical pointed
 * to /insights — telling Google every post was a duplicate of the hub.
 *
 * Run with:   node scripts/generate-insights.js
 * No external dependencies.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SITE_URL = 'https://www.croncore.com';
const PROJECT_ID = 'b5z10ias';
const DATASET = 'production';
const API_VERSION = '2024-10-01';

const ROOT = path.join(__dirname, '..');
const TEMPLATE_PATH = path.join(ROOT, 'article.html');
const OUT_DIR = path.join(ROOT, 'insights');

// Slugs we never want as standalone pages (test/draft content).
const EXCLUDE_SLUGS = new Set(['testing', 'test']);

// ---------- Sanity fetch ----------

function fetchSanityPosts() {
  const groq = `*[_type == "post" && !(_id in path("drafts.**")) && defined(slug.current)]{
    "slug": slug.current,
    title,
    excerpt,
    publishedAt,
    _updatedAt,
    "mainImage": mainImage{asset->{url}, alt},
    "category": category->title,
    "author": author->{name, "image": image.asset->url},
    body
  } | order(publishedAt desc)`;
  const url =
    'https://' + PROJECT_ID + '.apicdn.sanity.io/v' + API_VERSION +
    '/data/query/' + DATASET + '?query=' + encodeURIComponent(groq);

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error('Sanity API ' + res.statusCode + ': ' + data));
        }
        try {
          const json = JSON.parse(data);
          resolve(json.result || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// ---------- Helpers ----------

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) { return escapeHtml(str); }

// Build a Sanity image CDN URL. Accepts the {asset:{url}} shape we query for.
function imageUrl(image, opts) {
  if (!image || !image.asset || !image.asset.url) return '';
  const base = image.asset.url;
  const qs = [];
  opts = opts || {};
  if (opts.width) qs.push('w=' + opts.width);
  if (opts.height) qs.push('h=' + opts.height);
  if (opts.fit) qs.push('fit=' + opts.fit);
  if (opts.quality) qs.push('q=' + opts.quality);
  if (opts.auto !== false) qs.push('auto=format');
  return qs.length ? base + '?' + qs.join('&') : base;
}

// ---------- Portable Text -> HTML (mirrors js/sanity.js so output matches) ----------

const DECORATOR_TAGS = {
  'strong': 'strong',
  'em': 'em',
  'code': 'code',
  'underline': 'u',
  'strike-through': 's',
};

function renderSpan(child, markDefs) {
  if (child._type !== 'span') return '';
  const text = escapeHtml(child.text || '').replace(/\n/g, '<br>');
  const marks = (child.marks || []).slice();
  if (!marks.length) return text;
  const openTags = [];
  const closeTags = [];
  marks.forEach((mark) => {
    if (DECORATOR_TAGS[mark]) {
      const tag = DECORATOR_TAGS[mark];
      openTags.push('<' + tag + '>');
      closeTags.unshift('</' + tag + '>');
    } else if (markDefs && markDefs[mark]) {
      const def = markDefs[mark];
      if (def._type === 'link') {
        const href = escapeAttr(def.href || '#');
        const rel = def.blank ? ' target="_blank" rel="noopener noreferrer"' : '';
        openTags.push('<a href="' + href + '"' + rel + '>');
        closeTags.unshift('</a>');
      }
    }
  });
  return openTags.join('') + text + closeTags.join('');
}

function renderBlock(block) {
  const children = block.children || [];
  const markDefs = {};
  (block.markDefs || []).forEach((m) => { markDefs[m._key] = m; });
  const inner = children.map((c) => renderSpan(c, markDefs)).join('');
  const style = block.style || 'normal';
  if (style === 'normal') return '<p>' + inner + '</p>';
  if (style === 'blockquote') return '<blockquote>' + inner + '</blockquote>';
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(style)) {
    return '<' + style + '>' + inner + '</' + style + '>';
  }
  return '<p>' + inner + '</p>';
}

function renderImage(node) {
  const src = imageUrl(node, {width: 1200, fit: 'max', quality: 85});
  if (!src) return '';
  const alt = escapeAttr(node.alt || '');
  const caption = node.caption ? '<figcaption>' + escapeHtml(node.caption) + '</figcaption>' : '';
  return '<figure><img src="' + src + '" alt="' + alt + '" loading="lazy">' + caption + '</figure>';
}

function renderCodeBlock(node) {
  const lang = node.language ? ' class="language-' + escapeAttr(node.language) + '"' : '';
  return '<pre><code' + lang + '>' + escapeHtml(node.code || '') + '</code></pre>';
}

function portableTextToHtml(blocks) {
  if (!blocks || !blocks.length) return '';
  let html = '';
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    if (block._type === 'block' && block.listItem) {
      const listType = block.listItem === 'number' ? 'ol' : 'ul';
      const startLevel = block.level || 1;
      html += '<' + listType + '>';
      while (
        i < blocks.length &&
        blocks[i]._type === 'block' &&
        blocks[i].listItem === block.listItem &&
        (blocks[i].level || 1) === startLevel
      ) {
        const item = blocks[i];
        const children = item.children || [];
        const markDefs = {};
        (item.markDefs || []).forEach((m) => { markDefs[m._key] = m; });
        const inner = children.map((c) => renderSpan(c, markDefs)).join('');
        html += '<li>' + inner + '</li>';
        i++;
      }
      html += '</' + listType + '>';
      continue;
    }
    if (block._type === 'block') {
      html += renderBlock(block);
    } else if (block._type === 'image') {
      html += renderImage(block);
    } else if (block._type === 'codeBlock') {
      html += renderCodeBlock(block);
    }
    i++;
  }
  return html;
}

function portableTextToPlain(blocks, maxLen) {
  if (!blocks || !blocks.length) return '';
  let out = '';
  for (let i = 0; i < blocks.length && out.length < (maxLen || 200); i++) {
    const b = blocks[i];
    if (b._type === 'block' && b.children) {
      out += b.children.map((c) => c.text || '').join('') + ' ';
    }
  }
  out = out.trim();
  if (maxLen && out.length > maxLen) out = out.substring(0, maxLen).replace(/\s\S*$/, '') + '…';
  return out;
}

// ---------- Template rendering ----------

const TEMPLATE = fs.readFileSync(TEMPLATE_PATH, 'utf8');

function formatDateLong(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
}

function renderPostHtml(post) {
  const title = post.title || 'Untitled';
  const slug = post.slug;
  const canonicalUrl = SITE_URL + '/insights/' + encodeURIComponent(slug);
  const category = post.category || 'Insights';
  const authorName = (post.author && post.author.name) || 'Croncore';
  const heroImageUrl = imageUrl(post.mainImage, {width: 1600, fit: 'crop', quality: 85});
  const ogImageUrl = imageUrl(post.mainImage, {width: 1200, height: 630, fit: 'crop', quality: 80})
    || (SITE_URL + '/images/og-cover.png');
  const description = (post.excerpt && post.excerpt.trim())
    || portableTextToPlain(post.body, 160)
    || ('Read ' + title + ' on Croncore Insights — expert analysis on AI, automation, and enterprise systems.');
  const publishedAt = post.publishedAt || '';
  const modifiedAt = post._updatedAt || publishedAt;
  const dateStr = formatDateLong(publishedAt);

  const bodyHtml = portableTextToHtml(post.body || []);
  const plainBody = portableTextToPlain(post.body, 999999);
  const wordCount = plainBody.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const readingStr = readingTime + ' min read';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'mainEntityOfPage': {'@type': 'WebPage', '@id': canonicalUrl},
    'headline': title,
    'description': description,
    'datePublished': publishedAt,
    'dateModified': modifiedAt,
    'author': {'@type': 'Person', 'name': authorName},
    'publisher': {
      '@type': 'Organization',
      'name': 'Croncore',
      'logo': {'@type': 'ImageObject', 'url': SITE_URL + '/images/croncore-logo.png'},
    },
    'url': canonicalUrl,
  };
  if (ogImageUrl) articleSchema.image = [ogImageUrl];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL + '/'},
      {'@type': 'ListItem', 'position': 2, 'name': 'Insights', 'item': SITE_URL + '/insights'},
      {'@type': 'ListItem', 'position': 3, 'name': title, 'item': canonicalUrl},
    ],
  };

  // ----- Build the new <head> block (server-rendered metadata) -----
  const headBlock = [
    '    <!-- Primary SEO (server-rendered at build time) -->',
    '    <title>' + escapeHtml(title) + ' — Croncore Insights</title>',
    '    <meta name="description" content="' + escapeAttr(description) + '">',
    '    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">',
    '    <meta name="author" content="' + escapeAttr(authorName) + '">',
    '    <link rel="canonical" href="' + escapeAttr(canonicalUrl) + '">',
    '',
    '    <!-- Open Graph -->',
    '    <meta property="og:locale" content="en_US">',
    '    <meta property="og:type" content="article">',
    '    <meta property="og:site_name" content="Croncore">',
    '    <meta property="og:url" content="' + escapeAttr(canonicalUrl) + '">',
    '    <meta property="og:title" content="' + escapeAttr(title) + '">',
    '    <meta property="og:description" content="' + escapeAttr(description) + '">',
    '    <meta property="og:image" content="' + escapeAttr(ogImageUrl) + '">',
    '    <meta property="og:image:width" content="1200">',
    '    <meta property="og:image:height" content="630">',
    '    <meta property="article:published_time" content="' + escapeAttr(publishedAt) + '">',
    '    <meta property="article:modified_time" content="' + escapeAttr(modifiedAt) + '">',
    '    <meta property="article:author" content="' + escapeAttr(authorName) + '">',
    '    <meta property="article:section" content="' + escapeAttr(category) + '">',
    '',
    '    <!-- Twitter -->',
    '    <meta name="twitter:card" content="summary_large_image">',
    '    <meta name="twitter:site" content="@croncore">',
    '    <meta name="twitter:title" content="' + escapeAttr(title) + '">',
    '    <meta name="twitter:description" content="' + escapeAttr(description) + '">',
    '    <meta name="twitter:image" content="' + escapeAttr(ogImageUrl) + '">',
    '',
    '    <!-- Structured data -->',
    '    <script type="application/ld+json">' + JSON.stringify(articleSchema) + '</script>',
    '    <script type="application/ld+json">' + JSON.stringify(breadcrumbSchema) + '</script>',
  ].join('\n');

  // ----- Replace the template's placeholder head block (lines 26-51) -----
  // The template has a clearly-marked region between the "Primary SEO" comment
  // and the closing Twitter image meta. Replace the whole region in one go.
  const seoStart = '    <!-- Primary SEO (populated dynamically from Sanity in the script below) -->';
  const seoEndPattern = /<meta name="twitter:image"[^>]*>/;

  const startIdx = TEMPLATE.indexOf(seoStart);
  if (startIdx === -1) {
    throw new Error('Could not locate SEO placeholder block in article.html');
  }
  const restAfterStart = TEMPLATE.slice(startIdx);
  const endMatch = restAfterStart.match(seoEndPattern);
  if (!endMatch) {
    throw new Error('Could not locate end of SEO placeholder block in article.html');
  }
  const endIdx = startIdx + endMatch.index + endMatch[0].length;

  let html = TEMPLATE.slice(0, startIdx) + headBlock + TEMPLATE.slice(endIdx);

  // ----- Pre-render the article body so the page works without JS -----
  // We bake the hero or no-hero header + body content directly into the
  // article-wrapper. The client-side fetch script becomes a no-op because
  // article-wrapper is already visible and #loading is hidden.

  const backIconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
  const clockIconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';

  let articleMarkup;
  if (heroImageUrl) {
    const heroAlt = escapeAttr((post.mainImage && post.mainImage.alt) || title);
    articleMarkup = [
      '            <article id="article-wrapper">',
      '                <div class="article-hero-banner" id="hero-banner" style="display:block;">',
      '                    <img id="article-image" src="' + escapeAttr(heroImageUrl) + '" alt="' + heroAlt + '">',
      '                    <div class="article-hero-overlay"></div>',
      '                    <div class="article-hero-content">',
      '                        <div class="container">',
      '                            <a href="/insights" class="article-back">' + backIconSvg + ' Back to Insights</a>',
      '                            <div class="article-meta">',
      '                                <span class="category">' + escapeHtml(category) + '</span>',
      '                                <span class="dot"></span>',
      '                                <span class="date">' + escapeHtml(dateStr) + '</span>',
      '                                <span class="dot"></span>',
      '                                <span class="reading-time">' + clockIconSvg + ' <span>' + escapeHtml(readingStr) + '</span></span>',
      '                            </div>',
      '                            <h1 class="article-title">' + escapeHtml(title) + '</h1>',
      '                        </div>',
      '                    </div>',
      '                </div>',
      '                <div class="article-body-wrap">',
      '                    <div class="article-content" id="article-body">' + bodyHtml + '</div>',
      '                </div>',
      '                <div class="article-bottom-divider"><hr></div>',
      '                <div class="article-back-bottom">',
      '                    <a href="/insights">' + backIconSvg + ' Back to All Insights</a>',
      '                </div>',
      '            </article>',
    ].join('\n');
  } else {
    articleMarkup = [
      '            <article id="article-wrapper">',
      '                <div class="article-header no-hero" id="hero-no-image" style="display:block;">',
      '                    <div class="container">',
      '                        <a href="/insights" class="article-back">' + backIconSvg + ' Back to Insights</a>',
      '                        <div class="article-meta">',
      '                            <span class="category">' + escapeHtml(category) + '</span>',
      '                            <span class="dot"></span>',
      '                            <span class="date">' + escapeHtml(dateStr) + '</span>',
      '                            <span class="dot"></span>',
      '                            <span class="reading-time">' + clockIconSvg + ' <span>' + escapeHtml(readingStr) + '</span></span>',
      '                        </div>',
      '                        <h1 class="article-title">' + escapeHtml(title) + '</h1>',
      '                    </div>',
      '                </div>',
      '                <div class="article-body-wrap">',
      '                    <div class="article-content" id="article-body">' + bodyHtml + '</div>',
      '                </div>',
      '                <div class="article-bottom-divider"><hr></div>',
      '                <div class="article-back-bottom">',
      '                    <a href="/insights">' + backIconSvg + ' Back to All Insights</a>',
      '                </div>',
      '            </article>',
    ].join('\n');
  }

  // Replace the loading/error/empty-article block with the pre-rendered markup.
  // The template marks this region between "<!-- Article Status Pickers -->"
  // and the closing </article> tag of the empty wrapper.
  const mainStart = '            <!-- Article Status Pickers -->';
  const mainEndMarker = '            </article>\n\n        </main>';
  const mainStartIdx = html.indexOf(mainStart);
  const mainEndIdx = html.indexOf(mainEndMarker, mainStartIdx);
  if (mainStartIdx === -1 || mainEndIdx === -1) {
    throw new Error('Could not locate article body region in article.html');
  }
  html =
    html.slice(0, mainStartIdx) +
    articleMarkup + '\n\n        </main>' +
    html.slice(mainEndIdx + mainEndMarker.length);

  // Strip the client-side Sanity fetch script — the page is fully rendered now.
  // The block runs from the inline DOMContentLoaded handler to the closing
  // </script> tag right before "<!-- Float Buttons -->".
  const scriptStart = html.indexOf('<script>\n        document.addEventListener(\'DOMContentLoaded\', function () {\n            // ---- Soft-404 helper');
  if (scriptStart !== -1) {
    const scriptEnd = html.indexOf('</script>', scriptStart);
    if (scriptEnd !== -1) {
      // Also strip the preceding sanity.js include since we don't need it.
      const sanityIncludePattern = /\n\s*<!-- JavaScript -->\n\s*<script src="\/js\/sanity\.js"><\/script>/;
      const m = html.slice(0, scriptStart).match(sanityIncludePattern);
      let cutFrom = scriptStart;
      if (m) cutFrom = m.index;
      html =
        html.slice(0, cutFrom) +
        '\n    <!-- JavaScript -->\n    <script src="/js/main.js?v=4"></script>\n    ' +
        html.slice(scriptEnd + '</script>'.length);
    }
  }

  return html;
}

// ---------- Main ----------

async function main() {
  console.log('Fetching published posts from Sanity...');
  const posts = await fetchSanityPosts();
  const usable = posts.filter((p) => p.slug && !EXCLUDE_SLUGS.has(p.slug));
  console.log('  -> ' + posts.length + ' posts (' + usable.length + ' after excluding test/draft slugs)');

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, {recursive: true});

  let ok = 0;
  let failed = 0;
  const written = [];

  for (const post of usable) {
    try {
      const html = renderPostHtml(post);
      const outPath = path.join(OUT_DIR, post.slug + '.html');
      fs.writeFileSync(outPath, html, 'utf8');
      written.push(post.slug);
      ok++;
    } catch (e) {
      console.error('  ! Failed to render "' + post.slug + '": ' + e.message);
      failed++;
    }
  }

  // Index of pre-rendered slugs (used by routing fallback to decide 404 vs serve).
  const indexPath = path.join(OUT_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    count: written.length,
    slugs: written,
  }, null, 2), 'utf8');

  console.log('Wrote ' + ok + ' file(s) to ' + OUT_DIR + (failed ? (' (' + failed + ' failed)') : ''));
}

main().catch((err) => {
  console.error('Failed to generate insights:', err);
  process.exit(1);
});
