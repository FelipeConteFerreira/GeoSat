import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Informe e-mail e senha.');
      return;
    }

    setCarregando(true);
    try {
      await login(email.trim(), senha);
    } catch (error) {
      const mensagem =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível conectar à API. A primeira requisição pode demorar (servidor em nuvem).';
      Alert.alert('Erro no login', mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Ionicons name="leaf" size={56} color="#fff" />
        <Text style={styles.titulo}>GeoSat</Text>
        <Text style={styles.subtitulo}>Monitoramento agrícola via satélite</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Sua senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.botao, carregando && styles.botaoDisabled]}
          onPress={handleLogin}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>Entrar</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.dica}>
          Conectado à API: geosat-java.onrender.com{'\n'}
          A primeira conexão pode levar até 1 minuto (cold start).
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  header: {
    backgroundColor: '#2E7D32',
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  subtitulo: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  form: { padding: 24, flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: '#1B5E20', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  botao: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  botaoDisabled: { opacity: 0.7 },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dica: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});
