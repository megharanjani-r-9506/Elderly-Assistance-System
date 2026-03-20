import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView
} from 'react-native';
import { API } from '../../services/api';
import { getUser } from '../../services/session';

export default function ElderDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const user = getUser();

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/routine/user/${user.email}`);
      setTasks(res.data);

      // Check delay for each task
      res.data.forEach((task: any) => {
        if (task.status === 'pending') {
          checkDelay(task);
        }
      });

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Auto refresh every 1 minute
    const interval = setInterval(fetchTasks, 60000);

    return () => clearInterval(interval);
  }, []);

  // Delay check logic (15 min rule)
  const checkDelay = async (task: any) => {
    try {
      if (!task.created_at) return;

      const created = new Date(task.created_at);
      const now = new Date();

      const diffMinutes =
        (now.getTime() - created.getTime()) / 60000;

      if (diffMinutes > 15 && task.status === 'pending') {
        Alert.alert(
          'Missed Task',
          `${task.task} was not completed on time`
        );

        await API.post('/alert', {
          elderly_id: task.elderly_id,
          task: task.task
        });
      }

    } catch (err) {
      console.log('Delay check error', err);
    }
  };

  const markDone = async (id: number) => {
    try {
      await API.put(`/routine/${id}`);
      fetchTasks();
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Could not update task');
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.task}>{item.task}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      {/* STATUS */}
      <Text
        style={[
          styles.status,
          item.status === 'done'
            ? styles.done
            : styles.pending
        ]}
      >
        {item.status.toUpperCase()}
      </Text>

      {/* ACTION */}
      {item.status === 'pending' && (
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => markDone(item.id)}
        >
          <Text style={styles.doneText}>Mark as Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Routine</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No tasks assigned yet
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 10,
  },

  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: 'gray',
  },

  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  task: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  time: {
    color: 'gray',
    fontSize: 14,
  },

  status: {
    marginTop: 6,
    fontWeight: 'bold',
  },

  done: {
    color: '#2ecc71',
  },

  pending: {
    color: '#e74c3c',
  },

  doneBtn: {
    marginTop: 12,
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 8,
  },

  doneText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});