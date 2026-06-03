import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { usePlantacoes } from '../context/PlantacaoContext';
import { evaluateTemperatura } from '../utils/evaluateTemperatura';

export default function AdicionarPlantacaoScreen({ navigation }) {
  const { adicionarPlantacao } = usePlantacoes();

  const [nome, setNome] = useState('');
  const [umidade, setUmidade] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [saude, setSaude] = useState('');

  const avaliacao = temperatura ? evaluateTemperatura(temperatura) : null;

  function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Informe o nome da plantação.');
      return;
    }
    if (!umidade.trim()) {
      Alert.alert('Atenção', 'Informe a umidade do solo.');
      return;
    }
    if (!temperatura.trim() || isNaN(parseFloat(temperatura.replace(',', '.')))) {
      Alert.alert('Atenção', 'Informe uma temperatura válida.');
      return;
    }
    if (!saude.trim()) {
      Alert.alert('Atenção', 'Informe a saúde da plantação.');
      return;
    }

    adicionarPlantacao({ nome, umidade, temperatura, saude });
    Alert.alert('Sucesso', 'Plantação adicionada com sucesso!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>🌾 Nova Plantação</Text>
        <Text style={styles.subtitle}>Preencha os dados de monitoramento</Text>

        <Text style={styles.label}>Nome da plantação</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Talhão Norte"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Umidade do solo (%)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 72"
          value={umidade}
          onChangeText={setUmidade}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Temperatura (°C)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 28"
          value={temperatura}
          onChangeText={setTemperatura}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Saúde da plantação</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ex: Boa, Regular, Ruim..."
          value={saude}
          onChangeText={setSaude}
          multiline
        />

        {avaliacao && avaliacao.status !== 'invalido' && (
          <View style={[styles.statusBox, { borderColor: avaliacao.color }]}>
            <Text style={[styles.statusTitle, { color: avaliacao.color }]}>
              Status da temperatura
            </Text>
            <Text style={styles.statusText}>{avaliacao.message}</Text>
            <Text style={styles.statusHint}>
              Normal: 20°C a 30°C | Acima de 30°C: risco de seca | Abaixo de 10°C: risco crítico
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSalvar}>
          <Text style={styles.buttonText}>Salvar Plantação</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#E8F5E9' },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1B5E20', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  statusBox: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
  },
  statusTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  statusText: { fontSize: 14, color: '#333', marginBottom: 8 },
  statusHint: { fontSize: 12, color: '#666', lineHeight: 18 },
  button: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
