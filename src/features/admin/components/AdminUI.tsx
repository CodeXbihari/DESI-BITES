import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeTheme as theme } from '../../../theme/homeTheme';
import type { AdminOrderStatus, SalesPoint } from '../types';

export type ButtonTone = 'primary' | 'secondary' | 'quiet' | 'danger';

export function AdminButton({
  label,
  onPress,
  tone = 'secondary',
  icon,
  disabled = false,
  compact = false,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  tone?: ButtonTone;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  compact?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === 'primary' ? styles.button_primary : tone === 'quiet' ? styles.button_quiet : tone === 'danger' ? styles.button_danger : styles.button_secondary,
        compact && styles.buttonCompact,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {icon ? <Ionicons name={icon} size={16} color={tone === 'primary' || tone === 'danger' ? theme.card : theme.primary} /> : null}
      <Text style={[styles.buttonText, (tone === 'primary' || tone === 'danger') && styles.buttonTextLight]}>{label}</Text>
    </Pressable>
  );
}

export function AdminPageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <View style={styles.pageTitleRow}>
      <View style={styles.pageTitleCopy}>
        <Text style={styles.eyebrow}>DESI BITES · DEMO ADMIN</Text>
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.pageTitleAction}>{action}</View> : null}
    </View>
  );
}

export function AdminSectionTitle({ title, trailing }: { title: string; trailing?: React.ReactNode }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {trailing}
    </View>
  );
}

export function AdminPanel({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function AdminMetric({ label, value, note, icon, accent = false }: {
  label: string;
  value: string;
  note?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accent?: boolean;
}) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricTop}>
        <Text style={styles.metricLabel}>{label}</Text>
        <View style={[styles.metricIcon, accent && styles.metricIconAccent]}><Ionicons name={icon} size={17} color={theme.primary} /></View>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      {note ? <Text style={styles.metricNote}>{note}</Text> : null}
    </View>
  );
}

const statusTheme: Record<AdminOrderStatus, { bg: string; text: string }> = {
  new: { bg: '#F8EBCB', text: '#80531B' },
  accepted: { bg: '#F3E3D2', text: '#82472A' },
  preparing: { bg: '#F3E3D2', text: '#82472A' },
  ready: { bg: '#E8EFE0', text: '#42623B' },
  completed: { bg: '#E8EFE0', text: '#42623B' },
  cancelled: { bg: '#F5E1DD', text: '#8B3D35' },
};

export function AdminStatusPill({ status, label }: { status: AdminOrderStatus | 'active' | 'inactive' | 'low' | 'out'; label?: string }) {
  let colors: { bg: string; text: string };
  if (status in statusTheme) colors = statusTheme[status as AdminOrderStatus];
  else if (status === 'active') colors = { bg: '#E8EFE0', text: '#42623B' };
  else if (status === 'low') colors = { bg: '#F8EBCB', text: '#80531B' };
  else if (status === 'out' || status === 'inactive') colors = { bg: '#F5E1DD', text: '#8B3D35' };
  else colors = { bg: theme.header, text: theme.muted };
  const text = label ?? (status === 'out' ? 'Sold out' : status === 'low' ? 'Low stock' : status.charAt(0).toUpperCase() + status.slice(1));
  return <View style={[styles.pill, { backgroundColor: colors.bg }]}><Text style={[styles.pillText, { color: colors.text }]}>{text}</Text></View>;
}

export function AdminSearchField({ value, onChangeText, placeholder, accessibilityLabel }: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  accessibilityLabel: string;
}) {
  return (
    <View style={styles.searchField}>
      <Ionicons name="search" size={17} color={theme.muted} />
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={theme.muted} style={styles.searchInput} accessibilityLabel={accessibilityLabel} returnKeyType="search" />
      {value.length > 0 ? <Pressable onPress={() => onChangeText('')} accessibilityRole="button" accessibilityLabel="Clear search"><Ionicons name="close-circle" size={18} color={theme.muted} /></Pressable> : null}
    </View>
  );
}

