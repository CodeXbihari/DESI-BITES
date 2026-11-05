import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  OTP_THEME,
  OTP_HEADER_IMAGE,
  OTP_BOTTOM_IMAGE,
} from '../data/otpData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OtpScreenProps {
  phoneNumber?: string;
  onVerifySuccess: () => void;
  onBack: () => void;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({
  phoneNumber = '98765 43210',
  onVerifySuccess,
  onBack,
}) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const inputRefs = [
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
  ];

  // 30-second live countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle single digit input + auto-advance + paste
  const handleDigitChange = (value: string, index: number) => {
    setErrorMessage('');

    // Handle paste if multi-digit string is provided
    if (value.length > 1) {
      const cleaned = value.replace(/[^0-9]/g, '').slice(0, 4);
      if (cleaned.length > 0) {
        const nextOtp = [...otp];
        for (let i = 0; i < 4; i++) {
          nextOtp[i] = cleaned[i] || '';
        }
        setOtp(nextOtp);
        const nextFocus = Math.min(cleaned.length, 3);
        inputRefs[nextFocus].current?.focus();
        setFocusedIndex(nextFocus);
        return;
      }
    }

    const digit = value.replace(/[^0-9]/g, '');
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);

    // Auto-advance to next box if digit entered
    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
      setFocusedIndex(index + 1);
    }
  };

  // Handle backspace navigation across boxes
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const nextOtp = [...otp];
        nextOtp[index - 1] = '';
        setOtp(nextOtp);
        inputRefs[index - 1].current?.focus();
        setFocusedIndex(index - 1);
      }
    }
  };

  // Resend OTP action
  const handleResend = () => {
    if (timer > 0) return;
    setTimer(30);
    setOtp(['', '', '', '']);
    setErrorMessage('');
    inputRefs[0].current?.focus();
    setFocusedIndex(0);
    Alert.alert('OTP भेजा गया', `+91 ${phoneNumber} पर एक नया 4-अंकीय कोड भेजा गया है।`);
  };

  // Verify OTP action
  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 4) {
      setErrorMessage('कृपया सभी 4 अंक दर्ज करें (Please enter all 4 digits)');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsVerifying(false);
      onVerifySuccess();
    }, 500);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── 1. HEADER SECTION (AUTHENTIC CRIMSON PALACE ARTWORK) ── */}
          <View style={styles.headerContainer}>
            {/* The artwork contains the palace, curved gold border, typography & divider */}
            <Image
              source={{ uri: OTP_HEADER_IMAGE }}
              style={styles.headerBgImage}
              resizeMode="cover"
            />

            {/* Transparent Touch Overlays */}
            <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
              <View style={styles.topNavRow}>
                {/* Back Arrow Touch Target */}
                <TouchableOpacity
                  onPress={onBack}
                  style={styles.backButtonTouch}
                  activeOpacity={0.6}
                  hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                >
                  <View style={styles.backButtonArea}>
                    <Ionicons name="chevron-back" size={26} color="transparent" />
                  </View>
                </TouchableOpacity>

                {/* Right Area placeholder for [APP NAME] alignment */}
                <View style={{ width: 100 }} />
              </View>
            </SafeAreaView>
          </View>

          {/* ── 2. MAIN PARCHMENT SECTION WITH INTERACTIVE OTP INPUTS ── */}
          <View style={styles.parchmentBody}>
            {/* Error Message Notice if any */}
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={14} color="#790B16" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* 4 OTP Input Boxes */}
            <View style={styles.otpBoxesRow}>
              {[0, 1, 2, 3].map((index) => {
                const isFocused = focusedIndex === index;
                const hasValue = !!otp[index];
                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.9}
                    onPress={() => {
                      inputRefs[index].current?.focus();
                      setFocusedIndex(index);
                    }}
                    style={[
                      styles.otpBox,
                      isFocused && styles.otpBoxFocused,
                      hasValue && styles.otpBoxFilled,
                    ]}
                  >
                    <TextInput
                      ref={inputRefs[index]}
                      style={styles.otpInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={otp[index]}
                      onChangeText={(val) => handleDigitChange(val, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(null)}
                      selectTextOnFocus
                      caretHidden={false}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Resend OTP Section with Clock Icon */}
            <View style={styles.resendRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color={OTP_THEME.darkMaroon}
                style={styles.clockIcon}
              />

              {/* Countdown Timer */}
              <Text style={styles.resendTimerText}>
                Resend in 00:{timer < 10 ? `0${timer}` : timer}
              </Text>

              {/* Vertical Decorative Separator */}
              <View style={styles.resendDivider} />

              {/* Resend Link Button */}
              <TouchableOpacity
                onPress={handleResend}
                disabled={timer > 0}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.resendLinkText,
                    timer > 0 && styles.resendLinkDisabled,
                  ]}
                >
                  Resend
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── 3. VERIFY PILL BUTTON ── */}
            <TouchableOpacity
              style={styles.verifyButtonWrapper}
              onPress={handleVerify}
              disabled={isVerifying}
              activeOpacity={0.88}
            >
              {/* Outer Golden Border */}
              <View style={styles.verifyButtonGoldOuter}>
                {/* Inner Maroon Core with second gold rim */}
                <View style={styles.verifyButtonInner}>
                  {isVerifying ? (
                    <ActivityIndicator size="small" color={OTP_THEME.lightCream} />
                  ) : (
                    <>
                      <Text style={styles.verifyButtonText}>Verify</Text>
                      <Text style={styles.verifyArrowIcon}>→</Text>
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Subtle demo helper */}
            <View style={styles.demoHelperRow}>
              <Text style={styles.demoHelperText}>
                Code sent to +91 {phoneNumber}
              </Text>
            </View>
          </View>

          {/* ── 4. BOTTOM TRADITIONAL FOOD THALI & DHABA ILLUSTRATION ── */}
          <View style={styles.bottomIllustrationContainer}>
            <Image
              source={{ uri: OTP_BOTTOM_IMAGE }}
              style={styles.bottomArtworkImage}
              resizeMode="cover"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDE0A8',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FDE0A8',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FDE0A8',
    justifyContent: 'space-between',
  },

  /* ── 1. Header Styles ── */
  headerContainer: {
    width: '100%',
    height: Math.min(SCREEN_HEIGHT * 0.28, 245),
    backgroundColor: OTP_THEME.deepCrimson,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBgImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerSafeArea: {
    flex: 1,
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
  },
  backButtonTouch: {
    padding: 8,
  },
  backButtonArea: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── 2. Parchment Body Styles ── */
  parchmentBody: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 280,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(165, 9, 22, 0.1)',
    borderColor: '#A50916',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 14,
    gap: 6,
  },
  errorText: {
    color: '#790B16',
    fontSize: 12,
    fontWeight: '600',
  },

  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 14,
    marginBottom: 20,
  },
  otpBox: {
    width: Math.min((SCREEN_WIDTH - 90) / 4, 68),
    height: Math.min((SCREEN_WIDTH - 90) / 4, 68),
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#790B16',
    backgroundColor: 'rgba(255, 240, 206, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#71351E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  otpBoxFocused: {
    borderColor: '#D99A42',
    backgroundColor: '#FFF8EC',
    borderWidth: 2,
    shadowColor: '#D99A42',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  otpBoxFilled: {
    borderColor: '#790B16',
    backgroundColor: '#FFF3DB',
  },
  otpInput: {
    fontSize: 26,
    fontWeight: '700',
    color: '#790B16',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 26,
  },
  clockIcon: {
    marginRight: 6,
  },
  resendTimerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#790B16',
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  resendDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#790B16',
    marginHorizontal: 12,
    opacity: 0.6,
  },
  resendLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#790B16',
    textDecorationLine: 'underline',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },

  /* ── 3. Verify Button Styles ── */
  verifyButtonWrapper: {
    width: '100%',
    maxWidth: 340,
    shadowColor: '#6D0B13',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonGoldOuter: {
    borderRadius: 30,
    padding: 2,
    backgroundColor: '#D99A42',
    borderWidth: 1,
    borderColor: '#F2BD62',
  },
  verifyButtonInner: {
    backgroundColor: '#880A17',
    borderRadius: 28,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#6D0B13',
  },
  verifyButtonText: {
    color: '#FFF0CE',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginRight: 8,
  },
  verifyArrowIcon: {
    color: '#F2BD62',
    fontSize: 20,
    fontWeight: '700',
  },
  demoHelperRow: {
    marginTop: 12,
  },
  demoHelperText: {
    fontSize: 12,
    color: '#71351E',
    opacity: 0.7,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  /* ── 4. Bottom Illustration ── */
  bottomIllustrationContainer: {
    width: '100%',
    height: Math.min(SCREEN_HEIGHT * 0.34, 250),
    backgroundColor: '#FDE0A8',
    overflow: 'hidden',
  },
  bottomArtworkImage: {
    width: '100%',
    height: '100%',
  },
});
