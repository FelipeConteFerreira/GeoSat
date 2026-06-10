import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { geosatApi } from '../services/geosatApi';
import { useUsuario } from './UsuarioContext';
import { evaluateTemperatura } from '../utils/evaluateTemperatura';
import { ApiError } from '../services/apiClient';
import {
  montarBodyTalhao,
  montarBodySensor,
  montarBodyLeitura,
  limitarTexto,
} from '../utils/apiValidators';
const PlantacaoContext = createContext(null);

function mapTalhaoParaPlantacao(talhao, leitura, sensor = null) {
  const temperatura = leitura?.nrTempAr ?? 0;
  const umidade = leitura?.nrUmidadeSolo ?? 0;

  return {
    id: String(talhao.idTalhao),
    idTalhao: talhao.idTalhao,
    idSensor: leitura?.idSensor ?? sensor?.idSensor ?? null,
    nome: talhao.nmNome,
    umidade: String(umidade),
    temperatura: parseFloat(temperatura),
    saude: talhao.dsCultura,
    statusTemperatura: evaluateTemperatura(temperatura),
    leitura,
  };
}

export function PlantacaoProvider({ children }) {
  const { usuario, garantirPropriedadeNaApi } = useUsuario();
  const [plantacoes, setPlantacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erroApi, setErroApi] = useState(null);

  const carregarPlantacoes = useCallback(async (idPropriedadeInformado) => {
    const idPropriedade = idPropriedadeInformado ?? usuario?.idPropriedade;
    if (!idPropriedade) {
      setPlantacoes([]);
      setErroApi(null);
      return;
    }

    setCarregando(true);
    setErroApi(null);

    try {
      const talhoes = await geosatApi.listarTalhoesPorPropriedade(idPropriedade);
      const lista = await Promise.all(
        talhoes.map(async (talhao) => {
          const sensores = await geosatApi.listarSensoresPorTalhao(talhao.idTalhao);
          const sensor = sensores[0];
          let leitura = null;

          if (sensor) {
            leitura = await geosatApi.ultimaLeitura(sensor.idSensor);
          }

          return mapTalhaoParaPlantacao(talhao, leitura, sensor);
        })
      );

      setPlantacoes(lista);
    } catch (error) {
      setPlantacoes([]);
      setErroApi(error instanceof ApiError ? error.message : 'Erro ao carregar plantações da API');
      throw error;
    } finally {
      setCarregando(false);
    }
  }, [usuario?.idPropriedade]);

  useEffect(() => {
    carregarPlantacoes().catch(() => {});
  }, [carregarPlantacoes]);

  async function adicionarPlantacao(dados) {
    let idPropriedade = usuario?.idPropriedade;

    if (!idPropriedade) {
      const perfil = await garantirPropriedadeNaApi();
      idPropriedade = perfil?.idPropriedade;
    }

    if (!idPropriedade) {
      throw new ApiError(400, 'Não foi possível vincular uma propriedade na API para este usuário.');
    }

    const talhao = await geosatApi.criarTalhao(
      montarBodyTalhao({
        idPropriedade,
        nome: dados.nome,
        cultura: dados.saude,
      })
    );

    const sensor = await geosatApi.criarSensor(
      montarBodySensor({
        idTalhao: talhao.idTalhao,
        identificador: `MOB-${Date.now()}`,
        localizacao: limitarTexto(dados.nome, 200),
      })
    );

    const leitura = await geosatApi.criarLeitura(
      montarBodyLeitura({
        idSensor: sensor.idSensor,
        temperatura: dados.temperatura,
        umidade: dados.umidade,
      })
    );

    await carregarPlantacoes(idPropriedade);
    return mapTalhaoParaPlantacao(talhao, leitura);
  }

  async function removerPlantacao(idTalhao) {
    await geosatApi.excluirTalhao(idTalhao);
    await carregarPlantacoes();
  }

  async function atualizarPlantacao(plantacao, dados) {
    let idPropriedade = usuario?.idPropriedade;

    if (!idPropriedade) {
      const perfil = await garantirPropriedadeNaApi();
      idPropriedade = perfil?.idPropriedade;
    }

    if (!idPropriedade) {
      throw new ApiError(400, 'Não foi possível vincular uma propriedade na API para este usuário.');
    }

    const talhao = await geosatApi.atualizarTalhao(
      plantacao.idTalhao,
      montarBodyTalhao({
        idPropriedade,
        nome: dados.nome,
        cultura: dados.saude,
      })
    );

    let idSensor = plantacao.idSensor;
    if (!idSensor) {
      const sensores = await geosatApi.listarSensoresPorTalhao(plantacao.idTalhao);
      idSensor = sensores[0]?.idSensor ?? null;
    }

    if (!idSensor) {
      const sensor = await geosatApi.criarSensor(
        montarBodySensor({
          idTalhao: plantacao.idTalhao,
          identificador: `MOB-${Date.now()}`,
          localizacao: limitarTexto(dados.nome, 200),
        })
      );
      idSensor = sensor.idSensor;
    }

    const leitura = await geosatApi.criarLeitura(
      montarBodyLeitura({
        idSensor,
        temperatura: dados.temperatura,
        umidade: dados.umidade,
      })
    );

    await carregarPlantacoes(idPropriedade);
    return mapTalhaoParaPlantacao(talhao, leitura);
  }

  return (
    <PlantacaoContext.Provider
      value={{
        plantacoes,
        carregando,
        erroApi,
        adicionarPlantacao,
        atualizarPlantacao,
        removerPlantacao,
        recarregarPlantacoes: carregarPlantacoes,
        temPerfil: !!usuario?.idPropriedade,
      }}
    >
      {children}
    </PlantacaoContext.Provider>
  );
}

export function usePlantacoes() {
  const context = useContext(PlantacaoContext);
  if (!context) {
    throw new Error('usePlantacoes deve ser usado dentro de PlantacaoProvider');
  }
  return context;
}
