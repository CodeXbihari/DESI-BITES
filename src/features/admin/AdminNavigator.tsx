import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { homeTheme as theme } from '../../theme/homeTheme';
import { AdminPreviewIndicator } from './components/AdminUI';
import { AdminCustomerDetailsScreen } from './screens/AdminCustomerDetailsScreen';
import { AdminMenuItemFormScreen } from './screens/AdminMenuItemFormScreen';
import { AdminOrderDetailsScreen } from './screens/AdminOrderDetailsScreen';
import { AdminWorkspaceScreen } from './screens/AdminWorkspaceScreen';
import type { AdminStackParamList } from './types';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminNavigator({ onExit }: { onExit: () => void }) {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: theme.background },
      headerTintColor: theme.primary,
      headerTitleStyle: { color: theme.text, fontWeight: '800' },
      headerShadowVisible: false,
      headerRight: () => <AdminPreviewIndicator compact />,
      contentStyle: { backgroundColor: theme.background },
      animation: 'fade_from_bottom',
    }}>
      <Stack.Screen name="AdminWorkspace" options={{ headerShown: false }}>
        {props => <AdminWorkspaceScreen {...props} onExit={onExit} />}
      </Stack.Screen>
      <Stack.Screen name="AdminOrderDetails" component={AdminOrderDetailsScreen} options={{ headerShown: true, title: 'Order details' }} />
      <Stack.Screen name="AdminMenuItemForm" component={AdminMenuItemFormScreen} options={({ route }) => ({ headerShown: true, title: route.params?.menuItemId ? 'Edit menu item' : 'Add menu item' })} />
      <Stack.Screen name="AdminCustomerDetails" component={AdminCustomerDetailsScreen} options={{ headerShown: true, title: 'Customer details' }} />
    </Stack.Navigator>
  );
}
