import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { FinanceColors } from '@/constants/theme';
import { AccountCard } from '@/features/components/AccountCard';
import { ChartDay, ProfitChart } from '@/features/components/ProfitChart';
import { ExpenseGrid } from '@/features/components/ExpenseGrid';
import { AIAgentFab } from '../components/AIAgentFab';
import { AddCategoryModal } from './components/AddCategoryModal';
import { MonthPicker } from './components/MonthPicker';
import { AddExpenseModal } from '@/features/home/AddExpenseModal';
import { useAuth } from '@/context/AuthContext';

const formatDateForBack = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  // --- СОСТОЯНИЯ ---
  const [currentMonday, setCurrentMonday] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay(); 
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.getFullYear(), today.getMonth(), diff);
  });

  const [selectedMonth, setSelectedMonth] = useState(currentMonday.getMonth() + 1);
  const [chartData, setChartData] = useState<ChartDay[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [monthlyProfit, setMonthlyProfit] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isAddCatModalVisible, setAddCatModalVisible] = useState(false);
  
  // Режим модалки: трата или доход
  const [modalMode, setModalMode] = useState<'expense' | 'income'>('expense');

  const handleLogout = async () => {
    await signOut();
  };

  const refreshAllData = async (monday: Date) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) return;

    const month = monday.getMonth() + 1;
    const year = monday.getFullYear();
    const dateStr = formatDateForBack(monday);

    if (month !== selectedMonth) setSelectedMonth(month);

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [catsRes, accsRes, summaryRes, statsRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/categories?month=${month}&year=${year}`, { headers }),
        fetch('http://127.0.0.1:8000/accounts', { headers }),
        fetch(`http://127.0.0.1:8000/stats/summary?month=${month}&year=${year}`, { headers }),
        fetch(`http://127.0.0.1:8000/stats/weekly?start_date=${dateStr}`, { headers })
      ]);

      if (catsRes.status === 401) {
        handleLogout();
        return;
      }

      const catsData = await catsRes.json();
      const accsData = await accsRes.json();
      const summaryData = await summaryRes.json();
      const statsData = await statsRes.json();

      setCategories(catsData.map((c: any) => ({ ...c, icon: c.emoji })));
      setAccounts(accsData);
      setMonthlyProfit(summaryData.profit);
      setChartData(statsData);

      if (accsData.length > 0 && selectedAccountId === null) {
        setSelectedAccountId(accsData[0].id);
      }
    } catch (e) {
      console.error("Ошибка при обновлении данных:", e);
    }
  };

  useEffect(() => {
    refreshAllData(currentMonday);
  }, [currentMonday]);

  // --- ОБРАБОТЧИКИ ---

  const handleMonthChange = (index: number) => {
    const newMonth = index + 1;
    const firstDay = new Date(new Date().getFullYear(), index, 1);
    const day = firstDay.getDay();
    const diff = firstDay.getDate() - day + (day === 0 ? -6 : 1);
    const firstMonday = new Date(firstDay.getFullYear(), firstDay.getMonth(), diff);
    setCurrentMonday(firstMonday);
  };

  const handlePrevWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(next);
  };

  const handleNextWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(next);
  };

  const handleSaveExpense = async (data: any) => {
    if (!selectedAccountId) return;
    const token = await SecureStore.getItemAsync('userToken');

    try {
      const response = await fetch('http://127.0.0.1:8000/transactions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          amount: data.amount,
          account_id: data.account_id,
          category_id: data.category_id, // Может быть null для дохода
          note: data.note,   
          date: data.date,
          type: data.type // Используем тип из модалки (income/expense)
        }),
      });

      if (response.ok) {
        refreshAllData(currentMonday); 
        setSelectedCategory(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Открытие окна пополнения баланса
  const openTopUp = (accId: number) => {
    setSelectedAccountId(accId);
    setModalMode('income');
    // Используем фейковую категорию, чтобы сработал isVisible модалки
    setSelectedCategory({ name: 'Пополнение', id: null });
  };

  const getWeekRangeLabel = (monday: Date) => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const formatDate = (d: Date) =>
      `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    return `${formatDate(monday)} – ${formatDate(sunday)}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <MonthPicker onMonthChange={handleMonthChange} selectedMonth={selectedMonth} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <ProfitChart
              currentBalance={accounts.reduce((sum, a) => sum + a.balance, 0)}
              monthlyProfit={monthlyProfit}
              weekRange={getWeekRangeLabel(currentMonday)} 
              data={chartData}
              onPrevWeek={handlePrevWeek} 
              onNextWeek={handleNextWeek} 
              currency="BYN"
            />
          </View>

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
                onPress={() => {
                  setSelectedAccountId(acc.id);
                  setModalMode('expense'); // Если просто выбираем, то для будущей траты
                }} 
                onPlusPress={() => openTopUp(acc.id)} // Нажатие на плюс
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Расходы</Text>
          <ExpenseGrid
            categories={categories}
            onCategoryPress={(id) => {
              const cat = categories.find((c) => String(c.id) === String(id));
              setModalMode('expense');
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
            const token = await SecureStore.getItemAsync('userToken');
            await fetch('http://127.0.0.1:8000/categories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(newCat)
            });
            refreshAllData(currentMonday); 
            setAddCatModalVisible(false);
        }}
      />

      <AddExpenseModal 
        allCategories={categories}
        allAccounts={accounts}
        isVisible={!!selectedCategory}
        category={selectedCategory}
        account={accounts.find(a => a.id === selectedAccountId)} 
        initialType={modalMode}
        onClose={() => setSelectedCategory(null)}
        onSave={handleSaveExpense}
      />
      <AIAgentFab />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FinanceColors.backgroundGrouped
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 20
  },
  header: {
    paddingVertical: 10,
    alignItems: 'center'
  },
  card: {
    backgroundColor: FinanceColors.card,
    borderRadius: 25,
    marginTop: 5,
    overflow: 'hidden'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8
  },
  accountsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 5
  }
});