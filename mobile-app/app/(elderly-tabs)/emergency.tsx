import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { API } from '../../services/api';
import { getUser } from '../../services/session';

export default function EmergencyScreen() {
  const user = getUser();
  const [sending, setSending] = useState(false);

  const sendSOS = async () => {
    try {
      setSending(true);

      // 🔥 Send email instead of elderly_id
      await API.post('/emergency', {
        email: user.email,
        message: 'SOS Button Pressed'
      });

      Alert.alert(
        'Alert Sent',
        'Your caregiver has been notified.'
      );

    } catch (err: any) {
      console.log('Emergency error:', err?.response?.data || err);

      Alert.alert(
        'Error',
        'Could not send emergency alert. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const triggerSOS = () => {
    Alert.alert(
      'Send Emergency Alert?',
      'This will immediately notify your caregiver.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Send',
          style: 'destructive',
          onPress: sendSOS
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* TITLE */}
      <Text style={styles.title}>Emergency</Text>

      {/* SOS BUTTON */}
      <TouchableOpacity
        style={[
          styles.sosButton,
          sending && styles.disabled
        ]}
        onPress={triggerSOS}
        activeOpacity={0.8}
        disabled={sending}
      >
        {sending ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <Text style={styles.sosText}>SOS</Text>
        )}
      </TouchableOpacity>

      {/* INFO TEXT */}
      <Text style={styles.info}>
        Press the SOS button if you need immediate help.
        Your caregiver will be notified instantly.
      </Text>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 50
  },

  sosButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6
  },

  disabled: {
    backgroundColor: '#f5b7b1'
  },

  sosText: {
    color: 'white',
    fontSize: 44,
    fontWeight: 'bold'
  },

  info: {
    marginTop: 50,
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    lineHeight: 22
  }
});