import { API_URL } from './config';

async function parse(res, fallback) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || fallback);
  }
  return json;
}

const authHeaders = (token) => ({
  Accept: 'application/json',
  Authorization: `Bearer ${token}`,
});

const jsonHeaders = (token) => ({ ...authHeaders(token), 'Content-Type': 'application/json' });

/**
 * Fetch Réalisations content (public).
 * @param {string | { category?: string, featured?: boolean }} [filter]
 */
export async function getRealisationsContent(filter) {
  const params = new URLSearchParams();
  if (typeof filter === 'string' && filter && filter !== 'all') {
    params.set('category', filter);
  } else if (typeof filter === 'object' && filter !== null) {
    if (filter.category && filter.category !== 'all') {
      params.set('category', filter.category);
    }
    if (filter.featured) {
      params.set('featured', '1');
    }
  }

  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_URL}/realisations${qs}`, { headers: { Accept: 'application/json' } });
  const json = await parse(res, 'Échec du chargement des réalisations');
  return json.data;
}

/** Fetch everything including hidden items, categories, and materiaux options (admin). */
export async function getRealisationsAdmin(token) {
  const res = await fetch(`${API_URL}/admin/realisations`, { headers: authHeaders(token) });
  const json = await parse(res, 'Échec du chargement des réalisations');
  return json.data;
}

export async function updateRealisationsSection(payload, token) {
  const res = await fetch(`${API_URL}/admin/realisations/section`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  const json = await parse(res, "Échec de la mise à jour des en-têtes.");
  return json.data;
}

/** Create (no id) or update (id) a project. `formData` supports cover_image_file, gallery_files, materiaux_ids. */
export async function saveRealisationItem(formData, token, id) {
  const url = id ? `${API_URL}/admin/realisations/items/${id}` : `${API_URL}/admin/realisations/items`;
  const res = await fetch(url, { method: 'POST', headers: authHeaders(token), body: formData });
  const json = await parse(res, "Échec de l'enregistrement du projet.");
  return json.data;
}

export async function deleteRealisationItem(id, token) {
  const res = await fetch(`${API_URL}/admin/realisations/items/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await parse(res, 'Échec de la suppression du projet.');
}

export async function reorderRealisationItems(ids, token) {
  const res = await fetch(`${API_URL}/admin/realisations/reorder`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({ ids }),
  });
  const json = await parse(res, 'Échec du réordonnancement des projets.');
  return json.data;
}

/** Create (no id) or update (id) a category. */
export async function saveRealisationCategory(payload, token, id) {
  const url = id
    ? `${API_URL}/admin/realisations/categories/${id}`
    : `${API_URL}/admin/realisations/categories`;
  const res = await fetch(url, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  const json = await parse(res, "Échec de l'enregistrement de la catégorie.");
  return json.data;
}

export async function deleteRealisationCategory(id, token) {
  const res = await fetch(`${API_URL}/admin/realisations/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await parse(res, 'Échec de la suppression de la catégorie.');
}

export async function reorderRealisationCategories(ids, token) {
  const res = await fetch(`${API_URL}/admin/realisations/categories/reorder`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({ ids }),
  });
  const json = await parse(res, 'Échec du réordonnancement des catégories.');
  return json.data;
}
