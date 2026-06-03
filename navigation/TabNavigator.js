import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import PlantacoesScreen from '../screens/PlantacoesScreen';
import MonitoramentoScreen from '../screens/MonitoramentoScreen';
import AlertasScreen from '../screens/AlertasScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Inicio: { active: 'home', inactive: 'home-outline' },
  Plantacoes: { active: 'leaf', inactive: 'leaf-outline' },
  Monitoramento: { active: 'globe', inactive: 'globe-outline' },
  Alertas: { active: 'warning', inactive: 'warning-outline' },
  Perfil: { active: 'person', inactive: 'person-outline' },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#2E7D32' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#C8E6C9',
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.active : icons.inactive;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} options={{ title: 'Início', headerShown: false }} />
      <Tab.Screen name="Plantacoes" component={PlantacoesScreen} options={{ title: 'Plantações' }} />
      <Tab.Screen name="Monitoramento" component={MonitoramentoScreen} options={{ title: 'Monitoramento' }} />
      <Tab.Screen name="Alertas" component={AlertasScreen} options={{ title: 'Alertas' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
