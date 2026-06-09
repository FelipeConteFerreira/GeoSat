import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePlantacoes } from '../context/PlantacaoContext';
import { geosatApi } from '../services/geosatApi';

const NIVEL_CORES = {
  CRITICO: '#B71C1C',
  ALTO: '#E65100',
  MEDIO: '#F57F17',
  BAIXO: '#558B2F',
};

export default function AlertasScreen() {
  const { plantacoes, recarregarPlantacoes } = usePlantacoes();
  const [alertasApi, setAlertasApi] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const alertasLocais = plantacoes
    .filter((p) => p.statusTemperatura.status !== 'normal')
    .map((p) => ({
      id: `local-${p.id}`,
      origem: 'local',
      titulo: `${p.nome} — ${p.temperatura}°C`,
      mensagem: p.statusTemperatura.message,
      cor: p.statusTemperatura.color,
    }));

  const carregarAlertasApi = useCallback(async () => {
    try {
      const pendentes = await geosatApi.listarAlertasPendentes();
      setAlertasApi(
        pendentes.map((a) => ({
          id: `api-${a.idAlerta}`,
          idAlerta: a.idAlerta,
          origem: 'api',
          titulo: `${a.tpTipo} (${a.tpNivel})`,
          mensagem: a.dsDescricao,
          cor: NIVEL_CORES[a.tpNivel] ?? '#E65100',
          status: a.stStatus,
        }))
      );
    } catch {
      setAlertasApi([]);
    }
  }, []);

  const carregarTudo = useCallback(async () => {
    setCarregando(true);
    await Promise.all([recarregarPlantacoes(), carregarAlertasApi()]);
    setCarregando(false);
  }, [recarregarPlantacoes, carregarAlertasApi]);

  useFocusEffect(
    useCallback(() => {
      carregarTudo();
    }, [carregarTudo])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarTudo();
    setRefreshing(false);
  };

  async function resolverAlerta(idAlerta) {
    await geosatApi.resolverAlerta(idAlerta);
    await carregarAlertasApi();
  }

  const alertas = [...alertasApi, ...alertasLocais];

  function renderAlerta({ item }) {
    return (
      <View style={[styles.alertCard, { borderLeftColor: item.cor }]}>
        <Text style={[styles.alertTitle, { color: item.cor }]}>
          {item.origem === 'api' ? '🛰️' : '🌡️'} {item.titulo}
        </Text>
        <Text style={styles.alertMessage}>{item.mensagem}</Text>
        {item.origem === 'api' && (
          <TouchableOpacity style={styles.resolverBtn} onPress={() => resolverAlerta(item.idAlerta)}>
            <Text style={styles.resolverTexto}>Marcar como resolvido</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (carregando && !refreshing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚠️ Alertas Inteligentes</Text>
      <Text style={styles.subtitle}>API GeoSat + análise local de temperatura</Text>

      {alertas.length === 0 ? (
        <Text style={styles.empty}>
          Nenhum alerta no momento. Temperaturas entre 20°C e 30°C são consideradas normais.
        </Text>
      ) : (
        <FlatList
          data={alertas}
          keyExtractor={(item) => item.id}
          renderItem={renderAlerta}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#E8F5E9' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F5E9' },
  title: { fontSize: 22, marginBottom: 4, color: '#2E7D32', fontWeight: 'bold' },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 15 },
  empty: { fontSize: 14, color: '#555', lineHeight: 22 },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  alertTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  alertMessage: { fontSize: 14, color: '#333' },
  resolverBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resolverTexto: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
