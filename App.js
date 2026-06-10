import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
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
  const [fontesCarregadas] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontesCarregadas) return <LoadingScreen />;

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
