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

/**
 * Fetch Savoir-faire content (public). Throws on failure so the page can show an error state.
 */
export async function getSavoirFaireContent() {
  const res = await fetch(`${API_URL}/savoir-faire`, {
    headers: { Accept: 'application/json' },
  });
  const json = await parse(res, 'Échec du chargement du contenu');
  return json.data;
}

/** Fetch all content including hidden items (admin). */
export async function getSavoirFaireAdmin(token) {
  const res = await fetch(`${API_URL}/admin/savoir-faire`, { headers: authHeaders(token) });
  const json = await parse(res, 'Échec du chargement du contenu');
  return json.data;
}

export async function updateSavoirFaireSection(payload, token) {
  const res = await fetch(`${API_URL}/admin/savoir-faire/section`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await parse(res, "Échec de la mise à jour de l'en-tête.");
  return json.data;
}

/** Create (no id) or update (id) an item. `formData` supports image_file upload. */
export async function saveSavoirFaireItem(formData, token, id) {
  const url = id
    ? `${API_URL}/admin/savoir-faire/items/${id}`
    : `${API_URL}/admin/savoir-faire/items`;
  const res = await fetch(url, { method: 'POST', headers: authHeaders(token), body: formData });
  const json = await parse(res, "Échec de l'enregistrement.");
  return json.data;
}

export async function deleteSavoirFaireItem(id, token) {
  const res = await fetch(`${API_URL}/admin/savoir-faire/items/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await parse(res, 'Échec de la suppression.');
}

export async function reorderSavoirFaireItems(ids, token) {
  const res = await fetch(`${API_URL}/admin/savoir-faire/reorder`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  const json = await parse(res, 'Échec du réordonnancement.');
  return json.data;
}
