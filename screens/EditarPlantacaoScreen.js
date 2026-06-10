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
  ActivityIndicator,
} from 'react-native';
import { usePlantacoes } from '../context/PlantacaoContext';
import { evaluateTemperatura } from '../utils/evaluateTemperatura';
import { ApiError } from '../services/apiClient';
import { FONTS } from '../config/theme';

export default function EditarPlantacaoScreen({ route, navigation }) {
  const { atualizarPlantacao } = usePlantacoes();
  const plantacao = route.params?.plantacao;

  const [nome, setNome] = useState(plantacao?.nome ?? '');
  const [umidade, setUmidade] = useState(plantacao?.umidade ?? '');
  const [temperatura, setTemperatura] = useState(
    plantacao?.temperatura != null ? String(plantacao.temperatura) : ''
  );
  const [saude, setSaude] = useState(plantacao?.saude ?? '');
  const [salvando, setSalvando] = useState(false);

  const avaliacao = temperatura ? evaluateTemperatura(temperatura) : null;

  if (!plantacao) {
    return (
      <View style={styles.flex}>
        <Text style={styles.erro}>Plantação não encontrada.</Text>
      </View>
    );
  }

  async function handleSalvar() {
    if (!nome.trim()) return Alert.alert('Atenção', 'Informe o nome da plantação.');
    if (!umidade.trim()) return Alert.alert('Atenção', 'Informe a umidade do solo.');
    if (!temperatura.trim() || isNaN(parseFloat(temperatura.replace(',', '.')))) {
      return Alert.alert('Atenção', 'Informe uma temperatura válida.');
    }
    if (!saude.trim()) return Alert.alert('Atenção', 'Informe a cultura da plantação.');

    setSalvando(true);
    try {
      await atualizarPlantacao(plantacao, { nome, umidade, temperatura, saude });
      Alert.alert('Sucesso', 'Plantação atualizada na API!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'Erro ao atualizar na API.';
      Alert.alert('Erro', msg);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>✏️ Editar Plantação</Text>
        <Text style={styles.subtitle}>
          Atualiza o talhão (PUT) e registra nova leitura de temperatura/umidade
        </Text>

        <Text style={styles.label}>Nome da plantação (talhão)</Text>
        <TextInput style={styles.input} placeholder="Ex: Talhão Norte" value={nome} onChangeText={setNome} />

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

        <Text style={styles.label}>Cultura da plantação</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ex: Soja, Milho..."
          value={saude}
          onChangeText={setSaude}
          multiline
        />

        {avaliacao && avaliacao.status !== 'invalido' && (
          <View style={[styles.statusBox, { borderColor: avaliacao.color }]}>
            <Text style={[styles.statusTitle, { color: avaliacao.color }]}>Status da temperatura</Text>
            <Text style={styles.statusText}>{avaliacao.message}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, salvando && styles.buttonDisabled]}
          onPress={handleSalvar}
          disabled={salvando}
          accessibilityRole="button"
          accessibilityLabel="Salvar alterações na API"
        >
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Salvar alterações na API</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#E8F5E9' },
  container: { padding: 20, paddingBottom: 40 },
  erro: { padding: 20, fontSize: 15, color: '#555' },
  title: { fontSize: 24, fontFamily: FONTS.bold, color: '#2E7D32', marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: FONTS.regular, color: '#555', marginBottom: 20 },
  label: { fontSize: 14, fontFamily: FONTS.semiBold, color: '#1B5E20', marginBottom: 6, marginTop: 12 },
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
  statusTitle: { fontSize: 15, fontFamily: FONTS.bold, marginBottom: 4 },
  statusText: { fontSize: 14, color: '#333' },
  button: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: FONTS.bold },
});
