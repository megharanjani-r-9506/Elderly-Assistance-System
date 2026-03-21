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

  // check if routine was created today
  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 🔹 NEW: check if scheduled time has passed
  const isTimeReached = (time: string) => {
    if (!time) return false;

    const parts = time.split(':');
    const hour = parseInt(parts[0]);
    const minute = parseInt(parts[1]);

    const now = new Date();
    const routineTime = new Date();
    routineTime.setHours(hour, minute, 0, 0);

    return now >= routineTime;
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/routine/user/${user.email}`);

      // 🔁 reset status daily
      const updated = res.data.map((task: any) => {
        if (!isToday(task.created_at)) {
          task.status = 'pending';
        }
        return task;
      });

      setTasks(updated);

    } catch (err) {
      console.log('Routine fetch error:', err);
    }
  };

  useEffect(() => {
    fetchTasks();

    // auto refresh every 60s
    const interval = setInterval(fetchTasks, 60000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 MODIFIED: added time check and removed body from API call
  const markDone = async (id: number, time: string) => {
    if (!isTimeReached(time)) {
      Alert.alert(
        'Too Early',
        'You can only mark this task as done after its scheduled time.'
      );
      return;
    }

    try {
      console.log("Marking routine done:", id);

      await API.put(`/routine/${id}`);  // matches your FastAPI route
      fetchTasks();

    } catch (err) {
      console.log('Update error:', err);
      Alert.alert('Error', 'Could not update routine');
    }
  };

  const renderItem = ({ item }: any) => {
    const canMark = item.status === 'pending' && isTimeReached(item.time);

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.task}>{item.task}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

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

        {/* 🔹 MODIFIED: button only appears after scheduled time */}
        {canMark && (
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => markDone(item.id, item.time)}
          >
            <Text style={styles.doneText}>Mark as Done</Text>
          </TouchableOpacity>
        )}

        {/* 🔹 NEW: show waiting message before time */}
        {!canMark && item.status === 'pending' && (
          <Text style={styles.waitText}>
            Available after {item.time}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Daily Routine</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No routines assigned</Text>
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
    paddingHorizontal: 16
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 10
  },

  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: 'gray'
  },

  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  task: {
    fontSize: 18,
    fontWeight: 'bold'
  },

  time: {
    color: 'gray',
    fontSize: 14
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

  doneBtn: {
    marginTop: 12,
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 8
  },

  doneText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600'
  },

  waitText: {
    marginTop: 10,
    color: 'gray',
    fontStyle: 'italic'
  }

});