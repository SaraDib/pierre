/**
 * Pré-rendu SEO (post-build)
 * --------------------------------------------------------------
 * Ouvre le build (dist/) dans Chrome, attend que les données de l'API
 * soient chargées, puis enregistre le HTML final de chaque page publique.
 * Les robots (Google, Bing, WhatsApp, Facebook…) reçoivent ainsi le contenu
 * complet sans devoir exécuter le JavaScript.
 *
 *   dist/index.html         -> page d'accueil pré-rendue
 *   dist/realisations.html  -> page Réalisations pré-rendue
 *   dist/spa.html           -> coquille vide (admin, routes inconnues)
 *
 * Chrome/Edge local requis. Chemin personnalisable : CHROME_PATH=...
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preview } from 'vite';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const PORT = 4179;

const ROUTES = [
  { url: '/', out: 'index.html' },
  { url: '/realisations', out: 'realisations.html' },
];

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

function findChrome() {
  return CHROME_CANDIDATES.find((p) => fs.existsSync(p));
}

/** Nettoie le HTML capturé avant écriture */
function cleanHtml(html) {
  return (
    html
      // Classes d'état ajoutées au runtime (menu ouvert, header scrollé…)
      .replace(/<header class="\s*s?\s*"/, '<header class=""')
      // Vidéo : ne pas forcer le préchargement complet côté robots
      .replace(/preload="auto"/g, 'preload="metadata"')
  );
}

async function main() {
  const shellPath = path.join(DIST, 'index.html');
  if (!fs.existsSync(shellPath)) {
    console.error('✖ dist/index.html introuvable. Lancez "vite build" avant.');
    process.exit(1);
  }

  const chrome = findChrome();
  if (!chrome) {
    console.warn('⚠ Chrome/Edge introuvable : pré-rendu ignoré (définissez CHROME_PATH).');
    return;
  }

  // Coquille SPA vierge pour /admin et les routes non pré-rendues
  const shell = fs.readFileSync(shellPath, 'utf8');
  fs.writeFileSync(path.join(DIST, 'spa.html'), shell);

  const server = await preview({ preview: { port: PORT, strictPort: true, open: false }, logLevel: 'warn' });
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'],
  });

  const results = [];
  let failed = 0;

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1366, height: 900 });
      await page.evaluateOnNewDocument(() => {
        window.__PRERENDER__ = true;
      });

      const target = `http://localhost:${PORT}${route.url}`;
      process.stdout.write(`→ ${route.url} ... `);

      try {
        await page.goto(target, { waitUntil: 'networkidle2', timeout: 60000 });
        // Attendre la disparition de tous les loaders (données API chargées)
        await page.waitForFunction(
          () => !document.querySelector('[role="status"][aria-label="Chargement"]'),
          { timeout: 30000 }
        );
        await new Promise((r) => setTimeout(r, 800));

        const check = await page.evaluate(() => ({
          title: document.title,
          h1: document.querySelector('h1')?.textContent.trim().replace(/\s+/g, ' '),
          errors: document.querySelectorAll('[role="alert"]').length,
          textLength: document.getElementById('root')?.innerText.length || 0,
        }));

        if (check.errors > 0 || check.textLength < 200) {
          throw new Error(`contenu incomplet (erreurs API: ${check.errors}, texte: ${check.textLength} car.)`);
        }

        const html = '<!doctype html>\n' + (await page.evaluate(() => document.documentElement.outerHTML));
        results.push({ ...route, html: cleanHtml(html) });
        console.log(`OK  « ${check.title} » — ${check.textLength} caractères`);
      } catch (err) {
        failed++;
        console.log(`ÉCHEC (${err.message}) → coquille SPA conservée`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.httpServer.close(resolve));
  }

  // Écriture à la fin seulement (le serveur preview utilisait index.html comme coquille)
  for (const r of results) {
    fs.writeFileSync(path.join(DIST, r.out), r.html);
  }
  // Toute route non pré-rendue garde une version fonctionnelle
  for (const route of ROUTES) {
    const p = path.join(DIST, route.out);
    if (!fs.existsSync(p)) fs.writeFileSync(p, shell);
  }

  console.log(`\n✔ Pré-rendu terminé : ${results.length}/${ROUTES.length} page(s).`);
  if (failed) console.warn('⚠ Certaines pages n\'ont pas pu être pré-rendues (API injoignable ?).');
}

main().catch((err) => {
  console.error('✖ Erreur de pré-rendu :', err);
  process.exit(1);
});
