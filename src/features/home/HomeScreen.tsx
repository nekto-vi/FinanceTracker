import { FinanceColors } from '@/constants/theme';
import { AccountCard } from '@/features/components/AccountCard';
import { ProfitChart } from '@/features/components/ProfitChart';
import { ExpenseGrid } from '@/features/components/ExpenseGrid';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AIAgentFab } from '../components/AIAgentFab';
import { AddCategoryModal } from './components/AddCategoryModal';
import { useState, useEffect } from 'react';
import { MonthPicker } from './components/MonthPicker';
import { AddExpenseModal } from '@/features/home/AddExpenseModal';

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

export default function HomeScreen() {
  // 1. Стейты
 const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null); 
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isAddCatModalVisible, setAddCatModalVisible] = useState(false);
  
  const fetchData = async () => {
  try {
    const catsRes = await fetch('http://127.0.0.1:8000/categories');
    const catsText = await catsRes.text();
    console.log('Raw Categories Response:', catsText); 
    const catsData = JSON.parse(catsText); 

    const accsRes = await fetch('http://127.0.0.1:8000/accounts');
    const accsText = await accsRes.text();
    console.log('Raw Accounts Response:', accsText);
    const accsData = JSON.parse(accsText);

    setCategories(catsData.map((c: any) => ({ ...c, icon: c.emoji })));
    setAccounts(accsData);
    
    if (accsData.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accsData[0].id);
    }
  } catch (e) {
    console.error("Ошибка при загрузке данных:", e);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

const handleSaveExpense = async (amount: number) => {
    if (!selectedAccountId || !selectedCategory) {
      alert("Сначала выберите счет и категорию!");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          account_id: selectedAccountId,
          category_id: selectedCategory.id,
          type: "expense"
        }),
      });

      if (response.ok) {
        fetchData(); 
        setSelectedCategory(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
            <MonthPicker onMonthChange={(i) => console.log(i)} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {}

          <Text style={styles.sectionTitle}>Счета</Text>
          <View style={styles.accountsRow}>
            {accounts.map((acc) => (
              <AccountCard 
                key={acc.id}
                title={acc.name}
                amount={`${acc.balance.toLocaleString()} BYN`}
                icon={acc.name === "Карта" ? "creditcard.fill" : "dollarsign.circle.fill"}
                color={acc.name === "Карта" ? "#007AFF" : "#34C759"}
                isSelected={selectedAccountId === acc.id}
                onPress={() => setSelectedAccountId(acc.id)} 
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Расходы</Text>
          <ExpenseGrid
            categories={categories}
            onCategoryPress={(id) => {
              const cat = categories.find((c) => String(c.id) === String(id));
              setSelectedCategory(cat);
            }}
            onAddPress={() => setAddCatModalVisible(true)}
          />
        </ScrollView>
      </View>

      <AddCategoryModal 
        isVisible={isAddCatModalVisible}
        onClose={() => setAddCatModalVisible(false)}
        onConfirm={async (newCat) => {
            await fetch('http://127.0.0.1:8000/categories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newCat)
            });
            fetchData();
            setAddCatModalVisible(false);
        }}
      />

      <AddExpenseModal 
        isVisible={!!selectedCategory}
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
        onSave={handleSaveExpense}
      />
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
    marginBottom: 5,
  },
});