/**
 * Configuration centrale des URLs du backend.
 * En développement local (localhost / 127.0.0.1), cible automatiquement le backend local
 * http://127.0.0.1:8000 même si le serveur Vite n'a pas été redémarré après modification de .env.
 */
const isLocalDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const LOCAL_BACKEND_URL = 'http://127.0.0.1:8000';
const DEFAULT_BACKEND_URL = isLocalDev ? LOCAL_BACKEND_URL : 'https://serv.sutravomar-pierre.ma';

const envBackend = import.meta.env.VITE_BACKEND_URL;
const envApi = import.meta.env.VITE_API_URL;

export const BACKEND_URL = (
  isLocalDev && (!envBackend || envBackend.includes('sutravomar-pierre.ma'))
    ? LOCAL_BACKEND_URL
    : envBackend || DEFAULT_BACKEND_URL
).replace(/\/+$/, '');

export const API_URL = (
  isLocalDev && (!envApi || envApi.includes('sutravomar-pierre.ma'))
    ? `${BACKEND_URL}/api`
    : envApi || `${BACKEND_URL}/api`
).replace(/\/+$/, '');
