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

const jsonHeaders = (token) => ({
  ...authHeaders(token),
  'Content-Type': 'application/json; charset=utf-8',
});

/** Fetch public FAQ content (visible questions, categories, and section header) */
export async function getFaqContent(params = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.featured !== undefined) query.set('featured', params.featured ? '1' : '0');
  if (params.q) query.set('q', params.q);

  const qs = query.toString();
  const url = `${API_URL}/faq${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const json = await parse(res, 'Échec du chargement de la FAQ');
  return json.data;
}

/** Fetch admin FAQ content (all questions, categories, and section header) */
export async function getFaqAdmin(token, params = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.q) query.set('q', params.q);

  const qs = query.toString();
  const url = `${API_URL}/admin/faq${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, { headers: authHeaders(token) });
  const json = await parse(res, 'Échec du chargement de la FAQ');
  return json.data;
}

/** Update section header */
export async function updateFaqSection(payload, token) {
  const res = await fetch(`${API_URL}/admin/faq/section`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  const json = await parse(res, "Échec de la mise à jour de l'en-tête de la FAQ");
  return json.data;
}

/** Create (no id) or update (id) a FAQ item */
export async function saveFaqItem(payload, token, id) {
  const url = id ? `${API_URL}/admin/faq/items/${id}` : `${API_URL}/admin/faq/items`;
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;

  const res = await fetch(url, {
    method: 'POST',
    headers: isFormData ? authHeaders(token) : jsonHeaders(token),
    body: isFormData ? payload : JSON.stringify(payload),
  });
  const json = await parse(res, "Échec de l'enregistrement de la question");
  return json.data;
}

/** Delete a FAQ item */
export async function deleteFaqItem(id, token) {
  const res = await fetch(`${API_URL}/admin/faq/items/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await parse(res, 'Échec de la suppression de la question');
}

/** Reorder FAQ items. Body: { ids: [2, 1, 3] } */
export async function reorderFaqItems(ids, token) {
  const res = await fetch(`${API_URL}/admin/faq/reorder`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({ ids }),
  });
  const json = await parse(res, 'Échec du réordonnancement des questions');
  return json.data;
}

/** Create (no id) or update (id) a category */
export async function saveFaqCategory(payload, token, id) {
  const url = id ? `${API_URL}/admin/faq/categories/${id}` : `${API_URL}/admin/faq/categories`;
  const res = await fetch(url, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  const json = await parse(res, "Échec de l'enregistrement de la catégorie");
  return json.data;
}

/** Delete a category */
export async function deleteFaqCategory(id, token) {
  const res = await fetch(`${API_URL}/admin/faq/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await parse(res, 'Échec de la suppression de la catégorie');
}

/** Reorder categories */
export async function reorderFaqCategories(ids, token) {
  const res = await fetch(`${API_URL}/admin/faq/categories/reorder`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({ ids }),
  });
  const json = await parse(res, 'Échec du réordonnancement des catégories');
  return json.data;
}
