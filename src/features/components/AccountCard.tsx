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
}

export function AccountCard({ title, amount, icon, color, isSelected, onPress }: Props) {
  return (
    <Pressable 
      onPress={onPress} 
      style={[
        styles.container, 
        isSelected && { borderColor: color, borderWidth: 2 } 
      ]}
    >
      <SymbolView name={icon} size={24} tintColor={color + '80'} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.amount}>{amount}</Text>
      </View>
    </Pressable>
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
    borderWidth: 2,
    borderColor: 'transparent', 
  },
  textContainer: { 
    marginLeft: 10 
  },
  title: { 
    color: FinanceColors.textMuted, 
    fontSize: 12 
  },
  amount: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: FinanceColors.textPrimary 
  },
});