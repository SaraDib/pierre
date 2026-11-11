import { API_URL } from './config';

async function parse(res, fallback) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const firstError = json.errors ? Object.values(json.errors)[0]?.[0] : null;
    const err = new Error(firstError || json.message || fallback);
    err.status = res.status;
    throw err;
  }
  return json;
}

const authHeaders = (token) => ({
  Accept: 'application/json',
  Authorization: `Bearer ${token}`,
});

const jsonHeaders = (token) => ({
  ...authHeaders(token),
  'Content-Type': 'application/json',
});

/* ------------------------------------------------------------------ Types de matériaux */

/** Public : types visibles (Marbre, Granit…) + en-tête de section. */
export async function getCatalogueCategories() {
  const res = await fetch(`${API_URL}/catalogue-categories`, { headers: { Accept: 'application/json' } });
  const json = await parse(res, 'Échec du chargement des types de matériaux');
  return {
    items: Array.isArray(json.data) ? json.data : [],
    section: json.section || null,
  };
}

/** Public : un type + ses variétés visibles + type précédent/suivant. */
export async function getCatalogueCategory(slug) {
  const res = await fetch(`${API_URL}/catalogue-categories/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
  });
  const json = await parse(res, 'Type de matériau introuvable');
  return {
    category: json.data,
    materials: Array.isArray(json.materials) ? json.materials : [],
    prev: json.prev || null,
    next: json.next || null,
  };
}

/** Public : fiche d'une variété dans son type + variété précédente/suivante du même type. */
export async function getCatalogueMaterial(categorySlug, slug) {
  const res = await fetch(
    `${API_URL}/catalogue-materiaux/${encodeURIComponent(categorySlug)}/${encodeURIComponent(slug)}`,
    { headers: { Accept: 'application/json' } }
  );
  const json = await parse(res, 'Matériau introuvable');
  return {
    material: json.data,
    category: json.category || null,
    prev: json.prev || null,
    next: json.next || null,
  };
}

/** Admin : tous les types (y compris masqués). */
export async function getCatalogueCategoriesAdmin(token) {
  const res = await fetch(`${API_URL}/admin/catalogue-categories`, { headers: authHeaders(token) });
  const json = await parse(res, 'Échec du chargement des types');
  return Array.isArray(json.data) ? json.data : [];
}

/** Création (sans id) ou mise à jour (avec id). `formData` accepte image_file, hero_file. */
export async function saveCatalogueCategory(formData, token, id) {
  const url = id ? `${API_URL}/admin/catalogue-categories/${id}` : `${API_URL}/admin/catalogue-categories`;
  const res = await fetch(url, { method: 'POST', headers: authHeaders(token), body: formData });
  const json = await parse(res, "Échec de l'enregistrement du type.");
  return json.data;
}

export async function deleteCatalogueCategory(id, token) {
  const res = await fetch(`${API_URL}/admin/catalogue-categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await parse(res, 'Échec de la suppression du type.');
}

export async function reorderCatalogueCategories(ids, token) {
  const res = await fetch(`${API_URL}/admin/catalogue-categories/reorder`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({ ids }),
  });
  const json = await parse(res, "Échec de la mise à jour de l'ordre.");
  return Array.isArray(json.data) ? json.data : [];
}

/* ------------------------------------------------------------------ Variétés */

/** Public : matériaux visibles du catalogue + en-tête de section. */
export async function getCatalogueMateriaux() {
  const res = await fetch(`${API_URL}/catalogue-materiaux`, { headers: { Accept: 'application/json' } });
  const json = await parse(res, 'Échec du chargement des matériaux');
  return {
    items: Array.isArray(json.data) ? json.data : [],
    section: json.section || null,
  };
}

/** Public (ancien lien) : variété par son seul slug — sert à rediriger vers la nouvelle URL. */
export async function getCatalogueMaterialBySlug(slug) {
  const res = await fetch(`${API_URL}/catalogue-materiaux/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
  });
  const json = await parse(res, 'Matériau introuvable');
  return { material: json.data };
}

/** Admin : tout le catalogue (y compris les matériaux masqués) + types + en-tête de section. */
export async function getCatalogueAdmin(token) {
  const res = await fetch(`${API_URL}/admin/catalogue-materiaux`, { headers: authHeaders(token) });
  const json = await parse(res, 'Échec du chargement des matériaux');
  return {
    items: Array.isArray(json.data) ? json.data : [],
    categories: Array.isArray(json.categories) ? json.categories : [],
    section: json.section || null,
  };
}

/** Admin : mise à jour de l'en-tête de section (#materiaux et /detailsmateriaux). */
export async function updateCatalogueSection(payload, token) {
  const res = await fetch(`${API_URL}/admin/catalogue-materiaux/section`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  const json = await parse(res, "Échec de la mise à jour de l'en-tête.");
  return json.data;
}

/** Création (sans id) ou mise à jour (avec id). `formData` accepte image_file, hero_file, gallery_files[]. */
export async function saveCatalogueItem(formData, token, id) {
  const url = id ? `${API_URL}/admin/catalogue-materiaux/${id}` : `${API_URL}/admin/catalogue-materiaux`;
  const res = await fetch(url, { method: 'POST', headers: authHeaders(token), body: formData });
  const json = await parse(res, "Échec de l'enregistrement du matériau.");
  return json.data;
}

export async function deleteCatalogueItem(id, token) {
  const res = await fetch(`${API_URL}/admin/catalogue-materiaux/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await parse(res, 'Échec de la suppression.');
}

export async function reorderCatalogueItems(ids, token) {
  const res = await fetch(`${API_URL}/admin/catalogue-materiaux/reorder`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({ ids }),
  });
  const json = await parse(res, "Échec de la mise à jour de l'ordre.");
  return json.data;
}
