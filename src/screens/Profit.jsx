import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TextInput, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function Profit() {
  const [loading, setLoading] = useState(true);
  const [dailyProfit, setDailyProfit] = useState({});
  const [monthlyProfit, setMonthlyProfit] = useState({});
  const [yearlyProfit, setYearlyProfit] = useState({});
  const [totalProfit, setTotalProfit] = useState(0);
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('day'); // 'day', 'month', 'year'
  const [serviceStats, setServiceStats] = useState({ daily: {}, monthly: {}, yearly: {}, allTime: {} });
  const [allTimeSort, setAllTimeSort] = useState('profit'); // 'profit' or 'popularity'
  const [profitSort, setProfitSort] = useState('newest'); // 'newest', 'oldest', 'highest'
  const [isAdmin, setIsAdmin] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const checkAndFetch = async () => {
      setLoading(true);
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        const user = await firestore().collection('Users').doc(currentUser.uid).get();
        if (user.exists && user.data().role === 'admin') {
          setIsAdmin(true);
          await fetchProfitData();
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        setIsAdmin(false);
      }
      setLoading(false);
    };
    checkAndFetch();
  }, []);

  const fetchProfitData = async () => {
    try {
      const snapshot = await firestore()
        .collection('Service')
        .orderBy('date_created', 'desc')
        .get();

      const daily = {};
      const monthly = {};
      const yearly = {};
      let total = 0;

      // Service stats
      const serviceStatsDaily = {};
      const serviceStatsMonthly = {};
      const serviceStatsYearly = {};
      const serviceStatsAllTime = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.date_created || typeof data.totalPrice === 'undefined') return;

        const dateObj = data.date_created.toDate();
        const dayKey = dateObj.toISOString().slice(0, 10); // YYYY-MM-DD
        const monthKey = dateObj.toISOString().slice(0, 7); // YYYY-MM
        const yearKey = dateObj.getFullYear().toString(); // YYYY

        const price = Number(data.totalPrice) || 0;
        total += price;

        // Daily
        if (!daily[dayKey]) daily[dayKey] = 0;
        daily[dayKey] += price;

        // Monthly
        if (!monthly[monthKey]) monthly[monthKey] = 0;
        monthly[monthKey] += price;

        // Yearly
        if (!yearly[yearKey]) yearly[yearKey] = 0;
        yearly[yearKey] += price;

        // Service breakdown
        if (Array.isArray(data.selectedServices)) {
          data.selectedServices.forEach(service => {
            // Daily
            if (!serviceStatsDaily[dayKey]) serviceStatsDaily[dayKey] = {};
            if (!serviceStatsDaily[dayKey][service.name]) {
              serviceStatsDaily[dayKey][service.name] = { count: 0, profit: 0 };
            }
            serviceStatsDaily[dayKey][service.name].count += 1;
            serviceStatsDaily[dayKey][service.name].profit += Number(service.price) || 0;

            // Monthly
            if (!serviceStatsMonthly[monthKey]) serviceStatsMonthly[monthKey] = {};
            if (!serviceStatsMonthly[monthKey][service.name]) {
              serviceStatsMonthly[monthKey][service.name] = { count: 0, profit: 0 };
            }
            serviceStatsMonthly[monthKey][service.name].count += 1;
            serviceStatsMonthly[monthKey][service.name].profit += Number(service.price) || 0;

            // Yearly
            if (!serviceStatsYearly[yearKey]) serviceStatsYearly[yearKey] = {};
            if (!serviceStatsYearly[yearKey][service.name]) {
              serviceStatsYearly[yearKey][service.name] = { count: 0, profit: 0 };
            }
            serviceStatsYearly[yearKey][service.name].count += 1;
            serviceStatsYearly[yearKey][service.name].profit += Number(service.price) || 0;

            // All time
            if (!serviceStatsAllTime[service.name]) {
              serviceStatsAllTime[service.name] = { count: 0, profit: 0 };
            }
            serviceStatsAllTime[service.name].count += 1;
            serviceStatsAllTime[service.name].profit += Number(service.price) || 0;
          });
        }
      });

      setDailyProfit(daily);
      setMonthlyProfit(monthly);
      setYearlyProfit(yearly);
      setTotalProfit(total);
      setServiceStats({
        daily: serviceStatsDaily,
        monthly: serviceStatsMonthly,
        yearly: serviceStatsYearly,
        allTime: serviceStatsAllTime,
      });
    } catch (error) {
      console.error('Error fetching profit data:', error);
    }
  };

  // Filtered data based on search
  const getFilteredData = (data, type) => {
    if (!search.trim()) return data;
    const lower = search.trim().toLowerCase();
    return Object.fromEntries(
      Object.entries(data).filter(([key]) => key.toLowerCase().includes(lower))
    );
  };

  // Sorting for daily/monthly/yearly profit
  const sortProfitEntries = (entries) => {
    if (profitSort === 'newest') {
      return entries.sort((a, b) => b[0].localeCompare(a[0]));
    }
    if (profitSort === 'oldest') {
      return entries.sort((a, b) => a[0].localeCompare(b[0]));
    }
    if (profitSort === 'highest') {
      return entries.sort((a, b) => b[1] - a[1]);
    }
    return entries;
  };

  const renderServiceStatsTable = (stats, label) => {
    // Sorting logic for all-time stats
    let sortedStats = Object.entries(stats);
    if (allTimeSort === 'profit') {
      sortedStats = sortedStats.sort((a, b) => b[1].profit - a[1].profit);
    } else {
      sortedStats = sortedStats.sort((a, b) => b[1].count - a[1].count);
    }
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{label}</Text>
        <View style={styles.allTimeSortRow}>
          <Text style={styles.serviceStatLabel}>Sort by:</Text>
          <TouchableOpacity
            style={[styles.sortButton, allTimeSort === 'profit' && styles.sortButtonActive]}
            onPress={() => setAllTimeSort('profit')}
          >
            <Text style={[styles.sortButtonText, allTimeSort === 'profit' && styles.sortButtonTextActive]}>Revenue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, allTimeSort === 'popularity' && styles.sortButtonActive]}
            onPress={() => setAllTimeSort('popularity')}
          >
            <Text style={[styles.sortButtonText, allTimeSort === 'popularity' && styles.sortButtonTextActive]}>Popularity</Text>
          </TouchableOpacity>
        </View>
        {sortedStats.length === 0 ? (
          <Text style={styles.noData}>No data found.</Text>
        ) : (
          sortedStats.map(([service, { count, profit }]) => (
            <View key={service} style={styles.row}>
              <Text style={styles.date}>{service}</Text>
              <Text style={styles.amount}>
                RM {profit.toFixed(2)} ({count}x)
              </Text>
            </View>
          ))
        )}
      </View>
    );
  };

  const renderProfitTable = (data, label, stats, statsLabel) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <View style={styles.profitSortRow}>
        <Text style={styles.serviceStatLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, profitSort === 'newest' && styles.sortButtonActive]}
          onPress={() => setProfitSort('newest')}
        >
          <Text style={[styles.sortButtonText, profitSort === 'newest' && styles.sortButtonTextActive]}>Newest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, profitSort === 'oldest' && styles.sortButtonActive]}
          onPress={() => setProfitSort('oldest')}
        >
          <Text style={[styles.sortButtonText, profitSort === 'oldest' && styles.sortButtonTextActive]}>Oldest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, profitSort === 'highest' && styles.sortButtonActive]}
          onPress={() => setProfitSort('highest')}
        >
          <Text style={[styles.sortButtonText, profitSort === 'highest' && styles.sortButtonTextActive]}>Highest Profit</Text>
        </TouchableOpacity>
      </View>
      {Object.keys(data).length === 0 ? (
        <Text style={styles.noData}>No data found.</Text>
      ) : (
        sortProfitEntries(Object.entries(data)).map(([key, value]) => (
          <View key={key} style={{ marginBottom: 10 }}>
            <View style={styles.row}>
              <Text style={styles.date}>{key}</Text>
              <Text style={styles.amount}>RM {value.toFixed(2)}</Text>
            </View>
            {stats && stats[key] && (
              <View style={{ marginLeft: 10, marginTop: 2 }}>
                {Object.entries(stats[key])
                  .sort((a, b) => b[1].profit - a[1].profit)
                  .map(([service, { count, profit }]) => (
                    <Text key={service} style={styles.serviceStat}>
                      • {service}: RM {profit.toFixed(2)} ({count}x)
                    </Text>
                  ))}
              </View>
            )}
          </View>
        ))
      )}
      {statsLabel && stats && Object.keys(stats).length > 0 && (
        <Text style={styles.serviceStatLabel}>{statsLabel}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.background}>
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
            <Text style={styles.title}>
              <Text style={styles.smartWashText}>Smart</Text>
              <Text style={styles.washText}>Wash</Text>
            </Text>
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
          <Text style={styles.title}>
            <Text style={styles.smartWashText}>Smart</Text>
            <Text style={styles.washText}>Wash</Text>
          </Text>
          <Image
            style={styles.logo}
            source={require('../../assets/image/logo.png')}
          />
        </View>
        <SafeAreaView style={styles.container}>
          <ScrollView>
            <Text style={styles.pageTitle}>Revenue Summary</Text>
            <View style={styles.searchBar}>
              <TextInput
                style={styles.searchInput}
                placeholder={
                  searchType === 'day'
                    ? 'Search by date (YYYY-MM-DD)'
                    : searchType === 'month'
                    ? 'Search by month (YYYY-MM)'
                    : 'Search by year (YYYY)'
                }
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#007ea7"
              />
              <View style={styles.toggleGroup}>
                <Text
                  style={[
                    styles.toggleButton,
                    searchType === 'day' && styles.toggleButtonActive,
                  ]}
                  onPress={() => setSearchType('day')}
                >
                  Day
                </Text>
                <Text
                  style={[
                    styles.toggleButton,
                    searchType === 'month' && styles.toggleButtonActive,
                  ]}
                  onPress={() => setSearchType('month')}
                >
                  Month
                </Text>
                <Text
                  style={[
                    styles.toggleButton,
                    searchType === 'year' && styles.toggleButtonActive,
                  ]}
                  onPress={() => setSearchType('year')}
                >
                  Year
                </Text>
              </View>
            </View>
            <View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Total Revenue</Text>
                <Text style={styles.totalProfit}>RM {totalProfit.toFixed(2)}</Text>
              </View>
              {searchType === 'day'
                ? renderProfitTable(
                    getFilteredData(dailyProfit, 'day'),
                    'Daily Revenue',
                    serviceStats.daily,
                    'Service breakdown for each day'
                  )
                : searchType === 'month'
                ? renderProfitTable(
                    getFilteredData(monthlyProfit, 'month'),
                    'Monthly Revenue',
                    serviceStats.monthly,
                    'Service breakdown for each month'
                  )
                : renderProfitTable(
                    getFilteredData(yearlyProfit, 'year'),
                    'Yearly Revenue',
                    serviceStats.yearly,
                    'Service breakdown for each year'
                  )}
              {renderServiceStatsTable(serviceStats.allTime, 'All-Time Service Popularity & Revenue')}
            </View>
          </ScrollView>
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
    backgroundColor: '#ffffff',
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#00171f',
  },
  searchBar: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderColor: '#00a8e8',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 8,
    color: '#00171f',
  },
  toggleGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  toggleButton: {
    fontSize: 16,
    color: '#007ea7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#00a8e8',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  toggleButtonActive: {
    backgroundColor: '#e6f7ff',
    color: '#003459',
    borderColor: '#007ea7',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007ea7',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e6f7ff',
  },
  profitSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 4,
  },
  date: {
    fontSize: 16,
    color: '#007ea7',
  },
  amount: {
    fontSize: 16,
    color: '#003459',
    fontWeight: 'bold',
  },
  totalProfit: {
    fontSize: 24,
    color: '#00a8e8',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  noData: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
    marginVertical: 10,
  },
  serviceStat: {
    fontSize: 14,
    color: '#003459',
    marginLeft: 8,
  },
  serviceStatLabel: {
    fontSize: 13,
    color: '#007ea7',
    marginTop: 8,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  allTimeSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 4,
  },
  sortButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00a8e8',
    backgroundColor: '#fff',
  },
  sortButtonActive: {
    backgroundColor: '#00a8e8',
    borderColor: '#007ea7',
  },
  sortButtonText: {
    color: '#007ea7',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sortButtonTextActive: {
    color: '#ffffff',
  },
  errorText: {
    color: '#d90429',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
});