import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { API } from '../services/api';

export default function EditElderly() {
  const { id, name, age, condition } = useLocalSearchParams();

  const [newName, setNewName] = useState(name);
  const [newAge, setNewAge] = useState(age);
  const [newCondition, setNewCondition] = useState(condition);

  const handleUpdate = async () => {
    await API.put(`/elderly/${id}`, {
      name: newName,
      age: Number(newAge),
      condition: newCondition,
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <TextInput value={String(newName)} onChangeText={setNewName} style={styles.input} />
      <TextInput value={String(newAge)} onChangeText={setNewAge} style={styles.input} />
      <TextInput value={String(newCondition)} onChangeText={setNewCondition} style={styles.input} />

      <TouchableOpacity style={styles.btn} onPress={handleUpdate}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Update</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { backgroundColor: '#fff', padding: 15, marginBottom: 10 },
  btn: { backgroundColor: 'blue', padding: 15 }
});