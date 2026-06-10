import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../config/api';
import {
  definirTokens,
  limparTokensMemoria,
  normalizarTokens,
  obterTokens,
} from './tokenStore';

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

    if (Array.isArray(body.fieldErrors)) {
      const campos = body.fieldErrors
        .map((e) => `${e.field ?? e.campo}: ${e.message ?? e.defaultMessage}`)
        .join('\n');
      if (campos) return campos;
    }

    if (body.fieldErrors && typeof body.fieldErrors === 'object') {
      const campos = Object.entries(body.fieldErrors)
        .map(([campo, msg]) => `${campo}: ${msg}`)
        .join('\n');
      if (campos) return campos;
    }

    return body.message || body.error || body.detail || body.title || `Erro ${response.status}`;
  } catch {
    return `Erro ${response.status}`;
  }
}

async function obterTokensAtivos() {
  const memoria = obterTokens();
  if (memoria?.accessToken) return memoria;

  const raw = await AsyncStorage.getItem(STORAGE_KEYS.tokens);
  if (!raw) return null;

  const tokens = normalizarTokens(JSON.parse(raw));
  if (tokens?.accessToken) {
    definirTokens(tokens);
  }
  return tokens;
}

export async function getStoredTokens() {
  return obterTokensAtivos();
}

export async function saveStoredTokens(tokens) {
  const normalizados = normalizarTokens(tokens);
  await AsyncStorage.setItem(STORAGE_KEYS.tokens, JSON.stringify(normalizados));
  definirTokens(normalizados);
  return normalizados;
}

export async function clearStoredTokens() {
  limparTokensMemoria();
  await AsyncStorage.removeItem(STORAGE_KEYS.tokens);
  await AsyncStorage.removeItem(STORAGE_KEYS.email);
}

export async function getStoredEmail() {
  return AsyncStorage.getItem(STORAGE_KEYS.email);
}

export async function saveStoredEmail(email) {
  await AsyncStorage.setItem(STORAGE_KEYS.email, email.trim());
}

async function refreshAccessToken(refreshToken) {
  const tokenLimpo = String(refreshToken).trim();
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ refreshToken: tokenLimpo }),
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new ApiError(response.status, message || 'Sessão expirada');
  }

  const tokens = normalizarTokens(await response.json());
  await saveStoredTokens(tokens);
  return tokens;
}

export async function apiRequest(path, options = {}, retry = true) {
  const tokens = await obterTokensAtivos();
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers ?? {}),
  };

  if (tokens?.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body,
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
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email: email.trim(),
      senha: senha,
    }),
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new ApiError(response.status, message);
  }

  const tokens = normalizarTokens(await response.json());

  if (!tokens?.accessToken || !tokens?.refreshToken) {
    throw new ApiError(500, 'Resposta de login inválida da API.');
  }

  await saveStoredTokens(tokens);
  await saveStoredEmail(email.trim());
  return tokens;
}

export async function logoutRequest() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    await clearStoredTokens();
  }
}
