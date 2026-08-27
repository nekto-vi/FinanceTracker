import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/constants/Config';

interface AuthResponse {
  access_token: string;
  token_type: string;
  username: string;
  detail?: string;
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toggleAuthMode = useCallback(() => {
    setIsLogin((prev) => !prev);
  }, []);

  const handleAuthentication = async (): Promise<void> => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      Alert.alert('Внимание', 'Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);
    
    const endpoint = isLogin 
      ? API_CONFIG.ENDPOINTS.LOGIN 
      : API_CONFIG.ENDPOINTS.REGISTER;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          username: trimmedUsername, 
          password: trimmedPassword 
        }),
      });

      const data: AuthResponse = await response.json();

      if (response.ok) {
        await signIn(data.access_token, data.username);
      } else {
        Alert.alert('Ошибка авторизации', data.detail || 'Проверьте введенные данные');
      }
    } catch (error) {
      Alert.alert('Ошибка сети', 'Не удалось связаться с сервером. Попробуйте позже.');
      console.error('[Auth Error]:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.logo}>Finance AI</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'С возвращением!' : 'Добро пожаловать'}
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput 
              style={styles.input} 
              placeholder="Логин" 
              value={username} 
              onChangeText={setUsername} 
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              returnKeyType="next"
              blurOnSubmit={false}
              placeholderTextColor="#A9A9AC"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Пароль" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleAuthentication}
              placeholderTextColor="#A9A9AC"
            />

            <TouchableOpacity 
              style={styles.buttonContainer} 
              onPress={handleAuthentication}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient 
                colors={['#7C7BAD', '#6D6BA1']} 
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isLogin ? 'Войти' : 'Создать аккаунт'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={toggleAuthMode} 
              style={styles.switchButton}
            >
              <Text style={styles.switchText}>
                {isLogin 
                  ? 'Нет аккаунта? Зарегистрироваться' 
                  : 'Уже есть профиль? Войти'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: '900',
    color: '#6D6BA1',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3A3A3C',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  input: { 
    width: '100%', 
    backgroundColor: '#FFFFFF', 
    paddingVertical: 16,
    paddingHorizontal: 20, 
    borderRadius: 14, 
    marginBottom: 16, 
    fontSize: 16, 
    color: '#1C1C1E',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 15,
  }
});