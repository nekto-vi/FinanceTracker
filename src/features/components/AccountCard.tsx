import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SymbolView, SFSymbol } from 'expo-symbols';
import { FinanceColors } from '@/constants/theme';

interface AccountCardProps {
  title: string;
  amount: string;
  icon: SFSymbol;
  color: string;
  isSelected?: boolean;
  onPress?: () => void; 
}

export function AccountCard({ 
  title, 
  amount, 
  icon, 
  color, 
  isSelected, 
  onPress 
}: AccountCardProps) {
  
  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.container,
        isSelected && { borderColor: color },
        { opacity: pressed ? 0.8 : 1 }
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: `${color}15` }]}>
        <SymbolView 
          name={icon} 
          size={22} 
          tintColor={color} 
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.amount} numberOfLines={1}>
          {amount}
        </Text>
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
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    margin: 4,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: { 
    marginLeft: 12,
    flex: 1,
  },
  title: { 
    color: FinanceColors.textMuted, 
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2
  },
  amount: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: FinanceColors.textPrimary 
  },
});