import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      firestore()
        .collection('Users')
        .where('Email', '==', currentUser.email)
        .get()
        .then(querySnapshot => {
          if (!querySnapshot.empty) {
            setUserData(querySnapshot.docs[0].data());
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const renderHeader = () => (
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
  );

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.background}>
          {renderHeader()}
          <SafeAreaView style={styles.container}>
            <ActivityIndicator size="large" color="#00a8e8" />
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!userData) {
    return (
      <SafeAreaProvider>
        <View style={styles.background}>
          {renderHeader()}
          <SafeAreaView style={styles.container}>
            <Text style={styles.errorText}>No user data found.</Text>
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.background}>
        {renderHeader()}
        <SafeAreaView style={styles.container}>
          <View style={styles.profileContainer}>
            <Image
              source={require('../../assets/image/logo.png')}
              style={styles.avatar}
            />
            <Text style={styles.name}>{userData.Name}</Text>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userData.Email}</Text>
            <Text style={styles.label}>Phone Number:</Text>
            <Text style={styles.value}>{userData.PhoneNumber}</Text>
          </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 0,
    textAlign: 'center',
    flexDirection: 'row',
  },
  smartWashText: {
    color: '#00171f',
  },
  washText: {
    color: '#00a8e8',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    backgroundColor: '#e6f7ff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    width: 300,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#00a8e8',
    shadowColor: '#007ea7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#003459',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#007ea7',
    marginTop: 10,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    color: '#00171f',
  },
  errorText: {
    color: '#d90429',
    fontSize: 18,
  },
});