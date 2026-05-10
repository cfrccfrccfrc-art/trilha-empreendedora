#!/usr/bin/env node
// Gera public/sitemap.xml a partir de src/data/*.json
// Roda automaticamente antes de cada build (ver package.json: build).

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const OUT = path.join(ROOT, 'public', 'sitemap.xml');

const SITE = process.env.SITE_URL || 'https://trilha-empreendedora.vercel.app';
const TODAY = new Date().toISOString().slice(0, 10);

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8'));
}

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/diagnostico', priority: '0.9', changefreq: 'monthly' },
  { path: '/conteudos', priority: '0.8', changefreq: 'monthly' },
  { path: '/casos', priority: '0.8', changefreq: 'monthly' },
  { path: '/oportunidades', priority: '0.6', changefreq: 'monthly' },
  { path: '/formalizacao', priority: '0.7', changefreq: 'monthly' },
  { path: '/mini/precificacao', priority: '0.7', changefreq: 'monthly' },
  { path: '/mini/capital', priority: '0.7', changefreq: 'monthly' },
  { path: '/mini/canais', priority: '0.7', changefreq: 'monthly' },
  { path: '/posso-ajudar', priority: '0.5', changefreq: 'monthly' },
];

function urlEntry({ path: p, priority, changefreq, lastmod = TODAY }) {
  return [
    '  <url>',
    `    <loc>${SITE}${p}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

const lines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
];

for (const r of STATIC_ROUTES) {
  lines.push(urlEntry(r));
}

const resources = readJson('resources.json').filter((r) => r.status === 'active');
for (const r of resources) {
  lines.push(
    urlEntry({
      path: `/conteudos/${r.id}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: r.lastReviewed || TODAY,
    })
  );
}

const cases = readJson('cases.json').filter((c) => c.status === 'active');
for (const c of cases) {
  lines.push(
    urlEntry({
      path: `/casos/${c.id}`,
      priority: '0.6',
      changefreq: 'monthly',
    })
  );
}

lines.push('</urlset>');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, lines.join('\n') + '\n', 'utf8');

const totalUrls =
  STATIC_ROUTES.length + resources.length + cases.length;
console.log(`✓ sitemap.xml gerado com ${totalUrls} URLs em ${OUT}`);
