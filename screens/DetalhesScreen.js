import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DetalhesScreen({ route }) {
  const plantacao = route.params?.plantacao;

  if (!plantacao) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📊 Detalhes da Plantação</Text>
        <Text style={styles.info}>Selecione uma plantação em "Minhas Plantações".</Text>
      </View>
    );
  }

  const { statusTemperatura } = plantacao;

  return (
    <View style={styles.container}>
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
        <Text style={styles.label}>Saúde da plantação</Text>
        <Text style={styles.value}>{plantacao.saude}</Text>
      </View>

      <View style={[styles.card, styles.statusCard, { borderColor: statusTemperatura.color }]}>
        <Text style={styles.label}>Análise de temperatura</Text>
        <Text style={[styles.status, { color: statusTemperatura.color }]}>
          {statusTemperatura.message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#E8F5E9' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  statusCard: { borderWidth: 2 },
  label: { fontSize: 13, color: '#666', marginBottom: 4 },
  value: { fontSize: 16, color: '#333', fontWeight: '600' },
  status: { fontSize: 15, fontWeight: '600' },
  info: { fontSize: 14, color: '#555' },
});
