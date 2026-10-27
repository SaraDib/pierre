import { API_URL } from './config';

/**
 * Log in admin using email and password
 */
export async function loginAdmin(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data.message ||
      (data.errors && Object.values(data.errors).flat().join(' ')) ||
      'Une erreur est survenue lors de la connexion.';
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Fetch current authenticated user
 */
export async function getMe(token) {
  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Session expirée ou invalide.');
  }

  return response.json();
}

/**
 * Log out admin
 */
export async function logoutAdmin(token) {
  try {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.error('Logout error:', err);
  }
}
