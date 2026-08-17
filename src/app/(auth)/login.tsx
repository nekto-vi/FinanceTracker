import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  // Используем функцию signIn из нашего контекста
  const { signIn } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!username || !password) {
      Alert.alert('Ошибка', 'Введите логин и пароль');
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? 'login' : 'register';

    try {
      const response = await fetch(`http://127.0.0.1:8000/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Вызываем signIn из контекста. 
        // Эта функция сама сохранит токен и МГНОВЕННО обновит всё приложение.
        // Переход в (tabs) произойдет автоматически благодаря NavigationGuard в _layout.tsx
        await signIn(data.access_token, data.username);
      } else {
        Alert.alert('Ошибка', data.detail || 'Неверные данные');
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Сервер не отвечает. Проверьте соединение.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Finance AI</Text>
        <Text style={styles.title}>{isLogin ? 'С возвращением' : 'Создать аккаунт'}</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="Логин" 
          value={username} 
          onChangeText={setUsername} 
          autoCapitalize="none"
          placeholderTextColor="#C7C7CC"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Пароль" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry
          placeholderTextColor="#C7C7CC"
        />

        <TouchableOpacity 
          style={styles.btnWrapper} 
          onPress={handleAuth}
          disabled={loading}
        >
          <LinearGradient colors={['#7C7BAD', '#6D6BA1']} style={styles.liquidBtn}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnText}>{isLogin ? 'Войти' : 'Зарегистрироваться'}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{marginTop: 25}}>
          <Text style={styles.switchText}>
            {isLogin ? 'Нет аккаунта? Создать' : 'Уже есть профиль? Войти'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 40, fontWeight: '900', color: '#6D6BA1', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 40, color: '#1C1C1E' },
  input: { 
    width: '100%', 
    backgroundColor: 'white', 
    padding: 18, 
    borderRadius: 16, 
    marginBottom: 15, 
    fontSize: 16, 
    color: '#000',
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10 
  },
  btnWrapper: { width: '100%', borderRadius: 16, overflow: 'hidden', marginTop: 10 },
  liquidBtn: { padding: 18, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: '700', fontSize: 17 },
  switchText: { color: '#007AFF', fontWeight: '600' }
});