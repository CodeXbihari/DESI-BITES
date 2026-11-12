import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdminNavigator } from './AdminNavigator';
import { AdminDemoProvider } from './state/AdminDemoContext';
import { DeveloperPreviewMenu } from './DeveloperPreviewMenu';

export function AdminPreviewExperience({ onExit }: { onExit: () => void }) {
  const [adminOpen, setAdminOpen] = React.useState(false);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {adminOpen ? (
        <AdminDemoProvider>
          <NavigationContainer>
            <AdminNavigator onExit={() => setAdminOpen(false)} />
          </NavigationContainer>
        </AdminDemoProvider>
      ) : (
        <DeveloperPreviewMenu onOpenAdmin={() => setAdminOpen(true)} onExit={onExit} />
      )}
    </SafeAreaProvider>
  );
}
