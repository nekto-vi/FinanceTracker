import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FinanceColors } from '@/constants/theme';
import { SymbolView } from 'expo-symbols';
import { AuthModal } from './AuthModal';
import { useAuth } from '@/context/AuthContext';

export default function SettingsScreen() {
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const { username, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut(); 
  };

  const SettingItem = ({ icon, title, value, onPress, color = "#8E8E93", isLast = false }: any) => (
    <TouchableOpacity 
      style={[styles.item, isLast && { borderBottomWidth: 0 }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <SymbolView name={icon} size={20} tintColor={color} />
      </View>
      <Text style={styles.itemTitle}>{title}</Text>
      <View style={styles.rightContent}>
        {value && <Text style={styles.itemValue}>{value}</Text>}
        <SymbolView name="chevron.right" size={14} tintColor="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Настройки</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>АККАУНТ</Text>
          <View style={styles.card}>
            {username ? (
              <>
                <SettingItem 
                  icon="person.fill" 
                  title="Профиль" 
                  value={username} 
                  color="#007AFF" 
                />
                <SettingItem 
                  icon="rectangle.portrait.and.arrow.right" 
                  title="Выйти" 
                  onPress={handleLogout} 
                  color="#FF3B30" 
                  isLast 
                />
              </>
            ) : (
              <SettingItem 
                icon="person.crop.circle.badge.plus" 
                title="Войти в профиль" 
                onPress={() => setIsAuthVisible(true)} 
                color="#007AFF" 
                isLast 
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ОБЩЕЕ</Text>
          <View style={styles.card}>
            <SettingItem icon="dollarsign.circle.fill" title="Валюта" value="BYN" color="#34C759" />
            <SettingItem icon="paintbrush.fill" title="Тема" value="Светлая" color="#AF52DE" />
            <SettingItem icon="bell.fill" title="Уведомления" color="#FF9500" isLast />
          </View>
        </View>
      </ScrollView>

      <AuthModal 
        isVisible={isAuthVisible} 
        onClose={() => setIsAuthVisible(false)} 
        onLoginSuccess={() => {}} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F2F2F7' 
  },
  scroll: { 
    padding: 20 
  },
  header: { 
    fontSize: 34, 
    fontWeight: '800', 
    marginBottom: 20, 
    letterSpacing: 0.5 
  },
  section: { 
    marginBottom: 25 
  },
  sectionLabel: { 
    fontSize: 13, 
    color: '#8E8E93', 
    marginBottom: 8, 
    marginLeft: 10, 
    fontWeight: '500',
    textTransform: 'uppercase'
  },
  card: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    overflow: 'hidden' 
  },
  item: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    marginLeft: 15,
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderBottomColor: '#C7C7CC' 
  },
  iconBox: { 
    width: 32, 
    height: 32, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  itemTitle: { 
    flex: 1, 
    fontSize: 17, 
    color: '#000' 
  },
  rightContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  itemValue: { 
    fontSize: 17, 
    color: '#8E8E93', 
    marginRight: 8 
  }
});