const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/**
 * Format media URL (ensures Laravel storage paths resolve to backend port 8000)
 */
export function formatCompanyMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/storage/')) {
    return `${BACKEND_URL}${url}`;
  }
  return url;
}

/**
 * Default fallback company info
 */
export const DEFAULT_COMPANY = {
  name: 'SUTRAVOMAR',
  tagline: 'STONE LUXE',
  description: 'Marbre, granit et pierre naturelle : sélection, taille, vente et pose partout au Maroc.',
  logo_url: '/logo-gold.png',
  logo_footer_url: null,
  phone: '+212 6 00 00 00 00',
  phone_secondary: '',
  whatsapp_number: '212600000000',
  email: 'contact@sutravomar-stone.ma',
  address: 'Atelier & Showroom, Maroc',
  city: 'Casablanca',
  country: 'Maroc',
  opening_hours: 'Lun - Sam : 08h30 - 18h30',
  intervention_zone: 'Intervention dans tout le Maroc',
  instagram_url: 'https://instagram.com',
  facebook_url: 'https://facebook.com',
  maps_url: '',
  copyright: `© ${new Date().getFullYear()} SUTRAVOMAR STONE LUXE. Tous droits réservés.`,
};

/**
 * Fetch company information (public)
 */
export async function getCompanyInfo() {
  try {
    const res = await fetch(`${API_URL}/company`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Échec du chargement des informations');
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn('Utilisation des informations par défaut de l\'entreprise:', err.message);
    return null;
  }
}

/**
 * Update company information (admin)
 */
export async function updateCompanyInfo(payload, token) {
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

  const res = await fetch(`${API_URL}/admin/company`, {
    method: 'POST',
    headers,
    body,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || `Erreur HTTP ${res.status}`);
  }

  return json.data;
}

/**
 * Reset company info to default values (admin)
 */
export async function resetCompanyInfo(token) {
  const res = await fetch(`${API_URL}/admin/company/reset`, {
    method: 'POST',
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
