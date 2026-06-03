import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PlantacaoProvider } from './context/PlantacaoContext';
import { UsuarioProvider } from './context/UsuarioContext';
import StackNavigator from './navigation/StackNavigator';

export default function App() {
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
