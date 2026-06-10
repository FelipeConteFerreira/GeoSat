import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { geosatApi } from '../services/geosatApi';
import { useAuth } from './AuthContext';
import { ApiError } from '../services/apiClient';
import { montarBodyProdutor, montarBodyPropriedade, limitarTexto } from '../utils/apiValidators';

const UsuarioContext = createContext(null);

function nomeDoEmail(email) {
  const parte = String(email ?? '').split('@')[0] ?? '';
  return parte.replace(/[._-]/g, ' ').trim() || 'Usuário';
}

function gerarCpfDoEmail(email, tentativa = 0) {
  let hash = 0;
  const base = `${String(email ?? '').toLowerCase()}#${tentativa}`;
  for (let i = 0; i < base.length; i++) {
    hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
  }
  return String(hash).padStart(11, '0').slice(0, 11);
}

function gerarEmailAlternativo(email, tentativa = 0) {
  const [local, domain] = String(email ?? '').split('@');
  if (!domain) return limitarTexto(`app${tentativa}@geosat.local`, 150);
  const sufixo = tentativa === 0 ? 'app' : `app${tentativa}`;
  return limitarTexto(`${local}.${sufixo}@${domain}`, 150);
}

function montarPerfilLogin({ nome, email, role }) {
  return {
    nome: limitarTexto(nome, 100),
    email: limitarTexto(email, 150),
    role: role ?? 'USER',
    idProdutor: null,
    idPropriedade: null,
    cpf: '',
    telefone: '',
    propriedade: '',
    municipio: '',
    estado: '',
    cultivo: '',
  };
}

function mesclarComProdutorApi(perfil, produtor, propriedade, cultivo = '') {
  if (!produtor?.idProdutor) return perfil;

  return {
    ...perfil,
    nome: produtor.nmNome || perfil.nome,
    email: produtor.dsEmail || perfil.email,
    cpf: produtor.nrCpf ?? '',
    telefone: produtor.nrTelefone ?? '',
    propriedade: propriedade?.nmNome ?? '',
    municipio: propriedade?.nmMunicipio ?? '',
    estado: propriedade?.sgEstado ?? '',
    cultivo,
    idProdutor: produtor.idProdutor,
    idPropriedade: propriedade?.idPropriedade ?? null,
  };
}

async function buscarProdutorMe() {
  try {
    return await geosatApi.buscarProdutorMe();
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 500)) {
      return null;
    }
    throw error;
  }
}

async function buscarProdutorPorEmail(email) {
  try {
    const produtores = await geosatApi.listarProdutores();
    const emailBusca = email.trim().toLowerCase();
    return produtores.find((p) => p.dsEmail?.trim().toLowerCase() === emailBusca) ?? null;
  } catch {
    return null;
  }
}

async function criarProdutorTentativa({ nome, email, tentativaCpf }) {
  const body = montarBodyProdutor({
    nome,
    email,
    cpf: gerarCpfDoEmail(email, tentativaCpf),
  });
  return geosatApi.criarProdutor(body);
}

async function obterOuCriarProdutor({ nome, email }) {
  const existente = await buscarProdutorMe();
  if (existente?.idProdutor) return existente;

  const emailsParaTentar = [
    email,
    gerarEmailAlternativo(email, 0),
    gerarEmailAlternativo(email, 1),
    gerarEmailAlternativo(email, 2),
  ].filter((valor, indice, lista) => lista.indexOf(valor) === indice);

  for (const emailTentativa of emailsParaTentar) {
    for (let tentativaCpf = 0; tentativaCpf < 5; tentativaCpf++) {
      try {
        return await criarProdutorTentativa({
          nome,
          email: emailTentativa,
          tentativaCpf,
        });
      } catch (error) {
        if (!(error instanceof ApiError)) throw error;

        const msg = error.message?.toLowerCase() ?? '';
        if (msg.includes('email')) break;
        if (msg.includes('cpf') && tentativaCpf < 4) continue;
        throw error;
      }
    }
  }

  const porEmail = await buscarProdutorPorEmail(email);
  if (porEmail?.idProdutor) {
    const me = await buscarProdutorMe();
    if (me?.idProdutor) return me;
  }

  throw new ApiError(
    422,
    'Não foi possível criar o produtor na API. Tente fazer logout e entrar com outro e-mail.'
  );
}

async function obterOuCriarPropriedade({ nome, idProdutor }) {
  const propriedades = await geosatApi.listarPropriedadesPorProdutor(idProdutor);
  if (propriedades[0]?.idPropriedade) return propriedades[0];

  return geosatApi.criarPropriedade(
    montarBodyPropriedade({
      propriedade: `Propriedade ${limitarTexto(nome, 80)}`,
      municipio: 'Sao Paulo',
      estado: 'SP',
    })
  );
}

export function UsuarioProvider({ children }) {
  const { autenticado, emailLogado, nomeLogado, role } = useAuth();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroApi, setErroApi] = useState(null);

  const sincronizarCadastroApi = useCallback(async () => {
    const perfilLogin = montarPerfilLogin({
      nome: nomeLogado || nomeDoEmail(emailLogado),
      email: emailLogado,
      role,
    });

    const produtor = await obterOuCriarProdutor(perfilLogin);
    const propriedade = await obterOuCriarPropriedade({
      nome: perfilLogin.nome,
      idProdutor: produtor.idProdutor,
    });

    let cultivo = '';
    if (propriedade?.idPropriedade) {
      const talhoes = await geosatApi.listarTalhoesPorPropriedade(propriedade.idPropriedade);
      cultivo = talhoes[0]?.dsCultura ?? '';
    }

    const perfil = mesclarComProdutorApi(perfilLogin, produtor, propriedade, cultivo);
    setUsuario(perfil);
    return perfil;
  }, [emailLogado, nomeLogado, role]);

  const carregarPerfil = useCallback(async () => {
    if (!autenticado || !emailLogado) {
      setUsuario(null);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErroApi(null);

    try {
      await sincronizarCadastroApi();
    } catch (error) {
      const perfilLogin = montarPerfilLogin({
        nome: nomeLogado || nomeDoEmail(emailLogado),
        email: emailLogado,
        role,
      });
      setUsuario(perfilLogin);
      setErroApi(error instanceof ApiError ? error.message : 'Erro ao sincronizar cadastro na API');
    } finally {
      setCarregando(false);
    }
  }, [autenticado, emailLogado, nomeLogado, role, sincronizarCadastroApi]);

  useEffect(() => {
    carregarPerfil().catch(() => {});
  }, [carregarPerfil]);

  function limparUsuario() {
    setUsuario(null);
  }

  return (
    <UsuarioContext.Provider
      value={{
        usuario,
        carregando,
        erroApi,
        limparUsuario,
        recarregarPerfil: carregarPerfil,
        garantirPropriedadeNaApi: sincronizarCadastroApi,
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
