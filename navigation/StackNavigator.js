import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabNavigator from './TabNavigator';
import { FONTS } from '../config/theme';
import AdicionarPlantacaoScreen from '../screens/AdicionarPlantacaoScreen';
import EditarPlantacaoScreen from '../screens/EditarPlantacaoScreen';
import DetalhesScreen from '../screens/DetalhesScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2E7D32' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontFamily: FONTS.bold },
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="AdicionarPlantacao" component={AdicionarPlantacaoScreen} options={{ title: 'Nova Plantação' }} />
      <Stack.Screen name="EditarPlantacao" component={EditarPlantacaoScreen} options={{ title: 'Editar Plantação' }} />
      <Stack.Screen name="Detalhes" component={DetalhesScreen} options={{ title: 'Detalhes' }} />
    </Stack.Navigator>
  );
}
