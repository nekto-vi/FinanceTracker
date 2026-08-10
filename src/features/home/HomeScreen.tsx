import { FinanceColors } from '@/constants/theme';
import { AccountCard } from '@/features/components/AccountCard';
import { ChartDay, ProfitChart } from '@/features/components/ProfitChart';
import { ExpenseGrid } from '@/features/components/ExpenseGrid';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AIAgentFab } from '../components/AIAgentFab';
import { AddCategoryModal } from './components/AddCategoryModal';
import { useState, useEffect } from 'react';
import { MonthPicker } from './components/MonthPicker';
import { AddExpenseModal } from '@/features/home/AddExpenseModal';

export default function HomeScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null); 
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isAddCatModalVisible, setAddCatModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [chartData, setChartData] = useState<ChartDay[]>([]);
  const [monthlyProfit, setMonthlyProfit] = useState(0);
  
  const fetchData = async (month: number) => {
  try {
    console.log(`Загрузка данных за месяц: ${month}`);

    const catsRes = await fetch(`http://127.0.0.1:8000/categories?month=${month}`);
    const catsText = await catsRes.text();
    console.log('Raw Categories Response:', catsText); 
    const catsData = JSON.parse(catsText); 

    const accsRes = await fetch('http://127.0.0.1:8000/accounts');
    const accsText = await accsRes.text();
    console.log('Raw Accounts Response:', accsText);
    const accsData = JSON.parse(accsText);

    const statsRes = await fetch(`http://127.0.0.1:8000/stats/summary?month=${month}`);
    const statsData = await statsRes.json();
    setMonthlyProfit(statsData.profit); 

    setCategories(catsData.map((c: any) => ({ ...c, icon: c.emoji })));
    setAccounts(accsData);
    
    if (accsData.length > 0 && selectedAccountId === null) {
        setSelectedAccountId(accsData[0].id);
      }
    } catch (e) {
      console.error("Ошибка при загрузке данных:", e);
    }
};

  useEffect(() => {
      fetchData(selectedMonth);
    }, []); 

  const handleMonthChange = (index: number) => {
    const monthNumber = index + 1;
    setSelectedMonth(monthNumber);
    fetchData(monthNumber); 
  };

const handleSaveExpense = async (amount: number) => {
    if (!selectedAccountId || !selectedCategory) return;
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
        fetchData(selectedMonth); 
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
            <MonthPicker onMonthChange={handleMonthChange}/>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <ProfitChart
              currentBalance={accounts.reduce((sum, a) => sum + a.balance, 0)}
              monthlyProfit={monthlyProfit}
              weekRange="Текущая неделя"
              data={chartData}
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
            fetchData(selectedMonth);
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