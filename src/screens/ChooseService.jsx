import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

export default function ChooseService() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bodyType, carId } = route.params;

  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const userConfirm = () => {
    firestore()
      .collection('Service')
      .doc(carId)
      .update({
        selectedServices: selectedServices.map(service => ({
          id: service.id,
          name: service.name,
          price: getPrice(service),
        })),
        totalPrice: getTotalPrice(),
      })
      .then(() => {
        navigation.navigate('Payment', {
          carId,
          totalPrice: getTotalPrice(),
          selectedServices: selectedServices.map(service => ({
            id: service.id,
            name: service.name,
            price: getPrice(service),
          })),
        });
      })
      .catch(error => {
        console.error('Error updating selected services:', error);
      });
  };

  useEffect(() => {
    const subscriber = firestore()
      .collection('ServiceType')
      .onSnapshot(querySnapshot => {
        const fetchedServices = [];
        querySnapshot.forEach(documentSnapshot => {
          fetchedServices.push({
            id: documentSnapshot.id,
            ...documentSnapshot.data(),
          });
        });
        setServices(fetchedServices);
      });
    return () => subscriber();
  }, []);

  const getPrice = (service) => {
    return bodyType === 'Small' ? parseFloat(service.smallPrice) : parseFloat(service.bigPrice);
  };

  const addService = (service) => {
    if (!selectedServices.find(s => s.id === service.id)) {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const removeService = (service) => {
    setSelectedServices(selectedServices.filter(s => s.id !== service.id));
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + getPrice(service), 0).toFixed(2);
  };

  return (
    <View style={styles.background}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Choose Service</Text>
        <Text style={styles.subtitle}>Body Type: <Text style={{color:'#007ea7'}}>{bodyType}</Text></Text>
        {services.map((service, index) => (
          <View key={service.id} style={styles.serviceItem}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.servicePrice}>RM {getPrice(service)}</Text>
            <TouchableOpacity onPress={() => addService(service)}>
              <Text style={styles.addButton}>+</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Selected Services:</Text>
          {selectedServices.length === 0 && (
            <Text style={styles.emptyText}>No service selected yet.</Text>
          )}
          {selectedServices.map((service, index) => (
            <View key={service.id} style={styles.selectedServiceItem}>
              <Text style={styles.selectedServiceName}>{service.name}</Text>
              <Text style={styles.selectedServicePrice}>RM {getPrice(service)}</Text>
              <TouchableOpacity onPress={() => removeService(service)}>
                <Text style={styles.removeButton}>-</Text>
              </TouchableOpacity>
            </View>
          ))}
          <Text style={styles.totalPrice}>Total Price: <Text style={{color:'#00171f'}}>RM {getTotalPrice()}</Text></Text>
        </View>
        <View style={styles.confirmButton}>
          <Button title="Confirm" onPress={userConfirm} color="#007ea7" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#00171f',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#00a8e8',
    textAlign: 'center',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginVertical: 7,
    backgroundColor: '#e6f7ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00a8e8',
    shadowColor: '#003459',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  serviceName: {
    fontSize: 18,
    color: '#003459',
    fontWeight: 'bold',
  },
  servicePrice: {
    fontSize: 18,
    color: '#007ea7',
    fontWeight: 'bold',
  },
  addButton: {
    fontSize: 28,
    color: '#00a8e8',
    fontWeight: 'bold',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: 36,
    height: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#00a8e8',
  },
  summary: {
    marginTop: 25,
    padding: 16,
    backgroundColor: '#e6f7ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00a8e8',
    shadowColor: '#003459',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#00171f',
    textAlign: 'center',
  },
  emptyText: {
    color: '#007ea7',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  selectedServiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6f7ff',
  },
  selectedServiceName: {
    fontSize: 17,
    color: '#007ea7',
    fontWeight: 'bold',
  },
  selectedServicePrice: {
    fontSize: 17,
    color: '#00a8e8',
    fontWeight: 'bold',
  },
  removeButton: {
    fontSize: 28,
    color: '#003459',
    fontWeight: 'bold',
    backgroundColor: '#e6f7ff',
    borderRadius: 20,
    width: 36,
    height: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#007ea7',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#00a8e8',
    textAlign: 'center',
    letterSpacing: 1,
  },
  confirmButton: {
    marginTop: 25,
    marginBottom: 30,
    borderRadius: 10,
    overflow: 'hidden',
  },
});