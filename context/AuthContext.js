import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginRequest,
  logoutRequest,
  getStoredTokens,
  clearStoredTokens,
} from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    getStoredTokens()
      .then((stored) => setTokens(stored))
      .finally(() => setCarregando(false));
  }, []);

  const login = useCallback(async (email, senha) => {
    const novosTokens = await loginRequest(email, senha);
    setTokens(novosTokens);
    return novosTokens;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      await clearStoredTokens();
    }
    setTokens(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        tokens,
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
