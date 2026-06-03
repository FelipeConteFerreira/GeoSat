import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePlantacoes } from '../context/PlantacaoContext';

export default function MonitoramentoScreen({ navigation }) {
  const { plantacoes } = usePlantacoes();

  const ultima = plantacoes[plantacoes.length - 1];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛰️ Monitoramento via Satélite</Text>

      {ultima ? (
        <>
          <Text style={styles.plantacaoNome}>{ultima.nome}</Text>
          <Text style={styles.info}>Umidade do solo: {ultima.umidade}%</Text>
          <Text style={styles.info}>Temperatura: {ultima.temperatura}°C</Text>
          <Text style={styles.info}>Saúde da plantação: {ultima.saude}</Text>
          <Text style={[styles.status, { color: ultima.statusTemperatura.color }]}>
            {ultima.statusTemperatura.message}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Detalhes', { plantacao: ultima })}
          >
            <Text style={styles.buttonText}>Ver Detalhes</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.empty}>Cadastre uma plantação para ver o monitoramento.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('AdicionarPlantacao')}
          >
            <Text style={styles.buttonText}>Adicionar Plantação</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#E8F5E9' },
  title: { fontSize: 22, marginBottom: 15, color: '#2E7D32', fontWeight: 'bold' },
  plantacaoNome: { fontSize: 18, fontWeight: '600', color: '#1B5E20', marginBottom: 12 },
  info: { fontSize: 15, color: '#333', marginBottom: 6 },
  status: { fontSize: 14, fontWeight: '600', marginTop: 10, marginBottom: 20 },
  empty: { fontSize: 14, color: '#555', marginBottom: 20 },
  button: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
