import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { homeTheme as theme } from '../theme/homeTheme';

interface HeaderProps {
  variant?: 'default' | 'home';
  onOpenProfile?: () => void;
  onOpenSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ variant = 'default', onOpenProfile, onOpenSearch }) => {
  const { selectedAddress, searchQuery, setSearchQuery, cartCount, setIsCartOpen } = useApp();

  if (variant === 'home') return <HomeHeader onOpenProfile={onOpenProfile} onOpenSearch={onOpenSearch} />;

  return (
    <View style={styles.container}>
      {/* Top Location & Profile Row */}
      <View style={styles.topRow}>
        <View style={styles.locationContainer}>
          <View style={styles.deliveryBadge}>
            <Ionicons name="flash" size={12} color="#FFFFFF" />
            <Text style={styles.deliveryBadgeText}>12 MINS</Text>
          </View>
          <TouchableOpacity style={styles.addressSelector} activeOpacity={0.7}>
            <Text style={styles.addressTitle} numberOfLines={1}>
              {selectedAddress.tag} - {selectedAddress.area}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.addressSubtitle} numberOfLines={1}>
            {selectedAddress.addressLine}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.cartIconBtn} 
            activeOpacity={0.7}
            onPress={() => setIsCartOpen(true)}
          >
            <Ionicons name="cart-outline" size={24} color={colors.text} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder='Search "Atta", "Gulab Jamun", "Paneer"...'
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationContainer: {
    flex: 1,
    marginRight: 12,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
    gap: 3,
  },
  deliveryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addressSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    maxWidth: '85%',
  },
  addressSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartIconBtn: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
});

