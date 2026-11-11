import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Header } from '../components/Header';
import { HomeFoodCategories } from '../components/HomeFoodCategories';
import { RestaurantFoodCard } from '../components/RestaurantFoodCard';
import { SEARCH_MENU_ITEMS, type SearchMenuItem } from '../data/searchMenuData';
import { homeTheme as theme } from '../theme/homeTheme';
import homeSections from '../data/homeSections.json';

interface Props {
  bottomContentInset?: number;
  onOpenMenu: (category: SearchMenuItem['category']) => void;
  onOpenProfile: () => void;
  onOpenSearch: (query: string, collection?: 'popular' | 'recommended') => void;
}
export function HomeScreen({ bottomContentInset = 0, onOpenMenu, onOpenProfile, onOpenSearch }: Props) {
  const section = (title: string, icon: string, ids: string[], testID: string) => <View>
    <View style={styles.headingRow}><Text style={styles.heading}>{icon} {title}</Text><TouchableOpacity onPress={() => onOpenSearch('', testID === 'home-popular-row' ? 'popular' : 'recommended')} accessibilityRole="button" accessibilityLabel={`View all ${title}`}><Text style={styles.viewAll}>View All →</Text></TouchableOpacity></View>
    <ScrollView
      horizontal
      nestedScrollEnabled
      directionalLockEnabled
      testID={testID}
      accessibilityLabel={`${title}, horizontal list`}
      contentContainerStyle={styles.row}
      showsHorizontalScrollIndicator
      keyboardShouldPersistTaps="handled"
    >
      {ids.map(id => {
        const item = SEARCH_MENU_ITEMS.find(entry => entry.id === id);
        return item ? <View key={id} style={styles.cell}><RestaurantFoodCard item={item} /></View> : null;
      })}
    </ScrollView>
  </View>;
  return <View style={styles.container}>
    <ScrollView testID="home-content" style={styles.scroll} contentContainerStyle={{ paddingBottom: bottomContentInset + 12 }} showsVerticalScrollIndicator={false}>
      <Header variant="home" onOpenProfile={onOpenProfile} onOpenSearch={onOpenSearch} />
      <TouchableOpacity style={styles.banner} onPress={() => onOpenMenu('Pizza')} accessibilityRole="button" accessibilityLabel="Good Food Good Mood. Order pizza">
        <Image source={require('../../assets/images/menu/pizza.jpg')} style={styles.bannerImage} />
        <View style={styles.bannerCopy}><Text style={styles.bannerTitle}>Good Food</Text><Text style={styles.bannerAccent}>Good Mood!</Text><View style={styles.orderButton}><Text style={styles.orderText}>Order Now →</Text></View></View>
        <View style={styles.dots}><View style={styles.activeDot} />{[1,2,3,4].map(i => <View key={i} style={styles.dot} />)}</View>
      </TouchableOpacity>
      <HomeFoodCategories onOpenMenu={onOpenMenu} />
      {section('Popular Items', '🔥', homeSections.popular, 'home-popular-row')}
      {section('Recommended for You', '⭐', homeSections.recommended, 'home-recommended-row')}
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: theme.background }, scroll: { flex: 1 },
  banner: { marginHorizontal: 14, height: 166, borderRadius: 14, overflow: 'hidden', backgroundColor: '#351C0C' }, bannerImage: { width: '68%', height: '100%', position: 'absolute', right: 0 }, bannerCopy: { width: '55%', backgroundColor: 'rgba(53,28,12,0.75)', paddingLeft: 18, paddingTop: 19, height: '100%' },
  bannerTitle: { fontFamily: Platform.OS === 'android' ? 'serif' : 'Georgia', color: '#fff', fontSize: 27, fontWeight: '700', fontStyle: 'italic' }, bannerAccent: { fontFamily: Platform.OS === 'android' ? 'serif' : 'Georgia', color: '#FFD02F', fontSize: 29, fontWeight: '700', fontStyle: 'italic' }, orderButton: { alignSelf: 'flex-start', marginTop: 14, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 22, backgroundColor: '#FFD02F' }, orderText: { color: '#241800', fontSize: 13, fontWeight: '600' },
  dots: { position: 'absolute', bottom: 7, left: '41%', flexDirection: 'row', alignItems: 'center', gap: 5 }, dot: { width: 5, height: 5, borderRadius: 3, borderWidth: 1, borderColor: '#fff' }, activeDot: { width: 17, height: 5, borderRadius: 4, backgroundColor: '#FFD02F' },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 14, marginTop: 18, marginBottom: 10, gap: 8 }, heading: { flexShrink: 1, color: theme.text, fontSize: 20, fontWeight: '700' }, viewAll: { color: theme.primary, fontSize: 13, fontWeight: '600' },
  row: { gap: 12, paddingHorizontal: 14, paddingBottom: 10 }, cell: { width: 166, minWidth: 0 },
});
