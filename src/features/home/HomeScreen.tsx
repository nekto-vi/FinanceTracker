import { FinanceColors } from '@/constants/theme';
import { AccountCard } from '@/features/components/AccountCard';
import { ProfitChart } from '@/features/components/ProfitChart';
import { ExpenseGrid } from '@/features/components/ExpenseGrid';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AIAgentFab } from '../components/AIAgentFab';
import { AddCategoryModal } from './components/AddCategoryModal';
import { useState } from 'react';
import { MonthPicker } from './components/MonthPicker';

const CHART_DATA = [
  {
    label: 'Пн',
    segments: [
      { categoryId: 'food', amount: 30, color: '#FF9500' },
      { categoryId: 'transport', amount: 20, color: '#FF3B30' },
      { categoryId: 'mobile', amount: 35, color: '#5856D6' },
    ],
    transactions: [
      { id: '1', categoryId: 'food', categoryName: 'Еда', amount: 30, color: '#FF9500', note: 'Обед в кафе', time: '12:30' },
      { id: '2', categoryId: 'transport', categoryName: 'Транспорт', amount: 20, color: '#FF3B30', note: 'Такси', time: '09:15' },
      { id: '3', categoryId: 'mobile', categoryName: 'Связь', amount: 35, color: '#5856D6', note: 'Пополнение', time: '14:00' },
    ],
  },
  {
    label: 'Вт',
    segments: [
      { categoryId: 'shopping', amount: 45, color: '#FF2D92' },
      { categoryId: 'food', amount: 25, color: '#FF9500' },
      { categoryId: 'transport', amount: 15, color: '#FF3B30' },
      { categoryId: 'health', amount: 25, color: '#FF6B35' },
    ],
    transactions: [
      { id: '4', categoryId: 'shopping', categoryName: 'Шоппинг', amount: 45, color: '#FF2D92', note: 'Zara', time: '16:00' },
      { id: '5', categoryId: 'food', categoryName: 'Еда', amount: 25, color: '#FF9500', note: 'Продукты', time: '18:30' },
      { id: '6', categoryId: 'transport', categoryName: 'Транспорт', amount: 15, color: '#FF3B30', note: 'Автобус', time: '08:00' },
      { id: '7', categoryId: 'health', categoryName: 'Здоровье', amount: 25, color: '#FF6B35', note: 'Аптека', time: '19:00' },
    ],
  },
  {
    label: 'Ср',
    segments: [
      { categoryId: 'food', amount: 20, color: '#FF9500' },
      { categoryId: 'mobile', amount: 10, color: '#5856D6' },
    ],
    transactions: [
      { id: '8', categoryId: 'food', categoryName: 'Еда', amount: 20, color: '#FF9500', note: 'Кофе', time: '10:00' },
      { id: '9', categoryId: 'mobile', categoryName: 'Связь', amount: 10, color: '#5856D6', note: 'Интернет', time: '11:00' },
    ],
  },
  {
    label: 'Чт',
    segments: [
      { categoryId: 'entertainment', amount: 40, color: '#FF6482' },
      { categoryId: 'food', amount: 35, color: '#FF9500' },
      { categoryId: 'transport', amount: 25, color: '#FF3B30' },
    ],
    transactions: [
      { id: '10', categoryId: 'entertainment', categoryName: 'Отдых', amount: 40, color: '#FF6482', note: 'Кино', time: '20:00' },
      { id: '11', categoryId: 'food', categoryName: 'Еда', amount: 35, color: '#FF9500', note: 'Ужин', time: '21:00' },
      { id: '12', categoryId: 'transport', categoryName: 'Транспорт', amount: 25, color: '#FF3B30', note: 'Бензин', time: '08:30' },
    ],
  },
  {
    label: 'Пт',
    segments: [
      { categoryId: 'gifts', amount: 50, color: '#E83F3F' },
      { categoryId: 'food', amount: 30, color: '#FF9500' },
      { categoryId: 'shopping', amount: 20, color: '#FF2D92' },
      { categoryId: 'transport', amount: 25, color: '#FF3B30' },
    ],
    transactions: [
      { id: '13', categoryId: 'gifts', categoryName: 'Подарки', amount: 50, color: '#E83F3F', note: 'На день рождения', time: '15:00' },
      { id: '14', categoryId: 'food', categoryName: 'Еда', amount: 30, color: '#FF9500', note: 'Пицца', time: '19:00' },
      { id: '15', categoryId: 'shopping', categoryName: 'Шоппинг', amount: 20, color: '#FF2D92', note: 'Косметика', time: '14:00' },
      { id: '16', categoryId: 'transport', categoryName: 'Транспорт', amount: 25, color: '#FF3B30', note: 'Парковка', time: '13:00' },
    ],
  },
  {
    label: 'Сб',
    segments: [
      { categoryId: 'sport', amount: 15, color: '#F5A623' },
      { categoryId: 'food', amount: 10, color: '#FF9500' },
    ],
    transactions: [
      { id: '17', categoryId: 'sport', categoryName: 'Спорт', amount: 15, color: '#F5A623', note: 'Абонемент', time: '10:00' },
      { id: '18', categoryId: 'food', categoryName: 'Еда', amount: 10, color: '#FF9500', note: 'Вода', time: '12:00' },
    ],
  },
  {
    label: 'Вс',
    segments: [{ categoryId: 'home', amount: 12, color: '#C75B39' }],
    transactions: [
      { id: '19', categoryId: 'home', categoryName: 'Дом', amount: 12, color: '#C75B39', note: 'Мыло', time: '11:00' },
    ],
  },
];

