import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '@/context/AuthContext'; // Импорт

function NavigationGuard() {
  const { userToken, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (!userToken && !inAuthGroup) {
      router.replace('/login' as any);
    } else if (userToken && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [userToken, segments, isLoading]);

  if (isLoading) {
    return <View style={{flex: 1, justifyContent: 'center'}}><ActivityIndicator size="large" /></View>;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!userToken ? (
        <Stack.Screen name="(auth)/login" options={{ animation: 'fade' }} />
      ) : (
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationGuard />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}