import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePlantacoes } from '../context/PlantacaoContext';
import { ApiError } from '../services/apiClient';
import { FONTS } from '../config/theme';

export default function DetalhesScreen({ route, navigation }) {
  const { removerPlantacao, plantacoes } = usePlantacoes();
  const [excluindo, setExcluindo] = useState(false);
  const plantacaoParam = route.params?.plantacao;
  const [plantacao, setPlantacao] = useState(plantacaoParam);

  useFocusEffect(
    useCallback(() => {
      if (!plantacaoParam) return;
      const atualizada = plantacoes.find((p) => p.id === plantacaoParam.id);
      setPlantacao(atualizada ?? plantacaoParam);
    }, [plantacoes, plantacaoParam])
  );

  if (!plantacao) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📊 Detalhes da Plantação</Text>
        <Text style={styles.info}>Selecione uma plantação em "Minhas Plantações".</Text>
      </View>
    );
  }

  const { statusTemperatura } = plantacao;

  function confirmarExclusao() {
    Alert.alert(
      'Apagar plantação',
      `Deseja apagar "${plantacao.nome}"? O talhão será removido da API.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: handleExcluir },
      ]
    );
  }

  async function handleExcluir() {
    setExcluindo(true);
    try {
      await removerPlantacao(plantacao.idTalhao);
      Alert.alert('Sucesso', 'Plantação apagada da API.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'Erro ao apagar plantação.';
      Alert.alert('Erro', msg);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 {plantacao.nome}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Umidade do solo</Text>
        <Text style={styles.value}>{plantacao.umidade}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Temperatura</Text>
        <Text style={styles.value}>{plantacao.temperatura}°C</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Cultura da plantação</Text>
        <Text style={styles.value}>{plantacao.saude}</Text>
      </View>

      <View style={[styles.card, styles.statusCard, { borderColor: statusTemperatura.color }]}>
        <Text style={styles.label}>Análise de temperatura</Text>
        <Text style={[styles.status, { color: statusTemperatura.color }]}>
          {statusTemperatura.message}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.botaoEditar}
        onPress={() => navigation.navigate('EditarPlantacao', { plantacao })}
        accessibilityRole="button"
        accessibilityLabel="Editar plantação"
      >
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.botaoEditarTexto}>Editar plantação</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botaoExcluir, excluindo && styles.botaoDisabled]}
        onPress={confirmarExclusao}
        disabled={excluindo}
        accessibilityRole="button"
        accessibilityLabel="Apagar plantação"
      >
        {excluindo ? (
          <ActivityIndicator color="#B71C1C" />
        ) : (
          <>
            <Ionicons name="trash-outline" size={20} color="#B71C1C" />
            <Text style={styles.botaoExcluirTexto}>Apagar plantação</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingBottom: 40, backgroundColor: '#E8F5E9' },
  title: { fontSize: 22, fontFamily: FONTS.bold, color: '#2E7D32', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  statusCard: { borderWidth: 2 },
  label: { fontSize: 13, color: '#666', marginBottom: 4 },
  value: { fontSize: 16, color: '#333', fontFamily: FONTS.semiBold },
  status: { fontSize: 15, fontFamily: FONTS.semiBold },
  info: { fontSize: 14, color: '#555' },
  botaoEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
  },
  botaoEditarTexto: { color: '#fff', fontSize: 15, fontFamily: FONTS.semiBold },
  botaoExcluir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B71C1C',
    backgroundColor: '#fff',
  },
  botaoDisabled: { opacity: 0.7 },
  botaoExcluirTexto: { color: '#B71C1C', fontSize: 15, fontFamily: FONTS.semiBold },
});
