import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Text, View, Image, TextInput, StyleSheet, Button, ScrollView, Alert } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  function userSignup() {
    navigation.navigate('Signup');
  }

  function userLogin() {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        setLoading(false);
        navigation.navigate('Home');
      })
      .catch(error => {
        setLoading(false);
        let msg = 'Login failed. Please check your credentials.';
        if (error.code === 'auth/user-not-found') {
          msg = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
          msg = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/invalid-email') {
          msg = 'Invalid email address format.';
        } else if (error.code === 'auth/too-many-requests') {
          msg = 'Too many failed attempts. Please try again later.';
        }
        setErrorMsg(msg);
      });
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.background} edges={['left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image
              style={styles.logo}
              source={require('../../assets/image/logo.png')}
            />
          </View>
          <Text style={styles.title}>
            <Text style={styles.titlePrimary}>Smart</Text>
            <Text style={styles.titleAccent}>Wash</Text>
          </Text>
          <View style={styles.innerContainer}>
            <Text
              style={styles.sign}
              onPress={userSignup}
            >
              Don't have any account? Sign up here!
            </Text>
            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}
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
            <View style={styles.buttonWrapper}>
              <Button
                title={loading ? "Logging in..." : "Login"}
                onPress={userLogin}
                color="#007ea7"
                disabled={loading}
              />
            </View>
            <Text style={styles.bannerText}>
              Welcome to <Text style={{ color: '#00a8e8' }}>SmartWash</Text>
              {"\n"}Experience Expert Car Care Today!
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
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
    width: 300,
    maxWidth: '90%',
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