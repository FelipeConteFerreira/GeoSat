import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { geosatApi } from '../services/geosatApi';
import { useAuth } from './AuthContext';
import { STORAGE_KEYS } from '../config/api';
import { ApiError } from '../services/apiClient';

const UsuarioContext = createContext(null);

function mapPerfilLocal(produtor, propriedade) {
  if (!produtor) return null;
  return {
    idProdutor: produtor.idProdutor,
    idPropriedade: propriedade?.idPropriedade ?? null,
    nome: produtor.nmNome,
    email: produtor.dsEmail,
    cpf: produtor.nrCpf,
    telefone: produtor.nrTelefone ?? '',
    propriedade: propriedade?.nmNome ?? '',
    municipio: propriedade?.nmMunicipio ?? '',
    estado: propriedade?.sgEstado ?? '',
    cultivo: '',
  };
}

export function UsuarioProvider({ children }) {
  const { autenticado } = useAuth();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroApi, setErroApi] = useState(null);

  const carregarPerfil = useCallback(async () => {
    if (!autenticado) {
      setUsuario(null);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErroApi(null);

    try {
      const produtor = await geosatApi.buscarProdutorMe();
      const propriedades = await geosatApi.listarPropriedadesPorProdutor(produtor.idProdutor);
      const propriedade = propriedades[0] ?? null;
      const perfil = mapPerfilLocal(produtor, propriedade);

      setUsuario(perfil);
      await AsyncStorage.setItem(STORAGE_KEYS.perfil, JSON.stringify(perfil));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setUsuario(null);
        await AsyncStorage.removeItem(STORAGE_KEYS.perfil);
      } else {
        const localRaw = await AsyncStorage.getItem(STORAGE_KEYS.perfil);
        if (!localRaw) {
          setErroApi(error.message || 'Erro ao carregar perfil');
        }
      }
    } finally {
      setCarregando(false);
    }
  }, [autenticado]);

  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  async function salvarUsuario({ nome, cpf, telefone, email, propriedade, municipio, estado, cultivo }) {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const uf = estado.trim().toUpperCase().slice(0, 2);

    let idProdutor = usuario?.idProdutor;
    let idPropriedade = usuario?.idPropriedade;

    const produtorBody = {
      nmNome: nome.trim(),
      nrCpf: cpfLimpo,
      dsEmail: email.trim(),
      nrTelefone: telefone?.trim() || null,
    };

    if (idProdutor) {
      await geosatApi.atualizarProdutor(idProdutor, produtorBody);
    } else {
      const produtor = await geosatApi.criarProdutor(produtorBody);
      idProdutor = produtor.idProdutor;
    }

    const propriedadeBody = {
      nmNome: propriedade.trim(),
      nmMunicipio: municipio.trim(),
      sgEstado: uf,
      nrAreaHa: 1.0,
    };

    if (idPropriedade) {
      await geosatApi.atualizarPropriedade(idPropriedade, propriedadeBody);
    } else {
      const prop = await geosatApi.criarPropriedade(propriedadeBody);
      idPropriedade = prop.idPropriedade;
    }

    const perfil = {
      idProdutor,
      idPropriedade,
      nome: nome.trim(),
      email: email.trim(),
      cpf: cpfLimpo,
      telefone: telefone?.trim() ?? '',
      propriedade: propriedade.trim(),
      municipio: municipio.trim(),
      estado: uf,
      cultivo: cultivo.trim(),
    };

    setUsuario(perfil);
    await AsyncStorage.setItem(STORAGE_KEYS.perfil, JSON.stringify(perfil));
    return perfil;
  }

  async function limparUsuario() {
    setUsuario(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.perfil);
  }

  return (
    <UsuarioContext.Provider
      value={{
        usuario,
        carregando,
        erroApi,
        salvarUsuario,
        limparUsuario,
        recarregarPerfil: carregarPerfil,
      }}
    >
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
