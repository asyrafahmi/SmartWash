import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

export default function Payment() {
  const navigation = useNavigation();
  const route = useRoute();
  const { carId, totalPrice, selectedServices } = route.params;

  const [paymentMethod, setPaymentMethod] = useState('Card');

  const handlePayment = () => {
    firestore()
      .collection('Service')
      .doc(carId)
      .update({
        paymentMethod: paymentMethod,
      })
      .then(() => {
        navigation.navigate('Home');
      })
      .catch((error) => {
        console.error('Error updating payment method:', error);
      });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Navigation Elements */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.navButton}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.navButton}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Order Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {selectedServices.map((service, index) => (
          <View key={index} style={styles.serviceItem}>
            {/* Removed placeholder image */}
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.servicePrice}>RM {service.price}</Text>
          </View>
        ))}
      </View>

      {/* Payment Method Section */}
      <View style={styles.section}>
        <View style={styles.paymentHeader}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity>
            <Text style={styles.changeButton}>Change</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'Card' && styles.selectedPaymentOption,
          ]}
          onPress={() => setPaymentMethod('Card')}
        >
          {/* Removed placeholder image */}
          <Text style={styles.paymentText}>Credit/Debit Card</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'Online' && styles.selectedPaymentOption,
          ]}
          onPress={() => setPaymentMethod('Online')}
        >
          {/* Removed placeholder image */}
          <Text style={styles.paymentText}>Online Banking by RMS</Text>
        </TouchableOpacity>
      </View>

      {/* Price Breakdown Section */}
      <View style={styles.section}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total:</Text>
          <Text style={styles.priceValue}>RM {totalPrice}</Text>
        </View>
        <Text style={styles.taxNote}>
          * The total price already includes tax.
        </Text>
      </View>

      {/* Final Action Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handlePayment}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    fontSize: 28,
    color: '#007ea7',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#00a8e8',
    shadowColor: '#003459',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003459',
    marginBottom: 12,
    letterSpacing: 1,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    padding: 8,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  serviceName: {
    flex: 1,
    fontSize: 16,
    color: '#007ea7',
    fontWeight: 'bold',
  },
  servicePrice: {
    fontSize: 16,
    color: '#00a8e8',
    fontWeight: 'bold',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  changeButton: {
    fontSize: 14,
    color: '#00a8e8',
    fontWeight: 'bold',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e6f7ff',
    backgroundColor: '#f9f9f9',
  },
  selectedPaymentOption: {
    borderColor: '#007ea7',
    backgroundColor: '#e6f7ff',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  paymentText: {
    fontSize: 16,
    color: '#003459',
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  priceLabel: {
    fontSize: 18,
    color: '#007ea7',
    fontWeight: 'bold',
  },
  priceValue: {
    fontSize: 18,
    color: '#00171f',
    fontWeight: 'bold',
  },
  taxNote: {
    fontSize: 12,
    color: '#00a8e8',
    marginTop: 5,
    textAlign: 'center',
  },
  voucherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  voucherInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#e6f7ff',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  applyVoucher: {
    fontSize: 14,
    color: '#00a8e8',
    marginLeft: 10,
  },
  terms: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#003459',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});