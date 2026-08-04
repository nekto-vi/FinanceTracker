import { FinanceColors } from '@/constants/theme';
import { AccountCard } from '@/features/components/AccountCard';
import { ProfitChart } from '@/features/components/ProfitChart';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CHART_DATA = [
  {
    label: 'Пн',
    segments: [
      { categoryId: 'food', amount: 30, color: '#FF9500' },
      { categoryId: 'transport', amount: 20, color: '#FF3B30' },
      { categoryId: 'mobile', amount: 35, color: '#5856D6' },
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
  },
  {
    label: 'Ср',
    segments: [
      { categoryId: 'food', amount: 20, color: '#FF9500' },
      { categoryId: 'mobile', amount: 10, color: '#5856D6' },
    ],
  },
  {
    label: 'Чт',
    segments: [
      { categoryId: 'entertainment', amount: 40, color: '#FF6482' },
      { categoryId: 'food', amount: 35, color: '#FF9500' },
      { categoryId: 'transport', amount: 25, color: '#FF3B30' },
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
  },
  {
    label: 'Сб',
    segments: [
      { categoryId: 'sport', amount: 15, color: '#F5A623' },
      { categoryId: 'food', amount: 10, color: '#FF9500' },
    ],
  },
  {
    label: 'Вс',
    segments: [{ categoryId: 'home', amount: 12, color: '#C75B39' }],
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Июль</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
        <Text style={{ color: 'grey' }}>Сетка расходов (в разработке...)</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FinanceColors.backgroundGrouped,
  },
  header: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: FinanceColors.card,
    borderRadius: 25,
    marginTop: 10,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
  },
  accountsRow: {
    flexDirection: 'row',
    gap: 12,
  },
});