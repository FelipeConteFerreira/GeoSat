import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUsuario } from '../context/UsuarioContext';
import { useAuth } from '../context/AuthContext';
import { FONTS } from '../config/theme';

function InfoRow({ icon, label, valor }) {
  if (!valor) return null;

  return (
    <>
      <View style={styles.infoRow}>
        <Ionicons name={icon} size={22} color="#2E7D32" />
        <View style={styles.infoTexto}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValor}>{valor}</Text>
        </View>
      </View>
      <View style={styles.divisor} />
    </>
  );
}

export default function PerfilScreen() {
  const { usuario, carregando, limparUsuario } = useUsuario();
  const { logout } = useAuth();

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

  if (carregando || !usuario) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const inicial = usuario.nome.charAt(0).toUpperCase();

  return (
    <ScrollView contentContainerStyle={styles.perfilContainer}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{inicial}</Text>
        </View>
        <Text style={styles.perfilNome}>{usuario.nome}</Text>
        <Text style={styles.perfilSubtitulo}>{usuario.email}</Text>
        {usuario.role ? (
          <Text style={styles.perfilRole}>{usuario.role}</Text>
        ) : null}
      </View>

      {(usuario.propriedade || usuario.municipio || usuario.cultivo) ? (
        <View style={styles.infoCard}>
          <InfoRow icon="business-outline" label="Propriedade" valor={usuario.propriedade} />
          <InfoRow
            icon="location-outline"
            label="Localização"
            valor={usuario.municipio && usuario.estado ? `${usuario.municipio} - ${usuario.estado}` : ''}
          />
          <InfoRow icon="leaf-outline" label="Cultivo" valor={usuario.cultivo} />
        </View>
      ) : (
        <Text style={styles.aviso}>
          Perfil da conta definido no login. Dados de propriedade na API aparecem aqui quando existirem.
        </Text>
      )}

      <TouchableOpacity
        style={styles.botaoLogout}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Sair da conta"
      >
        <Ionicons name="log-out-outline" size={20} color="#B71C1C" />
        <Text style={styles.botaoLogoutTexto}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F5E9' },
  perfilContainer: { padding: 20, paddingBottom: 40, backgroundColor: '#E8F5E9', flexGrow: 1 },
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
  avatarTexto: { fontSize: 32, fontFamily: FONTS.bold, color: '#fff' },
  perfilNome: { fontSize: 22, fontFamily: FONTS.bold, color: '#1B5E20' },
  perfilSubtitulo: { fontSize: 14, color: '#666', marginTop: 4 },
  perfilRole: {
    fontSize: 12,
    color: '#2E7D32',
    fontFamily: FONTS.semiBold,
    marginTop: 6,
    backgroundColor: '#C8E6C9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  infoTexto: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  infoValor: { fontSize: 16, fontFamily: FONTS.semiBold, color: '#333' },
  divisor: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 16 },
  aviso: { fontSize: 13, color: '#666', lineHeight: 20, marginTop: 4 },
  botaoLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B71C1C',
    backgroundColor: '#fff',
  },
  botaoLogoutTexto: { color: '#B71C1C', fontSize: 15, fontFamily: FONTS.semiBold },
});

