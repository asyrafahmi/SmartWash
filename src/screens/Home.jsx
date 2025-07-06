import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Button, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function Home() {
  const navigation = useNavigation();

  // Progress bar state
  const [eligible, setEligible] = useState(false);
  const [washCount, setWashCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
        const data = querySnapshot.docs.map(doc => doc.data());
        setWashCount(data.length);
        setEligible(data.length > 0 && data.length % 5 === 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function getService() {
    navigation.navigate('Service');
  }

  function getProfile() {
    navigation.navigate('Profile');
  }

  function getPrice() {
    navigation.navigate('PriceService');
  }

  function getHistory() {
    navigation.navigate('History');
  }

  function signOut() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'Login' },
        ],
      })
    );
  }

  // Progress bar calculation
  const washesThisCycle = washCount % 5;
  const progress = washCount === 0 ? 0 : washesThisCycle === 0 && washCount > 0 ? 5 : washesThisCycle;

  const renderProgressBar = () => (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${(progress / 5) * 100}%` }]} />
      </View>
      <View style={styles.progressBarLabels}>
        {[1, 2, 3, 4, 5].map(i => (
          <View key={i} style={styles.progressStep}>
            <View style={[
              styles.progressCircle,
              progress >= i ? styles.progressCircleActive : styles.progressCircleInactive,
              eligible && i === 5 ? styles.progressCircleReward : null
            ]}>
              <Text style={[
                styles.progressCircleText,
                progress >= i ? styles.progressCircleTextActive : styles.progressCircleTextInactive
              ]}>
                {i}
              </Text>
            </View>
            {i === 5 && eligible && (
              <Text style={styles.rewardText}>🎉</Text>
            )}
          </View>
        ))}
      </View>
      {eligible ? (
        <View style={styles.freeWashHighlightRow}>
          <Text style={styles.freeWashCrown}>👑</Text>
          <Text style={styles.freeWashText}>You have earned a FREE car wash!</Text>
          <Text style={styles.freeWashCrown}>👑</Text>
        </View>
      ) : (
        <Text style={styles.progressBarText}>
          Washes this cycle: {progress} / 5
        </Text>
      )}
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
    </View>
  );

  return (
    <View style={styles.background}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Text style={styles.hamburgerMenu}>☰</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.title}>
              <Text style={styles.titlePrimary}>Smart</Text>
              <Text style={styles.titleAccent}>Wash</Text>
            </Text>
            <Text style={styles.subTitle}>
              Snow Car Wash
            </Text>
            <Text style={styles.address}>
              13, Jalan Seri Putra 3/12, Bandar Seri Putra, 43000 Kajang, Selangor
            </Text>
          </View>
          <Image
            style={styles.logo}
            source={require('../../assets/image/logo.png')}
          />
        </View>

        {/* Beautiful Progress Bar at the top */}
        {loading ? (
          <ActivityIndicator size="large" color="#00a8e8" style={{ marginVertical: 20 }} />
        ) : renderProgressBar()}

        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Welcome to <Text style={{ color: '#00a8e8' }}>SmartWash</Text>
            {"\n"}Experience Professional Car Care Today!
          </Text>
          <Button title="Request a Service" onPress={getService} color="#007ea7" />
        </View>
        {/* Shiny Car Image Section */}
        <View style={styles.carImageContainer}>
          <Image
            style={styles.carImage}
            source={require('../../assets/image/shiny-car.png')}
            resizeMode="cover"
          />
        </View>
        <View style={styles.services}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.serviceGrid}>
            <View style={styles.serviceItem}><Text style={styles.serviceItemText}>Wash</Text></View>
            <View style={styles.serviceItem}><Text style={styles.serviceItemText}>Vacuum</Text></View>
            <View style={styles.serviceItem}><Text style={styles.serviceItemText}>Wax</Text></View>
            <View style={styles.serviceItem}><Text style={styles.serviceItemText}>Coating</Text></View>
            <View style={styles.serviceItem}><Text style={styles.serviceItemText}>Polish</Text></View>
            <View style={styles.serviceItem}><Text style={styles.serviceItemText}>Interior Cleaning</Text></View>
          </View>
          <Button title="View Service Pricing" onPress={getPrice} color="#007ea7" />
        </View>

        <View style={styles.history}>
          <Text style={styles.sectionTitle}>Service History</Text>
          <Button title="View Past Services" onPress={getHistory} color="#007ea7" />
        </View>

        <View style={styles.centeredButton}>
          <Button title="Log Out" onPress={signOut} color="#003459" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  title: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titlePrimary: {
    fontFamily: 'Roboto',
    fontSize: 30,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#00171f',
  },
  titleAccent: {
    fontFamily: 'Roboto',
    fontSize: 30,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#00a8e8',
  },
  subTitle: {
    fontSize: 16,
    color: '#003459',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -2,
    marginBottom: 2,
    letterSpacing: 1,
  },
  address: {
    fontSize: 13,
    color: '#007ea7',
    textAlign: 'center',
    marginBottom: 2,
  },
  carImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
    width: '100%',
  },
  carImage: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    shadowColor: '#003459',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: '#fff',
  },
  banner: {
    backgroundColor: '#e6f7ff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#00a8e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#00171f',
  },
  services: {
    marginVertical: 10,
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#00a8e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#003459',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  serviceItem: {
    width: '45%',
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#00a8e8',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    elevation: 1,
  },
  serviceItemText: {
    color: '#003459',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centeredButton: {
    alignItems: 'center',
    marginVertical: 10,
  },
  history: {
    marginVertical: 20,
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#00a8e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  // Progress Bar Styles
  progressBarContainer: {
    marginBottom: 18,
    alignItems: 'center',
    width: '100%',
  },
  progressBarBackground: {
    width: '100%',
    height: 18,
    backgroundColor: '#e6f7ff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#00a8e8',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00a8e8',
    borderRadius: 12,
  },
  progressBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: -18,
    marginBottom: 8,
    position: 'relative',
    zIndex: 2,
  },
  progressStep: {
    alignItems: 'center',
    width: '20%',
  },
  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e6f7ff',
    backgroundColor: '#ffffff',
    marginBottom: 2,
  },
  progressCircleActive: {
    backgroundColor: '#00a8e8',
    borderColor: '#007ea7',
  },
  progressCircleInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#e6f7ff',
  },
  progressCircleReward: {
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  progressCircleText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  progressCircleTextActive: {
    color: '#ffffff',
  },
  progressCircleTextInactive: {
    color: '#007ea7',
  },
  rewardText: {
    fontSize: 18,
    color: '#FFD700',
    marginTop: -6,
    fontWeight: 'bold',
  },
  progressBarText: {
    fontSize: 15,
    color: '#00171f',
    fontWeight: 'bold',
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'center',
  },
  // Centered row for crown and text
  freeWashHighlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9C4',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 8,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    width: '100%',
  },
  freeWashCrown: {
    fontSize: 22,
    marginHorizontal: 8,
    color: '#FFD700',
  },
  freeWashText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18,
    marginHorizontal: 8,
    textAlign: 'center',
    flex: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 0.5,
    textTransform: 'uppercase',
  },
  noteSection: {
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    padding: 14,
    marginTop: 8,
    marginBottom: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#00a8e8',
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
});