import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const staffColors = {
  cream: '#FFF0D8', ivory: '#FFF9F1', brown: '#4D2B20', burgundy: '#8B1E28',
  terracotta: '#843B28', beige: '#DAB9A5', teal: '#009B91', peach: '#FFE7C2',
  activeSurface: '#DDF0EB', activeText: '#165951',
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function StaffBrand({ caption = 'CAFE MANAGEMENT' }: { caption?: string }) {
  return (
    <View style={staffStyles.brand}>
      <Image source={require('../../../assets/images/desi-logo.png')} style={staffStyles.logo} resizeMode="contain" accessible={false} />
      <View style={staffStyles.brandText}>
        <Text style={staffStyles.wordmark}>DESI BITES</Text>
        <Text style={staffStyles.eyebrow}>{caption}</Text>
      </View>
    </View>
  );
}

export function StaffButton({ label, onPress, icon, primary = false, disabled = false, busy = false }: {
  label: string; onPress: () => void; icon?: IconName; primary?: boolean; disabled?: boolean; busy?: boolean;
}) {
  const color = primary ? staffColors.ivory : staffColors.burgundy;
  return (
    <Pressable
      accessibilityRole="button" accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy} onPress={onPress}
      style={({ pressed }) => [staffStyles.button, primary && staffStyles.primaryButton, (disabled || busy || pressed) && staffStyles.dimmed]}
    >
      {busy ? <ActivityIndicator size="small" color={color} /> : icon ? <Ionicons name={icon} size={17} color={color} /> : null}
      <Text style={[staffStyles.buttonText, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function StaffField({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={staffStyles.field}>
      <Text style={staffStyles.label}>{label}</Text>
      <TextInput {...props} accessibilityLabel={label} placeholderTextColor={staffColors.terracotta} style={staffStyles.input} />
    </View>
  );
}

export function PinField({ value, onChange, onSubmit, disabled, label = '6-Digit PIN' }: {
  value: string; onChange: (value: string) => void; onSubmit?: () => void; disabled?: boolean; label?: string;
}) {
  const [visible, setVisible] = React.useState(false);
  return (
    <View style={staffStyles.field}>
      <Text style={staffStyles.label}>{label}</Text>
      <View style={staffStyles.pinRow}>
        <TextInput accessibilityLabel={label} style={[staffStyles.input, staffStyles.pinInput]} value={value} onChangeText={text => onChange(text.replace(/\D/g, ''))}
          secureTextEntry={!visible} keyboardType="number-pad" maxLength={6} editable={!disabled}
          onSubmitEditing={onSubmit} returnKeyType="done" autoComplete="off" autoCapitalize="none" />
        <StaffButton label={visible ? 'Hide PIN' : 'Show PIN'} onPress={() => setVisible(current => !current)} disabled={disabled} />
      </View>
    </View>
  );
}

export function StaffNotice({ message, error = false }: { message: string; error?: boolean }) {
  return (
    <Text accessibilityRole={error ? 'alert' : undefined} accessibilityLiveRegion="polite" style={[staffStyles.notice, error && staffStyles.error]}>
      {message}
    </Text>
  );
}

export function StatusBadge({ label, active = false }: { label: string; active?: boolean }) {
  return <Text style={[staffStyles.badge, active && staffStyles.activeBadge]}>{label}</Text>;
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase()).join('');
}

export const staffStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: staffColors.cream },
  content: { width: '100%', maxWidth: 940, alignSelf: 'center', padding: 16, paddingBottom: 26, gap: 14 },
  card: { backgroundColor: staffColors.ivory, borderColor: staffColors.beige, borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 },
  title: { color: staffColors.brown, fontSize: 28, fontWeight: '800' },
  sectionTitle: { color: staffColors.brown, fontSize: 18, fontWeight: '800' },
  label: { color: staffColors.brown, fontSize: 14, fontWeight: '700' },
  text: { color: staffColors.brown, fontSize: 14 },
  muted: { color: staffColors.terracotta, fontSize: 13 },
  eyebrow: { color: staffColors.terracotta, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { flexShrink: 1 },
  logo: { width: 54, height: 46 },
  wordmark: { color: staffColors.brown, fontSize: 18, fontWeight: '900', letterSpacing: 1.1 },
  button: { minHeight: 44, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 24, borderWidth: 1, borderColor: staffColors.beige, backgroundColor: staffColors.ivory, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' },
  primaryButton: { backgroundColor: staffColors.burgundy, borderColor: staffColors.burgundy },
  buttonText: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  dimmed: { opacity: 0.7 },
  field: { gap: 5 },
  input: { minHeight: 46, minWidth: 0, paddingHorizontal: 12, borderRadius: 11, borderWidth: 1, borderColor: staffColors.beige, backgroundColor: staffColors.ivory, color: staffColors.brown, fontSize: 16 },
  pinRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  pinInput: { flex: 1 },
  notice: { padding: 10, borderRadius: 10, backgroundColor: staffColors.activeSurface, color: staffColors.activeText, fontSize: 14 },
  error: { backgroundColor: '#F7E0DB', color: staffColors.burgundy },
  badge: { alignSelf: 'flex-start', overflow: 'hidden', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 5, color: staffColors.terracotta, backgroundColor: staffColors.peach, fontSize: 12, fontWeight: '700' },
  activeBadge: { color: staffColors.activeText, backgroundColor: staffColors.activeSurface },
  avatar: { height: 44, width: 44, borderRadius: 14, backgroundColor: staffColors.peach, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: staffColors.burgundy, fontSize: 14, fontWeight: '800' },
});
