import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { authErrorMessage } from './src/services/authValidation';
import { AppProvider, useApp } from './src/context/AppContext';
import { colors } from './src/theme/colors';
import { homeTheme } from './src/theme/homeTheme';
import type { SearchMenuItem } from './src/data/searchMenuData';

import { HomeScreen } from './src/screens/HomeScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { OtpScreen } from './src/screens/OtpScreen';
import { SearchResultsScreen } from './src/screens/SearchResultsScreen';
import { ReorderScreen } from './src/screens/ReorderScreen';
import { CheckoutScreen } from './src/screens/CheckoutScreen';

import { CartFloatingBar } from './src/components/CartFloatingBar';
import { CartModal } from './src/components/CartModal';
import { AdminAuthExperience } from './src/features/admin/AdminAuthExperience';

const ONBOARDING_STORAGE_KEY = '@desi_onboarding_completed';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Otp: { phoneNumber?: string };
  Main: undefined;
  SearchResults: { query?: string; collection?: 'popular' | 'recommended'; category?: SearchMenuItem['category'] } | undefined;
  Checkout: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Tab = 'home' | 'orders' | 'reorder' | 'profile';

interface MainAppProps {
  onLogout: () => void;
  onReplayOnboarding: () => void;
  onOpenSearch: (query: string, collection?: 'popular' | 'recommended', category?: SearchMenuItem['category']) => void;
  onCheckout: () => void;
}

function MainApp({ onLogout, onReplayOnboarding, onOpenSearch, onCheckout }: MainAppProps) {
  const insets = useSafeAreaInsets();
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [cartBottomSpace, setCartBottomSpace] = useState(0);
  const [tabBarHeight, setTabBarHeight] = useState(styles.tabBar.height + insets.bottom);
  const { orders, cartCount } = useApp();
  const isHome = currentTab === 'home';
  const isProfile = currentTab === 'profile';
  const usesLoginPalette = isHome || isProfile;
  const activeTabColor = usesLoginPalette ? homeTheme.primary : colors.primary;
  const inactiveTabColor = usesLoginPalette ? homeTheme.muted : colors.textMuted;

  // The tab bar already sits outside the screen container. Reserve only the
  // part of the cart's measured height and bottom offset that covers Home.
  const homeBottomInset = cartCount > 0
    ? Math.max(0, cartBottomSpace - tabBarHeight)
    : 0;

  return (
    <SafeAreaView style={[styles.container, usesLoginPalette && styles.homeContainer]} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Screen Container */}
      <View style={styles.screenContainer}>
        {currentTab === 'home' && (
          <HomeScreen
            bottomContentInset={homeBottomInset}
            onOpenSearch={onOpenSearch}
            onOpenMenu={category => onOpenSearch('', undefined, category)}
            onOpenProfile={() => setCurrentTab('profile')}
          />
        )}
        {currentTab === 'orders' && <OrdersScreen />}
        {currentTab === 'reorder' && <ReorderScreen />}
        {currentTab === 'profile' && (
          <ProfileScreen
            onReplayOnboarding={onReplayOnboarding}
            onLogout={onLogout}
          />
        )}
      </View>

      {/* Floating Cart bar (shows when cart has items) */}
      <CartFloatingBar bottomOffset={tabBarHeight + 4} onBottomSpaceChange={setCartBottomSpace} variant={isHome ? 'home' : isProfile ? 'profile' : 'default'} />

      {/* Slide-up Modals */}
      <CartModal onCheckout={onCheckout} />

      {/* Bottom Tab Bar */}
      <View
        style={[styles.tabBar, usesLoginPalette && styles.homeTabBar, { height: 56 + insets.bottom, paddingBottom: insets.bottom }]}
        onLayout={({ nativeEvent: { layout } }) => setTabBarHeight(layout.height)}
      >
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentTab('home')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentTab === 'home' ? 'home' : 'home-outline'}
            size={22}
            color={currentTab === 'home' ? activeTabColor : inactiveTabColor}
          />
          <Text
            style={[
              styles.tabLabel,
              usesLoginPalette && styles.homeTabLabel,
              currentTab === 'home' && styles.tabLabelActive,
              currentTab === 'home' && usesLoginPalette && styles.homeTabLabelActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentTab('orders')}
          activeOpacity={0.7}
        >
          <View style={styles.tabIconWrap}>
            <Ionicons name={currentTab === 'orders' ? 'receipt' : 'receipt-outline'} size={22} color={currentTab === 'orders' ? activeTabColor : inactiveTabColor} />
            {orders.length > 0 && (
              <View style={[styles.ordersBadge, isProfile && styles.profileOrdersBadge]}>
                <Text style={[styles.ordersBadgeText, isProfile && styles.profileOrdersBadgeText]}>{orders.length}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              usesLoginPalette && styles.homeTabLabel,
              currentTab === 'orders' && styles.tabLabelActive,
              currentTab === 'orders' && usesLoginPalette && styles.homeTabLabelActive,
            ]}
          >
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentTab('reorder')}
          activeOpacity={0.7}
        >
          <Ionicons name={currentTab === 'reorder' ? 'repeat' : 'repeat-outline'} size={22} color={currentTab === 'reorder' ? activeTabColor : inactiveTabColor} />
          <Text
            style={[
              styles.tabLabel,
              usesLoginPalette && styles.homeTabLabel,
              currentTab === 'reorder' && styles.tabLabelActive,
              currentTab === 'reorder' && usesLoginPalette && styles.homeTabLabelActive,
            ]}
          >
            Reorder
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentTab('profile')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={currentTab === 'profile' ? activeTabColor : inactiveTabColor}
          />
          <Text
            style={[
              styles.tabLabel,
              usesLoginPalette && styles.homeTabLabel,
              currentTab === 'profile' && styles.tabLabelActive,
              currentTab === 'profile' && usesLoginPalette && styles.homeTabLabelActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── THEMED LOADING SPLASH SCREEN ──
function SplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <StatusBar style="light" />
      <View style={styles.splashEmblem}>
        <View style={styles.splashLotusCenter} />
      </View>
      <Text style={styles.splashTitle}>DESI EXPRESS</Text>
      <View style={styles.splashDivider}>
        <View style={styles.splashLine} />
        <Text style={styles.splashDiamond}>◆</Text>
        <View style={styles.splashLine} />
      </View>
      <Text style={styles.splashSubtitle}>असली स्वाद, घर तक</Text>
      <ActivityIndicator size="small" color="#C69A5B" style={{ marginTop: 24 }} />
    </View>
  );
}

