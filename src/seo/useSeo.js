import { useEffect } from 'react';

export const SITE_URL = 'https://sutravomar-pierre.ma';
export const SITE_NAME = 'SUTRAVOMAR STONE LUXE';
export const DEFAULT_IMAGE = `${SITE_URL}/og-cover.jpg`;

/** Trouve (ou crée) une balise <meta> / <link> dans le <head> */
function ensureTag(tag, attr, key) {
  let el = document.head.querySelector(`${tag}[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(attr, key);
    el.dataset.seoCreated = '1';
    document.head.appendChild(el);
  }
  return el;
}

/**
 * Applique une liste de modifications au <head> et renvoie une fonction
 * qui restaure l'état précédent (utile au changement de page).
 */
function applyHead(entries) {
  const restores = [];
  for (const { tag, attr, key, valueAttr, value } of entries) {
    if (value === undefined || value === null) continue;
    const el = ensureTag(tag, attr, key);
    const created = el.dataset.seoCreated === '1' && !el.hasAttribute(valueAttr);
    const prev = el.getAttribute(valueAttr);
    el.setAttribute(valueAttr, value);
    restores.push(() => {
      if (created) el.remove();
      else if (prev !== null) el.setAttribute(valueAttr, prev);
    });
  }
  return () => restores.reverse().forEach((fn) => fn());
}

/** Ajoute/remplace un bloc JSON-LD identifié par un id */
export function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data, null, 2);
}

/**
 * Hook SEO par page : title, description, canonical, Open Graph, Twitter, robots.
 *
 * @param {object} opts
 * @param {string} [opts.title]
 * @param {string} [opts.description]
 * @param {string} [opts.path]      Chemin canonique (ex: '/realisations')
 * @param {string} [opts.image]     URL absolue de l'image de partage
 * @param {boolean} [opts.noindex]  Exclure la page des moteurs de recherche
 */
export function useSeo({ title, description, path, image, noindex = false } = {}) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    const url = path !== undefined ? `${SITE_URL}${path}` : undefined;
    const img = image || undefined;

    const restoreHead = applyHead([
      { tag: 'meta', attr: 'name', key: 'description', valueAttr: 'content', value: description },
      { tag: 'link', attr: 'rel', key: 'canonical', valueAttr: 'href', value: url },
      { tag: 'meta', attr: 'property', key: 'og:title', valueAttr: 'content', value: title },
      { tag: 'meta', attr: 'property', key: 'og:description', valueAttr: 'content', value: description },
      { tag: 'meta', attr: 'property', key: 'og:url', valueAttr: 'content', value: url },
      { tag: 'meta', attr: 'property', key: 'og:image', valueAttr: 'content', value: img },
      { tag: 'meta', attr: 'name', key: 'twitter:title', valueAttr: 'content', value: title },
      { tag: 'meta', attr: 'name', key: 'twitter:description', valueAttr: 'content', value: description },
      { tag: 'meta', attr: 'name', key: 'twitter:image', valueAttr: 'content', value: img },
      {
        tag: 'meta',
        attr: 'name',
        key: 'robots',
        valueAttr: 'content',
        value: noindex ? 'noindex, nofollow' : undefined,
      },
    ]);

    return () => {
      document.title = prevTitle;
      restoreHead();
    };
  }, [title, description, path, image, noindex]);
}
