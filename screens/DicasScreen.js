import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DICAS_PLANTACAO } from '../data/dicasPlantacao';
import { FONTS } from '../config/theme';

const CARD_GAP = 12;
const PADDING = 16;
const CARD_WIDTH = (Dimensions.get('window').width - PADDING * 2 - CARD_GAP) / 2;

function DicaCard({ dica }) {
  return (
    <View style={[styles.dicaCard, { backgroundColor: dica.corFundo, width: CARD_WIDTH }]}>
      <View style={styles.dicaTopo}>
        <View style={[styles.iconeBox, { backgroundColor: dica.corResumo }]}>
          <Ionicons name={dica.icone} size={22} color={dica.corTitulo} />
        </View>
        <Text style={styles.dicaEmoji}>🌱</Text>
      </View>

      <Text style={[styles.dicaTitulo, { color: dica.corTitulo }]}>
        {dica.numero}. {dica.titulo}
      </Text>

      {dica.imagem && (
        <Image source={dica.imagem} style={styles.dicaImagem} resizeMode="cover" />
      )}

      <Text style={styles.dicaDescricao}>{dica.descricao}</Text>

      <View style={[styles.dicaResumo, { backgroundColor: dica.corResumo }]}>
        <Text style={[styles.dicaResumoTexto, { color: dica.corTitulo }]}>{dica.resumo}</Text>
      </View>
    </View>
  );
}

export default function DicasScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTexto}>
          <Text style={styles.headerTitulo}>🌱 Dicas para uma boa plantação</Text>
          <Text style={styles.headerSub}>
            Dicas essenciais para ter uma plantação{'\n'}
            <Text style={styles.headerDestaque}>viva e cheia de vida! 🌿</Text>
          </Text>
        </View>
        <View style={styles.headerSprout}>
          <Text style={styles.sproutEmoji}>🌱</Text>
          <View style={styles.solo} />
        </View>
      </View>

      <View style={styles.grid}>
        {DICAS_PLANTACAO.map((dica) => (
          <DicaCard key={dica.id} dica={dica} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1B3D1F' },
  content: { paddingBottom: 32 },
  header: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTexto: { flex: 1, paddingRight: 12 },
  headerTitulo: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: '#fff',
    lineHeight: 28,
    marginBottom: 10,
  },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 22 },
  headerDestaque: { color: '#81C784', fontFamily: FONTS.semiBold },
  headerSprout: { alignItems: 'center' },
  sproutEmoji: { fontSize: 48 },
  solo: {
    width: 56,
    height: 14,
    backgroundColor: '#5D4037',
    borderRadius: 8,
    marginTop: -8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    paddingHorizontal: PADDING,
  },
  dicaCard: {
    borderRadius: 16,
    padding: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  dicaTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconeBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dicaEmoji: { fontSize: 28, opacity: 0.85 },
  dicaTitulo: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  dicaImagem: {
    width: '100%',
    height: 90,
    borderRadius: 10,
    marginBottom: 10,
  },
  dicaDescricao: {
    fontSize: 12,
    color: '#444',
    lineHeight: 18,
    marginBottom: 12,
  },
  dicaResumo: {
    borderRadius: 8,
    padding: 10,
  },
  dicaResumoTexto: {
    fontSize: 11,
    fontFamily: FONTS.semiBold,
    lineHeight: 16,
  },
});
