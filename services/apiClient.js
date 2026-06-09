import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../config/api';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function parseError(response) {
  try {
    const body = await response.json();
    return body.message || body.detail || body.title || `Erro ${response.status}`;
  } catch {
    return `Erro ${response.status}`;
  }
}

export async function getStoredTokens() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.tokens);
  return raw ? JSON.parse(raw) : null;
}

export async function saveStoredTokens(tokens) {
  await AsyncStorage.setItem(STORAGE_KEYS.tokens, JSON.stringify(tokens));
}

export async function clearStoredTokens() {
  await AsyncStorage.removeItem(STORAGE_KEYS.tokens);
}

async function refreshAccessToken(refreshToken) {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'Sessão expirada');
  }

  const tokens = await response.json();
  await saveStoredTokens(tokens);
  return tokens;
}

export async function apiRequest(path, options = {}, retry = true) {
  const tokens = await getStoredTokens();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  if (tokens?.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry && tokens?.refreshToken) {
    try {
      await refreshAccessToken(tokens.refreshToken);
      return apiRequest(path, options, false);
    } catch {
      await clearStoredTokens();
      throw new ApiError(401, 'Sessão expirada. Faça login novamente.');
    }
  }

  if (!response.ok) {
    const message = await parseError(response);
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function loginRequest(email, senha) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new ApiError(response.status, message);
  }

  const tokens = await response.json();
  await saveStoredTokens(tokens);
  return tokens;
}

export async function logoutRequest() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    await clearStoredTokens();
  }
}
