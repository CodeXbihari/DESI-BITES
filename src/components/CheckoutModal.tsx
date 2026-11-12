import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { homeTheme } from '../theme/homeTheme';

const { height } = Dimensions.get('window');

const PAYMENT_METHODS = [
  { id: 'upi', name: 'Google Pay / PhonePe / UPI', icon: 'flash', fee: 'Free' },
  { id: 'card', name: 'Credit / Debit Card', icon: 'card-outline', fee: 'Free' },
  { id: 'cod', name: 'Cash on Delivery', icon: 'cash-outline', fee: 'Free' },
];

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    addresses,
    selectedAddress,
    setSelectedAddress,
    finalTotal,
    placeOrder,
  } = useApp();

  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [deliveryNote, setDeliveryNote] = useState('Leave at door');

  const notesOptions = [
    'Leave at door',
    'Don’t ring bell 🔕',
    'Avoid calling',
    'Hand over to security',
  ];

  const handleConfirmOrder = () => {
    placeOrder(selectedPayment.toUpperCase());
  };

  return (
    <Modal
      visible={isCheckoutOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsCheckoutOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Review & Pay</Text>
              <Text style={styles.headerSubtitle}>Desi Mart Express Checkout</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsCheckoutOpen(false)}
            >
              <Ionicons name="close" size={20} color={homeTheme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Delivery Address Section */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.titleWithIcon}>
                  <Ionicons name="location" size={18} color={homeTheme.primary} />
                  <Text style={styles.cardTitle}>Deliver to</Text>
                </View>
              </View>

              {addresses.map((addr) => {
                const isSelected = selectedAddress.id === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={[
                      styles.addressItem,
                      isSelected && styles.addressItemSelected,
                    ]}
                    onPress={() => setSelectedAddress(addr)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? homeTheme.primary : homeTheme.muted}
                    />
                    <View style={styles.addressInfo}>
                      <View style={styles.tagBadge}>
                        <Text style={styles.tagText}>{addr.tag}</Text>
                      </View>
                      <Text style={styles.addrText}>{addr.addressLine}</Text>
                      <Text style={styles.addrSubText}>
                        {addr.area}, {addr.city} - {addr.pincode}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Delivery Instructions */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Delivery Instructions</Text>
              <View style={styles.chipsRow}>
                {notesOptions.map((note) => {
                  const isSelected = deliveryNote === note;
                  return (
                    <TouchableOpacity
                      key={note}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected,
                      ]}
                      onPress={() => setDeliveryNote(note)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {note}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Payment Options */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Payment Options</Text>
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedPayment === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentItem,
                      isSelected && styles.paymentItemSelected,
                    ]}
                    onPress={() => setSelectedPayment(method.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.paymentLeft}>
                      <View style={styles.paymentIconBox}>
                        <Ionicons
                          name={method.icon as any}
                          size={18}
                          color={homeTheme.primary}
                        />
                      </View>
                      <Text style={styles.paymentName}>{method.name}</Text>
                    </View>
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={isSelected ? homeTheme.primary : homeTheme.border}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.footerLabel}>Total Payable</Text>
              <Text style={styles.footerAmount}>₹{finalTotal}</Text>
            </View>
            <TouchableOpacity
              style={styles.payBtn}
              activeOpacity={0.8}
              onPress={handleConfirmOrder}
            >
              <Text style={styles.payBtnText}>Place Desi Order</Text>
              <Ionicons name="checkmark-sharp" size={18} color={homeTheme.background} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: homeTheme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    minHeight: height * 0.55,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: homeTheme.header,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: homeTheme.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: homeTheme.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: homeTheme.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: homeTheme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: homeTheme.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: homeTheme.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: homeTheme.text,
    marginBottom: 8,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: homeTheme.border,
    marginBottom: 8,
    gap: 10,
  },
  addressItemSelected: {
    borderColor: homeTheme.primary,
    backgroundColor: homeTheme.header,
  },
  addressInfo: {
    flex: 1,
  },
  tagBadge: {
    backgroundColor: homeTheme.primaryDark,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginBottom: 4,
  },
  tagText: {
    color: homeTheme.background,
    fontSize: 10,
    fontWeight: '700',
  },
  addrText: {
    fontSize: 12,
    fontWeight: '600',
    color: homeTheme.text,
  },
  addrSubText: {
    fontSize: 11,
    color: homeTheme.muted,
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: homeTheme.border,
    backgroundColor: homeTheme.background,
  },
  chipSelected: {
    backgroundColor: homeTheme.header,
    borderColor: homeTheme.primary,
  },
  chipText: {
    fontSize: 12,
    color: homeTheme.text,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: homeTheme.primary,
    fontWeight: '700',
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: homeTheme.border,
  },
  paymentItemSelected: {
    backgroundColor: homeTheme.header,
    borderRadius: 8,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: homeTheme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentName: {
    fontSize: 13,
    fontWeight: '600',
    color: homeTheme.text,
  },
  footer: {
    backgroundColor: homeTheme.card,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: homeTheme.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 11,
    color: homeTheme.muted,
    fontWeight: '500',
  },
  footerAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: homeTheme.text,
  },
  payBtn: {
    backgroundColor: homeTheme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  payBtnText: {
    color: homeTheme.background,
    fontSize: 14,
    fontWeight: '800',
  },
});

