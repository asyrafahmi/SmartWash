import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { launchCamera } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

export default function Service() {
  const [numberPlate, setNumberPlate] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [response, setResponse] = useState(null);
  const navigation = useNavigation();

  const userService = () => {
    firestore()
      .collection('Service')
      .add({
        user_id: auth().currentUser.uid,
        num_plate: numberPlate,
        body_type: bodyType,
        date_created: firestore.FieldValue.serverTimestamp(),
      })
      .then((docRef) => {
        navigation.navigate('ChooseService', { bodyType, carId: docRef.id });
      });
  };

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
        <ScrollView style={styles.container}>
          <View style={styles.innerContainer}>
            <Text style={styles.pageTitle}>Service Page</Text>
            {/*<Button title="Insert photo of your car" onPress={pickImage} color="#007ea7" />
            {carPhoto && <Image source={{ uri: carPhoto }} style={styles.carImage} />} */}
            <TextInput
              style={styles.input}
              onChangeText={setNumberPlate}
              value={numberPlate}
              placeholder="Enter the number plate"
              placeholderTextColor="#007ea7"
            />
            <Text style={styles.label}>Select Body Type:</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setBodyType('Small')}
              >
                <View style={styles.outerCircle}>
                  {bodyType === 'Small' && <View style={styles.innerCircle} />}
                </View>
                <Text style={styles.radioText}>Small</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setBodyType('Big')}
              >
                <View style={styles.outerCircle}>
                  {bodyType === 'Big' && <View style={styles.innerCircle} />}
                </View>
                <Text style={styles.radioText}>Big</Text>
              </TouchableOpacity>
            </View>
            <Button title="Submit" onPress={userService} color="#007ea7" />
            <View style={styles.noteSection}>
              <Text style={styles.noteTitle}>Note:</Text>
              <Text style={styles.noteText}>Small: Sedan/Compact (Kancil/Vios/Civic)</Text>
              <Text style={styles.noteText}>Big: SUV/MPV/4WD (Ativa/CRV/Starex/Hilux)</Text>
              <Text style={styles.cautionText}>
              If you're unsure of your vehicle's body type, please check with our staff first.
              Wrong selection may lead to order cancellation and resubmission.
              </Text>                
            </View>
          </View>
        </ScrollView>
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
    fontFamily: 'Roboto',
    fontSize: 30,
    fontWeight: 'bold',
    fontStyle: 'italic',
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
    padding: 20,
  },
  innerContainer: {
    padding: 20,
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#e6f7ff',
    borderRadius: 16,
    shadowColor: '#00a8e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#003459',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderColor: '#00a8e8',
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    color: '#00171f',
    fontWeight: 'bold',
  },
  carImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
    color: '#007ea7',
    fontWeight: 'bold',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  outerCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007ea7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#ffffff',
  },
  innerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#007ea7',
  },
  radioText: {
    fontSize: 16,
    color: '#007ea7',
    fontWeight: 'bold',
  },
  noteSection: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#e6f7ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00a8e8',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#003459',
  },
  noteText: {
    fontSize: 16,
    color: '#007ea7',
  },
  cautionText: {
    color: '#d97706',
    fontSize: 15,
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});