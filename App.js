import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PlantacaoProvider } from './context/PlantacaoContext';
import StackNavigator from './navigation/StackNavigator';

export default function App() {
  return (
    <PlantacaoProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </PlantacaoProvider>
  );
}
