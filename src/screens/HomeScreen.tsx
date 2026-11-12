import React, { useRef, useState } from 'react';
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
  const [activeBanner, setActiveBanner] = useState(0);
  const [bannerWidth, setBannerWidth] = useState(0);
  const bannerRef=useRef<React.ComponentRef<typeof ScrollView>>(null);
  const popularRef = useRef<React.ComponentRef<typeof ScrollView>>(null), recommendedRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const popularOffset = useRef(0), recommendedOffset = useRef(0);
  const section = (title: string, icon: string, ids: string[], testID: string) => {
    const rowRef = testID === 'home-popular-row' ? popularRef : recommendedRef;
    const rowOffset = testID === 'home-popular-row' ? popularOffset : recommendedOffset;
    return <View key={testID}>
    <View style={styles.headingRow}><Text style={styles.heading}>{icon} {title}</Text><View style={styles.headingActions}><TouchableOpacity onPress={() => { const next=Math.max(0,rowOffset.current+178);rowOffset.current=next;rowRef.current?.scrollTo({x:next,animated:true}); }} accessibilityRole="button" accessibilityLabel={`Scroll ${title} right`} style={styles.scrollButton}><Text style={styles.scrollButtonText}>›</Text></TouchableOpacity><TouchableOpacity onPress={() => onOpenSearch('', testID === 'home-popular-row' ? 'popular' : 'recommended')} accessibilityRole="button" accessibilityLabel={`View all ${title}`}><Text style={styles.viewAll}>View All →</Text></TouchableOpacity></View></View>
    <ScrollView
      ref={rowRef}
      horizontal
      nestedScrollEnabled
      directionalLockEnabled={false}
      scrollEnabled
      decelerationRate="fast"
      testID={testID}
      accessibilityLabel={`${title}, horizontal list`}
      contentContainerStyle={styles.row}
      showsHorizontalScrollIndicator
      onScroll={event=>{rowOffset.current=event.nativeEvent.contentOffset.x;}}
      scrollEventThrottle={16}
      keyboardShouldPersistTaps="handled"
    >
      {ids.map(id => {
        const item = SEARCH_MENU_ITEMS.find(entry => entry.id === id);
        return item ? <View key={id} style={styles.cell}><RestaurantFoodCard item={item} /></View> : null;
      })}
    </ScrollView>
  </View>;
  };
  return <View style={styles.container}>
    <ScrollView testID="home-content" style={styles.scroll} contentContainerStyle={{ paddingBottom: bottomContentInset + 12 }} showsVerticalScrollIndicator={false}>
      <Header variant="home" onOpenProfile={onOpenProfile} onOpenSearch={onOpenSearch} />
      <View style={styles.banner} onLayout={event=>setBannerWidth(event.nativeEvent.layout.width)}>
        <ScrollView ref={bannerRef} horizontal pagingEnabled nestedScrollEnabled directionalLockEnabled={false} showsHorizontalScrollIndicator={false} onMomentumScrollEnd={event => setActiveBanner(Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width))}>
          {['db-veg-pizza','db-paneer-tikka-pizza','db-veg-cheese-burger','db-veg-pasta','db-litti-2pc-chokha'].map((id,index) => {
            const item = SEARCH_MENU_ITEMS.find(entry => entry.id === id)!;
            return <View key={id} style={[styles.bannerSlide,{width:bannerWidth||undefined}]}>
              <Image source={{ uri: item.image }} style={styles.bannerImage} />
              <View style={styles.bannerCopy}><Text style={styles.bannerTitle}>Good Food</Text><Text style={styles.bannerAccent}>Good Mood!</Text><TouchableOpacity style={styles.orderButton} onPress={() => onOpenMenu(item.category as SearchMenuItem['category'])} accessibilityRole="button" accessibilityLabel={`Order ${item.category}`}><Text style={styles.orderText}>Order Now →</Text></TouchableOpacity></View>
            </View>;
          })}
        </ScrollView>
        <View style={styles.dots}>{[0,1,2,3,4].map(i => <TouchableOpacity key={i} style={i===activeBanner?styles.activeDot:styles.dot} onPress={()=>{setActiveBanner(i);bannerRef.current?.scrollTo({x:i*bannerWidth,animated:true});}} accessibilityRole="button" accessibilityLabel={`Show promotion ${i+1}`}/>)}</View>
      </View>
      <HomeFoodCategories onOpenMenu={onOpenMenu} />
      {section('Popular Items', '🔥', homeSections.popular, 'home-popular-row')}
      {section('Recommended for You', '⭐', homeSections.recommended, 'home-recommended-row')}
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: theme.background }, scroll: { flex: 1 },
  banner: { marginHorizontal: 14, height: 166, borderRadius: 14, overflow: 'hidden', backgroundColor: '#351C0C' }, bannerSlide: { width: '100%', height: '100%' }, bannerImage: { width: '68%', height: '100%', position: 'absolute', right: 0 }, bannerCopy: { width: '55%', backgroundColor: 'rgba(53,28,12,0.75)', paddingLeft: 18, paddingTop: 19, height: '100%' },
  bannerTitle: { fontFamily: Platform.OS === 'android' ? 'serif' : 'Georgia', color: '#fff', fontSize: 27, fontWeight: '700', fontStyle: 'italic' }, bannerAccent: { fontFamily: Platform.OS === 'android' ? 'serif' : 'Georgia', color: '#FFD02F', fontSize: 29, fontWeight: '700', fontStyle: 'italic' }, orderButton: { alignSelf: 'flex-start', marginTop: 14, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 22, backgroundColor: '#FFD02F' }, orderText: { color: '#241800', fontSize: 13, fontWeight: '600' },
  dots: { position: 'absolute', bottom: 7, left: '41%', flexDirection: 'row', alignItems: 'center', gap: 5 }, dot: { width: 5, height: 5, borderRadius: 3, borderWidth: 1, borderColor: '#fff' }, activeDot: { width: 17, height: 5, borderRadius: 4, backgroundColor: '#FFD02F' },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 14, marginTop: 18, marginBottom: 10, gap: 8 }, headingActions: { flexDirection:'row', alignItems:'center', gap:8 }, scrollButton:{width:26,height:26,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:theme.border,borderRadius:13},scrollButtonText:{color:theme.primary,fontSize:22,lineHeight:24},heading: { flexShrink: 1, color: theme.text, fontSize: 20, fontWeight: '700' }, viewAll: { color: theme.primary, fontSize: 13, fontWeight: '600' },
  row: { gap: 12, paddingHorizontal: 14, paddingBottom: 10, flexGrow: 0 }, cell: { width: 166, minWidth: 0 },
});