export function AdminFilterRow({ options, selected, onSelect }: { options: Array<{ label: string; value: string }>; selected: string; onSelect: (value: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
      {options.map(option => {
        const active = selected === option.value;
        return (
          <Pressable key={option.value} onPress={() => onSelect(option.value)} accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.filterChip, active && styles.filterChipActive]}>
            <Text style={[styles.filterText, active && styles.filterTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function AdminEmptyState({ title, detail, icon = 'file-tray-outline', action }: { title: string; detail: string; icon?: React.ComponentProps<typeof Ionicons>['name']; action?: React.ReactNode }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><Ionicons name={icon} size={28} color={theme.primary} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDetail}>{detail}</Text>
      {action ? <View style={styles.emptyAction}>{action}</View> : null}
    </View>
  );
}

export function AdminLoadingState({ label = 'Loading demo data…' }: { label?: string }) {
  return <View style={styles.loading}><ActivityIndicator color={theme.primary} /><Text style={styles.loadingText}>{label}</Text></View>;
}

export function AdminErrorNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.errorNotice}>
      <Ionicons name="alert-circle-outline" size={20} color="#8B3D35" />
      <View style={styles.errorCopy}><Text style={styles.errorTitle}>Couldn’t load this view</Text><Text style={styles.errorText}>{message}</Text></View>
      <Pressable onPress={onRetry} accessibilityRole="button"><Text style={styles.errorRetry}>Retry</Text></Pressable>
    </View>
  );
}

export function AdminToggleRow({ title, detail, value, onValueChange }: { title: string; detail?: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}><Text style={styles.toggleTitle}>{title}</Text>{detail ? <Text style={styles.toggleDetail}>{detail}</Text> : null}</View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#CFBFAE', true: '#8DAB7D' }} thumbColor={value ? theme.primary : theme.card} accessibilityLabel={title} />
    </View>
  );
}

export function AdminSalesChart({ points }: { points: SalesPoint[] }) {
  const maxValue = Math.max(...points.map(point => point.value), 1);
  return (
    <View>
      <View style={styles.chart} accessibilityRole="image" accessibilityLabel="Sales chart for the selected period">
        {points.map((point, index) => (
          <View key={`${point.label}-${index}`} style={styles.chartColumn}>
            <View style={[styles.chartBar, index % 3 === 1 && styles.chartBarGold, { height: `${Math.max(8, point.value / maxValue * 100)}%` }]} />
          </View>
        ))}
      </View>
      <View style={styles.chartLabels}>{points.map((point, index) => <Text key={`${point.label}-label-${index}`} style={styles.chartLabel}>{point.label}</Text>)}</View>
    </View>
  );
}

export function AdminConfirmModal({ visible, title, message, confirmLabel = 'Confirm', destructive = false, onCancel, onConfirm }: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmMessage}>{message}</Text>
          <View style={styles.confirmActions}><AdminButton label="Cancel" onPress={onCancel} tone="quiet" /><AdminButton label={confirmLabel} onPress={onConfirm} tone={destructive ? 'danger' : 'primary'} /></View>
        </View>
      </View>
    </Modal>
  );
}

export function AdminToast({ message, bottomOffset = 12 }: { message: string | null; bottomOffset?: number }) {
  if (!message) return null;
  return <View pointerEvents="none" accessibilityLiveRegion="polite" style={[styles.toast, { bottom: bottomOffset }]}><Ionicons name="checkmark-circle" size={17} color={theme.header} /><Text style={styles.toastText}>{message}</Text></View>;
}

export function AdminDemoLabel() {
  return <View style={styles.demoLabel}><View style={styles.demoDot} /><Text style={styles.demoLabelText}>DEMO DATA · LOCAL PREVIEW</Text></View>;
}

