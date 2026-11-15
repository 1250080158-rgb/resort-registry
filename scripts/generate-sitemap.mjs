import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = process.env.SITE_URL || 'https://resortregistry.vercel.app';
const ROOT = join(process.cwd(), 'src', 'data');
const PUBLIC = join(process.cwd(), 'public');

function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
}

// Một nguồn duy nhất cho ngày tháng bài blog: src/data/blogMeta.json
const blogMeta = readJson('blogMeta.json');
const metaBySlug = Object.fromEntries(blogMeta.map(m => [m.slug, { publishedAt: m.publishedAt, updatedAt: m.updatedAt }]));
const propertySlugs = readJson('propertySlugs.json');

const urls = [];

// Trang chủ
urls.push({
  loc: `${SITE_URL}/`,
  lastmod: new Date().toISOString().split('T')[0],
  changefreq: 'daily',
  priority: '1.0',
});

// Trang danh sách công khai
const listings = [
  { path: '/danh-sach-nha', changefreq: 'weekly', priority: '0.8' },
  { path: '/thue-biet-thu-nghi-duong', changefreq: 'weekly', priority: '0.8' },
  { path: '/thue-bungalow-bien', changefreq: 'weekly', priority: '0.8' },
  { path: '/mua-ban-bat-dong-san-nghi-duong', changefreq: 'weekly', priority: '0.8' },
];
for (const item of listings) {
  urls.push({
    loc: `${SITE_URL}${item.path}`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: item.changefreq,
    priority: item.priority,
  });
}

// Trang blog danh sách
urls.push({
  loc: `${SITE_URL}/blog`,
  lastmod: new Date().toISOString().split('T')[0],
  changefreq: 'weekly',
  priority: '0.8',
});

// Trang chi tiết blog (slug + ngày từ blogMeta.json)
for (const meta of blogMeta) {
  urls.push({
    loc: `${SITE_URL}/blog/${meta.slug}`,
    lastmod: meta.updatedAt || new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.6',
  });
}

// Trang chi tiết nhà
for (const item of propertySlugs) {
  urls.push({
    loc: `${SITE_URL}/nha/${item.slug}`,
    lastmod: item.lastmod || new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.7',
  });
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`),
  '</urlset>',
  '',
].join('\n');

if (!existsSync(PUBLIC)) mkdirSync(PUBLIC, { recursive: true });
writeFileSync(join(PUBLIC, 'sitemap.xml'), xml, 'utf8');

console.log(`Generated sitemap.xml with ${urls.length} URLs at ${join(PUBLIC, 'sitemap.xml')}`);
