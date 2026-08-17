import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

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

const COLUMNS = 5;

export function ExpenseGrid({
  categories,
  onCategoryPress,
  onAddPress,
}: ExpenseGridProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: Math.ceil((categories.length + 1) / COLUMNS) }).map(
        (_, rowIndex) => {
          const start = rowIndex * COLUMNS;
          const end = start + COLUMNS;
          const rowItems = categories.slice(start, end);
          const isLastRow = end >= categories.length + 1;
          const showAddButton = isLastRow && rowItems.length < COLUMNS;

          return (
            <View key={rowIndex} style={styles.row}>
              {rowItems.map((cat) => (
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
                      { backgroundColor: cat.color + '20' }, 
                    ]}
                  >
                    <Text style={styles.icon}>{cat.icon}</Text>
                  </View>
                  <Text style={styles.amount} numberOfLines={1}>
                    {cat.amount} {cat.currency ?? 'BYN'}
                  </Text>
                </Pressable>
              ))}

              {showAddButton && (
                <Pressable style={[styles.cell, styles.addCell]} onPress={onAddPress}>
                    <View style={[styles.iconCircle, styles.addCircle]}>
                        <Text style={styles.addIcon}>+</Text>
                    </View>
                </Pressable>
              )}
            </View>
          );
        }
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
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
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  amount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  addCircle: {
    backgroundColor: '#E5E5EA',
  },
  addIcon: {
    fontSize: 28,
    color: '#8E8E93',
    fontWeight: '300',
    lineHeight: 32,
  },
  addCell: {
  paddingTop: 18, 
},
});