import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlantacoes } from '../context/PlantacaoContext';

function getSaudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function HomeScreen({ navigation }) {
  const { plantacoes, recarregarPlantacoes } = usePlantacoes();
  const [refreshing, setRefreshing] = useState(false);

  const totalAlertas = plantacoes.filter((p) => p.statusTemperatura.status !== 'normal').length;
  const tempMedia =
    plantacoes.length > 0
      ? (plantacoes.reduce((s, p) => s + p.temperatura, 0) / plantacoes.length).toFixed(1)
      : '--';

  const ultimasPlantacoes = [...plantacoes].reverse().slice(0, 3);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await recarregarPlantacoes();
    setRefreshing(false);
  }, [recarregarPlantacoes]);

  const acoesRapidas = [
    {
      id: 'add',
      titulo: 'Nova Plantação',
      icone: 'add-circle',
      cor: '#2E7D32',
      onPress: () => navigation.navigate('AdicionarPlantacao'),
    },
    {
      id: 'list',
      titulo: 'Minhas Plantações',
      icone: 'leaf',
      cor: '#388E3C',
      onPress: () => navigation.navigate('Plantacoes'),
    },
    {
      id: 'monitor',
      titulo: 'Monitoramento',
      icone: 'globe',
      cor: '#1B5E20',
      onPress: () => navigation.navigate('Monitoramento'),
    },
    {
      id: 'alertas',
      titulo: 'Ver Alertas',
      icone: 'warning',
      cor: totalAlertas > 0 ? '#E65100' : '#558B2F',
      onPress: () => navigation.navigate('Alertas'),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.saudacao}>{getSaudacao()}, produtor!</Text>
          <Text style={styles.titulo}>🌱 GeoSat</Text>
          <Text style={styles.subtitulo}>Monitoramento agrícola via satélite</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="planet" size={48} color="rgba(255,255,255,0.3)" />
        </View>
      </View>

      {totalAlertas > 0 && (
        <Pressable
          style={styles.alertaBanner}
          onPress={() => navigation.navigate('Alertas')}
        >
          <Ionicons name="warning" size={22} color="#E65100" />
          <Text style={styles.alertaTexto}>
            {totalAlertas} alerta{totalAlertas > 1 ? 's' : ''} ativo{totalAlertas > 1 ? 's' : ''} — toque para ver
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#E65100" />
        </Pressable>
      )}

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardFirst]}>
          <Ionicons name="leaf" size={24} color="#2E7D32" />
          <Text style={styles.statNumero}>{plantacoes.length}</Text>
          <Text style={styles.statLabel}>Plantações</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="thermometer" size={24} color="#2E7D32" />
          <Text style={styles.statNumero}>{tempMedia}°</Text>
          <Text style={styles.statLabel}>Temp. média</Text>
        </View>
        <View style={[styles.statCard, styles.statCardLast]}>
          <Ionicons name="warning" size={24} color={totalAlertas > 0 ? '#E65100' : '#2E7D32'} />
          <Text style={[styles.statNumero, totalAlertas > 0 && styles.statAlerta]}>{totalAlertas}</Text>
          <Text style={styles.statLabel}>Alertas</Text>
        </View>
      </View>

      <Text style={styles.secaoTitulo}>Ações rápidas</Text>
      <View style={styles.acoesGrid}>
        {acoesRapidas.map((acao) => (
          <TouchableOpacity
            key={acao.id}
            style={styles.acaoCard}
            activeOpacity={0.7}
            onPress={acao.onPress}
          >
            <View style={[styles.acaoIcone, { backgroundColor: acao.cor }]}>
              <Ionicons name={acao.icone} size={26} color="#fff" />
            </View>
            <Text style={styles.acaoTitulo}>{acao.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.secaoTitulo}>Plantações recentes</Text>
      {ultimasPlantacoes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="leaf-outline" size={40} color="#A5D6A7" />
          <Text style={styles.emptyTexto}>Nenhuma plantação cadastrada ainda</Text>
          <TouchableOpacity
            style={styles.emptyBotao}
            onPress={() => navigation.navigate('AdicionarPlantacao')}
          >
            <Text style={styles.emptyBotaoTexto}>+ Cadastrar primeira plantação</Text>
          </TouchableOpacity>
        </View>
      ) : (
        ultimasPlantacoes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.plantacaoCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Detalhes', { plantacao: item })}
          >
            <View style={styles.plantacaoInfo}>
              <Text style={styles.plantacaoNome}>{item.nome}</Text>
              <Text style={styles.plantacaoDetalhe}>
                🌡️ {item.temperatura}°C · 💧 {item.umidade}% · 🌱 {item.saude}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.statusTemperatura.color + '22' }]}>
              <Text style={[styles.statusTexto, { color: item.statusTemperatura.color }]}>
                {item.statusTemperatura.status === 'normal' ? 'OK' : '!'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))
      )}

      <View style={styles.dicaCard}>
        <Ionicons name="bulb-outline" size={22} color="#F57F17" />
        <Text style={styles.dicaTexto}>
          Temperatura ideal: 20°C a 30°C. Acima de 30°C há risco de seca; abaixo de 10°C, risco crítico.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8F1' },
  content: { paddingBottom: 30 },
  header: {
    backgroundColor: '#2E7D32',
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  saudacao: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 4 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitulo: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  headerIcon: { marginLeft: 12 },
  alertaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#E65100',
    gap: 8,
  },
  alertaTexto: { flex: 1, color: '#E65100', fontWeight: '600', fontSize: 14 },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statCardFirst: {},
  statCardLast: {},
  statNumero: { fontSize: 22, fontWeight: 'bold', color: '#1B5E20', marginTop: 6 },
  statAlerta: { color: '#E65100' },
  statLabel: { fontSize: 11, color: '#666', marginTop: 2, textAlign: 'center' },
  secaoTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  acoesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    gap: 10,
  },
  acaoCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  acaoIcone: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  acaoTitulo: { fontSize: 13, fontWeight: '600', color: '#333', textAlign: 'center' },
  emptyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderStyle: 'dashed',
  },
  emptyTexto: { color: '#666', fontSize: 14, marginTop: 10, marginBottom: 16, textAlign: 'center' },
  emptyBotao: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emptyBotaoTexto: { color: '#fff', fontWeight: '600', fontSize: 14 },
  plantacaoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  plantacaoInfo: { flex: 1 },
  plantacaoNome: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },
  plantacaoDetalhe: { fontSize: 12, color: '#666', marginTop: 4 },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statusTexto: { fontWeight: 'bold', fontSize: 14 },
  dicaCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFDE7',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 14,
    borderRadius: 10,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F57F17',
  },
  dicaTexto: { flex: 1, fontSize: 13, color: '#555', lineHeight: 20 },
});
