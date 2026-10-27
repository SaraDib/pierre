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

/** Fetch public Méthode content (visible steps + section header) */
export async function getMethodeContent() {
  const res = await fetch(`${API_URL}/methode`, { headers: { Accept: 'application/json' } });
  const json = await parse(res, 'Échec du chargement de la méthode');
  return json.data;
}

/** Fetch admin Méthode content (all steps + section header) */
export async function getMethodeAdmin(token) {
  const res = await fetch(`${API_URL}/admin/methode`, { headers: authHeaders(token) });
  const json = await parse(res, 'Échec du chargement de la méthode');
  return json.data;
}

/** Update section header */
export async function updateMethodeSection(payload, token) {
  const res = await fetch(`${API_URL}/admin/methode/section`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  const json = await parse(res, "Échec de la mise à jour de l'en-tête de la méthode");
  return json.data;
}

/** Create (no id) or update (id) a method step. Supports image_file in FormData. */
export async function saveMethodeItem(formData, token, id) {
  const url = id ? `${API_URL}/admin/methode/items/${id}` : `${API_URL}/admin/methode/items`;
  const res = await fetch(url, { method: 'POST', headers: authHeaders(token), body: formData });
  const json = await parse(res, "Échec de l'enregistrement de l'étape");
  return json.data;
}

/** Delete a method step */
export async function deleteMethodeItem(id, token) {
  const res = await fetch(`${API_URL}/admin/methode/items/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await parse(res, "Échec de la suppression de l'étape");
}

/** Reorder method steps. Body: { ids: [2, 1, 3, 4] } */
export async function reorderMethodeItems(ids, token) {
  const res = await fetch(`${API_URL}/admin/methode/reorder`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({ ids }),
  });
  const json = await parse(res, 'Échec du réordonnancement des étapes');
  return json.data;
}
