import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Text, View, Image, TextInput, StyleSheet, Button, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agree, setAgree] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  function userLogin() {
    navigation.navigate('Login');
  }

  function validateEmail(email) {
    // Simple email regex
    return /\S+@\S+\.\S+/.test(email);
  }

  function userSignup() {
    setErrorMsg('');
    if (!fullname.trim() || !email.trim() || !password.trim() || !phoneNumber.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (!/^\d{9,15}$/.test(phoneNumber)) {
      setErrorMsg('Please enter a valid phone number (9-15 digits).');
      return;
    }
    if (!agree) {
      setErrorMsg('You must agree to the terms and conditions.');
      return;
    }
    setLoading(true);
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        // Save user info to Firestore
        return firestore()
          .collection('Users')
          .doc(userCredential.user.uid)
          .set({
            Name: fullname,
            Email: email,
            PhoneNumber: phoneNumber,
            CreatedAt: firestore.FieldValue.serverTimestamp(),
          });
      })
      .then(() => {
        setLoading(false);
        navigation.navigate('Login');
      })
      .catch(error => {
        setLoading(false);
        let msg = 'Signup failed. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
          msg = 'This email is already in use.';
        } else if (error.code === 'auth/invalid-email') {
          msg = 'Invalid email address format.';
        } else if (error.code === 'auth/weak-password') {
          msg = 'Password is too weak.';
        }
        setErrorMsg(msg);
      });
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.background} edges={['left', 'right']}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.header}>
            <Image
              style={styles.logo}
              source={require('../../assets/image/logo.png')}
            />
          </View>
          <View style={styles.title}>
            <Text style={styles.titlePrimary}>Smart</Text>
            <Text style={styles.titleAccent}>Wash</Text>
          </View>
          <View style={styles.innerContainer}>
            <Text
              style={styles.sign}
              onPress={userLogin}
            >
              Already have an account? Login here!
            </Text>
            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}
            <TextInput
              style={styles.input}
              onChangeText={setName}
              value={fullname}
              placeholder="Full Name"
              placeholderTextColor="#007ea7"
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              onChangeText={setEmail}
              value={email}
              placeholder="Email"
              keyboardType="email-address"
              placeholderTextColor="#007ea7"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              onChangeText={setPassword}
              value={password}
              placeholder="Password"
              secureTextEntry={true}
              placeholderTextColor="#007ea7"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              onChangeText={setPhoneNumber}
              value={phoneNumber}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              placeholderTextColor="#007ea7"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={15}
            />
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAgree(!agree)}
              >
                {agree ? <Text style={styles.checkmark}>✓</Text> : null}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>
                I agree to the Terms & Conditions.
              </Text>
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                title={loading ? "Signing up..." : "Sign Up"}
                onPress={userSignup}
                color="#007ea7"
                disabled={loading}
              />
            </View>
            <Text style={styles.bannerText}>
              Join <Text style={{ color: '#00a8e8' }}>SmartWash</Text> for a better car care experience!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
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
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 0,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 5,
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
  innerContainer: {
    backgroundColor: '#e6f7ff',
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: '#00a8e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sign: {
    fontSize: 12,
    alignSelf: 'center',
    color: '#003459',
    marginBottom: 10,
  },
  input: {
    height: 40,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#00a8e8',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    color: '#003459',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginLeft: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#00a8e8',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderRadius: 4,
  },
  checkmark: {
    fontSize: 16,
    color: '#00a8e8',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#003459',
    flex: 1,
    flexWrap: 'wrap',
  },
  buttonWrapper: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bannerText: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#00171f',
  },
  errorBox: {
    backgroundColor: '#ffeaea',
    borderColor: '#d90429',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: '#d90429',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});