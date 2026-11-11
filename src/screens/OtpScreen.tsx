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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  OTP_HEADER_IMAGE,
  OTP_BOTTOM_IMAGE,
} from '../data/otpData';
import { LOGIN_THEME } from '../data/loginData';

import { useAuth } from '../context/AuthContext';
import { authErrorMessage, OTP_LENGTH } from '../services/authValidation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OtpScreenProps {
  phoneNumber?: string;
  onBack: () => void;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({
  phoneNumber,
  onBack,
}) => {
  const { verifyOtp, sendOtp, busy, phoneNumber: requestedPhone, resendAt } = useAuth();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now());
  const inputRefs = useRef<Array<React.ComponentRef<typeof TextInput> | null>>([]);
  const timer = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const isVerifying = busy;

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDigitChange = (value: string, index: number) => {
    setErrorMessage('');
    const digits = value.replace(/\D/g, '');
    const start = digits.length >= OTP_LENGTH ? 0 : index;
    const next = [...otp];
    if (!digits) next[index] = '';
    else digits.slice(0, OTP_LENGTH - start).split('').forEach((digit, offset) => { next[start + offset] = digit; });
    setOtp(next);
    inputRefs.current[Math.min(start + digits.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      setOtp(previous => previous.map((digit, i) => i === index - 1 ? '' : digit));
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0 || busy) return;
    setErrorMessage('');
    setNotice('');
    try {
      await sendOtp(requestedPhone ?? phoneNumber ?? '');
      setOtp(Array(OTP_LENGTH).fill(''));
      setNotice('A new six-digit code has been sent.');
      inputRefs.current[0]?.focus();
    } catch (error) { setErrorMessage(authErrorMessage(error)); }
  };

  const handleVerify = async () => {
    setErrorMessage('');
    setNotice('');
    try { await verifyOtp(otp.join('')); }
    catch (error) { setErrorMessage(authErrorMessage(error)); }
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

            {/* The reference image contains a four-digit instruction; replace only that label. */}
            <View pointerEvents="none" style={styles.codeInstruction}>
              <Text style={styles.codeInstructionText}>Enter the 6-digit code sent to you</Text>
            </View>
            {/* Transparent Touch Overlays */}
            <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
              <View style={styles.topNavRow}>
                {/* Back Arrow Touch Target */}
                <TouchableOpacity
                  onPress={onBack}
                  disabled={busy}
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
                <Text accessibilityRole="alert" style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Six-digit SMS code, including paste and autofill. */}
            <View style={styles.otpBoxesRow}>
              {Array.from({ length: OTP_LENGTH }, (_, index) => {
                const isFocused = focusedIndex === index;
                const hasValue = !!otp[index];
                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.9}
                    onPress={() => {
                      inputRefs.current[index]?.focus();
                      setFocusedIndex(index);
                    }}
                    style={[
                      styles.otpBox,
                      isFocused && styles.otpBoxFocused,
                      hasValue && styles.otpBoxFilled,
                    ]}
                  >
                    <TextInput
                      ref={(input) => { inputRefs.current[index] = input; }}
                      style={styles.otpInput}
                      keyboardType="number-pad"
                      maxLength={OTP_LENGTH}
                      editable={!busy}
                      textContentType="oneTimeCode"
                      autoComplete="sms-otp"
                      accessibilityLabel={`OTP digit ${index + 1}`}
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
                color={LOGIN_THEME.darkBrownText}
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
                disabled={timer > 0 || busy}
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
              disabled={busy || otp.join('').length !== OTP_LENGTH}
              activeOpacity={0.88}
            >
              {/* Outer Golden Border */}
              <View style={styles.verifyButtonGoldOuter}>
                {/* Inner Maroon Core with second gold rim */}
                <View style={styles.verifyButtonInner}>
                  {isVerifying ? (
                    <ActivityIndicator size="small" color={LOGIN_THEME.parchmentBg} />
                  ) : (
                    <>
                      <Text style={styles.verifyButtonText}>Verify</Text>
                      <Text style={styles.verifyArrowIcon}>→</Text>
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {notice ? <Text accessibilityRole="alert" style={styles.demoHelperText}>{notice}</Text> : null}
            {/* Verification destination */}
            <View style={styles.demoHelperRow}>
              <Text style={styles.demoHelperText}>
                Code sent to {requestedPhone ?? phoneNumber}
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
    backgroundColor: LOGIN_THEME.parchmentBg,
  },
  scrollView: {
    flex: 1,
    backgroundColor: LOGIN_THEME.parchmentBg,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: LOGIN_THEME.parchmentBg,
    justifyContent: 'space-between',
  },

  /* ── 1. Header Styles ── */
  headerContainer: {
    width: '100%',
    height: Math.min(SCREEN_HEIGHT * 0.28, 245),
    backgroundColor: LOGIN_THEME.heroBg,
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
  codeInstruction: {
    position: 'absolute',
    top: '64%',
    left: 0,
    width: '100%',
    paddingHorizontal: 24,
    minHeight: 30,
    paddingVertical: 5,
    backgroundColor: LOGIN_THEME.buttonMaroon,
    borderRadius: 4,
    justifyContent: 'center',
  },
  codeInstructionText: {
    color: LOGIN_THEME.parchmentBg,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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
    gap: 8,
    marginBottom: 20,
  },
  otpBox: {
    width: Math.min((SCREEN_WIDTH - 100) / 6, 52),
    height: Math.min((SCREEN_WIDTH - 100) / 6, 52),
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: LOGIN_THEME.inputBorder,
    backgroundColor: LOGIN_THEME.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: LOGIN_THEME.darkBrownText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  otpBoxFocused: {
    borderColor: LOGIN_THEME.decorativeGold,
    backgroundColor: LOGIN_THEME.inputBg,
    borderWidth: 2,
    shadowColor: LOGIN_THEME.decorativeGold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  otpBoxFilled: {
    borderColor: LOGIN_THEME.inputBorder,
    backgroundColor: LOGIN_THEME.inputBg,
  },
  otpInput: {
    fontSize: 26,
    fontWeight: '700',
    color: LOGIN_THEME.darkBrownText,
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
    color: LOGIN_THEME.darkBrownText,
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  resendDivider: {
    width: 1,
    height: 14,
    backgroundColor: LOGIN_THEME.darkBrownText,
    marginHorizontal: 12,
    opacity: 0.6,
  },
  resendLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: LOGIN_THEME.darkBrownText,
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
    shadowColor: LOGIN_THEME.buttonMaroonDark,
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
    backgroundColor: LOGIN_THEME.buttonMaroon,
    borderRadius: 28,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: LOGIN_THEME.buttonMaroonDark,
  },
  verifyButtonText: {
    color: LOGIN_THEME.parchmentBg,
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
    color: LOGIN_THEME.darkBrownText,
    opacity: 0.7,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  /* ── 4. Bottom Illustration ── */
  bottomIllustrationContainer: {
    width: '100%',
    height: Math.min(SCREEN_HEIGHT * 0.34, 250),
    backgroundColor: LOGIN_THEME.parchmentBg,
    overflow: 'hidden',
  },
  bottomArtworkImage: {
    width: '100%',
    height: '100%',
  },
});
