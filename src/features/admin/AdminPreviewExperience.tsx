import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdminNavigator } from './AdminNavigator';
import { AdminDemoProvider } from './state/AdminDemoContext';

export function AdminPreviewExperience({ onExit }: { onExit: () => void }) {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AdminDemoProvider>
        <NavigationContainer>
          <AdminNavigator onExit={onExit} />
        </NavigationContainer>
      </AdminDemoProvider>
    </SafeAreaProvider>
  );
}
