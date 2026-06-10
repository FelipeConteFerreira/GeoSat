import { apiRequest, ApiError } from './apiClient';
import { unwrapEntity, unwrapList } from '../utils/hateoas';

function exigirCampo(resposta, campo) {
  const entity = unwrapEntity(resposta);
  if (entity?.[campo] == null) {
    throw new ApiError(500, `Resposta da API inválida: campo "${campo}" ausente.`);
  }
  return entity;
}

export const geosatApi = {
  async buscarProdutorMe() {
    const data = await apiRequest('/produtores/me');
    return unwrapEntity(data);
  },

  async listarProdutores() {
    const data = await apiRequest('/produtores');
    return unwrapList(data).map(unwrapEntity);
  },

  async criarProdutor(body) {
    const data = await apiRequest('/produtores', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return exigirCampo(data, 'idProdutor');
  },

  async atualizarProdutor(id, body) {
    const data = await apiRequest(`/produtores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return unwrapEntity(data);
  },

  async listarPropriedadesPorProdutor(idProdutor) {
    const data = await apiRequest(`/propriedades/produtor/${idProdutor}`);
    return unwrapList(data).map(unwrapEntity);
  },

  async criarPropriedade(body) {
    const data = await apiRequest('/propriedades', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return exigirCampo(data, 'idPropriedade');
  },

  async atualizarPropriedade(id, body) {
    const data = await apiRequest(`/propriedades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return unwrapEntity(data);
  },

  async listarTalhoesPorPropriedade(idPropriedade) {
    const data = await apiRequest(`/talhoes/propriedade/${idPropriedade}`);
    return unwrapList(data).map(unwrapEntity);
  },

  async criarTalhao(body) {
    const data = await apiRequest('/talhoes', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return exigirCampo(data, 'idTalhao');
  },

  async atualizarTalhao(idTalhao, body) {
    const data = await apiRequest(`/talhoes/${idTalhao}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return unwrapEntity(data);
  },

  async excluirTalhao(idTalhao) {
    await apiRequest(`/talhoes/${idTalhao}`, { method: 'DELETE' });
  },

  async listarSensoresPorTalhao(idTalhao) {
    const data = await apiRequest(`/sensores/talhao/${idTalhao}`);
    return unwrapList(data).map(unwrapEntity);
  },

  async criarSensor(body) {
    const data = await apiRequest('/sensores', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return exigirCampo(data, 'idSensor');
  },

  async ultimaLeitura(idSensor) {
    try {
      const data = await apiRequest(`/leituras/sensor/${idSensor}/last`);
      return unwrapEntity(data);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  },

  async criarLeitura(body) {
    const data = await apiRequest('/leituras', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return unwrapEntity(data);
  },

};
