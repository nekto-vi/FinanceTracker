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
import { API_CONFIG } from '@/constants/Config';

const formatDateForBack = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const sortAccounts = (accountList: any[]) => [...accountList].sort((firstAccount, secondAccount) => {
  const accountOrder: Record<string, number> = { Карта: 0, Наличные: 1 };
  return (accountOrder[firstAccount.name] ?? 2) - (accountOrder[secondAccount.name] ?? 2);
});

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

  const orderedAccounts = sortAccounts(accounts);

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
      const baseUrl = API_CONFIG.BASE_URL;

        const [catsRes, accsRes, summaryRes, statsRes] = await Promise.all([
          fetch(`${baseUrl}/categories?month=${month}&year=${year}`, { headers }),
          fetch(`${baseUrl}/accounts`, { headers }),
          fetch(`${baseUrl}/stats/summary?month=${month}&year=${year}`, { headers }),
          fetch(`${baseUrl}/stats/weekly?start_date=${dateStr}`, { headers })
        ]);

        if ([catsRes, accsRes, summaryRes, statsRes].some((response) => response.status === 401)) {
          await handleLogout();
          return;
        }

        if (!catsRes.ok || !accsRes.ok || !summaryRes.ok || !statsRes.ok) {
          console.error('Ошибка при обновлении данных:', {
            categories: catsRes.status,
            accounts: accsRes.status,
            summary: summaryRes.status,
            weekly: statsRes.status,
          });
          return;
        }

        const catsResponse = await catsRes.json();
        const accountsResponse = await accsRes.json();
        const summaryData = await summaryRes.json();
        const weeklyResponse = await statsRes.json();
        const catsData = Array.isArray(catsResponse) ? catsResponse : [];
        const accsData = Array.isArray(accountsResponse) ? accountsResponse : [];
        const statsData = Array.isArray(weeklyResponse) ? weeklyResponse : [];
        const sortedAccounts = sortAccounts(accsData);

        setCategories(catsData.map((category: any) => ({ ...category, icon: category.emoji })));
        setAccounts(sortedAccounts);
        setMonthlyProfit(summaryData.profit ?? 0);
        setChartData(statsData);

        if (accsData.length > 0 && selectedAccountId === null) {
          setSelectedAccountId(sortedAccounts[0].id);
        }
      } catch (e) {
        console.error("Ошибка сети:", e);
      }
  };

  useEffect(() => {
    refreshAllData(currentMonday);
  }, [currentMonday]);

  // --- ОБРАБОТЧИКИ ---


const handleOnConfirmCategory = async (newCat: any) => {
  const token = await SecureStore.getItemAsync('userToken');
  
  if (!token) {
    Alert.alert("Ошибка", "Вы не авторизованы");
    return;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        name: newCat.name,
        emoji: newCat.icon,
        color: newCat.color,
      })
    });

    if (response.ok) {
      await refreshAllData(currentMonday); 
      setAddCatModalVisible(false);
    } else {
      const errorText = await response.text();
      let errorData: { detail?: string | Array<{ msg?: string }> } = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText };
      }
      console.error("Ошибка сервера:", errorData);
      const detail = Array.isArray(errorData.detail)
        ? errorData.detail.map((item) => item.msg).filter(Boolean).join(', ')
        : errorData.detail;
      Alert.alert("Ошибка", detail || "Не удалось создать категорию");
    }
  } catch (e) {
    console.error("Ошибка сети:", e);
    Alert.alert("Ошибка", "Нет связи с сервером");
  }
};

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
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSACTIONS}`, {
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
          <MonthPicker 
            onMonthChange={handleMonthChange} 
            selectedMonth={selectedMonth} 
            selectedYear={currentMonday.getFullYear()} 
          />

        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <ProfitChart
              currentBalance={orderedAccounts.reduce((sum, account) => sum + account.balance, 0)}
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
            {orderedAccounts.map((acc) => (
              <AccountCard 
                key={acc.id}
                title={acc.name}
                amount={`${acc.balance.toLocaleString()} BYN`}
                icon={acc.name === "Карта" ? "creditcard.fill" : "dollarsign.circle.fill"}
                color={acc.name === "Карта" ? "#007AFF" : "#34C759"}
                isSelected={selectedAccountId === acc.id}
                onPress={() => {
                  setSelectedAccountId(acc.id);
                  setModalMode('expense'); 
                }} 
                onPlusPress={() => openTopUp(acc.id)} 
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
        onConfirm={handleOnConfirmCategory}
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