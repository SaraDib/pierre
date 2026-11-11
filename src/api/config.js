/**
 * Configuration centrale des URLs du backend (Local & Production Hosting).
 * - En local (localhost / 127.0.0.1) : utilise http://127.0.0.1:8000
 * - En production (hébergement) : utilise https://serv.sutravomar-pierre.ma
 */
const isLocalHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const LOCAL_BACKEND_URL = 'http://127.0.0.1:8000';
const PROD_BACKEND_URL = 'https://serv.sutravomar-pierre.ma';

const envBackend = (import.meta.env.VITE_BACKEND_URL || '').trim();
const envApi = (import.meta.env.VITE_API_URL || '').trim();

function resolveBackendUrl() {
  if (isLocalHost) {
    // En local, ignore l'URL de production si elle est présente dans .env
    if (!envBackend || envBackend.includes('sutravomar-pierre.ma')) {
      return LOCAL_BACKEND_URL;
    }
    return envBackend;
  }

  // En hébergement/production, ignore localhost/127.0.0.1 si présent dans .env
  if (!envBackend || envBackend.includes('127.0.0.1') || envBackend.includes('localhost')) {
    return PROD_BACKEND_URL;
  }
  return envBackend;
}

export const BACKEND_URL = resolveBackendUrl().replace(/\/+$/, '');

function resolveApiUrl() {
  if (isLocalHost) {
    if (!envApi || envApi.includes('sutravomar-pierre.ma')) {
      return `${BACKEND_URL}/api`;
    }
    return envApi;
  }

  if (!envApi || envApi.includes('127.0.0.1') || envApi.includes('localhost')) {
    return `${BACKEND_URL}/api`;
  }
  return envApi;
}

export const API_URL = resolveApiUrl().replace(/\/+$/, '');
