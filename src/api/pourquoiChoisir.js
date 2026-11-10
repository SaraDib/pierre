import { API_URL, BACKEND_URL } from './config';

export function formatPourquoiMediaUrl(url) {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  if (url.startsWith('/storage/')) {
    return `${BACKEND_URL}${url}`;
  }
  return url;
}

export const DEFAULT_POURQUOI_CATEGORIES = [
  {
    id: 1,
    icon: 'home',
    line1: 'Maisons',
    line2: '& villas',
    is_active: true,
  },
  {
    id: 2,
    icon: 'hotel',
    line1: 'Hôtels',
    line2: '& restaurants',
    is_active: true,
  },
  {
    id: 3,
    icon: 'shop',
    line1: 'Commerces',
    line2: '& boutiques',
    is_active: true,
  },
  {
    id: 4,
    icon: 'users',
    line1: 'Espaces publics',
    line2: '& professionnels',
    is_active: true,
  },
];

export const DEFAULT_POURQUOI_CHOISIR = {
  eyebrow: 'POURQUOI NOUS CHOISIR ?',
  title_line1: "L'excellence",
  title_line2: 'au cœur de chaque projet.',
  description:
    "Chez SUTRAVOMAR, nous ne vendons pas seulement des pierres, nous créons des espaces intemporels. Chaque projet est une rencontre entre la nature, l'architecture et votre vision.",
  stat1_number: '+500',
  stat1_label: 'Projets réalisés',
  stat2_number: '100%',
  stat2_label: 'Clients satisfaits',
  stat3_number: '15 ans',
  stat3_label: "D'expérience",
  button_text: 'En savoir plus',
  button_link: '#materiaux',
  image: '/images/pourquoi-nous-choisir-escalier.jpg',
  image_alt: 'Escalier monumental en marbre avec éclairage LED sous chaque marche',
  quote_line1: 'La pierre',
  quote_line2: 'révèle le caractère',
  quote_line3: 'de vos espaces',
  categories: DEFAULT_POURQUOI_CATEGORIES,
};

export async function getPourquoiChoisir() {
  try {
    const res = await fetch(`${API_URL}/pourquoi-choisir`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Échec du chargement de la section Pourquoi nous choisir');
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn('Utilisation des données par défaut (Pourquoi nous choisir):', err.message);
    return null;
  }
}

export async function getPourquoiChoisirAdmin(token) {
  const res = await fetch(`${API_URL}/admin/pourquoi-choisir`, {
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

export async function updatePourquoiChoisir(payload, token) {
  let body;
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  if (payload instanceof FormData) {
    body = payload;
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  const res = await fetch(`${API_URL}/admin/pourquoi-choisir`, {
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

export async function resetPourquoiChoisir(token) {
  const res = await fetch(`${API_URL}/admin/pourquoi-choisir/reset`, {
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

