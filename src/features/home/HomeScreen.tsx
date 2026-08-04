import { FinanceColors } from '@/constants/theme';
import { AccountCard } from '@/features/components/AccountCard';
import { ProfitChart } from '@/features/components/ProfitChart';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Июль</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Карточка графика */}
        <View style={styles.card}>
          <ProfitChart />
        </View>

        <Text style={styles.sectionTitle}>Счета</Text>
        <View style={styles.accountsRow}>
          <AccountCard title="Карта" amount="$4,280" icon="creditcard.fill" color="#007AFF" />
          <AccountCard title="Наличные" amount="320 BYN" icon="dollarsign.circle.fill" color="#34C759" />
        </View>

        <Text style={styles.sectionTitle}>Расходы</Text>
        {/* Сетку категорий сделаем следующим шагом */}
        <Text style={{color: 'grey'}}>Сетка расходов (в разработке...)</Text>
        
        <View style={{ height: 150 }} /> 
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
    padding: 20,
    marginTop: 10,
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