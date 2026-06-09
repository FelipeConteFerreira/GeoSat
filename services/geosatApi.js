import { apiRequest } from './apiClient';
import { unwrapEntity, unwrapList } from '../utils/hateoas';

export const geosatApi = {
  async buscarProdutorMe() {
    const data = await apiRequest('/produtores/me');
    return unwrapEntity(data);
  },

  async criarProdutor(body) {
    const data = await apiRequest('/produtores', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return unwrapEntity(data);
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
    return unwrapEntity(data);
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
    return unwrapEntity(data);
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
    return unwrapEntity(data);
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

  async listarAlertasPendentes() {
    const data = await apiRequest('/alertas/produtor/me/pendentes');
    return unwrapList(data).map(unwrapEntity);
  },

  async listarMeusAlertas() {
    const data = await apiRequest('/alertas/produtor/me');
    return unwrapList(data).map(unwrapEntity);
  },

  async resolverAlerta(idAlerta) {
    const data = await apiRequest(`/alertas/${idAlerta}/resolver`, { method: 'PATCH' });
    return unwrapEntity(data);
  },
};
