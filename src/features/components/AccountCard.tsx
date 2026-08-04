import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SymbolView, SFSymbol } from 'expo-symbols'; // Импортируем SFSymbol
import { FinanceColors } from '@/constants/theme';

interface Props {
  title: string;
  amount: string;
  icon: SFSymbol; // Используем правильное имя типа
  color: string;
}

export function AccountCard({ title, amount, icon, color }: Props) {
  return (
    <View style={styles.container}>
      {/* Добавляем иконку. color + '80' делает её полупрозрачной */}
      <SymbolView name={icon} size={24} tintColor={color + '80'} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.amount}>{amount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FinanceColors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 10,
  },
  title: {
    color: FinanceColors.textMuted,
    fontSize: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: FinanceColors.textPrimary,
  },
});