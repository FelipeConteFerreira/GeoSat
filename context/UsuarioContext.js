import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@geosat_usuario';

const UsuarioContext = createContext(null);

export function UsuarioProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((dados) => {
        if (dados) setUsuario(JSON.parse(dados));
      })
      .finally(() => setCarregando(false));
  }, []);

  async function salvarUsuario({ nome, propriedade, cultivo }) {
    const novoUsuario = {
      nome: nome.trim(),
      propriedade: propriedade.trim(),
      cultivo: cultivo.trim(),
    };
    setUsuario(novoUsuario);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novoUsuario));
    return novoUsuario;
  }

  async function limparUsuario() {
    setUsuario(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  return (
    <UsuarioContext.Provider value={{ usuario, carregando, salvarUsuario, limparUsuario }}>
      {children}
    </UsuarioContext.Provider>
  );
}

export function useUsuario() {
  const context = useContext(UsuarioContext);
  if (!context) {
    throw new Error('useUsuario deve ser usado dentro de UsuarioProvider');
  }
  return context;
}
