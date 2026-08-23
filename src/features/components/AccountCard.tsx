// src/features/components/AccountCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SymbolView, SFSymbol } from 'expo-symbols';
import { FinanceColors } from '@/constants/theme';

interface Props {
  title: string;
  amount: string;
  icon: SFSymbol;
  color: string;
  isSelected?: boolean;
  onPress?: () => void;
  onPlusPress?: () => void; 
}

export function AccountCard({ title, amount, icon, color, isSelected, onPress, onPlusPress }: Props) {
  return (
    <Pressable 
      onPress={onPress} 
      style={[
        styles.container, 
        isSelected && { borderColor: color, borderWidth: 2 }
      ]}
    >
      <SymbolView name={icon} size={24} tintColor={color} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.amount}>{amount}</Text>
      </View>
      
      {/* Кнопка пополнения */}
      <Pressable 
        onPress={onPlusPress} 
        style={({pressed}) => [styles.plusBtn, pressed && {opacity: 0.5}]}
      >
        <SymbolView name="plus.circle.fill" size={22} tintColor="#34C759" />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  textContainer: { flex: 1, marginLeft: 10 },
  title: { color: '#8E8E93', fontSize: 12 },
  amount: { fontSize: 15, fontWeight: 'bold', color: '#000' },
  plusBtn: {
    padding: 4,
  }
});