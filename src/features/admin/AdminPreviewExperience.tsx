import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdminNavigator } from './AdminNavigator';
import { AdminDemoProvider } from './state/AdminDemoContext';
import type { AdminStaffNavigation } from './types';

export function AdminPreviewExperience({ onExit, staffNavigation }: { onExit: () => void; staffNavigation?: AdminStaffNavigation }) {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AdminDemoProvider>
        <NavigationContainer>
          <AdminNavigator onExit={onExit} staffNavigation={staffNavigation} />
        </NavigationContainer>
      </AdminDemoProvider>
    </SafeAreaProvider>
  );
}
