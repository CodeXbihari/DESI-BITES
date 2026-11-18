import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AdminPreviewExperience } from '../admin/AdminPreviewExperience';
import { DeliveryDashboardScreen } from './DeliveryDashboardScreen';
import { DeliveryManagementScreen } from './DeliveryManagementScreen';
import { StaffProvider, useStaff } from './StaffContext';
import { StaffLoginScreen } from './StaffLoginScreen';
import { StaffButton, StaffNotice, errorMessage, staffColors, staffStyles } from './StaffUI';
import { allowedStaffPath, loginPath, readStaffPath, roleDashboard } from './staffDemo';
import type { StaffPath } from './staffDemo';

const web = Platform.OS === 'web' && typeof window !== 'undefined';

function currentPath() {
  return web ? readStaffPath(window.location.pathname) ?? loginPath : loginPath;
}

function writePath(path: StaffPath, replace: boolean) {
  if (!web || window.location.pathname === path) return;
  if (replace) window.history.replaceState(null, '', path);
  else window.history.pushState(null, '', path);
}

function StaffRouter() {
  const { account, loading, error, logout, reload } = useStaff();
  const [requested, setRequested] = useState<StaffPath>(currentPath);
  const [logoutError, setLogoutError] = useState('');
  const path = allowedStaffPath(requested, account?.role);

  useEffect(() => {
    if (!web) return;
    const onPop = () => setRequested(currentPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (loading || error) return;
    writePath(path, true);
    if (requested !== path) setRequested(path);
  }, [error, loading, path, requested]);

  useEffect(() => {
    if (Platform.OS !== 'android' || path !== '/admin/delivery') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setRequested(roleDashboard.admin);
      return true;
    });
    return () => subscription.remove();
  }, [path]);

  function navigate(destination: StaffPath) {
    const next = allowedStaffPath(destination, account?.role);
    writePath(next, false);
    setRequested(next);
  }

  async function signOut() {
    setLogoutError('');
    try { await logout(); }
    catch (failure) { setLogoutError(errorMessage(failure)); }
  }

  if (loading || error) {
    return (
      <SafeAreaView style={[staffStyles.screen, styles.center]}>
        {error ? <>
          <StaffNotice message={error} error />
          <StaffButton label="Retry" onPress={reload} />
        </> : <>
          <ActivityIndicator size="large" color={staffColors.burgundy} />
          <Text style={staffStyles.muted}>Opening staff demo…</Text>
        </>}
      </SafeAreaView>
    );
  }

  if (!account) return <StaffLoginScreen />;

  return (
    <View style={staffStyles.screen}>
      {account.role === 'admin' ? (
        <AdminPreviewExperience onExit={() => void signOut()} staffNavigation={{
          deliveryOpen: path === '/admin/delivery',
          deliveryContent: <DeliveryManagementScreen />,
          onDeliveryChange: open => navigate(open ? '/admin/delivery' : roleDashboard.admin),
        }} />
      ) : (
        <DeliveryDashboardScreen key={account.id} onLogout={() => void signOut()} />
      )}
      {logoutError ? <StaffNotice message={logoutError} error /> : null}
    </View>
  );
}

export function StaffExperience() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <StaffProvider><StaffRouter /></StaffProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center', gap: 12, padding: 16 },
});
