import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
useEffect(() => {
  Notifications.requestPermissionsAsync();
}, []);
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(caregiver-tabs)" />
      <Stack.Screen name="(elderly-tabs)" />
      <Stack.Screen name="add-elderly" />
      <Stack.Screen name="edit-elderly" />
    </Stack>
  );
}