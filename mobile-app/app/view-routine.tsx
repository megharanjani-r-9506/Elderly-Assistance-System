import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { API } from '../services/api';

export default function ViewRoutine() {
  const { id } = useLocalSearchParams();
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/routine/${id}`);
      setTasks(res.data);
    } catch (err) {
      console.log(err);
      alert('Error loading routines');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Routine Status</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item: any) => item.id.toString()}
        ListEmptyComponent={<Text>No routines added</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.task}>{item.task}</Text>
            <Text>Time: {item.time}</Text>

            {/* 🔥 STATUS DISPLAY */}
            <Text style={{
              color: item.status === 'done' ? 'green' : 'red',
              marginTop: 5
            }}>
              Status: {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  title: { fontSize: 22, marginBottom: 10 },

  card: {
    backgroundColor: '#eee',
    padding: 15,
    marginBottom: 10,
    borderRadius: 6
  },

  task: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});