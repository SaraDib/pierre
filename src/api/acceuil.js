import { API_URL, BACKEND_URL } from './config';

/**
 * Format media URL (ensures Laravel storage paths resolve to the backend host)
 */
export function formatMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/storage/')) {
    return `${BACKEND_URL}${url}`;
  }
  return url;
}

/**
 * Fetch Acceuil content (public)
 */
export async function getAcceuilContent() {
  try {
    const res = await fetch(`${API_URL}/acceuil`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Échec du chargement du contenu');
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn('Utilisation du contenu local par défaut:', err.message);
    return null;
  }
}

/**
 * Update Acceuil content (admin)
 */
export async function updateAcceuilContent(payload, token) {
  let body;
  let headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  if (payload instanceof FormData) {
    body = payload;
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  const res = await fetch(`${API_URL}/admin/acceuil`, {
    method: 'POST',
    headers,
    body,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || 'Échec de la mise à jour du contenu.');
  }

  return json.data;
}

/**
 * Reset Acceuil content to initial defaults (admin)
 */
export async function resetAcceuilContent(token) {
  const res = await fetch(`${API_URL}/admin/acceuil/reset`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || 'Échec de la réinitialisation.');
  }

  return json.data;
}
