import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  StyleSheet
} from 'react-native';
import { API } from '../../services/api';

export default function CaregiverEmergency() {
  const [alerts, setAlerts] = useState([]);
  const lastAlertId = useRef<number | null>(null);

  const fetchAlerts = async () => {
    try {
      const res = await API.get('/emergency');

      if (res.data.length > 0) {
        const latest = res.data[0];

        // show popup only for new alerts
        if (latest.id !== lastAlertId.current) {
          lastAlertId.current = latest.id;

          Alert.alert(
            "🚨 Emergency Alert",
            `${latest.name} needs help!`
          );
        }
      }

      setAlerts(res.data);
    } catch (err) {
      console.log("Fetch emergency error:", err);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // poll every 5 seconds
    const interval = setInterval(fetchAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Alerts</Text>

      <FlatList
        data={alerts}
        keyExtractor={(item: any) => item.id.toString()}
        ListEmptyComponent={<Text>No emergency alerts</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },

  title: {
    fontSize: 24,
    marginBottom: 10
  },

  card: {
    backgroundColor: '#ffe6e6',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold'
  },

  message: {
    marginTop: 4
  },

  time: {
    marginTop: 4,
    fontSize: 12,
    color: '#555'
  }
});