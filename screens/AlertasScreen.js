import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { usePlantacoes } from '../context/PlantacaoContext';

export default function AlertasScreen() {
  const { plantacoes } = usePlantacoes();

  const alertas = plantacoes
    .filter((p) => p.statusTemperatura.status !== 'normal')
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      temperatura: p.temperatura,
      ...p.statusTemperatura,
    }));

  function renderAlerta({ item }) {
    const icone =
      item.status === 'seca' ? '🔥' : item.status === 'critico' ? '❄️' : '⚠️';

    return (
      <View style={[styles.alertCard, { borderLeftColor: item.color }]}>
        <Text style={[styles.alertTitle, { color: item.color }]}>
          {icone} {item.nome} — {item.temperatura}°C
        </Text>
        <Text style={styles.alertMessage}>{item.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚠️ Alertas Inteligentes</Text>

      {alertas.length === 0 ? (
        <Text style={styles.empty}>
          Nenhum alerta no momento. Temperaturas entre 20°C e 30°C são consideradas normais.
        </Text>
      ) : (
        <FlatList
          data={alertas}
          keyExtractor={(item) => item.id}
          renderItem={renderAlerta}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#E8F5E9' },
  title: { fontSize: 22, marginBottom: 15, color: '#2E7D32', fontWeight: 'bold' },
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
});