const styles = StyleSheet.create({
  button: { minHeight: 40, paddingHorizontal: 13, borderWidth: 1, borderColor: theme.border, borderRadius: 11, backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  button_primary: { backgroundColor: theme.primary, borderColor: theme.primary },
  button_secondary: { backgroundColor: theme.card },
  button_quiet: { backgroundColor: 'transparent', borderColor: 'transparent' },
  button_danger: { backgroundColor: '#8B3D35', borderColor: '#8B3D35' },
  buttonCompact: { minHeight: 34, paddingHorizontal: 10 },
  buttonDisabled: { opacity: 0.5 },
  pressed: { opacity: 0.78 },
  buttonText: { color: theme.primary, fontSize: 12, fontWeight: '700' },
  buttonTextLight: { color: theme.card },
  pageTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 17 },
  pageTitleCopy: { flex: 1, minWidth: 0 },
  pageTitleAction: { maxWidth: '48%' },
  eyebrow: { color: theme.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.15, marginBottom: 6 },
  pageTitle: { color: theme.text, fontSize: 23, fontWeight: '800' },
  pageSubtitle: { color: theme.muted, fontSize: 12, marginTop: 5, lineHeight: 17 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 11 },
  sectionTitle: { color: theme.text, fontSize: 15, fontWeight: '800', flexShrink: 1 },
  panel: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 15, padding: 14, marginBottom: 14 },
  metric: { flexBasis: '47%', flexGrow: 1, minWidth: 132, padding: 13, borderWidth: 1, borderColor: theme.border, borderRadius: 14, backgroundColor: theme.card, marginBottom: 9 },
  metricTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  metricLabel: { flex: 1, color: theme.muted, fontSize: 11, fontWeight: '600' },
  metricIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: theme.header, alignItems: 'center', justifyContent: 'center' },
  metricIconAccent: { backgroundColor: '#F4E5C9' },
  metricValue: { color: theme.text, fontSize: 21, fontWeight: '900', marginTop: 10 },
  metricNote: { color: theme.muted, fontSize: 10, marginTop: 4 },
  pill: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5 },
  pillText: { fontSize: 9, fontWeight: '800', textTransform: 'capitalize' },
  searchField: { minHeight: 42, paddingHorizontal: 11, borderWidth: 1, borderColor: theme.border, borderRadius: 11, backgroundColor: '#FFFCF7', flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, minWidth: 0, paddingVertical: 7, color: theme.text, fontSize: 13 },
  filterRow: { gap: 7, paddingVertical: 2, paddingRight: 12 },
  filterChip: { paddingHorizontal: 11, minHeight: 33, borderWidth: 1, borderColor: theme.border, borderRadius: 99, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  filterChipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  filterText: { color: theme.muted, fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: theme.card },
  emptyState: { minHeight: 190, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: theme.header, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyTitle: { color: theme.text, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  emptyDetail: { color: theme.muted, fontSize: 12, textAlign: 'center', lineHeight: 17, marginTop: 5, maxWidth: 270 },
  emptyAction: { marginTop: 12 },
  loading: { minHeight: 190, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: theme.muted, fontSize: 12 },
  errorNotice: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginBottom: 12, borderRadius: 12, backgroundColor: '#F5E1DD' },
  errorCopy: { flex: 1 },
  errorTitle: { color: '#71342E', fontSize: 12, fontWeight: '800' },
  errorText: { color: '#71342E', fontSize: 11, marginTop: 3 },
  errorRetry: { color: theme.primary, fontSize: 11, fontWeight: '800' },
  toggleRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: theme.border },
  toggleCopy: { flex: 1 },
  toggleTitle: { color: theme.text, fontSize: 13, fontWeight: '700' },
  toggleDetail: { color: theme.muted, fontSize: 11, marginTop: 3, lineHeight: 15 },
  chart: { height: 146, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', gap: 7, paddingHorizontal: 3, paddingTop: 8, borderBottomWidth: 1, borderBottomColor: theme.border },
  chartColumn: { height: '100%', flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartBar: { width: '65%', minWidth: 9, maxWidth: 28, backgroundColor: theme.primary, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  chartBarGold: { backgroundColor: theme.gold },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: 4, paddingTop: 7 },
  chartLabel: { flex: 1, color: theme.muted, fontSize: 9, textAlign: 'center' },
  modalBackdrop: { flex: 1, padding: 22, backgroundColor: 'rgba(37, 19, 12, 0.45)', alignItems: 'center', justifyContent: 'center' },
  confirmCard: { width: '100%', maxWidth: 380, padding: 18, borderRadius: 18, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  confirmTitle: { color: theme.text, fontSize: 17, fontWeight: '800' },
  confirmMessage: { color: theme.muted, fontSize: 13, lineHeight: 19, marginTop: 7 },
  confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginTop: 17 },
  toast: { position: 'absolute', zIndex: 10, bottom: 12, alignSelf: 'center', maxWidth: '90%', minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 12, backgroundColor: theme.primaryDark },
  toastText: { color: theme.card, fontSize: 12, fontWeight: '700', flexShrink: 1 },
  demoLabel: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 99, backgroundColor: '#F4E7D2' },
  demoDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.gold },
  demoLabelText: { color: theme.muted, fontSize: 9, letterSpacing: 0.5, fontWeight: '800' },
});
