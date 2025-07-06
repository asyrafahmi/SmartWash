import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 32;

export default function Analytic() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [serviceData, setServiceData] = useState([]);
  const [filter, setFilter] = useState('month'); // 'day', 'month', 'year'
  const [bodyTypeFilter, setBodyTypeFilter] = useState('all'); // 'all', 'Small', 'Big'
  const [isAdmin, setIsAdmin] = useState(false);

  // Analytics data
  const [revenueByPeriod, setRevenueByPeriod] = useState({});
  const [serviceCountByPeriod, setServiceCountByPeriod] = useState({});
  const [serviceTypePopularity, setServiceTypePopularity] = useState({});
  const [bodyTypeDistribution, setBodyTypeDistribution] = useState({});

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
          await fetchData();
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        setIsAdmin(false);
      }
      setLoading(false);
    };
    checkAndFetch();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isAdmin) processAnalytics();
    // eslint-disable-next-line
  }, [serviceData, filter, bodyTypeFilter, isAdmin]);

  const fetchData = async () => {
    try {
      const snapshot = await firestore()
        .collection('Service')
        .orderBy('date_created', 'desc')
        .get();
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date_created?.toDate ? doc.data().date_created.toDate() : null,
      }));
      setServiceData(data);
    } catch (e) {
      setServiceData([]);
    }
  };

  const processAnalytics = () => {
    // Filter by body type if needed
    let filtered = serviceData;
    if (bodyTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.body_type === bodyTypeFilter);
    }

    // Revenue and count by period
    const revenue = {};
    const count = {};
    const typePopularity = {};
    const bodyTypeDist = { Small: 0, Big: 0 };

    filtered.forEach(item => {
      if (!item.date) return;
      let key;
      if (filter === 'day') key = item.date.toISOString().slice(0, 10);
      else if (filter === 'month') key = item.date.toISOString().slice(0, 7);
      else key = item.date.getFullYear().toString();

      // Revenue
      const total = Number(item.totalPrice) || 0;
      revenue[key] = (revenue[key] || 0) + total;
      count[key] = (count[key] || 0) + 1;

      // Service type popularity
      if (Array.isArray(item.selectedServices)) {
        item.selectedServices.forEach(s => {
          typePopularity[s.name] = (typePopularity[s.name] || 0) + 1;
        });
      }

      // Body type distribution
      if (item.body_type === 'Small') bodyTypeDist.Small += 1;
      if (item.body_type === 'Big') bodyTypeDist.Big += 1;
    });

    setRevenueByPeriod(revenue);
    setServiceCountByPeriod(count);
    setServiceTypePopularity(typePopularity);
    setBodyTypeDistribution(bodyTypeDist);
  };

  // Prepare chart data
  const getLineChartData = (dataObj, label) => {
    const keys = Object.keys(dataObj).sort();
    let displayKeys = keys.length > 7 ? keys.slice(-7) : keys;
    // Format labels for readability
    const labels = displayKeys.map(dateStr => {
      if (filter === 'day') return dateStr.slice(5); // MM-DD
      if (filter === 'month') return dateStr;        // YYYY-MM
      return dateStr;                                // YYYY
    });
    return {
      labels,
      datasets: [
        {
          data: displayKeys.map(k => dataObj[k]),
        },
      ],
      legend: [label],
    };
  };

  const getBarChartData = (dataObj, label) => {
    const keys = Object.keys(dataObj).sort();
    let displayKeys = keys.length > 7 ? keys.slice(-7) : keys;
    const labels = displayKeys.map(dateStr => {
      if (filter === 'day') return dateStr.slice(5); // MM-DD
      if (filter === 'month') return dateStr;        // YYYY-MM
      return dateStr;                                // YYYY
    });
    return {
      labels,
      datasets: [
        {
          data: displayKeys.map(k => dataObj[k]),
        },
      ],
      legend: [label],
    };
  };

  const getPieChartData = (dataObj) => {
    const colors = ['#00a8e8', '#FFD700', '#003459', '#007ea7', '#e6f7ff', '#00b894', '#fdcb6e'];
    const total = Object.values(dataObj).reduce((sum, v) => sum + v, 0);
    return Object.keys(dataObj).map((k, i) => {
      const value = dataObj[k];
      const percent = total ? ((value / total) * 100).toFixed(1) : 0;
      return {
        name: `${k} (${percent}%)`,
        population: value,
        color: colors[i % colors.length],
        legendFontColor: '#003459',
        legendFontSize: 14,
      };
    });
  };

  // Custom legend for PieChart
  const renderPieLegend = (data) => (
    <View style={styles.pieLegendContainer}>
      {data.map((item, idx) => (
        <View key={idx} style={styles.pieLegendRow}>
          <View style={[styles.pieLegendColor, { backgroundColor: item.color }]} />
          <Text style={styles.pieLegendText}>{item.name}</Text>
        </View>
      ))}
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
              <Text style={styles.titlePrimary}>Smart</Text>
              <Text style={styles.titleAccent}>Wash</Text>
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
              <Text style={styles.titlePrimary}>Smart</Text>
              <Text style={styles.titleAccent}>Wash</Text>
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
      <SafeAreaView style={styles.background}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Text style={styles.hamburgerMenu}>☰</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              <Text style={styles.titlePrimary}>Smart</Text>
              <Text style={styles.titleAccent}>Wash</Text>
            </Text>
            <Image
              style={styles.logo}
              source={require('../../assets/image/logo.png')}
            />
          </View>
          <Text style={styles.pageTitle}>Analytics Dashboard</Text>
          {/* Filters */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Period:</Text>
            <Text
              style={[styles.filterButton, filter === 'day' && styles.filterButtonActive]}
              onPress={() => setFilter('day')}
            >Day</Text>
            <Text
              style={[styles.filterButton, filter === 'month' && styles.filterButtonActive]}
              onPress={() => setFilter('month')}
            >Month</Text>
            <Text
              style={[styles.filterButton, filter === 'year' && styles.filterButtonActive]}
              onPress={() => setFilter('year')}
            >Year</Text>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Body:</Text>
            <Text
              style={[styles.filterButton, bodyTypeFilter === 'all' && styles.filterButtonActive]}
              onPress={() => setBodyTypeFilter('all')}
            >All</Text>
            <Text
              style={[styles.filterButton, bodyTypeFilter === 'Small' && styles.filterButtonActive]}
              onPress={() => setBodyTypeFilter('Small')}
            >Small</Text>
            <Text
              style={[styles.filterButton, bodyTypeFilter === 'Big' && styles.filterButtonActive]}
              onPress={() => setBodyTypeFilter('Big')}
            >Big</Text>
          </View>
          <>
            {/* Revenue Line Chart */}
            <View style={styles.graphSection}>
              <Text style={styles.chartTitle}>Revenue by {filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
              <LineChart
                data={getLineChartData(revenueByPeriod, 'Revenue')}
                width={screenWidth}
                height={220}
                yAxisLabel="RM "
                chartConfig={chartConfig}
                style={styles.chart}
                horizontalLabelRotation={30}
                withInnerLines={true}
                withOuterLines={true}
                fromZero
              />
            </View>
            {/* Service Count Bar Chart */}
            <View style={styles.graphSection}>
              <Text style={styles.chartTitle}>Number of Services by {filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
              <BarChart
                data={getBarChartData(serviceCountByPeriod, 'Service Count')}
                width={screenWidth}
                height={220}
                yAxisLabel=""
                chartConfig={chartConfig}
                style={styles.chart}
                horizontalLabelRotation={30}
                withInnerLines={true}
                withOuterLines={true}
                fromZero
              />
            </View>
            {/* Service Type Popularity Pie Chart */}
            <View style={styles.graphSection}>
              <Text style={styles.chartTitle}>Service Type Popularity</Text>
              <PieChart
                data={getPieChartData(serviceTypePopularity)}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                style={[styles.chart, styles.pieChart]}
                hasLegend={false}
                center={[0, 0]}
              />
              {renderPieLegend(getPieChartData(serviceTypePopularity))}
            </View>
            {/* Body Type Distribution Pie Chart */}
            <View style={styles.graphSection}>
              <Text style={styles.chartTitle}>Body Type Distribution</Text>
              <PieChart
                data={getPieChartData(bodyTypeDistribution)}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                style={[styles.chart, styles.pieChart]}
                hasLegend={false}
                center={[0, 0]}
              />
              {renderPieLegend(getPieChartData(bodyTypeDistribution))}
            </View>
          </>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#e6f7ff',
  backgroundGradientTo: '#e6f7ff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 168, 232, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 52, 89, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: '#007ea7',
  },
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    padding: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
    color: '#00171f',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  filterLabel: {
    fontSize: 15,
    color: '#003459',
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  filterButton: {
    fontSize: 15,
    color: '#007ea7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00a8e8',
    marginHorizontal: 2,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#00a8e8',
    color: '#fff',
    borderColor: '#007ea7',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003459',
    marginTop: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  pieChart: {
    marginBottom: 0,
  },
  graphSection: {
    marginBottom: 32,
    backgroundColor: '#f4faff',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#00345922',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  pieLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  pieLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 2,
  },
  pieLegendColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pieLegendText: {
    fontSize: 14,
    color: '#003459',
    marginRight: 8,
  },
  errorText: {
    color: '#d90429',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
});