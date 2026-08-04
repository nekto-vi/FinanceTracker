import { FinanceColors } from '@/constants/theme';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

export default function AIAgentScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>ИИ Агент</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FinanceColors.backgroundGrouped,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
  },
});