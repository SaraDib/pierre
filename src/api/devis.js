import { API_URL } from './config';

export const DEFAULT_DEVIS_SECTION = {
  eyebrow: 'Devis sur mesure',
  title_prefix: 'Donnez vie à',
  title_emphasis: 'vos projets de pierre.',
  description: 'Partagez-nous les dimensions, surfaces et inspirations de votre ouvrage. Notre bureau d\'études vous transmet une estimation détaillée et personnalisée.',
  stat1_value: '24h',
  stat1_label: 'Délai de réponse',
  stat2_value: 'Gratuit',
  stat2_label: 'Étude & chiffrage',
  button_text: 'Envoyer via WhatsApp',
  note_text: 'Le message se prépare automatiquement dans WhatsApp, prêt à être expédié.',
};

/**
 * Get Devis section content (public)
 */
export async function getDevisSection() {
  try {
    const res = await fetch(`${API_URL}/devis/section`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Échec du chargement de la section devis');
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn('Utilisation du contenu local devis:', err.message);
    return DEFAULT_DEVIS_SECTION;
  }
}

/**
 * Update Devis section content (admin)
 */
export async function updateDevisSection(payload, token) {
  const res = await fetch(`${API_URL}/admin/devis/section`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `Erreur HTTP ${res.status}`);
  }
  return json.data;
}

/**
 * Submit a quote request (public - saves trace before opening WhatsApp)
 */
export async function submitDevis(formData) {
  try {
    const res = await fetch(`${API_URL}/devis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn('Erreur enregistrement devis backend:', json.message);
    }
    return json.data;
  } catch (err) {
    console.warn('Trace devis non envoyée au serveur:', err.message);
    return null;
  }
}

/**
 * Get all quote requests with search / filter (admin)
 */
export async function getDevisList(params = {}, token) {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'all') {
    query.set('status', params.status);
  }
  if (params.search) {
    query.set('search', params.search);
  }

  const res = await fetch(`${API_URL}/admin/devis?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `Erreur HTTP ${res.status}`);
  }
  return json.data;
}

/**
 * Get quote stats (admin)
 */
export async function getDevisStats(token) {
  try {
    const res = await fetch(`${API_URL}/admin/devis/stats`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message);
    return json.data;
  } catch (err) {
    console.warn('Stats devis non disponibles:', err.message);
    return { total: 0, nouveau: 0, en_cours: 0, traite: 0 };
  }
}

/**
 * Update quote status / notes (admin)
 */
export async function updateDevis(id, payload, token) {
  const res = await fetch(`${API_URL}/admin/devis/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `Erreur HTTP ${res.status}`);
  }
  return json.data;
}

/**
 * Delete a quote request (admin)
 */
export async function deleteDevis(id, token) {
  const res = await fetch(`${API_URL}/admin/devis/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `Erreur HTTP ${res.status}`);
  }
  return true;
}
