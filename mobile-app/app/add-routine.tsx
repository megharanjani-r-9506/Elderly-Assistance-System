import { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { API } from '../services/api';
import * as Notifications from 'expo-notifications';

export default function AddRoutine() {
  const { id } = useLocalSearchParams();

  const [task, setTask] = useState('');
  const [time, setTime] = useState('');

  const handleSave = async () => {
    if (!task || !time) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }

    // ✅ Validate time format HH:MM
    const isValidTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
    if (!isValidTime) {
      Alert.alert('Invalid Time', 'Use format HH:MM (e.g. 14:30)');
      return;
    }

    try {
      await API.post('/routine', {
        elderly_id: Number(id),
        task,
        time
      });

      // 🔔 Schedule notification
      await scheduleNotification(task, time);

      Alert.alert('Success', 'Routine added');
      router.back();

    } catch (err: any) {
      console.log(err);
      Alert.alert('Error', err?.response?.data?.detail || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Task (Medicine, Walk...)"
        style={styles.input}
        onChangeText={setTask}
      />

      <TextInput
        placeholder="Time (HH:MM e.g. 14:30)"
        style={styles.input}
        onChangeText={setTime}
      />

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.text}>Add Routine</Text>
      </TouchableOpacity>
    </View>
  );
}

// 🔔 Notification Scheduler
const scheduleNotification = async (task: string, time: string) => {
  try {
    const [hour, minute] = time.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Reminder',
        body: `Time for: ${task}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR, // ✅ FIX
        hour,
        minute,
        repeats: false,
      },
    });

  } catch (err) {
    console.log('Notification error:', err);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },

  input: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 6
  },

  btn: {
    backgroundColor: 'purple',
    padding: 15,
    borderRadius: 6
  },

  text: {
    color: 'white',
    textAlign: 'center'
  }
});