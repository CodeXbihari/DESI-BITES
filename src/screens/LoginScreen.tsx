import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  LOGIN_HERO_IMAGE,
  LOGIN_FOOTER_LANDSCAPE,
  LOGIN_THEME,
} from '../data/loginData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToOtp?: (phoneNumber: string) => void;
  onBackToOnboarding?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToOtp,
  onBackToOnboarding,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  const handleSendOtp = () => {
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');
    if (cleaned.length < 10) {
      Alert.alert(
        'अमान्य नंबर (Invalid Number)',
        'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें। (Please enter a valid 10-digit mobile number)'
      );
      return;
    }

    if (onNavigateToOtp) {
      onNavigateToOtp(cleaned);
    } else {
      onLoginSuccess();
    }
  };

  const handleCountryCodePress = () => {
    Alert.alert(
      'Select Country Code',
      'Supported countries for OTP verification:',
      [
        { text: '🇮🇳 India (+91)', onPress: () => setCountryCode('+91') },
        { text: '🇬🇧 UK (+44)', onPress: () => setCountryCode('+44') },
        { text: '🇺🇸 USA (+1)', onPress: () => setCountryCode('+1') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── 1. TOP HERO SECTION (AUTHENTIC BIHARI VILLAGE ILLUSTRATION) ── */}
          <View style={styles.heroSection}>
            {/* The Authentic Hero Artwork: Bihari man, gamcha, temple, sun, mud house & wave */}
            <Image
              source={{ uri: LOGIN_HERO_IMAGE }}
              style={styles.heroImage}
              resizeMode="cover"
            />

            {/* Top Interactive Bar Overlay */}
            <SafeAreaView edges={['top']} style={styles.topNavOverlay}>
              <View style={styles.topBar}>
                {/* Back button to return to Onboarding if enabled, else empty space */}
                {onBackToOnboarding ? (
                  <TouchableOpacity
                    onPress={onBackToOnboarding}
                    style={styles.backButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Ionicons name="arrow-back" size={22} color="#FFF0D7" />
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 40 }} />
                )}

                {/* Single Help button on top-right */}
                <TouchableOpacity
                  style={styles.helpButton}
                  onPress={() => setShowHelpModal(true)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.helpText}>Help</Text>
                  <View style={styles.helpIconCircle}>
                    <Text style={styles.helpQuestionMark}>?</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>

          {/* ── 2. LOGIN CONTENT SECTION (WARM PARCHMENT BACKGROUND) ── */}
          <View style={styles.parchmentCard}>
            {/* Heading in Devanagari */}
            <View style={styles.headingWrapper}>
              <Text style={styles.hindiHeading}>
                {isRegisterMode ? 'नया खाता बनाएं' : 'फिर से स्वागत है'}
              </Text>
              {/* Maroon Underline below Heading */}
              <View style={styles.brushUnderline} />
            </View>

            {/* Registration Name Field (If Register Mode) */}
            {isRegisterMode && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <View style={styles.phoneInputBox}>
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color="#7B321F"
                    style={{ marginLeft: 14, marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="#A48978"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>
            )}

            {/* Mobile Number Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
              <View style={styles.phoneInputBox}>
                {/* Country Code Selector */}
                <TouchableOpacity
                  style={styles.countryCodePill}
                  onPress={handleCountryCodePress}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                  <Ionicons
                    name="chevron-down"
                    size={13}
                    color={LOGIN_THEME.darkBrownText}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>

                {/* Vertical Divider */}
                <View style={styles.inputDivider} />

                {/* Phone Input */}
                <TextInput
                  style={styles.textInput}
                  placeholder="98765 43210"
                  placeholderTextColor="#A48978"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            {/* Primary Button: "Send OTP" */}
            <TouchableOpacity
              style={styles.sendOtpButton}
              onPress={handleSendOtp}
              activeOpacity={0.88}
            >
              <Ionicons
                name="send"
                size={16}
                color="#FFFFFF"
                style={styles.paperPlaneIcon}
              />
              <Text style={styles.sendOtpText}>
                {isRegisterMode ? 'Create Account & Send OTP' : 'Send OTP'}
              </Text>
            </TouchableOpacity>

            {/* Decorative Divider with Small Maroon Leaf Ornament in Middle */}
            <View style={styles.ornamentDivider}>
              <View style={styles.ornamentLine} />
              <View style={styles.miniLotus}>
                <View style={[styles.miniLeaf, styles.miniLeafL]} />
                <View style={[styles.miniLeaf, styles.miniLeafC]} />
                <View style={[styles.miniLeaf, styles.miniLeafR]} />
              </View>
              <View style={styles.ornamentLine} />
            </View>

            {/* Sub-question: "नए हैं?" */}
            <Text style={styles.newHereText}>
              {isRegisterMode ? 'पहले से खाता है?' : 'नए हैं?'}
            </Text>

            {/* Outlined Button: "Create an account" */}
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={() => setIsRegisterMode(!isRegisterMode)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isRegisterMode ? 'log-in-outline' : 'person-add-outline'}
                size={18}
                color={LOGIN_THEME.darkBrownText}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.createAccountText}>
                {isRegisterMode ? 'Log in to existing account' : 'Create an account'}
              </Text>
            </TouchableOpacity>

            {/* Legal Terms & Privacy Footer */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By continuing you agree to the{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => setShowTermsModal(true)}
                >
                  Terms
                </Text>{' '}
                and{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => setShowTermsModal(true)}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          </View>

          {/* ── 3. BOTTOM BIHAR VILLAGE LANDSCAPE & DECORATIVE MAROON BORDER ── */}
          <View style={styles.bottomLandscapeSection}>
            <Image
              source={{ uri: LOGIN_FOOTER_LANDSCAPE }}
              style={styles.bottomLandscapeImage}
              resizeMode="cover"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── HELP MODAL ── */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>सहायता (Help Desk)</Text>
              <TouchableOpacity
                onPress={() => setShowHelpModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={LOGIN_THEME.darkBrownText} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>
              लॉगिन या ऑर्डर से संबंधित किसी भी सहायता के लिए हमारी ग्राहक सेवा 24/7 उपलब्ध है:
            </Text>
            <View style={styles.contactDetailsBox}>
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={17} color={LOGIN_THEME.deepMaroon} />
                <Text style={styles.contactText}>टोल फ्री: 1800-DESI-EXP</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="chatbubbles-outline" size={17} color={LOGIN_THEME.deepMaroon} />
                <Text style={styles.contactText}>व्हाट्सएप: +91 98765 43210</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={17} color={LOGIN_THEME.deepMaroon} />
                <Text style={styles.contactText}>ईमेल: support@desiexpress.in</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.modalActionBtn}
              onPress={() => setShowHelpModal(false)}
            >
              <Text style={styles.modalActionBtnText}>समझ गए (Close)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── TERMS MODAL ── */}
      <Modal
        visible={showTermsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxHeight: '78%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms & Privacy Policy</Text>
              <TouchableOpacity
                onPress={() => setShowTermsModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={LOGIN_THEME.darkBrownText} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 250, marginVertical: 12 }}>
              <Text style={styles.termsModalContent}>
                Welcome to Desi Express. By using this service, you agree to our terms of fresh food preparation, guaranteed delivery within 12 minutes, and strict data privacy.{'\n\n'}
                Your mobile phone number is solely used for login authentication and order dispatch updates. We do not sell or distribute personal customer details to third parties.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalActionBtn}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.modalActionBtnText}>स्वीकार करें (Accept)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOGIN_THEME.heroBg,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: LOGIN_THEME.heroBg,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: LOGIN_THEME.parchmentBg,
    justifyContent: 'space-between',
  },

  /* ── 1. Hero Section ── */
  heroSection: {
    width: '100%',
    height: Math.min(SCREEN_HEIGHT * 0.43, 385),
    backgroundColor: LOGIN_THEME.heroBg,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topNavOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 10 : 4,
  },
  appNameSpacer: {
    paddingVertical: 4,
  },
  appNameText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF0D7',
    letterSpacing: 1.2,
  },
  backButton: {
    padding: 6,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  helpText: {
    color: '#FFF0D7',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  helpIconCircle: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.2,
    borderColor: '#FFF0D7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
  },
  helpQuestionMark: {
    color: '#FFF0D7',
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 12,
  },

  /* ── 2. Login Content Section ── */
  parchmentCard: {
    flex: 1,
    backgroundColor: LOGIN_THEME.parchmentBg,
    paddingHorizontal: 26,
    paddingTop: 8,
    paddingBottom: 16,
    position: 'relative',
  },

  headingWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  hindiHeading: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 30,
    fontWeight: '800',
    color: LOGIN_THEME.darkBrownText,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  brushUnderline: {
    width: 88,
    height: 3,
    backgroundColor: LOGIN_THEME.deepMaroon,
    borderRadius: 2,
    opacity: 0.9,
  },

  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: LOGIN_THEME.darkBrownText,
    marginBottom: 7,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  phoneInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LOGIN_THEME.inputBg,
    borderWidth: 1,
    borderColor: LOGIN_THEME.inputBorder,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 12,
    shadowColor: '#542719',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  countryCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: LOGIN_THEME.darkBrownText,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  inputDivider: {
    width: 1,
    height: 22,
    backgroundColor: LOGIN_THEME.inputDivider,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: LOGIN_THEME.darkBrownText,
    padding: 0,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  /* Primary Send OTP Button */
  sendOtpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LOGIN_THEME.buttonMaroon,
    borderRadius: 12,
    height: 50,
    marginTop: 4,
    shadowColor: LOGIN_THEME.buttonMaroonDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  paperPlaneIcon: {
    marginRight: 8,
    transform: [{ rotate: '-20deg' }],
  },
  sendOtpText: {
    color: '#FFF0D7',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  /* Decorative Lotus Divider */
  ornamentDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
    gap: 8,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(123, 50, 31, 0.25)',
  },
  miniLotus: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  miniLeaf: {
    backgroundColor: LOGIN_THEME.deepMaroon,
  },
  miniLeafL: {
    width: 4,
    height: 8,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    transform: [{ rotate: '-25deg' }],
  },
  miniLeafC: {
    width: 6,
    height: 11,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  miniLeafR: {
    width: 4,
    height: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    transform: [{ rotate: '25deg' }],
  },

  newHereText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 15,
    fontWeight: '800',
    color: LOGIN_THEME.darkBrownText,
    textAlign: 'center',
    marginBottom: 10,
  },

  /* Create Account Button */
  createAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: LOGIN_THEME.inputBorder,
    borderRadius: 12,
    height: 48,
    backgroundColor: 'transparent',
    marginBottom: 18,
  },
  createAccountText: {
    color: LOGIN_THEME.darkBrownText,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  /* Terms and Privacy */
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  termsText: {
    fontSize: 11.5,
    color: '#6F4B3C',
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  termsLink: {
    color: LOGIN_THEME.deepMaroon,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  /* ── 3. Bottom Bihar Village Landscape ── */
  bottomLandscapeSection: {
    width: '100%',
    height: Math.min(SCREEN_HEIGHT * 0.16, 120),
    backgroundColor: LOGIN_THEME.parchmentBg,
    overflow: 'hidden',
  },
  bottomLandscapeImage: {
    width: '100%',
    height: '100%',
  },

  /* ── Modals ── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFF2DA',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LOGIN_THEME.deepMaroon,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(134, 28, 36, 0.2)',
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: LOGIN_THEME.darkBrownText,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalDesc: {
    fontSize: 13,
    color: '#5B3728',
    lineHeight: 18,
    marginBottom: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  contactDetailsBox: {
    backgroundColor: '#FFF8EC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E8D0BA',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    fontWeight: '600',
    color: LOGIN_THEME.darkBrownText,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalActionBtn: {
    backgroundColor: LOGIN_THEME.deepMaroon,
    borderRadius: 10,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionBtnText: {
    color: '#FFF0D7',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  termsModalContent: {
    fontSize: 12.5,
    color: '#5B3728',
    lineHeight: 19,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
