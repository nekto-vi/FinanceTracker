import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as localDb from '@/services/localDb'; // Импорт твоей локальной базы

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
}

export function AuthModal({ isVisible, onClose, onLoginSuccess }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!username || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setIsLoading(true);
    const endpoint = isLogin ? 'login' : 'register';
    
    try {
      // 1. Авторизация/Регистрация на сервере
      const response = await fetch(`http://127.0.0.1:8000/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Сохраняем токен и имя
        await SecureStore.setItemAsync('userToken', data.access_token);
        await SecureStore.setItemAsync('username', data.username);

        // 2. ЗАПУСКАЕМ СИНХРОНИЗАЦИЮ
        try {
          console.log('Начало синхронизации данных...');
          const localData = await localDb.getFullDataForSync();
          
          const syncResponse = await fetch(`http://127.0.0.1:8000/auth/sync`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.access_token}` 
            },
            body: JSON.stringify(localData),
          });

          if (syncResponse.ok) {
            await localDb.clearLocalData(); // Очищаем телефон после переноса в облако
            console.log('✅ Данные успешно синхронизированы');
          }
        } catch (syncError) {
          console.error('Ошибка синхронизации:', syncError);
          // Не прерываем вход, если синхронизация не удалась, просто логируем
        }

        onLoginSuccess(data.username);
        onClose();
      } else {
        Alert.alert('Ошибка', data.detail || 'Ошибка авторизации');
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Нет связи с сервером. Проверьте запущен ли Python.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <BlurView intensity={30} style={StyleSheet.absoluteFill}>
        <View style={styles.overlay}>
          <View style={styles.content}>
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
              disabled={isLoading}
            >
              <LinearGradient colors={['#7C7BAD', '#6D6BA1']} style={styles.liquidBtn}>
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.btnText}>{isLogin ? 'Войти' : 'Зарегистрироваться'}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 20 }}>
              <Text style={styles.switchText}>
                {isLogin ? 'Ещё нет аккаунта? Регистрация' : 'Уже есть аккаунт? Войти'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ color: '#8E8E93' }}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(255,255,255,0.4)', 
    justifyContent: 'center', 
    padding: 20 
  },
  content: { 
    backgroundColor: 'white', 
    borderRadius: 32, 
    padding: 30, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10
  },
  title: { 
    fontSize: 26, 
    fontWeight: '800', 
    marginBottom: 25, 
    letterSpacing: -0.5,
    textAlign: 'center'
  },
  input: { 
    width: '100%', 
    backgroundColor: '#F2F2F7', 
    padding: 18, 
    borderRadius: 16, 
    marginBottom: 12, 
    fontSize: 16,
    color: '#000'
  },
  btnWrapper: { 
    width: '100%', 
    marginTop: 10, 
    borderRadius: 16, 
    overflow: 'hidden' 
  },
  liquidBtn: { 
    padding: 18, 
    alignItems: 'center' 
  },
  btnText: { 
    color: 'white', 
    fontWeight: '700', 
    fontSize: 17 
  },
  switchText: { 
    color: '#007AFF', 
    fontWeight: '600',
    fontSize: 15
  },
  closeBtn: { 
    marginTop: 30 
  }
});