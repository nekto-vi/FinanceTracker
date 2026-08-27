import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_W - 40 - 48) / 5;

export type ExpenseCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
  currency?: string;
};

type ExpenseGridProps = {
  categories: ExpenseCategory[];
  onCategoryPress?: (id: string) => void;
  onAddPress?: () => void;
};

export function ExpenseGrid({
  categories,
  onCategoryPress,
  onAddPress,
}: ExpenseGridProps) {
  return (
    <View style={styles.container}>
      {categories.map((cat) => (
        <Pressable
          key={cat.id}
          style={styles.cell}
          onPress={() => onCategoryPress?.(cat.id)}
        >
          <Text style={styles.name} numberOfLines={1}>
            {cat.name}
          </Text>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: cat.color + '20' }, // 20 = 12% opacity
            ]}
          >
            <Text style={styles.icon}>{cat.icon}</Text>
          </View>
          <Text style={styles.amount} numberOfLines={1}>
            {cat.amount} {cat.currency ?? 'BYN'}
          </Text>
        </Pressable>
      ))}

      {/* Кнопка добавить */}
      <Pressable style={styles.cell} onPress={onAddPress}>
        <Text style={styles.name}></Text>
        <View style={[styles.iconCircle, styles.addCircle]}>
          <Text style={styles.addIcon}>+</Text>
        </View>
        <Text style={styles.amount}></Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', 
    gap: 12, 
  },
  cell: {
    width: COLUMN_WIDTH, 
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
  name: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  amount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  addCircle: {
    backgroundColor: '#F2F2F7',
  },
  addIcon: {
    fontSize: 30,
    color: '#8E8E93',
    fontWeight: '300',
  },
});