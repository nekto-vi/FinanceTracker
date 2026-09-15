import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { FinanceColors } from '@/constants/theme';
import { API_CONFIG } from '@/constants/Config';
import { MonthPicker } from '@/features/home/components/MonthPicker';

type FilterType = 'all' | 'expense' | 'income';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, profit: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Фильтры и поиск
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Загрузка всех данных для истории
  const fetchHistoryData = useCallback(async (month: number, year: number) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) return;

    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = API_CONFIG.BASE_URL;

      const [txRes, catsRes, accsRes, sumRes] = await Promise.all([
        fetch(`${baseUrl}/transactions/history?month=${month}`, { headers }),
        fetch(`${baseUrl}/categories?month=${month}&year=${year}`, { headers }),
        fetch(`${baseUrl}/accounts`, { headers }),
        fetch(`${baseUrl}/stats/summary?month=${month}&year=${year}`, { headers }),
      ]);

      if (txRes.ok) {
        const data = await txRes.json();
        setTransactions(Array.isArray(data) ? data : []);
      }
      if (catsRes.ok) {
        const data = await catsRes.json();
        setCategories(Array.isArray(data) ? data : []);
      }
      if (accsRes.ok) {
        const data = await accsRes.json();
        setAccounts(Array.isArray(data) ? data : []);
      }
      if (sumRes.ok) {
        const data = await sumRes.json();
        setSummary(data);
      }
    } catch (e) {
      console.error('Ошибка загрузки истории:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Автообновление при переходе на вкладку
  useFocusEffect(
    useCallback(() => {
      fetchHistoryData(selectedMonth, selectedYear);
    }, [selectedMonth, selectedYear, fetchHistoryData])
  );

  // Удаление транзакции
  const handleDelete = async (id: number) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) return;

    Alert.alert('Удалить операцию?', 'Баланс счета будет автоматически пересчитан.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/transactions/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              fetchHistoryData(selectedMonth, selectedYear);
            }
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  // Переключение месяца
  const handleMonthChange = (index: number) => {
    const newMonth = index + 1;
    setSelectedMonth(newMonth);
    fetchHistoryData(newMonth, selectedYear);
  };

  // Фильтрация и поиск
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Фильтр по типу (все / расход / доход)
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }
      // Поиск по заметке или названию категории
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const noteMatch = tx.note?.toLowerCase().includes(query);
        const cat = categories.find((c) => c.id === tx.category_id);
        const catMatch = cat?.name?.toLowerCase().includes(query);
        return noteMatch || catMatch;
      }
      return true;
    });
  }, [transactions, filterType, searchQuery, categories]);

  // Группировка транзакций по дням
  const groupedData = useMemo(() => {
    const groups: { [key: string]: { dateLabel: string; items: any[]; dayTotal: number } } = {};

    filteredTransactions.forEach((tx) => {
      const date = new Date(tx.created_at);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateLabel: formatDateHeader(date),
          items: [],
          dayTotal: 0,
        };
      }
      groups[dateKey].items.push(tx);
      if (tx.type === 'expense') {
        groups[dateKey].dayTotal -= tx.amount;
      } else {
        groups[dateKey].dayTotal += tx.amount;
      }
    });

    return Object.values(groups);
  }, [filteredTransactions]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 1. Верхний переключатель месяцев */}
      <View style={styles.header}>
        <MonthPicker
          onMonthChange={handleMonthChange}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </View>

      <FlatList
        data={groupedData}
        keyExtractor={(item, index) => `${item.dateLabel}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchHistoryData(selectedMonth, selectedYear)}
            tintColor={FinanceColors.accent}
          />
        }
        ListHeaderComponent={
          <>
            {/* 2. Сводная карточка месяца */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Доходы</Text>
                <Text style={[styles.summaryValue, { color: '#34C759' }]}>
                  +{summary.total_income.toLocaleString()} BYN
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Расходы</Text>
                <Text style={[styles.summaryValue, { color: '#FF3B30' }]}>
                  -{summary.total_expense.toLocaleString()} BYN
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Итог</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: summary.profit >= 0 ? '#007AFF' : '#FF3B30' },
                  ]}
                >
                  {summary.profit >= 0 ? '+' : ''}
                  {summary.profit.toLocaleString()} BYN
                </Text>
              </View>
            </View>

            {/* 3. Поисковая строка */}
            <View style={styles.searchBar}>
              <SymbolView name="magnifyingglass" size={17} tintColor="#8E8E93" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Поиск по заметкам и категориям..."
                placeholderTextColor="#8E8E93"
                style={styles.searchInput}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <SymbolView name="xmark.circle.fill" size={16} tintColor="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>

            {/* 4. Чипы-фильтры */}
            <View style={styles.filterChips}>
              <TouchableOpacity
                style={[styles.chip, filterType === 'all' && styles.chipActive]}
                onPress={() => setFilterType('all')}
              >
                <Text style={[styles.chipText, filterType === 'all' && styles.chipTextActive]}>
                  Все ({transactions.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, filterType === 'expense' && styles.chipActive]}
                onPress={() => setFilterType('expense')}
              >
                <Text style={[styles.chipText, filterType === 'expense' && styles.chipTextActive]}>
                  Расходы
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, filterType === 'income' && styles.chipActive]}
                onPress={() => setFilterType('income')}
              >
                <Text style={[styles.chipText, filterType === 'income' && styles.chipTextActive]}>
                  Доходы
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <SymbolView name="tray" size={32} tintColor="#8E8E93" />
              </View>
              <Text style={styles.emptyTitle}>Нет операций</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'По вашему запросу ничего не найдено'
                  : 'В этом месяце пока не было расходов и доходов'}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.dayGroup}>
            {/* Заголовок дня */}
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{item.dateLabel}</Text>
              <Text
                style={[
                  styles.dayTotal,
                  { color: item.dayTotal >= 0 ? '#34C759' : '#8E8E93' },
                ]}
              >
                {item.dayTotal > 0 ? '+' : ''}
                {item.dayTotal.toLocaleString()} BYN
              </Text>
            </View>

            {/* Карточка операций дня */}
            <View style={styles.dayCard}>
              {item.items.map((tx: any, idx: number) => {
                const isExpense = tx.type === 'expense';
                const cat = categories.find((c) => c.id === tx.category_id);
                const acc = accounts.find((a) => a.id === tx.account_id);
                const isLast = idx === item.items.length - 1;

                return (
                  <View
                    key={tx.id}
                    style={[styles.txItem, isLast && { borderBottomWidth: 0 }]}
                  >
                    {/* Иконка категории/счета */}
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: isExpense
                            ? (cat?.color || '#FF9500') + '20'
                            : '#34C75920',
                        },
                      ]}
                    >
                      {isExpense ? (
                        <Text style={styles.iconEmoji}>{cat?.emoji || cat?.icon || '🛒'}</Text>
                      ) : (
                        <SymbolView name="dollarsign.circle.fill" size={22} tintColor="#34C759" />
                      )}
                    </View>

                    {/* Название и заметка */}
                    <View style={styles.txInfo}>
                      <Text style={styles.txTitle} numberOfLines={1}>
                        {isExpense ? cat?.name || 'Расход' : 'Пополнение'}
                      </Text>
                      <View style={styles.txSubtitleRow}>
                        <Text style={styles.txAccount}>{acc?.name || 'Счет'}</Text>
                        {tx.note ? (
                          <>
                            <Text style={styles.txDot}>•</Text>
                            <Text style={styles.txNote} numberOfLines={1}>
                              {tx.note}
                            </Text>
                          </>
                        ) : null}
                      </View>
                    </View>

                    {/* Сумма и время */}
                    <View style={styles.txAmountCol}>
                      <Text
                        style={[
                          styles.txAmount,
                          { color: isExpense ? '#000000' : '#34C759' },
                        ]}
                      >
                        {isExpense ? '-' : '+'}
                        {tx.amount.toLocaleString()} BYN
                      </Text>
                      <Text style={styles.txTime}>{formatTime(tx.created_at)}</Text>
                    </View>

                    {/* Кнопка быстрого удаления */}
                    <TouchableOpacity
                      onPress={() => handleDelete(tx.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.deleteBtn}
                    >
                      <SymbolView name="trash" size={16} tintColor="#C7C7CC" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// Форматирование заголовка даты
const formatDateHeader = (d: Date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (target.getTime() === today.getTime()) return 'Сегодня';
  if (target.getTime() === yesterday.getTime()) return 'Вчера';

  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  });
};

// Форматирование времени
const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FinanceColors.backgroundGrouped,
  },
  header: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: FinanceColors.backgroundGrouped,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  // Сводная карточка
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Поиск
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 42,
    marginTop: 6,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    paddingVertical: 0,
  },
  // Фильтры-чипы
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#E5E5EA',
  },
  chipActive: {
    backgroundColor: FinanceColors.accent,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  // Группа по дням
  dayGroup: {
    marginBottom: 18,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  dayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dayTotal: {
    fontSize: 13,
    fontWeight: '600',
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingLeft: 14,
    paddingRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F2F2F7',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 22,
  },
  txInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  txSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txAccount: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  txDot: {
    fontSize: 12,
    color: '#C7C7CC',
    marginHorizontal: 4,
  },
  txNote: {
    fontSize: 12,
    color: '#8E8E93',
    flex: 1,
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  txTime: {
    fontSize: 11,
    color: '#C7C7CC',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});