import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { usePlantacoes } from '../context/PlantacaoContext';

export default function PlantacoesScreen({ navigation }) {
  const { plantacoes, carregando, recarregarPlantacoes } = usePlantacoes();
  const [refreshing, setRefreshing] = React.useState(false);

  function renderItem({ item }) {
    const { statusTemperatura } = item;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Detalhes', { plantacao: item })}
      >
        <Text style={styles.cardTitle}>{item.nome}</Text>
        <Text style={styles.cardInfo}>💧 Umidade: {item.umidade}%</Text>
        <Text style={styles.cardInfo}>🌡️ Temperatura: {item.temperatura}°C</Text>
        <Text style={styles.cardInfo}>🌱 Saúde: {item.saude}</Text>
        <Text style={[styles.cardStatus, { color: statusTemperatura.color }]}>
          {statusTemperatura.message}
        </Text>
      </TouchableOpacity>
    );
  }

  async function onRefresh() {
    setRefreshing(true);
    await recarregarPlantacoes();
    setRefreshing(false);
  }

  if (carregando && plantacoes.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plantacoes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />}
        contentContainerStyle={plantacoes.length === 0 && styles.emptyList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nenhuma plantação cadastrada. Toque no botão abaixo para adicionar.
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AdicionarPlantacao')}
      >
        <Text style={styles.addButtonText}>+ Adicionar Plantação</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9', padding: 16 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F5E9' },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  emptyText: { textAlign: 'center', color: '#555', fontSize: 15, paddingHorizontal: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8 },
  cardInfo: { fontSize: 14, color: '#333', marginBottom: 4 },
  cardStatus: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  addButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