const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Еда', icon: '🍔', color: '#FF9500', amount: 120 },
  { id: 'transport', name: 'Транспорт', icon: '🚗', color: '#FF3B30', amount: 45 },
  { id: 'shopping', name: 'Шоппинг', icon: '🛍️', color: '#FF2D92', amount: 210 },
  { id: 'health', name: 'Здоровье', icon: '💊', color: '#FF6B35', amount: 15 },
  { id: 'home', name: 'Дом', icon: '🏠', color: '#C75B39', amount: 80 },
  { id: 'sport', name: 'Спорт', icon: '🏀', color: '#F5A623', amount: 60 },
  { id: 'mobile', name: 'Связь', icon: '📱', color: '#5856D6', amount: 25 },
  { id: 'entertainment', name: 'Отдых', icon: '🍿', color: '#FF6482', amount: 110 },
  { id: 'gifts', name: 'Подарки', icon: '🎁', color: '#E83F3F', amount: 50 },
];

export default function HomeScreen() {
    const handleMonthChange = (index: number) => {
    console.log('Выбран месяц с индексом:', index);
    // Здесь позже будем фильтровать данные
  };
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  const handleAddCategory = (newCat: any) => {
    console.log('Создаем категорию:', newCat);
    // Здесь будет логика сохранения в твой стейт или БД
    setAddModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.wrapper}>
        <View>
          <View style={styles.header}>
            <MonthPicker onMonthChange={handleMonthChange} />
          </View>

          <View style={styles.card}>
            <ProfitChart
              currentBalance={500}
              monthlyProfit={3400}
              weekRange="1 – 7 июля"
              data={CHART_DATA}
              currency="BYN"
            />
          </View>

          <Text style={styles.sectionTitle}>Счета</Text>
          <View style={styles.accountsRow}>
            <AccountCard title="Карта" amount="$4,280" icon="creditcard.fill" color="#007AFF" />
            <AccountCard title="Наличные" amount="320 BYN" icon="dollarsign.circle.fill" color="#34C759" />
          </View>

          <Text style={styles.sectionTitle}>Расходы</Text>
        </View>

        <ScrollView
          style={styles.gridScroll}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          <ExpenseGrid
            categories={EXPENSE_CATEGORIES}
            onCategoryPress={(id) => console.log('Категория:', id)}
            onAddPress={() => setAddModalVisible(true)}
          />
        </ScrollView>
      </View>
      <AddCategoryModal 
        isVisible={isAddModalVisible}
        onClose={() => setAddModalVisible(false)}
        onConfirm={handleAddCategory}
      />
      <AIAgentFab /> 
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FinanceColors.backgroundGrouped,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  card: {
    backgroundColor: FinanceColors.card,
    borderRadius: 25,
    marginTop: 5,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  accountsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridScroll: {
    flex: 1,
  },
  gridContent: {
    paddingBottom: 20,
  },
});