import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { API } from '../services/api';
import { setUser } from '../services/session';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Enter all fields');
      return;
    }

    try {
      const res = await API.post('/login', { email, password });

      // ✅ Save logged-in user
      setUser(res.data);

      const role = res.data.role;

      // ✅ Navigate based on role
      if (role === 'caregiver') {
        router.replace('/(caregiver-tabs)');
      } else if (role === 'elderly') {
        router.replace('/(elderly-tabs)');
      } else {
        alert('Unknown role');
      }

    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.text}>LOGIN</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={{ textAlign: 'center', marginTop: 15 }}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { backgroundColor: '#fff', padding: 15, marginBottom: 10 },
  btn: { backgroundColor: '#3498db', padding: 15 },
  text: { color: 'white', textAlign: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});