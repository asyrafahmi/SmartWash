import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ProgressBarAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function Progress() {
  const route = useRoute();
  const { selectedServices = [] } = route.params || {};

  const [remainingTime, setRemainingTime] = useState(0);
  const [progress, setProgress] = useState(0);

  const serviceDurations = {
    Wash: 10,
    Vacuum: 5,
    Wax: 10,
    Polish: 20,
    Coating: 10,
    'Interior Cleaning': 120,
  };

  const totalServiceTime = selectedServices.reduce(
    (total, service) => total + (serviceDurations[service.name] || 0) * 60, // Convert to seconds
    0
  );

  useEffect(() => {
    setRemainingTime(totalServiceTime);

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev > 0) {
          return prev - 1;
        } else {
          clearInterval(interval);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalServiceTime]);

  useEffect(() => {
    setProgress((totalServiceTime - remainingTime) / totalServiceTime);
  }, [remainingTime, totalServiceTime]);

  if (!selectedServices || selectedServices.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No services selected. Please go back and select services.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>
        Remaining Time: {Math.floor(remainingTime / 60)}m {remainingTime % 60}s
      </Text>
      <ProgressBarAndroid
        styleAttr="Horizontal"
        indeterminate={false}
        progress={progress}
        color="#1995AD"
      />
      <ScrollView style={styles.serviceList}>
        {selectedServices.map((service, index) => (
          <View key={index} style={styles.serviceItem}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDuration}>
              Duration: {serviceDurations[service.name] || 0} min
            </Text>
          </View>
        ))}
      </ScrollView>
      {remainingTime === 0 && (
        <Text style={styles.readyText}>Your vehicle is ready for pickup!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F1F1F2',
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1995AD',
  },
  serviceList: {
    marginTop: 20,
  },
  serviceItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  serviceName: {
    fontSize: 18,
    color: '#1995AD',
  },
  serviceDuration: {
    fontSize: 16,
    color: '#999',
  },
  readyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});