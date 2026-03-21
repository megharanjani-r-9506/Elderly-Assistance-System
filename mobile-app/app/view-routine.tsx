import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { API } from '../services/api';

export default function ViewRoutine() {
  const { id } = useLocalSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/routine/${id}`);
      setTasks(res.data);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Error loading routines');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const deleteTask = (taskId: number) => {
    Alert.alert(
      'Delete Routine',
      'Are you sure you want to delete this routine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await API.delete(`/routine/${taskId}`);
              fetchTasks();
            } catch {
              Alert.alert('Error', 'Could not delete routine');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.task}>{item.task}</Text>
      <Text style={styles.time}>Time: {item.time}</Text>

      <Text
        style={[
          styles.status,
          item.status === 'done' ? styles.done : styles.pending
        ]}
      >
        {item.status.toUpperCase()}
      </Text>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => deleteTask(item.id)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Routine Status</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No routines added</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f6f8'
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15
  },

  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: 'gray'
  },

  card: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2
  },

  task: {
    fontSize: 18,
    fontWeight: 'bold'
  },

  time: {
    marginTop: 4,
    color: 'gray'
  },

  status: {
    marginTop: 6,
    fontWeight: 'bold'
  },

  done: {
    color: '#2ecc71'
  },

  pending: {
    color: '#e74c3c'
  },

  deleteBtn: {
    marginTop: 10,
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },

  deleteText: {
    color: 'white',
    fontWeight: '600'
  }
});