import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function AddElderly() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [medical, setMedical] = useState('');

  const handleSave = () => {
    alert('Elderly profile saved');
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Elderly Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Medical Notes"
        value={medical}
        onChangeText={setMedical}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.btnText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
  },
  btnText: { color: '#fff', textAlign: 'center' },
});