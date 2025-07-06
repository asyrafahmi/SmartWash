import React from 'react';
import { Text, View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';
import { useNavigation } from '@react-navigation/native';

export default function PriceService() {
  const navigation = useNavigation();
  const tableHead = ['Service', 'Small (RM)', 'Big (RM)'];
  const tableData = [
    ['Wash', '10', '15'],
    ['Vacuum', '5', '10'],
    ['Wax', '10', '15'],
    ['Polish', '100', '150'],
    ['Coating', '50', '80'],
    ['Interior Cleaning', '250', '300'],
  ];

  return (
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
        <Text style={styles.pageTitle}>Price List</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <Table borderStyle={{ borderWidth: 2, borderColor: '#00a8e8' }}>
            <Row data={tableHead} style={styles.head} textStyle={styles.text} />
            <Rows data={tableData} textStyle={styles.text} />
          </Table>
        </View>
        <View style={styles.noteSection}>
          <Text style={styles.noteTitle}>Note:</Text>
          <Text style={styles.noteText}>Small: Sedan/Compact (Kancil/Vios/Civic)</Text>
          <Text style={styles.noteText}>Big: SUV/MPV/4WD (Ativa/CRV/Starex/Hilux)</Text>
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
    color: undefined,
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
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#00171f',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007ea7',
  },
  head: {
    height: 40,
    backgroundColor: '#e6f7ff',
  },
  text: {
    margin: 6,
    color: '#003459',
    fontWeight: 'bold',
  },
  noteSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#007ea7',
  },
  noteText: {
    fontSize: 16,
    color: '#003459',
  },
});