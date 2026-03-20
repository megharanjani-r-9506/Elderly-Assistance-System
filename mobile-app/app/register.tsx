import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { API } from '../services/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!email || !password) {
      alert('Enter all fields');
      return;
    }

    try {
      const res = await API.post('/register', { email, password });

      alert('Registered successfully');
      router.replace('/login');

    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.btn} onPress={handleRegister}>
        <Text style={styles.text}>REGISTER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { backgroundColor: '#fff', padding: 15, marginBottom: 10 },
  btn: { backgroundColor: 'green', padding: 15 },
  text: { color: 'white', textAlign: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});