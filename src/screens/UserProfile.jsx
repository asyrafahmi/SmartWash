import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Linking, FlatList, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export default function UserProfile({ route, navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState('');
  const { userId } = route.params;

  useEffect(() => {
    if (userId) {
      firestore()
        .collection('Users')
        .doc(userId)
        .get()
        .then(documentSnapshot => {
          setUserData(documentSnapshot.data());
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
        });
      // Fetch user's service history
      firestore()
        .collection('Service')
        .where('user_id', '==', userId)
        .orderBy('date_created', 'desc')
        .get()
        .then(async querySnapshot => {
          const data = await Promise.all(
            querySnapshot.docs.map(async doc => {
              const docData = doc.data();
              // Fetch photo URLs for this service record
              let photoUrls = [];
              try {
                const listResult = await storage()
                  .ref(`service_photos/${doc.id}`)
                  .listAll();
                photoUrls = await Promise.all(
                  listResult.items.map(async itemRef => {
                    const url = await itemRef.getDownloadURL();
                    return { url, name: itemRef.name };
                  })
                );
              } catch (e) {
                photoUrls = [];
              }
              // Calculate total price
              let totalPrice = 0;
              if (Array.isArray(docData.selectedServices)) {
                totalPrice = docData.selectedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
              }
              return {
                id: doc.id,
                ...docData,
                totalPrice,
                photoUrls,
              };
            })
          );
          setHistory(data);
          setHistoryLoading(false);
        })
        .catch(error => {
          setHistory([]);
          setHistoryLoading(false);
        });
    } else {
      setLoading(false);
      setHistoryLoading(false);
    }
  }, [userId]);

  // Helper to extract and format date from filename
  function getDateFromFileName(name) {
    // filename format: 2024-05-24T15-30-00.000Z_photo.jpg
    const match = name && name.match(/^(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.\d{3}Z)/);
    if (match) {
      const fixed = match[1].replace(/^(\d{4}-\d{2}-\d{2}T)(\d{2})-(\d{2})-(\d{2})/, (_, d, h, m, s) => `${d}${h}:${m}:${s}`);
      const date = new Date(fixed);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    }
    return '';
  }

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

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color="#00a8e8" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!userData) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Text style={styles.errorText}>No user data found.</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Back Button at the top left */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{"<-"}</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
          <View style={styles.profileContainer}>
            <Text style={styles.label}>Customer Data</Text>
            <Image
              source={require('../../assets/image/logo.png')}
              style={styles.avatar}
            />
            <Text style={styles.name}>{userData.Name}</Text>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userData.Email}</Text>
            <Text style={styles.label}>Phone Number:</Text>
            <View style={styles.phoneRow}>
              <Text style={styles.value}>{userData.PhoneNumber}</Text>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => {
                  if (userData.PhoneNumber) {
                    Linking.openURL(`tel:${userData.PhoneNumber}`);
                  }
                }}
              >
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Wash History</Text>
            {historyLoading ? (
              <ActivityIndicator size="large" color="#00a8e8" />
            ) : history.length === 0 ? (
              <Text style={styles.noHistory}>No history found.</Text>
            ) : (
              <FlatList
                data={history}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.historyCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Image
                        source={require('../../assets/image/logo.png')}
                        style={{ width: 30, height: 30, borderRadius: 8, marginRight: 10 }}
                      />
                      <Text style={styles.historyCardTitle}>{item.num_plate} - {item.body_type}</Text>
                    </View>
                    <Text style={styles.historyLabel}>Date: <Text style={styles.historyValue}>
                      {item.date_created?.toDate
                        ? item.date_created.toDate().toLocaleDateString()
                        : 'N/A'}
                    </Text></Text>
                    {item.selectedServices && Array.isArray(item.selectedServices) && (
                      <>
                        <Text style={styles.historyLabel}>Services:</Text>
                        {item.selectedServices.map((service, idx) => (
                          <Text key={idx} style={styles.historyValue}>
                            - {service.name} (RM {service.price})
                          </Text>
                        ))}
                      </>
                    )}
                    {item.paymentMethod && (
                      <Text style={styles.historyLabel}>Payment Method: <Text style={styles.historyValue}>{item.paymentMethod}</Text></Text>
                    )}
                    <Text style={styles.historyLabel}>Total Price: <Text style={styles.historyValue}>RM {item.totalPrice.toFixed(2)}</Text></Text>
                    {item.photoUrls && item.photoUrls.length > 0 && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={styles.historyLabel}>Photos:</Text>
                        {renderPhotos(item.photoUrls)}
                      </View>
                    )}
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </ScrollView>
        {renderFullImageModal()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: '#e6f7ff',
    borderRadius: 20,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007ea7',
    fontWeight: 'bold',
  },
  profileContainer: {
    backgroundColor: '#e6f7ff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    width: 300,
    elevation: 3,
    marginTop: 60,
    marginBottom: 30,
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  callButton: {
    marginLeft: 10,
    backgroundColor: '#00a8e8',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#d90429',
    fontSize: 18,
  },
  historySection: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#e6f7ff',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#00a8e8',
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007ea7',
    marginBottom: 16,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e6f7ff',
  },
  historyCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003459',
  },
  historyLabel: {
    fontWeight: 'bold',
    color: '#007ea7',
    fontSize: 15,
    marginTop: 4,
  },
  historyValue: {
    color: '#00171f',
    fontSize: 15,
    fontWeight: 'normal',
  },
  noHistory: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
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