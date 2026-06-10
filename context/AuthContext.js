import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginRequest,
  logoutRequest,
  getStoredTokens,
  getStoredEmail,
  clearStoredTokens,
} from '../services/apiClient';
import { registrarCallbackTokens } from '../services/tokenStore';

const AuthContext = createContext(null);

function nomeDoEmail(email) {
  const parte = String(email ?? '').split('@')[0] ?? '';
  return parte.replace(/[._-]/g, ' ').trim() || 'Usuário';
}

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(null);
  const [emailLogado, setEmailLogado] = useState(null);
  const [nomeLogado, setNomeLogado] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    registrarCallbackTokens(setTokens);
    Promise.all([getStoredTokens(), getStoredEmail()])
      .then(([stored, email]) => {
        setTokens(stored);
        setEmailLogado(email);
        setNomeLogado(email ? nomeDoEmail(email) : null);
      })
      .finally(() => setCarregando(false));
  }, []);

  const login = useCallback(async (email, senha, nome) => {
    const novosTokens = await loginRequest(email, senha);
    const emailLimpo = email.trim();
    const nomeLimpo = String(nome ?? '').trim() || nomeDoEmail(emailLimpo);

    setTokens(novosTokens);
    setEmailLogado(emailLimpo);
    setNomeLogado(nomeLimpo);
    return novosTokens;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      await clearStoredTokens();
    }
    setTokens(null);
    setEmailLogado(null);
    setNomeLogado(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        tokens,
        emailLogado,
        nomeLogado,
        role: tokens?.role ?? null,
        autenticado: !!tokens?.accessToken,
        carregando,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
