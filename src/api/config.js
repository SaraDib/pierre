/**
 * Configuration centrale des URLs du backend.
 * Surchargeable via les variables d'environnement Vite (VITE_BACKEND_URL / VITE_API_URL).
 */
const DEFAULT_BACKEND_URL = 'https://serv.sutravomar-pierre.ma';

export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, '');
export const API_URL = (import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`).replace(/\/+$/, '');
