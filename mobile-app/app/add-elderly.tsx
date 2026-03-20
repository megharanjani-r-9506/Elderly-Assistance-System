import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { API } from '../services/api';

export default function AddElderly() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [condition, setCondition] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSave = async () => {
    if (!name || !age || !condition || !email || !password) {
      alert('Fill all fields');
      return;
    }

    try {
      await API.post('/elderly', {
        name,
        age: Number(age),
        condition,
        email,
        password
      });

      alert('Elderly added successfully');

      router.back();

    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.detail || 'Error saving');
    }
  };

  return (
    <View style={styles.container}>
      
      <TextInput
        placeholder="Name"
        style={styles.input}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Age"
        style={styles.input}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Condition"
        style={styles.input}
        onChangeText={setCondition}
      />

      {/* 🔥 NEW FIELDS */}
      <TextInput
        placeholder="Elder Email"
        style={styles.input}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Save</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  input: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 6
  },

  btn: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 6
  }
});