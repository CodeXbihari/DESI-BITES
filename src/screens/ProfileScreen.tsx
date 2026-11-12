import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { homeTheme } from '../theme/homeTheme';

interface ProfileScreenProps {
  onReplayOnboarding?: () => void;
  onLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onReplayOnboarding,
  onLogout,
}) => {
  const { user, profileError } = useAuth();
  const { addresses, favorites, orders } = useApp();

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.displayName?.slice(0, 2).toUpperCase() || 'DB'}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user?.displayName || 'Desi Bytes Member'}</Text>
          <Text style={styles.userPhone}>{user?.phoneNumber}</Text>
          <View style={styles.clubBadge}>
            <Ionicons name="sparkles" size={12} color={homeTheme.gold} />
            <Text style={styles.clubText}>DESI CLUB GOLD MEMBER</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {profileError ? <Text accessibilityRole="alert" style={{ color: colors.danger, padding: 16 }}>{profileError}</Text> : null}
        {/* Wallet / Desi Cash Quick Bar */}
        <View style={styles.walletBar}>
          <View style={styles.walletLeft}>
            <Ionicons name="wallet-outline" size={24} color={homeTheme.primary} />
            <View>
              <Text style={styles.walletTitle}>Desi Cash Balance</Text>
              <Text style={styles.walletAmount}>₹150.00</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addCashBtn}>
            <Text style={styles.addCashText}>Top Up</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Orders Placed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{addresses.length}</Text>
            <Text style={styles.statLabel}>Addresses</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuCard}>
          <Text style={styles.sectionHeading}>Account Settings</Text>

          <TouchableOpacity style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Ionicons name="location-outline" size={20} color={homeTheme.text} />
              <Text style={styles.menuTitle}>Saved Addresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={homeTheme.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Ionicons name="card-outline" size={20} color={homeTheme.text} />
              <Text style={styles.menuTitle}>Payment Methods & UPI</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={homeTheme.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Ionicons name="notifications-outline" size={20} color={homeTheme.text} />
              <Text style={styles.menuTitle}>Order Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={homeTheme.muted} />
          </TouchableOpacity>

          {onReplayOnboarding && (
            <TouchableOpacity style={styles.menuRow} onPress={onReplayOnboarding}>
              <View style={styles.menuLeft}>
                <Ionicons name="color-palette-outline" size={20} color={homeTheme.primary} />
                <Text style={[styles.menuTitle, { color: homeTheme.primary, fontWeight: '700' }]}>
                  Replay Welcome Onboarding (चाय तैयार है)
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={homeTheme.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.menuCard}>
          <Text style={styles.sectionHeading}>Help & Information</Text>

          <TouchableOpacity style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Ionicons name="help-buoy-outline" size={20} color={homeTheme.text} />
              <Text style={styles.menuTitle}>24x7 Customer Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={homeTheme.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={homeTheme.text} />
              <Text style={styles.menuTitle}>Freshness & Quality Guarantee</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={homeTheme.muted} />
          </TouchableOpacity>

          {onLogout && (
            <TouchableOpacity
              style={[styles.menuRow, { borderBottomWidth: 0, marginTop: 4 }]}
              onPress={onLogout}
            >
              <View style={styles.menuLeft}>
                <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                <Text style={[styles.menuTitle, { color: '#DC2626', fontWeight: '700' }]}>
                  Log Out / Switch Account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>

        {/* Version info */}
        <View style={styles.footerInfo}>
          <Text style={styles.versionText}>Desi Mart App v1.0.0 (Expo Prototype)</Text>
          <Text style={styles.madeWithText}>Crafted with ❤️ for Android & iOS</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: homeTheme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: homeTheme.header,
    borderBottomWidth: 1,
    borderBottomColor: homeTheme.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: homeTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: homeTheme.background,
    fontSize: 20,
    fontWeight: '800',
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: homeTheme.text,
  },
  userPhone: {
    fontSize: 12,
    color: homeTheme.muted,
    marginTop: 2,
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: homeTheme.header,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  clubText: {
    fontSize: 10,
    fontWeight: '800',
    color: homeTheme.muted,
    letterSpacing: 0.4,
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  walletBar: {
    backgroundColor: homeTheme.card,
    borderWidth: 1,
    borderColor: homeTheme.border,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletTitle: {
    fontSize: 12,
    color: homeTheme.muted,
    fontWeight: '600',
  },
  walletAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: homeTheme.text,
  },
  addCashBtn: {
    backgroundColor: homeTheme.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addCashText: {
    color: homeTheme.background,
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: homeTheme.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: homeTheme.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: homeTheme.text,
  },
  statLabel: {
    fontSize: 11,
    color: homeTheme.muted,
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: homeTheme.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: homeTheme.border,
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: homeTheme.muted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: homeTheme.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: homeTheme.text,
  },
  footerInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 11,
    color: homeTheme.muted,
    fontWeight: '600',
  },
  madeWithText: {
    fontSize: 11,
    color: homeTheme.muted,
    marginTop: 2,
  },
});

