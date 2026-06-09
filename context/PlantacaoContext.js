import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { geosatApi } from '../services/geosatApi';
import { useUsuario } from './UsuarioContext';
import { evaluateTemperatura } from '../utils/evaluateTemperatura';
import { ApiError } from '../services/apiClient';

const PlantacaoContext = createContext(null);

function mapTalhaoParaPlantacao(talhao, leitura) {
  const temperatura = leitura?.nrTempAr ?? 0;
  const umidade = leitura?.nrUmidadeSolo ?? 0;

  return {
    id: String(talhao.idTalhao),
    idTalhao: talhao.idTalhao,
    idSensor: leitura?.idSensor ?? null,
    nome: talhao.nmNome,
    umidade: String(umidade),
    temperatura: parseFloat(temperatura),
    saude: talhao.dsCultura,
    statusTemperatura: evaluateTemperatura(temperatura),
    leitura,
  };
}

export function PlantacaoProvider({ children }) {
  const { usuario } = useUsuario();
  const [plantacoes, setPlantacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erroApi, setErroApi] = useState(null);

  const carregarPlantacoes = useCallback(async () => {
    if (!usuario?.idPropriedade) {
      setPlantacoes([]);
      return;
    }

    setCarregando(true);
    setErroApi(null);

    try {
      const talhoes = await geosatApi.listarTalhoesPorPropriedade(usuario.idPropriedade);
      const plantacoesComLeitura = await Promise.all(
        talhoes.map(async (talhao) => {
          const sensores = await geosatApi.listarSensoresPorTalhao(talhao.idTalhao);
          const sensor = sensores[0];
          let leitura = null;

          if (sensor) {
            leitura = await geosatApi.ultimaLeitura(sensor.idSensor);
          }

          return mapTalhaoParaPlantacao(talhao, leitura);
        })
      );

      setPlantacoes(plantacoesComLeitura);
    } catch (error) {
      setErroApi(error.message || 'Erro ao carregar plantações');
    } finally {
      setCarregando(false);
    }
  }, [usuario?.idPropriedade]);

  useEffect(() => {
    carregarPlantacoes();
  }, [carregarPlantacoes]);

  async function adicionarPlantacao({ nome, umidade, temperatura, saude }) {
    if (!usuario?.idPropriedade) {
      throw new ApiError(400, 'Cadastre seu perfil com propriedade antes de adicionar plantações.');
    }

    const temp = parseFloat(String(temperatura).replace(',', '.'));
    const umid = parseFloat(String(umidade).replace(',', '.'));

    const talhao = await geosatApi.criarTalhao({
      idPropriedade: usuario.idPropriedade,
      nmNome: nome.trim(),
      dsCultura: saude.trim(),
      nrAreaHa: 1.0,
    });

    const sensor = await geosatApi.criarSensor({
      idTalhao: talhao.idTalhao,
      cdIdentificadorHw: `MOBILE-${Date.now()}`,
      dsLocalizacao: nome.trim(),
    });

    const leitura = await geosatApi.criarLeitura({
      idSensor: sensor.idSensor,
      dtLeitura: new Date().toISOString().slice(0, 19) + 'Z',
      nrTempAr: temp,
      nrUmidadeSolo: umid,
      nrLuminosidade: 500,
    });

    const novaPlantacao = mapTalhaoParaPlantacao(talhao, leitura);
    setPlantacoes((atual) => [...atual, novaPlantacao]);
    return novaPlantacao;
  }

  return (
    <PlantacaoContext.Provider
      value={{
        plantacoes,
        carregando,
        erroApi,
        adicionarPlantacao,
        recarregarPlantacoes: carregarPlantacoes,
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