// ── ROOT STACK NAVIGATOR ──
function RootNavigator({ initialRoute, onOnboardingChange }: { initialRoute: 'Onboarding' | 'Login'; onOnboardingChange: (completed: boolean) => void }) {
  const { user, logout } = useAuth();
  const { setIsCartOpen } = useApp();
  return (
    <Stack.Navigator
      initialRouteName={user ? 'Main' : initialRoute}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Group navigationKey={user ? `user-${user.uid}` : 'guest-onboarding'}>
      <Stack.Screen name="Onboarding">
        {({ navigation }: NativeStackScreenProps<RootStackParamList, 'Onboarding'>) => (
          <OnboardingScreen
            onComplete={async () => {
              try {
                await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
              } catch (err) {
                console.warn('Failed to save onboarding state:', err);
              }
              onOnboardingChange(true);
              navigation.replace(user ? 'Main' : 'Login');
            }}
          />
        )}
      </Stack.Screen>

      </Stack.Group>
      {!user ? <Stack.Group navigationKey="guest">
      <Stack.Screen name="Login">
        {({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) => (
          <LoginScreen
            onNavigateToOtp={(phoneNumber) => {
              navigation.navigate('Otp', { phoneNumber });
            }}
            onBackToOnboarding={() => {
              navigation.navigate('Onboarding');
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Otp">
        {({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Otp'>) => (
          <OtpScreen
            phoneNumber={route.params?.phoneNumber}
            onBack={() => {
              navigation.goBack();
            }}
          />
        )}
      </Stack.Screen>

      </Stack.Group> : <Stack.Group navigationKey={user.uid}>
      <Stack.Screen name="Main">
        {({ navigation }: NativeStackScreenProps<RootStackParamList, 'Main'>) => (
          <MainApp
            onCheckout={() => navigation.navigate('Checkout')}
            onLogout={() => {
              void logout().catch(error => Alert.alert('Sign out failed', authErrorMessage(error)));
            }}
            onReplayOnboarding={async () => {
              try {
                await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
              } catch (err) {
                console.warn('Failed to clear onboarding state:', err);
              }
              onOnboardingChange(false);
              navigation.replace('Onboarding');
            }}
            onOpenSearch={(query, collection, category) => navigation.navigate('SearchResults', { query, collection, category })}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="SearchResults">
        {({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'SearchResults'>) => (
          <SearchResultsScreen initialQuery={route.params?.query} initialCollection={route.params?.collection} initialCategory={route.params?.category} onBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>

      <Stack.Screen name="Checkout">
        {({ navigation }: NativeStackScreenProps<RootStackParamList, 'Checkout'>) => (
          <CheckoutScreen
            onBack={() => {
              navigation.goBack();
            }}
          />
        )}
      </Stack.Screen>

      </Stack.Group>}
    </Stack.Navigator>
  );
}

function AppContent() {
  const { user, initializing } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        setHasCompletedOnboarding(value === 'true');
      } catch (err) {
        console.warn('Failed to read onboarding state:', err);
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkOnboardingStatus();
  }, []);

  if (isLoading || initializing) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <AppProvider key={user?.uid ?? 'guest'}>
        <NavigationContainer>
          <RootNavigator initialRoute={hasCompletedOnboarding ? 'Login' : 'Onboarding'} onOnboardingChange={setHasCompletedOnboarding} />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  const [adminRoute, setAdminRoute] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    const check = (url: string | null | undefined) => {
      if (!active) return;
      const parsed = url ? new URL(url) : null;
      const path = parsed ? `${parsed.protocol === 'desibites:' ? `/${parsed.hostname}` : ''}${parsed.pathname}` : '';
      setAdminRoute(path === '/admin' || path.startsWith('/admin/'));
    };
    if (Platform.OS === 'web') check(window.location.href);
    else void Linking.getInitialURL().then(check).catch(() => { if (active) setAdminRoute(false); });
    const subscription = Linking.addEventListener('url', event => check(event.url));
    return () => { active = false; subscription.remove(); };
  }, []);
  if (adminRoute === null) return <SplashScreen />;
  if (adminRoute) return <AdminAuthExperience onExit={() => {
    if (Platform.OS === 'web') window.history.replaceState({}, '', '/');
    setAdminRoute(false);
  }} />;

  return <AuthProvider><AppContent /></AuthProvider>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
  },
  homeContainer: {
    backgroundColor: homeTheme.background,
  },
  homeTabBar: {
    backgroundColor: homeTheme.card,
    borderTopColor: homeTheme.border,
    shadowColor: homeTheme.text,
  },
  homeTabLabel: {
    color: homeTheme.muted,
  },
  homeTabLabelActive: {
    color: homeTheme.primary,
  },
  tabBar: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabIconWrap: {
    position: 'relative',
  },
  ordersBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.primary,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  ordersBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  profileOrdersBadge: {
    backgroundColor: homeTheme.primary,
  },
  profileOrdersBadgeText: {
    color: homeTheme.background,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 3,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#1A0A05',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashEmblem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7A2328',
    borderWidth: 2,
    borderColor: '#C69A5B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  splashLotusCenter: {
    width: 12,
    height: 22,
    backgroundColor: '#C69A5B',
    borderRadius: 6,
  },
  splashTitle: {
    color: '#F5DEB3',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 3,
  },
  splashDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 6,
  },
  splashLine: {
    width: 24,
    height: 1,
    backgroundColor: '#C69A5B',
    opacity: 0.5,
  },
  splashDiamond: {
    color: '#C69A5B',
    fontSize: 8,
  },
  splashSubtitle: {
    color: '#C69A5B',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
