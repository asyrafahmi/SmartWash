import './gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Home from './screens/Home';
import Profile from './screens/Profile';
import Signup from './screens/Signup';
import Login from './screens/Login';
import Service from './screens/Service';
import PriceService from './screens/PriceService';
import History from './screens/History';
import ChooseService from './screens/ChooseService';
import Payment from './screens/Payment';
import Progress from './screens/Progress';
import Record from './screens/Record';
import UserProfile from './screens/UserProfile';
import Profit from './screens/Profit';
import Analytic from './screens/Analytic';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function HomeStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="History" component={History} />
      <Stack.Screen name="Service" component={Service} />
      <Stack.Screen name="ChooseService" component={ChooseService} />
      <Stack.Screen name="PriceService" component={PriceService} />
      <Stack.Screen name="Payment" component={Payment} />
      <Stack.Screen name="Progress" component={Progress} />
      <Stack.Screen name="Record" component={Record} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="Profit" component={Profit} />
      <Stack.Screen name="Analytic" component={Analytic} />
    </Stack.Navigator>
  );
}

function CustomDrawer({ navigation }) {
  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'flex-start', backgroundColor: '#ffffff' }}>
      <View style={{ 
        width: '100%', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 30 
      }}>
        <Text style={styles.title}>
          <Text style={styles.titlePrimary}>Smart</Text>
          <Text style={styles.titleAccent}>Wash</Text>
        </Text>
        <Image
          source={require('../assets/image/logo.png')}
          style={{ width: 40, height: 40, marginLeft: 8 }}
          resizeMode="contain"
        />
      </View>
      <Text 
        style={styles.drawerItem} 
        onPress={() => navigation.navigate('HomeStack', { screen: 'Home' })}
      >
        Home
      </Text>
      <Text 
        style={styles.drawerItem} 
        onPress={() => navigation.navigate('HomeStack', { screen: 'Profile' })}
      >
        Profile
      </Text>
      <Text 
        style={styles.drawerItem} 
        onPress={() => navigation.navigate('HomeStack', { screen: 'Service' })}
      >
        Service
      </Text>
      <Text 
        style={styles.drawerItem} 
        onPress={() => navigation.navigate('HomeStack', { screen: 'PriceService' })}
      >
        Price Service
      </Text>
      <Text 
        style={styles.drawerItem} 
        onPress={() => navigation.navigate('HomeStack', { screen: 'History' })}
      >
        History
      </Text>
      <Text
        style={styles.drawerItem}
        onPress={() => navigation.navigate('HomeStack', { screen: 'Record' })}
      >
        Record
      </Text>
      <Text
        style={styles.drawerItem}
        onPress={() => navigation.navigate('HomeStack', { screen: 'Profit' })}
      >
        Revenue
      </Text>
      <Text
        style={styles.drawerItem}
        onPress={() => navigation.navigate('HomeStack', { screen: 'Analytic' })}
      >
        Analytic
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{
          headerShown: false
        }}
        drawerContent={props => <CustomDrawer {...props} />}
      >
        <Drawer.Screen name="HomeStack" component={HomeStackScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Roboto',
    fontSize: 30,
    fontWeight: 'bold',
    fontStyle: 'italic',
    flexDirection: 'row',
  },
  titlePrimary: {
    color: '#00171f',
  },
  titleAccent: {
    color: '#00a8e8',
  },
  drawerItem: {
    fontSize: 20,
    marginBottom: 20,
    color: '#007ea7',
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
});