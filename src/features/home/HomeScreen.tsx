import { FinanceColors } from '@/constants/theme';
import { AccountCard } from '@/features/components/AccountCard';
import { ChartDay, ProfitChart } from '@/features/components/ProfitChart';
import { ExpenseGrid } from '@/features/components/ExpenseGrid';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { AIAgentFab } from '../components/AIAgentFab';
import { AddCategoryModal } from './components/AddCategoryModal';
import { useState, useEffect } from 'react';
import { MonthPicker } from './components/MonthPicker';
import { AddExpenseModal } from '@/features/home/AddExpenseModal';

const formatDateForBack = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export default function HomeScreen() {
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

  const getWeekRangeLabel = (monday: Date) => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const formatDate = (d: Date) =>
      `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    return `${formatDate(monday)} – ${formatDate(sunday)}`;
  };

  const refreshAllData = async (monday: Date) => {
    const dateStr = formatDateForBack(monday);
    const month = monday.getMonth() + 1;
    const year = monday.getFullYear();

    if (month !== selectedMonth) {
      setSelectedMonth(month);
    }

    try {
      const [catsRes, accsRes, summaryRes, statsRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/categories?month=${month}&year=${year}`),
        fetch('http://127.0.0.1:8000/accounts'),
        fetch(`http://127.0.0.1:8000/stats/summary?month=${month}&year=${year}`),
        fetch(`http://127.0.0.1:8000/stats/weekly?start_date=${dateStr}`)
      ]);

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
  }, []);

  const handleMonthChange = (index: number) => {
    const newMonth = index + 1;
    if (newMonth === selectedMonth) return;

    const firstDayOfMonth = new Date(new Date().getFullYear(), index, 1);
    const day = firstDayOfMonth.getDay();
    const diff = firstDayOfMonth.getDate() - day + (day === 0 ? -6 : 1);
    const firstMonday = new Date(firstDayOfMonth.setDate(diff));

    setCurrentMonday(firstMonday);
    refreshAllData(firstMonday);
  };

  const handlePrevWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(next);
    refreshAllData(next);
  };

  const handleNextWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(next);
    refreshAllData(next);
  };

  const handleSaveExpense = async (data: any) => {
    if (!selectedAccountId || !selectedCategory) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: data.amount,
          account_id: selectedAccountId,
          category_id: selectedCategory.id,
          note: data.note,   
          date: data.date,
          type: "expense"
        }),
      });

      if (response.ok) {
        await refreshAllData(currentMonday); 
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
          <MonthPicker 
            onMonthChange={handleMonthChange} 
            selectedMonth={selectedMonth} 
          />
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