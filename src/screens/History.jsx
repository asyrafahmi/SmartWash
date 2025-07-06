import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [washCount, setWashCount] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    firestore()
      .collection('Service')
      .where('user_id', '==', currentUser.uid)
      .orderBy('date_created', 'desc')
      .get()
      .then(querySnapshot => {
        const data = querySnapshot.docs.map(doc => {
          const docData = doc.data();
          // Calculate total price for each record
          let totalPrice = 0;
          if (Array.isArray(docData.selectedServices)) {
            totalPrice = docData.selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
          }
          return {
            id: doc.id,
            ...docData,
            totalPrice,
          };
        });
        setHistory(data);

        // Count total washes (records)
        setWashCount(data.length);
        setEligible(data.length > 0 && data.length % 5 === 0);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching history:', error);
        setLoading(false);
      });
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>Number Plate:</Text>
      <Text style={styles.value}>{item.num_plate}</Text>
      <Text style={styles.label}>Body Type:</Text>
      <Text style={styles.value}>{item.body_type}</Text>
      <Text style={styles.label}>Date:</Text>
      <Text style={styles.value}>
        {item.date_created?.toDate
          ? item.date_created.toDate().toISOString().slice(0, 10)
          : 'N/A'}
      </Text>
      {item.selectedServices && Array.isArray(item.selectedServices) && (
        <>
          <Text style={styles.label}>Services:</Text>
          {item.selectedServices.map((service, idx) => (
            <Text key={idx} style={styles.value}>
              - {service.name} (RM {service.price})
            </Text>
          ))}
        </>
      )}
      {item.paymentMethod && (
        <>
          <Text style={styles.label}>Payment Method:</Text>
          <Text style={styles.value}>{item.paymentMethod}</Text>
        </>
      )}
      <Text style={styles.label}>Total Price:</Text>
      <Text style={styles.value}>RM {item.totalPrice.toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaProvider>
      <View style={styles.background}>
        {/* Header at the very top, outside ScrollView */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Text style={styles.hamburgerMenu}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            <Text style={styles.smartWashText}>Smart</Text>
            <Text style={styles.washText}>Wash</Text>
          </Text>
          <Image
            style={styles.logo}
            source={require('../../assets/image/logo.png')}
          />
        </View>
        <SafeAreaView style={styles.container}>
          <Text style={styles.pageTitle}>Wash History</Text>
          <View style={styles.noteSection}>
            {eligible ? (
              <Text style={styles.eligibleText}>
                Congratulations! You are eligible to redeem a free car wash as a reward for every 5 visits. Please inform our staff during your next visit to claim your free wash.
              </Text>
            ) : (
              <Text style={styles.noteText}>
                You have completed {washCount} car wash{washCount === 1 ? '' : 'es'}. Redeem a free car wash for every 5 visits. Keep washing to unlock your next reward!
              </Text>
            )}
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#00a8e8" />
          ) : history.length === 0 ? (
            <Text style={styles.noHistory}>No history found.</Text>
          ) : (
            <FlatList
              data={history}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
            />
          )}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 0,
  },
  hamburgerMenu: {
    fontSize: 30,
    marginRight: 10,
    color: '#007ea7',
  },
  logo: {
    width: 50,
    height: 50,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 0,
    textAlign: 'center',
    flexDirection: 'row',
    color: undefined, // Remove color to allow per-word coloring
  },
  smartWashText: {
    color: '#00171f',
  },
  washText: {
    color: '#00a8e8',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#00171f',
  },
  noteSection: {
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 18,
    elevation: 1,
  },
  eligibleText: {
    color: '#007ea7',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noteText: {
    color: '#007ea7',
    fontSize: 16,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e6f7ff',
  },
  label: {
    fontWeight: 'bold',
    color: '#007ea7',
    fontSize: 16,
    marginTop: 6,
  },
  value: {
    color: '#00171f',
    fontSize: 16,
    marginLeft: 5,
  },
  noHistory: {
    textAlign: 'center',
    color: '#999',
    fontSize: 18,
    marginTop: 40,
  },
});