import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UsuarioProvider } from './context/UsuarioContext';
import { PlantacaoProvider } from './context/PlantacaoContext';
import StackNavigator from './navigation/StackNavigator';
import LoginScreen from './screens/LoginScreen';
import LoadingScreen from './components/LoadingScreen';

function AppContent() {
  const { autenticado, carregando } = useAuth();

  if (carregando) return <LoadingScreen />;
  if (!autenticado) return <LoginScreen />;

  return (
    <UsuarioProvider>
      <PlantacaoProvider>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </PlantacaoProvider>
    </UsuarioProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
