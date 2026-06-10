import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlantacoes } from '../context/PlantacaoContext';
import { ApiError } from '../services/apiClient';
import { FONTS } from '../config/theme';

export default function PlantacoesScreen({ navigation }) {
  const { plantacoes, carregando, recarregarPlantacoes, removerPlantacao } = usePlantacoes();
  const [refreshing, setRefreshing] = React.useState(false);
  const [excluindoId, setExcluindoId] = React.useState(null);

  function confirmarExclusao(item) {
    Alert.alert(
      'Apagar plantação',
      `Deseja apagar "${item.nome}"? O talhão será removido da API.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => handleExcluir(item) },
      ]
    );
  }

  async function handleExcluir(item) {
    setExcluindoId(item.id);
    try {
      await removerPlantacao(item.idTalhao);
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'Erro ao apagar plantação.';
      Alert.alert('Erro', msg);
    } finally {
      setExcluindoId(null);
    }
  }

  function renderItem({ item }) {
    const { statusTemperatura } = item;
    const excluindo = excluindoId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardConteudo}
          onPress={() => navigation.navigate('Detalhes', { plantacao: item })}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalhes da plantação ${item.nome}`}
        >
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <Text style={styles.cardInfo}>💧 Umidade: {item.umidade}%</Text>
          <Text style={styles.cardInfo}>🌡️ Temperatura: {item.temperatura}°C</Text>
          <Text style={styles.cardInfo}>🌱 Cultura: {item.saude}</Text>
          <Text style={[styles.cardStatus, { color: statusTemperatura.color }]}>
            {statusTemperatura.message}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoExcluir}
          onPress={() => confirmarExclusao(item)}
          disabled={excluindo}
          accessibilityRole="button"
          accessibilityLabel={`Apagar plantação ${item.nome}`}
        >
          {excluindo ? (
            <ActivityIndicator size="small" color="#B71C1C" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color="#B71C1C" />
              <Text style={styles.botaoExcluirTexto}>Apagar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
        accessibilityRole="button"
        accessibilityLabel="Adicionar nova plantação"
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
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    elevation: 2,
    overflow: 'hidden',
  },
  cardConteudo: { padding: 16 },
  cardTitle: { fontSize: 18, fontFamily: FONTS.bold, color: '#2E7D32', marginBottom: 8 },
  botaoExcluir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#FFCDD2',
    backgroundColor: '#FFF5F5',
  },
  botaoExcluirTexto: { color: '#B71C1C', fontSize: 14, fontFamily: FONTS.semiBold },
  cardInfo: { fontSize: 14, color: '#333', marginBottom: 4 },
  cardStatus: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  addButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontFamily: FONTS.bold },
});