function HomeHeader({ onOpenSearch }: Pick<HeaderProps, 'onOpenProfile' | 'onOpenSearch'>) {
  const { selectedAddress, addresses, setSelectedAddress, addAddress, searchQuery, setSearchQuery, cartCount, setIsCartOpen } = useApp();
  const [showAddresses, setShowAddresses] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ addressLine: '', area: '', city: '', pincode: '' });

  return (
    <>
      <View style={homeStyles.header}>
        <Image
          source={require('../../assets/images/login_footer_landscape.jpg')}
          style={homeStyles.texture}
          resizeMode="cover"
          accessible={false}
        />
        <View style={homeStyles.topRow}>
          <TouchableOpacity style={homeStyles.location} onPress={() => setShowAddresses(true)} accessibilityRole="button" accessibilityLabel="Change delivery address">
            <View style={homeStyles.addressRow}><Ionicons name="location" size={23} color={theme.primary} /><Text style={homeStyles.addressTitle} numberOfLines={1}>{selectedAddress.city}</Text><Ionicons name="chevron-down" size={16} color={theme.primary} /></View>
          </TouchableOpacity>
          <TouchableOpacity style={homeStyles.cart} onPress={() => setIsCartOpen(true)} accessibilityRole="button" accessibilityLabel={`Open cart, ${cartCount} items`}><Ionicons name="cart-outline" size={32} color={theme.primary} />{cartCount > 0 && <Text style={homeStyles.cartBadge}>{cartCount}</Text>}</TouchableOpacity>
        </View>
        <Image source={require('../../assets/images/desi-logo.png')} style={{ width: '82%', height: 78, alignSelf: 'center', marginTop: -12, marginBottom: 10 }} resizeMode="contain" accessibilityLabel="Desi Bites Café" />
        <TouchableOpacity style={homeStyles.search} onPress={() => onOpenSearch?.(searchQuery)} accessibilityRole="button" accessibilityLabel="Search for food">
          <Ionicons name="search-outline" size={23} color={theme.text} /><Text style={homeStyles.input}>{searchQuery || 'Search for food…'}</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={showAddresses} transparent animationType="fade" onRequestClose={() => setShowAddresses(false)}>
        <View style={homeStyles.backdrop}>
          <View style={homeStyles.addressSheet}>
            <View style={homeStyles.topRow}>
              <Text style={homeStyles.sheetTitle}>Delivering to</Text>
              <TouchableOpacity onPress={() => setShowAddresses(false)} accessibilityRole="button" accessibilityLabel="Close address selection" hitSlop={10}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {addresses.map(address => (
                <TouchableOpacity
                  key={address.id}
                  style={[homeStyles.addressOption, address.id === selectedAddress.id && homeStyles.addressSelected]}
                  onPress={() => { setSelectedAddress(address); setShowAddresses(false); }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: address.id === selectedAddress.id }}
                >
                  <Text style={homeStyles.optionTitle}>{address.tag} · {address.area}</Text>
                  <Text style={homeStyles.addressDetail}>{address.addressLine}, {address.city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={homeStyles.addAddressButton} onPress={() => setShowAddAddress(true)} accessibilityRole="button"><Ionicons name="add-circle-outline" size={19} color={theme.primary}/><Text style={homeStyles.addAddressText}>Add new address</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showAddAddress} transparent animationType="slide" onRequestClose={() => setShowAddAddress(false)}><View style={homeStyles.backdrop}><View style={homeStyles.addressSheet}><Text style={homeStyles.sheetTitle}>Add new address</Text>{(['addressLine','area','city','pincode'] as const).map((field,index)=><TextInput key={field} style={homeStyles.newAddressInput} placeholder={['Street address','Area / locality','City','PIN code'][index]} placeholderTextColor={theme.muted} value={newAddress[field]} onChangeText={value=>setNewAddress(prev=>({...prev,[field]:value}))} keyboardType={field==='pincode'?'number-pad':'default'} />)}<View style={homeStyles.addressActions}><TouchableOpacity style={[homeStyles.addressAction,homeStyles.cancelAddress]} onPress={()=>{setShowAddAddress(false);setNewAddress({addressLine:'',area:'',city:'',pincode:''});}} accessibilityRole="button"><Text style={homeStyles.cancelAddressText}>Cancel</Text></TouchableOpacity><TouchableOpacity style={[homeStyles.addressAction,homeStyles.saveAddress]} onPress={()=>{const {addressLine,area,city,pincode}=newAddress;if(!addressLine.trim()||!area.trim()||!city.trim()||!/^\d{6}$/.test(pincode.trim()))return;const address={id:`address-${Date.now()}`,tag:'Other' as const,addressLine:addressLine.trim(),area:area.trim(),city:city.trim(),pincode:pincode.trim(),isDefault:false};addAddress(address);setNewAddress({addressLine:'',area:'',city:'',pincode:''});setShowAddAddress(false);setShowAddresses(false);}} accessibilityRole="button"><Text style={homeStyles.saveAddressText}>Save address</Text></TouchableOpacity></View></View></View></Modal>
    </>
  );
}

const homeStyles = StyleSheet.create({
  header: { backgroundColor: theme.background, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, overflow: 'hidden' },
  texture: { ...StyleSheet.absoluteFill, width: '100%', height: '100%', opacity: 0.09 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  location: { flex: 1, minWidth: 0 },
  delivering: { fontSize: 9, letterSpacing: 1.2, color: theme.muted, fontWeight: '700', marginBottom: 5 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  addressTitle: { flexShrink: 1, color: theme.text, fontSize: 15, fontWeight: '600' },
  addressDetail: { fontSize: 10, lineHeight: 16, color: theme.muted, marginTop: 4 },
  cart: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: -5, right: -4, minWidth: 16, borderRadius: 8, textAlign: 'center', paddingHorizontal: 3, backgroundColor: theme.primary, color: theme.card, fontSize: 9, fontWeight: '800' },
  profile: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: theme.gold, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 46, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.border, borderRadius: 28, backgroundColor: theme.card },
  input: { flex: 1, minWidth: 0, fontSize: 13, paddingVertical: 12, color: theme.text },
  backdrop: { flex: 1, backgroundColor: 'rgba(44,24,18,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  addressSheet: { width: '100%', maxWidth: 420, maxHeight: '80%', borderRadius: 18, padding: 20, backgroundColor: theme.background, borderWidth: 1, borderColor: theme.gold },
  sheetTitle: { flex: 1, fontFamily: theme.headingFont, fontSize: 23, fontWeight: '700', color: theme.text },
  addressOption: { borderWidth: 1, borderColor: theme.border, borderRadius: 12, backgroundColor: theme.card, padding: 12, marginBottom: 10 },
  addressSelected: { borderColor: theme.primary },
  addAddressButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: theme.primary, borderRadius: 12, marginTop: 6 },
  addAddressText: { color: theme.primary, fontWeight: '700' },
  newAddressInput: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 10, color: theme.text },
  addressActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  addressAction: { flex: 1, minHeight: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelAddress: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  saveAddress: { backgroundColor: theme.primary },
  cancelAddressText: { color: theme.text, fontWeight: '700' },
  saveAddressText: { color: theme.card, fontWeight: '700' },
  optionTitle: { fontWeight: '700', color: theme.text, fontSize: 14 },
});

