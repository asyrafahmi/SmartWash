import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, ScrollView, Image, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import storage from '@react-native-firebase/storage';
import { launchCamera } from 'react-native-image-picker';

export default function Record() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredRecords(records);
    } else {
      const lower = search.toLowerCase();
      setFilteredRecords(
        records.filter(
          item =>
            (item.num_plate && item.num_plate.toLowerCase().includes(lower)) ||
            (item.body_type && item.body_type.toLowerCase().includes(lower)) ||
            (item.userEmail && item.userEmail.toLowerCase().includes(lower))
        )
      );
    }
  }, [search, records]);

  async function fetchRecords() {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }
      const user = await firestore()
        .collection('Users')
        .doc(currentUser.uid)
        .get();

      if (user.data().role === 'admin') {
        setIsAdmin(true);
        const querySnapshot = await firestore()
          .collection('Service')
          .orderBy('date_created', 'desc')
          .get();

        const data = await Promise.all(
          querySnapshot.docs.map(async doc => {
            const serviceData = { id: doc.id, ...doc.data() };
            try {
              const userDoc = await firestore().collection('Users').doc(serviceData.user_id).get();
              serviceData.userEmail = userDoc.exists ? userDoc.data().Email : 'N/A';
            } catch (e) {
              serviceData.userEmail = 'N/A';
            }
            // Fetch photo URLs and names for this record
            try {
              const listResult = await storage()
                .ref(`service_photos/${serviceData.id}`)
                .listAll();
              const urls = await Promise.all(
                listResult.items.map(async itemRef => {
                  const url = await itemRef.getDownloadURL();
                  return { url, name: itemRef.name };
                })
              );
              serviceData.photoUrls = urls;
            } catch (e) {
              serviceData.photoUrls = [];
            }
            return serviceData;
          })
        );
        setRecords(data);
        setFilteredRecords(data);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  }

  // Fetch all customers for modal (exclude admin)
  const fetchCustomers = async () => {
    setCustomerLoading(true);
    try {
      const querySnapshot = await firestore().collection('Users').get();
      const data = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(user => (user.role || '').toLowerCase() !== 'admin');
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
    setCustomerLoading(false);
  };

  // Camera and upload logic
  const handlePhoto = async (item) => {
    try {
      setPhotoLoading(true);
      launchCamera(
        {
          mediaType: 'photo',
          cameraType: 'back',
          saveToPhotos: false,
          quality: 0.7,
        },
        async (response) => {
          if (response.didCancel) {
            setPhotoLoading(false);
            return;
          }
          if (response.errorCode) {
            Alert.alert('Camera Error', response.errorMessage || 'Unknown error');
            setPhotoLoading(false);
            return;
          }
          if (response.assets && response.assets.length > 0) {
            const asset = response.assets[0];
            const uri = asset.uri;
            // Use ISO string for easier parsing
            const takenAt = new Date();
            const isoString = takenAt.toISOString().replace(/:/g, '-');
            const fileName = `${isoString}_${asset.fileName || 'photo.jpg'}`;
            const ref = storage().ref(`service_photos/${item.id}/${fileName}`);
            await ref.putFile(uri);
            // Refresh photo URLs for this record
            const listResult = await storage().ref(`service_photos/${item.id}`).listAll();
            const urls = await Promise.all(
              listResult.items.map(async itemRef => {
                const url = await itemRef.getDownloadURL();
                return { url, name: itemRef.name };
              })
            );
            setRecords(prev =>
              prev.map(r =>
                r.id === item.id ? { ...r, photoUrls: urls } : r
              )
            );
            setFilteredRecords(prev =>
              prev.map(r =>
                r.id === item.id ? { ...r, photoUrls: urls } : r
              )
            );
            Alert.alert('Success', 'Photo uploaded!');
          }
          setPhotoLoading(false);
        }
      );
    } catch (error) {
      setPhotoLoading(false);
      console.error('Photo upload error:', error);
      Alert.alert('Error', 'Failed to upload photo.');
    }
  };

  const handleProfile = (item) => {
    navigation.navigate('UserProfile', { userId: item.user_id });
  };

  // Helper to extract and format date from filename
  function getDateFromFileName(name) {
    // filename format: 2024-05-24T15-30-00.000Z_photo.jpg
    const match = name && name.match(/^(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.\d{3}Z)/);
    if (match) {
      // Actually, just replace the first three '-' in time with ':'
      const fixed = match[1].replace(/^(\d{4}-\d{2}-\d{2}T)(\d{2})-(\d{2})-(\d{2})/, (_, d, h, m, s) => `${d}${h}:${m}:${s}`);
      const date = new Date(fixed);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    }
    return '';
  }

  // Full screen image modal
  const renderFullImageModal = () => (
    <Modal
      visible={fullImageVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setFullImageVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setFullImageVisible(false)}>
        <View style={styles.fullImageOverlay}>
          <Image
            source={{ uri: fullImageUrl }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderPhotos = (photoUrls = []) => (
    <ScrollView horizontal style={{ marginTop: 8 }}>
      {photoUrls.map((photo, idx) => {
        let url = photo.url || photo;
        let name = photo.name || '';
        let dateStr = getDateFromFileName(name);
        return (
          <TouchableOpacity
            key={idx}
            style={{ alignItems: 'center', marginRight: 8 }}
            onPress={() => {
              setFullImageUrl(url);
              setFullImageVisible(true);
            }}
          >
            <Image
              source={{ uri: url }}
              style={{ width: 60, height: 60, borderRadius: 8, borderWidth: 1, borderColor: '#00a8e8' }}
            />
            <Text style={{ fontSize: 10, color: '#007ea7', marginTop: 2, maxWidth: 70, textAlign: 'center' }}>
              {dateStr}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Number Plate: <Text style={styles.value}>{item.num_plate}</Text></Text>
        <Text style={styles.label}>Body Type: <Text style={styles.value}>{item.body_type}</Text></Text>
        <Text style={styles.label}>Date: <Text style={styles.value}>
          {item.date_created?.toDate
            ? item.date_created.toDate().toISOString().slice(0, 10)
            : 'N/A'}
        </Text></Text>
        <Text style={styles.label}>User Email: <Text style={styles.value}>{item.userEmail || 'N/A'}</Text></Text>
        {item.photoUrls && item.photoUrls.length > 0 && renderPhotos(item.photoUrls)}
      </View>
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.iconButton} onPress={() => handlePhoto(item)}>
          <Text style={styles.iconText}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleProfile(item)}>
          <Text style={styles.iconText}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Modal for customer info
  const renderCustomerModal = () => (
    <Modal
      visible={customerModalVisible}
      animationType="slide"
      onRequestClose={() => setCustomerModalVisible(false)}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>All Customers ({customers.length})</Text>
          {customerLoading ? (
            <ActivityIndicator size="large" color="#00a8e8" />
          ) : (
            <ScrollView contentContainerStyle={styles.customerList}>
              {customers.map((customer, idx) => (
                <View key={customer.id || idx} style={styles.customerCard}>
                  <Text style={styles.customerLabel}>Name: <Text style={styles.customerValue}>{customer.Name || '-'}</Text></Text>
                  <Text style={styles.customerLabel}>Email: <Text style={styles.customerValue}>{customer.Email || '-'}</Text></Text>
                  <Text style={styles.customerLabel}>Phone: <Text style={styles.customerValue}>{customer.PhoneNumber || '-'}</Text></Text>
                  <Text style={styles.customerLabel}>Role: <Text style={styles.customerValue}>{customer.role || '-'}</Text></Text>
                </View>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={() => setCustomerModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );

  if (loading || photoLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.background}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Text style={styles.hamburgerMenu}>☰</Text>
            </TouchableOpacity>
            <Text style={styles.title}>SmartWash</Text>
            <Image
              style={styles.logo}
              source={require('../../assets/image/logo.png')}
            />
          </View>
          <SafeAreaView style={styles.container}>
            <ActivityIndicator size="large" color="#00a8e8" />
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaProvider>
        <View style={styles.background}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Text style={styles.hamburgerMenu}>☰</Text>
            </TouchableOpacity>
            <Text style={styles.title}>SmartWash</Text>
            <Image
              style={styles.logo}
              source={require('../../assets/image/logo.png')}
            />
          </View>
          <SafeAreaView style={styles.container}>
            <Text style={styles.errorText}>Access denied. Admins only.</Text>
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Text style={styles.hamburgerMenu}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>SmartWash</Text>
          <Image
            style={styles.logo}
            source={require('../../assets/image/logo.png')}
          />
        </View>
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>All Records</Text>
          {/* Professional Notice */}
          <View style={styles.noticeBox}>
            <Text style={[styles.noticeText, { fontSize: 10 }]}>
              <Text style={{ fontWeight: 'bold' }}>Notice: </Text>
              All workers are required to upload photo documentation before and after each service. Failure to provide such documentation may result in the worker being held financially responsible for any customer claims regarding damages.
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <TouchableOpacity
              style={styles.summaryButton}
              onPress={() => {
                Alert.alert('Total Services', `Total services: ${records.length}`);
              }}
            >
              <Text style={styles.summaryButtonText}>Total Services: {records.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.summaryButton}
              onPress={async () => {
                setCustomerModalVisible(true);
                if (customers.length === 0) await fetchCustomers();
              }}
            >
              <Text style={styles.summaryButtonText}>Total Customers: {customers.length}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by number plate, body type, or email"
            value={search}
            onChangeText={setSearch}
          />
          <FlatList
            data={filteredRecords}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.noData}>No records found.</Text>
            }
          />
          {renderCustomerModal()}
          {renderFullImageModal()}
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
    color: '#003459',
    marginBottom: 20,
    textAlign: 'center',
  },
  noticeBox: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  noticeText: {
    color: '#856404',
    fontSize: 15,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryButton: {
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 2,
    flex: 1,
    alignItems: 'center',
  },
  summaryButtonText: {
    color: '#007ea7',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchInput: {
    height: 40,
    borderColor: '#00a8e8',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#e6f7ff',
    borderRadius: 10,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00a8e8',
  },
  label: {
    fontWeight: 'bold',
    color: '#007ea7',
    fontSize: 16,
    marginTop: 6,
  },
  value: {
    color: '#003459',
    fontSize: 16,
    fontWeight: 'normal',
  },
  errorText: {
    color: '#d90429',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  iconButton: {
    backgroundColor: '#00a8e8',
    borderRadius: 8,
    padding: 10,
    marginLeft: 8,
  },
  iconText: {
    fontSize: 22,
    color: '#ffffff',
  },
  noData: {
    textAlign: 'center',
    color: 'red',
    fontSize: 18,
    marginTop: 40,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003459',
    marginBottom: 16,
    textAlign: 'center',
  },
  customerList: {
    paddingBottom: 20,
  },
  customerCard: {
    backgroundColor: '#e6f7ff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#00a8e8',
  },
  customerLabel: {
    fontWeight: 'bold',
    color: '#007ea7',
    fontSize: 16,
    marginTop: 4,
  },
  customerValue: {
    color: '#003459',
    fontSize: 16,
    fontWeight: 'normal',
  },
  closeButton: {
    backgroundColor: '#007ea7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Full screen image modal
  fullImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '95%',
    height: '80%',
    borderRadius: 12,
  },
});