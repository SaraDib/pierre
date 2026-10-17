const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
 * Convert a DB texture payload ({ slug, texture_type | texture: {...} }) into the shape
 * expected by <StoneTexture material={...} />.
 */
export function toStoneMaterial(m) {
  if (!m) return null;
  const t = m.texture || m;
  return {
    k: m.slug,
    type: t.type ?? t.texture_type,
    base: t.base,
    vein: t.vein,
    tone: t.tone,
    freq: t.freq,
    seed: t.seed,
  };
}

/**
 * Fetch Matériaux content (public). Optional category slug filter.
 * Throws on failure so the page can show an error state.
 */
export async function getMateriauxContent(category) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : '';
  const res = await fetch(`${API_URL}/materiaux${qs}`, { headers: { Accept: 'application/json' } });
  const json = await parse(res, 'Échec du chargement du contenu');
  return json.data;
}

/** Fetch everything including hidden items and categories (admin). */
export async function getMateriauxAdmin(token) {
  const res = await fetch(`${API_URL}/admin/materiaux`, { headers: authHeaders(token) });
  const json = await parse(res, 'Échec du chargement du contenu');
  return json.data;
}

export async function updateMateriauxSection(payload, token) {
  const res = await fetch(`${API_URL}/admin/materiaux/section`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  const json = await parse(res, "Échec de la mise à jour de l'en-tête.");
  return json.data;
}

/** Create (no id) or update (id) a material. `formData` supports image_file upload. */
export async function saveMateriauxItem(formData, token, id) {
  const url = id ? `${API_URL}/admin/materiaux/items/${id}` : `${API_URL}/admin/materiaux/items`;
  const res = await fetch(url, { method: 'POST', headers: authHeaders(token), body: formData });
  const json = await parse(res, "Échec de l'enregistrement.");
  return json.data;
}

export async function deleteMateriauxItem(id, token) {
  const res = await fetch(`${API_URL}/admin/materiaux/items/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await parse(res, 'Échec de la suppression.');
}

export async function reorderMateriauxItems(ids, token) {
  const res = await fetch(`${API_URL}/admin/materiaux/reorder`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({ ids }),
  });
  const json = await parse(res, 'Échec du réordonnancement.');
  return json.data;
}

/** Create (no id) or update (id) a category. */
export async function saveMateriauxCategory(payload, token, id) {
  const url = id
    ? `${API_URL}/admin/materiaux/categories/${id}`
    : `${API_URL}/admin/materiaux/categories`;
  const res = await fetch(url, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  const json = await parse(res, "Échec de l'enregistrement de la catégorie.");
  return json.data;
}

export async function deleteMateriauxCategory(id, token) {
  const res = await fetch(`${API_URL}/admin/materiaux/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await parse(res, 'Échec de la suppression.');
}

export async function reorderMateriauxCategories(ids, token) {
  const res = await fetch(`${API_URL}/admin/materiaux/categories/reorder`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({ ids }),
  });
  const json = await parse(res, 'Échec du réordonnancement.');
  return json.data;
}
