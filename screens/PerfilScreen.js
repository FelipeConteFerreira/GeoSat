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

function FormularioUsuario({ onSalvar, usuarioInicial }) {
  const [nome, setNome] = useState(usuarioInicial?.nome ?? '');
  const [propriedade, setPropriedade] = useState(usuarioInicial?.propriedade ?? '');
  const [cultivo, setCultivo] = useState(usuarioInicial?.cultivo ?? '');

  function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Informe seu nome.');
      return;
    }
    if (!propriedade.trim()) {
      Alert.alert('Atenção', 'Informe o nome da propriedade.');
      return;
    }
    if (!cultivo.trim()) {
      Alert.alert('Atenção', 'Informe o que você cultiva.');
      return;
    }
    onSalvar({ nome, propriedade, cultivo });
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.formHeader}>
          <Ionicons name="person-circle-outline" size={64} color="#2E7D32" />
          <Text style={styles.formTitulo}>
            {usuarioInicial ? 'Editar perfil' : 'Crie seu perfil'}
          </Text>
          <Text style={styles.formSubtitulo}>
            {usuarioInicial
              ? 'Atualize seus dados de produtor rural'
              : 'Preencha seus dados para personalizar o GeoSat'}
          </Text>
        </View>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Felipe Conte"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Propriedade</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Fazenda Boa Vista"
          value={propriedade}
          onChangeText={setPropriedade}
        />

        <Text style={styles.label}>O que você cultiva</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Soja, milho, café..."
          value={cultivo}
          onChangeText={setCultivo}
        />

        <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
          <Text style={styles.botaoSalvarTexto}>
            {usuarioInicial ? 'Salvar alterações' : 'Criar perfil'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PerfilExibicao({ usuario, onEditar }) {
  return (
    <ScrollView contentContainerStyle={styles.perfilContainer}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{usuario.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.perfilNome}>{usuario.nome}</Text>
        <Text style={styles.perfilSubtitulo}>Produtor rural</Text>
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
    </ScrollView>
  );
}

export default function PerfilScreen() {
  const { usuario, carregando, salvarUsuario } = useUsuario();
  const [editando, setEditando] = useState(false);

  async function handleSalvar(dados) {
    await salvarUsuario(dados);
    setEditando(false);
    Alert.alert('Sucesso', 'Perfil salvo com sucesso!');
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
      />
    );
  }

  return <PerfilExibicao usuario={usuario} onEditar={() => setEditando(true)} />;
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
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
});
