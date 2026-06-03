import React, { createContext, useContext, useState } from 'react';
import { evaluateTemperatura } from '../utils/evaluateTemperatura';

const PlantacaoContext = createContext(null);

export function PlantacaoProvider({ children }) {
  const [plantacoes, setPlantacoes] = useState([]);

  function adicionarPlantacao({ nome, umidade, temperatura, saude }) {
    const avaliacao = evaluateTemperatura(temperatura);

    const novaPlantacao = {
      id: Date.now().toString(),
      nome: nome.trim(),
      umidade: umidade.trim(),
      temperatura: parseFloat(String(temperatura).replace(',', '.')),
      saude: saude.trim(),
      statusTemperatura: avaliacao,
    };

    setPlantacoes((atual) => [...atual, novaPlantacao]);
    return novaPlantacao;
  }

  return (
    <PlantacaoContext.Provider value={{ plantacoes, adicionarPlantacao }}>
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
