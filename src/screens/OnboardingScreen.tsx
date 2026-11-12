import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ONBOARDING_SLIDES,
  ONBOARDING_THEME,
} from '../data/onboardingData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  // Subtle floating sway animation matching "@keyframes sway { 50% { transform: translateY(-6px); } }"
  const swayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: -7,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );
    swayLoop.start();
    return () => swayLoop.stop();
  }, [swayAnim]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < ONBOARDING_SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIdx = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: nextIdx * SCREEN_WIDTH, animated: true });
      setCurrentIndex(nextIdx);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const previousIdx = currentIndex - 1;
      scrollRef.current?.scrollTo({ x: previousIdx * SCREEN_WIDTH, animated: true });
      setCurrentIndex(previousIdx);
    }
  };

  const handleGoToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Decorative earthy warmth layers mimicking radial-gradient */}
      <View style={styles.topWarmthOrb} />
      <View style={styles.bottomInkOrb} />
      
      {/* Subtle stippling / texture overlay simulation */}
      <View style={styles.texturePatternOverlay} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Bar with Skip Pill */}
        <View style={styles.topBar}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>DESI EXPRESS</Text>
          </View>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onComplete}
            activeOpacity={0.75}
          >
            <Text style={styles.skipButtonText}>छोड़ें · Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Pager Carousel */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.pager}
        >
          {ONBOARDING_SLIDES.map((slide, index) => (
            <View key={slide.id} style={styles.slide}>
              {/* Arched card frame (48% 48% 22px 22px) */}
              <View style={styles.archOuterCard}>
                <View style={styles.archInnerCard}>
                  {/* Subtle inner sunburst radial backdrop */}
                  <View style={styles.sunburstDisc} />

                  {/* Character Illustration with floating sway animation */}
                  <Animated.View
                    style={[
                      styles.characterWrapper,
                      { transform: [{ translateY: swayAnim }] },
                    ]}
                  >
                    <Image
                      source={{ uri: slide.image }}
                      style={styles.characterImage}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </View>
              </View>

              {/* Madhubani Folk Motif Divider Line */}
              <View style={styles.motifContainer}>
                <View style={styles.motifLine} />
                <View style={styles.motifFishIcon}>
                  <Text style={styles.motifFishGlyph}>𓆝</Text>
                </View>
                <View style={styles.motifDot} />
                <View style={styles.motifFishIcon}>
                  <Text style={styles.motifFishGlyph}>𓆟</Text>
                </View>
                <View style={styles.motifDot} />
                <View style={styles.motifFishIcon}>
                  <Text style={styles.motifFishGlyph}>𓆝</Text>
                </View>
                <View style={styles.motifLine} />
              </View>

              {/* Slide Title in Devanagari */}
              <Text style={styles.slideTitle}>{slide.title}</Text>

              {/* Slide Subtitle */}
              <Text style={styles.slideDescription}>{slide.description}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Footer navigation: equal columns keep pagination centered */}
        <View style={styles.footer}>
          <View style={styles.footerColumn}>
            <TouchableOpacity
              style={[styles.previousButton, currentIndex === 0 && styles.previousButtonHidden]}
              onPress={handlePrevious}
              disabled={currentIndex === 0}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Previous onboarding screen"
            >
              <Text style={styles.previousArrow}>←</Text>
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.footerColumn, styles.footerCenterColumn]}>
            <View style={styles.dotsContainer}>
              {ONBOARDING_SLIDES.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dot,
                    currentIndex === i ? styles.dotActive : styles.dotInactive,
                  ]}
                  onPress={() => handleGoToSlide(i)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to onboarding screen ${i + 1}`}
                  accessibilityState={{ selected: currentIndex === i }}
                />
              ))}
            </View>
          </View>

          <View style={[styles.footerColumn, styles.footerRightColumn]}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={currentIndex === ONBOARDING_SLIDES.length - 1 ? 'Get started' : 'Next onboarding screen'}
            >
              <View style={styles.nextButtonBevel}>
                <Text style={styles.nextButtonText}>
                  {currentIndex === ONBOARDING_SLIDES.length - 1 ? 'शुरू करें' : 'आगे बढ़ें'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#59301F', // radial-gradient core tone
  },
  topWarmthOrb: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.1,
    left: SCREEN_WIDTH * 0.1,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.45,
    borderRadius: 200,
    backgroundColor: '#805039',
    opacity: 0.8,
  },
  bottomInkOrb: {
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.35,
    backgroundColor: '#321B13',
    opacity: 0.9,
  },
  texturePatternOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    borderWidth: 0,
    opacity: 0.08,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 10,
  },
  brandBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 241, 216, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(217, 180, 119, 0.25)',
  },
  brandBadgeText: {
    color: '#D9B477',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  skipButton: {
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 241, 216, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 225, 178, 0.35)',
  },
  skipButtonText: {
    color: '#FFF1D8',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pager: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  archOuterCard: {
    width: Math.min(SCREEN_WIDTH - 56, 320),
    height: Math.min(SCREEN_HEIGHT * 0.46, 360),
    borderRadius: 160,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(225, 190, 132, 0.25)',
    backgroundColor: 'rgba(40, 20, 14, 0.35)',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  archInnerCard: {
    width: '100%',
    height: '100%',
    borderRadius: 154,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: 'rgba(65, 34, 22, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(247, 217, 167, 0.12)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  sunburstDisc: {
    position: 'absolute',
    top: 25,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#C69A5B',
    opacity: 0.15,
  },
  characterWrapper: {
    width: '92%',
    height: '92%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  motifContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    marginVertical: 14,
    opacity: 0.9,
  },
  motifLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#D8B477',
    opacity: 0.5,
  },
  motifFishIcon: {
    paddingHorizontal: 6,
  },
  motifFishGlyph: {
    color: '#D8B477',
    fontSize: 16,
    fontWeight: 'bold',
  },
  motifDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D8B477',
    marginHorizontal: 3,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFF0D5',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 8,
    textShadowColor: 'rgba(34, 14, 7, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  slideDescription: {
    fontSize: 16,
    lineHeight: 23,
    color: '#F5E5C8',
    textAlign: 'center',
    maxWidth: 290,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    zIndex: 10,
  },
  footerColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  footerCenterColumn: {
    alignItems: 'center',
  },
  footerRightColumn: {
    alignItems: 'flex-end',
  },
  previousButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  previousButtonHidden: {
    opacity: 0,
  },
  previousArrow: {
    color: '#FFF1D8',
    fontSize: 23,
    lineHeight: 26,
    fontWeight: '600',
  },
  previousButtonText: {
    color: '#FFF1D8',
    fontSize: 14,
    fontWeight: '700',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  dotInactive: {
    width: 10,
    backgroundColor: '#D9B477',
    opacity: 0.38,
  },
  dotActive: {
    width: 28,
    backgroundColor: '#F3D49D',
    opacity: 1,
    shadowColor: '#F3D49D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  nextButton: {
    borderRadius: 15,
    backgroundColor: '#8B6036', // 3D bottom bevel base
    paddingBottom: 4, // creates the 3D tactile ledge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  nextButtonBevel: {
    backgroundColor: '#FFF4DD',
    borderWidth: 1,
    borderColor: '#E8C68D',
    borderRadius: 15,
    paddingVertical: 13,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#432417',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

