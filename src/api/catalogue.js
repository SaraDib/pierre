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

/** Public : matériaux visibles du catalogue + en-tête de section. */
export async function getCatalogueMateriaux() {
  const res = await fetch(`${API_URL}/catalogue-materiaux`, { headers: { Accept: 'application/json' } });
  const json = await parse(res, 'Échec du chargement des matériaux');
  return {
    items: Array.isArray(json.data) ? json.data : [],
    section: json.section || null,
  };
}

/** Public : détail d'un matériau par son slug + précédent/suivant. */
export async function getCatalogueMaterialBySlug(slug) {
  const res = await fetch(`${API_URL}/catalogue-materiaux/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
  });
  const json = await parse(res, 'Matériau introuvable');
  return {
    material: json.data,
    prev: json.prev || null,
    next: json.next || null,
    section: json.section || null,
  };
}

/** Admin : tout le catalogue (y compris les matériaux masqués) + en-tête de section. */
export async function getCatalogueAdmin(token) {
  const res = await fetch(`${API_URL}/admin/catalogue-materiaux`, { headers: authHeaders(token) });
  const json = await parse(res, 'Échec du chargement des matériaux');
  return {
    items: Array.isArray(json.data) ? json.data : [],
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
