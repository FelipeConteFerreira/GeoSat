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
import { Ionicons } from '@expo/vector-icons';
import { useUsuario } from '../context/UsuarioContext';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';

function FormularioUsuario({ onSalvar, usuarioInicial, salvando }) {
  const [nome, setNome] = useState(usuarioInicial?.nome ?? '');
  const [email, setEmail] = useState(usuarioInicial?.email ?? '');
  const [cpf, setCpf] = useState(usuarioInicial?.cpf ?? '');
  const [telefone, setTelefone] = useState(usuarioInicial?.telefone ?? '');
  const [propriedade, setPropriedade] = useState(usuarioInicial?.propriedade ?? '');
  const [municipio, setMunicipio] = useState(usuarioInicial?.municipio ?? 'São Paulo');
  const [estado, setEstado] = useState(usuarioInicial?.estado ?? 'SP');
  const [cultivo, setCultivo] = useState(usuarioInicial?.cultivo ?? '');

  function handleSalvar() {
    if (!nome.trim()) return Alert.alert('Atenção', 'Informe seu nome.');
    if (!email.trim()) return Alert.alert('Atenção', 'Informe seu e-mail.');
    if (!cpf.replace(/\D/g, '').match(/^\d{11}$/)) {
      return Alert.alert('Atenção', 'Informe um CPF válido com 11 dígitos.');
    }
    if (!propriedade.trim()) return Alert.alert('Atenção', 'Informe o nome da propriedade.');
    if (!municipio.trim()) return Alert.alert('Atenção', 'Informe o município.');
    if (!estado.trim()) return Alert.alert('Atenção', 'Informe a UF (ex: SP).');
    if (!cultivo.trim()) return Alert.alert('Atenção', 'Informe o que você cultiva.');

    onSalvar({ nome, email, cpf, telefone, propriedade, municipio, estado, cultivo });
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.formHeader}>
          <Ionicons name="person-circle-outline" size={64} color="#2E7D32" />
          <Text style={styles.formTitulo}>{usuarioInicial ? 'Editar perfil' : 'Crie seu perfil'}</Text>
          <Text style={styles.formSubtitulo}>
            Seus dados serão sincronizados com a API GeoSat
          </Text>
        </View>

        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} placeholder="Ex: Felipe Conte" value={nome} onChangeText={setNome} />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>CPF (11 dígitos)</Text>
        <TextInput
          style={styles.input}
          placeholder="00000000000"
          value={cpf}
          onChangeText={setCpf}
          keyboardType="numeric"
          maxLength={11}
        />

        <Text style={styles.label}>Telefone (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="11999999999"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Propriedade</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Fazenda Boa Vista"
          value={propriedade}
          onChangeText={setPropriedade}
        />

        <Text style={styles.label}>Município</Text>
        <TextInput style={styles.input} placeholder="Ex: Ribeirão Preto" value={municipio} onChangeText={setMunicipio} />

        <Text style={styles.label}>Estado (UF)</Text>
        <TextInput
          style={styles.input}
          placeholder="SP"
          value={estado}
          onChangeText={setEstado}
          maxLength={2}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>O que você cultiva</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Soja, milho, café..."
          value={cultivo}
          onChangeText={setCultivo}
        />

        <TouchableOpacity
          style={[styles.botaoSalvar, salvando && styles.botaoDisabled]}
          onPress={handleSalvar}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoSalvarTexto}>
              {usuarioInicial ? 'Salvar na API' : 'Criar perfil na API'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PerfilExibicao({ usuario, onEditar, onLogout }) {
  return (
    <ScrollView contentContainerStyle={styles.perfilContainer}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{usuario.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.perfilNome}>{usuario.nome}</Text>
        <Text style={styles.perfilSubtitulo}>{usuario.email}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={22} color="#2E7D32" />
          <View style={styles.infoTexto}>
            <Text style={styles.infoLabel}>Propriedade</Text>
            <Text style={styles.infoValor}>{usuario.propriedade}</Text>
          </View>
        </View>
        <View style={styles.divisor} />
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={22} color="#2E7D32" />
          <View style={styles.infoTexto}>
            <Text style={styles.infoLabel}>Localização</Text>
            <Text style={styles.infoValor}>{usuario.municipio} - {usuario.estado}</Text>
          </View>
        </View>
        <View style={styles.divisor} />
        <View style={styles.infoRow}>
          <Ionicons name="leaf-outline" size={22} color="#2E7D32" />
          <View style={styles.infoTexto}>
            <Text style={styles.infoLabel}>Cultivo</Text>
            <Text style={styles.infoValor}>{usuario.cultivo}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.botaoEditar} onPress={onEditar}>
        <Ionicons name="create-outline" size={20} color="#2E7D32" />
        <Text style={styles.botaoEditarTexto}>Editar perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoLogout} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color="#B71C1C" />
        <Text style={styles.botaoLogoutTexto}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function PerfilScreen() {
  const { usuario, carregando, salvarUsuario, limparUsuario } = useUsuario();
  const { logout } = useAuth();
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar(dados) {
    setSalvando(true);
    try {
      await salvarUsuario(dados);
      setEditando(false);
      Alert.alert('Sucesso', 'Perfil sincronizado com a API!');
    } catch (error) {
      const msg = error instanceof ApiError ? error.message : 'Erro ao salvar perfil na API.';
      Alert.alert('Erro', msg);
    } finally {
      setSalvando(false);
    }
  }

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await limparUsuario();
          await logout();
        },
      },
    ]);
  }

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!usuario || editando) {
    return (
      <FormularioUsuario
        usuarioInicial={editando ? usuario : null}
        onSalvar={handleSalvar}
        salvando={salvando}
      />
    );
  }

  return (
    <PerfilExibicao
      usuario={usuario}
      onEditar={() => setEditando(true)}
      onLogout={handleLogout}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#E8F5E9' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F5E9' },
  formContainer: { padding: 20, paddingBottom: 40 },
  formHeader: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  formTitulo: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', marginTop: 12 },
  formSubtitulo: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 6, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#1B5E20', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  botaoSalvar: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  botaoDisabled: { opacity: 0.7 },
  botaoSalvarTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  perfilContainer: { padding: 20, paddingBottom: 40 },
  avatarContainer: { alignItems: 'center', marginTop: 20, marginBottom: 28 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarTexto: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  perfilNome: { fontSize: 22, fontWeight: 'bold', color: '#1B5E20' },
  perfilSubtitulo: { fontSize: 14, color: '#666', marginTop: 4 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  infoTexto: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  infoValor: { fontSize: 16, fontWeight: '600', color: '#333' },
  divisor: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 16 },
  botaoEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
    backgroundColor: '#fff',
  },
  botaoEditarTexto: { color: '#2E7D32', fontSize: 15, fontWeight: '600' },
  botaoLogout: {
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
  botaoLogoutTexto: { color: '#B71C1C', fontSize: 15, fontWeight: '600' },
});
