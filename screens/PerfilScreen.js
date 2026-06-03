import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PerfilScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Perfil do Produtor</Text>

      <Text>Nome: Felipe Conte</Text>
      <Text>Propriedade: Fazenda Boa Vista</Text>
      <Text>Cultura: Soja</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22 }
});
