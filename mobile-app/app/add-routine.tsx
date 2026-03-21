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
// import * as Notifications from 'expo-notifications';

export default function AddRoutine() {
  const { id } = useLocalSearchParams();

  const [task, setTask] = useState('');
  const [time, setTime] = useState('');

  const handleSave = async () => {
    if (!task || !time) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // HH:MM validation
    const valid = /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
    if (!valid) {
      Alert.alert('Invalid Time', 'Use HH:MM format (e.g. 08:30)');
      return;
    }

    try {
      await API.post('/routine', {
        elderly_id: Number(id),
        task,
        time
      });

      // await scheduleNotification(task, time);

      Alert.alert('Success', 'Routine added successfully');
      router.back();

    } catch (err: any) {
      console.log(err);
      Alert.alert(
        'Error',
        err?.response?.data?.detail || 'Could not add routine'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Routine</Text>

      <TextInput
        placeholder="Task (e.g. Take medicine)"
        style={styles.input}
        value={task}
        onChangeText={setTask}
      />

      <TextInput
        placeholder="Time (HH:MM e.g. 08:30)"
        style={styles.input}
        value={time}
        onChangeText={setTime}
      />

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>Save Routine</Text>
      </TouchableOpacity>
    </View>
  );
}

/* / 🔔 DAILY notification scheduler (fixed)
const scheduleNotification = async (task: string, time: string) => {
  try {
    const [hour, minute] = time.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Routine Reminder',
        body: `Time to: ${task}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: hour,
        minute: minute,
        repeats: true,
      },
    }); 

  } catch (err) {
    console.log('Notification scheduling error:', err);
  } 
}; */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f6f8'
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },

  input: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd'
  },

  btn: {
    backgroundColor: '#6c5ce7',
    padding: 15,
    borderRadius: 10,
    marginTop: 10
  },

  btnText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  }
});