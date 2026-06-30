#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Generates sitemap.xml at the repo root.
 *
 *   - Static pages (home, services, insights hub, newsroom, contact, legal)
 *   - All service detail pages under /services/
 *   - Case study pages
 *   - All published Sanity posts at /insights/<slug>
 *
 * Run with:   node scripts/generate-sitemap.js
 *
 * No external dependencies. Uses the public Sanity CDN endpoint.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SITE_URL = 'https://www.croncore.com';
const PROJECT_ID = 'b5z10ias';
const DATASET = 'production';
const API_VERSION = '2024-10-01';
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_PAGES = [
  {loc: '/',                       changefreq: 'weekly',  priority: '1.0'},
  {loc: '/services',               changefreq: 'monthly', priority: '0.9'},
  {loc: '/case-studies',           changefreq: 'monthly', priority: '0.9'},
  {loc: '/insights',               changefreq: 'weekly',  priority: '0.9'},
  {loc: '/newsroom',               changefreq: 'weekly',  priority: '0.85'},
  {loc: '/sled-delivery-partner',  changefreq: 'monthly', priority: '0.8'},
  {loc: '/sled-case-studies',      changefreq: 'monthly', priority: '0.8'},
  {loc: '/ai-consulting-services', changefreq: 'monthly', priority: '0.8'},
  {loc: '/contact',                changefreq: 'monthly', priority: '0.8'},
];

const SERVICE_SLUGS = [
  'web-saas-applications',
  'enterprise-application-development',
  'api-development-integrations',
  'cloud-native-devops',
  'security-assessments-pen-testing',
  'managed-security-soc',
  'zero-trust-identity',
  'data-engineering-analytics',
  'enterprise-ai-agents',
  'sales-crm-chatbots',
  'operations-automation',
  'process-document-ai',
  'gdpr-compliant-ai-systems',
  'edtech-ai-platforms',
  'data-sovereignty-on-premise-ai',
  'regulatory-ai-consulting',
  'custom-llm-training',
  'model-fine-tuning',
  'multilingual-low-resource-ai',
  'speech-ai',
  'model-deployment-serving',
  'mlops-pipelines',
  'monitoring-observability',
  'ai-cost-optimization',
  'erp-implementation',
  'salesforce-servicenow',
  'platform-customization-extensions',
  'migrations-modernization',
];

const CASE_STUDIES = [
  'sovereign-voice-engine-for-mongolia',
  'custom-ai-voice-agent-closes-the-speed-to-lead-gap',
  'architecting-a-ground-up-digital-learning-powerhouse',
  'autonomous-sales-agent-drives-record-revenue-growth',
  'derby-downtown-lighting-rfp',
  'macomb-community-college-av-equipment-rfq',
  'south-platte-renew-website-rfp',
  'airfield-maintenance-pitkin-county-rfp',
  'rochester-erp-system-rfp',
  'boulder-valley-firewall-optimization-itb',
  'kansas-city-public-schools-data-dashboard-rfp',
  'tiburon-sea-level-rise-rfp',
  'town-of-amherst-comprehensive-plan-rfq',
  'uta-6g-network-gpus-ifb',
  'summerville-boone-street-sidewalk-rfp',
];

const LEGAL_PAGES = [
  {loc: '/privacy-policy', changefreq: 'yearly', priority: '0.4'},
  {loc: '/terms',          changefreq: 'yearly', priority: '0.4'},
];

// Slugs we never want indexed (test/draft content)
const EXCLUDE_SLUGS = new Set(['testing', 'test']);

function fetchSanityPosts() {
  // !(_id in path("drafts.**")) excludes unpublished drafts
  const groq = '*[_type == "post" && !(_id in path("drafts.**")) && defined(slug.current)]{ "slug": slug.current, _updatedAt, publishedAt } | order(publishedAt desc)';
  const url = 'https://' + PROJECT_ID + '.apicdn.sanity.io/v' + API_VERSION + '/data/query/' + DATASET + '?query=' + encodeURIComponent(groq);

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

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry({loc, lastmod, changefreq, priority}) {
  let out = '  <url>\n';
  out += '    <loc>' + xmlEscape(loc) + '</loc>\n';
  if (lastmod)    out += '    <lastmod>' + lastmod + '</lastmod>\n';
  if (changefreq) out += '    <changefreq>' + changefreq + '</changefreq>\n';
  if (priority)   out += '    <priority>' + priority + '</priority>\n';
  out += '  </url>';
  return out;
}

async function main() {
  console.log('Fetching published posts from Sanity...');
  const posts = await fetchSanityPosts();
  const visiblePosts = posts.filter((p) => !EXCLUDE_SLUGS.has(p.slug));
  console.log('  -> ' + posts.length + ' published posts (' + visiblePosts.length + ' after excluding test slugs)');

  const entries = [];

  STATIC_PAGES.forEach((p) => entries.push(urlEntry({
    loc: SITE_URL + p.loc,
    lastmod: TODAY,
    changefreq: p.changefreq,
    priority: p.priority,
  })));

  SERVICE_SLUGS.forEach((slug) => entries.push(urlEntry({
    loc: SITE_URL + '/services/' + slug,
    lastmod: TODAY,
    changefreq: 'monthly',
    priority: '0.85',
  })));

  CASE_STUDIES.forEach((slug) => entries.push(urlEntry({
    loc: SITE_URL + '/case-studies/' + slug,
    lastmod: TODAY,
    changefreq: 'yearly',
    priority: '0.8',
  })));

  visiblePosts.forEach((p) => entries.push(urlEntry({
    // encodeURI keeps the URL valid when slugs contain spaces or unicode
    loc: SITE_URL + '/insights/' + encodeURI(p.slug),
    lastmod: (p._updatedAt || p.publishedAt || '').slice(0, 10),
    changefreq: 'monthly',
    priority: '0.7',
  })));

  LEGAL_PAGES.forEach((p) => entries.push(urlEntry({
    loc: SITE_URL + p.loc,
    lastmod: TODAY,
    changefreq: p.changefreq,
    priority: p.priority,
  })));

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.join('\n') + '\n' +
    '</urlset>\n';

  const outPath = path.join(__dirname, '..', 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log('Wrote ' + outPath + ' (' + entries.length + ' URLs)');
}

main().catch((err) => {
  console.error('Failed to generate sitemap:', err);
  process.exit(1);
});
