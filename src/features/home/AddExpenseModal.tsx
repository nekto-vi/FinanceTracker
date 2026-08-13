import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ScrollView, SafeAreaView, Dimensions, Keyboard, FlatList
} from 'react-native';
import { SymbolView } from 'expo-symbols';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  isVisible: boolean;
  category: any;
  account: any;
  allCategories: any[];
  allAccounts: any[];
  onClose: () => void;
  onSave: (data: any) => void;
}

export function AddExpenseModal({ isVisible, category, account, allCategories, allAccounts, onClose, onSave }: Props) {
  const [amount, setAmount] = useState('0');
  const [comment, setComment] = useState('');
  const [showCalc, setShowCalc] = useState(false);
  
  const [selectedCat, setSelectedCat] = useState(category);
  const [selectedAcc, setSelectedAcc] = useState(account);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [history, setHistory] = useState<any[]>([]);

  // Генерируем даты (7 последних дней)
  const dates = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  useEffect(() => {
    if (isVisible) {
      setSelectedCat(category);
      setSelectedAcc(account);
      fetchHistory();
      setAmount('0');
      setComment('');
      setShowCalc(false);
    }
  }, [isVisible, category, account]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/transactions/history?month=${new Date().getMonth() + 1}`);
      const data = await res.json();
      setHistory(data);
    } catch (e) { console.log(e); }
  };

  const handleCalcPress = (val: string) => {
    if (val === 'C') return setAmount('0');
    if (val === 'delete') return setAmount(amount.length > 1 ? amount.slice(0, -1) : '0');
    setAmount(prev => (prev === '0' ? val : prev + val));
  };

  const onFinalSave = () => {
    onSave({
      amount: parseFloat(amount),
      account_id: selectedAcc.id,
      category_id: selectedCat.id,
      note: comment,
      date: selectedDate.toISOString().split('T')[0]
    });
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          {/* Header */}
          <View style={styles.header}>
             <TouchableOpacity onPress={onClose} hitSlop={15}>
                <SymbolView name="xmark" size={20} tintColor="#8E8E93" />
             </TouchableOpacity>
             <Text style={styles.headerTitle}>Новая операция</Text>
             <View style={{width: 20}} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Название и Сумма */}
            <View style={styles.centerBlock}>
              <Text style={styles.topCatName}>{selectedCat?.name}</Text>
              <TouchableOpacity onPress={() => { Keyboard.dismiss(); setShowCalc(true); }}>
                <Text style={styles.mainAmount}>{amount} BYN</Text>
              </TouchableOpacity>
            </View>

            {/* Account -> Category Flow */}
            <View style={styles.pathContainer}>
                <View style={styles.pathItem}>
                    <Text style={styles.pathLabel}>Счет</Text>
                    <TouchableOpacity 
                        onPress={() => {
                            const idx = allAccounts.findIndex(a => a.id === selectedAcc.id);
                            setSelectedAcc(allAccounts[(idx + 1) % allAccounts.length]);
                        }}
                        style={[styles.iconCircle, {backgroundColor: '#FF3B30'}]}
                    >
                        <SymbolView name="creditcard.fill" size={24} tintColor="white" />
                    </TouchableOpacity>
                    <Text style={styles.pathName}>{selectedAcc?.name}</Text>
                    <Text style={styles.pathValue}>{selectedAcc?.balance.toLocaleString()} BYN</Text>
                </View>

                <SymbolView name="chevron.right" size={20} tintColor="#333" />

                <View style={styles.pathItem}>
                    <Text style={styles.pathLabel}>Категория</Text>
                    <TouchableOpacity 
                        onPress={() => {
                            const idx = allCategories.findIndex(c => c.id === selectedCat.id);
                            setSelectedCat(allCategories[(idx + 1) % allCategories.length]);
                        }}
                        style={[styles.iconCircle, {backgroundColor: selectedCat?.color}]}
                    >
                        <Text style={{fontSize: 24}}>{selectedCat?.icon}</Text>
                    </TouchableOpacity>
                    <Text style={styles.pathName}>{selectedCat?.name}</Text>
                    <Text style={styles.pathValue}>{selectedCat?.amount} BYN потрачено</Text>
                </View>
            </View>

            {/* Comment */}
            <View style={styles.inputSection}>
                <TextInput 
                  style={styles.commentInput}
                  placeholder="Добавить комментарий..."
                  placeholderTextColor="#444"
                  value={comment}
                  onChangeText={setComment}
                  onFocus={() => setShowCalc(false)}
                />
            </View>

            {/* Date Selector */}
            <View style={styles.dateSection}>
                <Text style={styles.sectionLabel}>Дата</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {dates.map((d, i) => {
                        const isSelected = d.toDateString() === selectedDate.toDateString();
                        return (
                            <TouchableOpacity 
                                key={i} 
                                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                                onPress={() => setSelectedDate(d)}
                            >
                                <Text style={[styles.dateCardText, isSelected && {color: 'white'}]}>
                                    {d.getDate()} {d.toLocaleString('ru-RU', {month: 'short'})}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* History List */}
            <View style={styles.historySection}>
                <Text style={styles.historyTitle}>История операций</Text>
                {history.map((h, i) => (
                    <View key={i} style={styles.hItem}>
                        <View style={styles.hRow}>
                            <Text style={styles.hDate}>{new Date(h.created_at).toLocaleDateString('ru-RU')}</Text>
                            <Text style={styles.hAmount}>-{h.amount} BYN</Text>
                        </View>
                        <Text style={styles.hNote}>{h.note || 'Без комментария'}</Text>
                    </View>
                ))}
            </View>
          </ScrollView>

          {/* Калькулятор с кнопкой Save */}
          {showCalc && (
            <View style={styles.calcContainer}>
              <TouchableOpacity style={styles.bigSaveBtn} onPress={onFinalSave}>
                  <Text style={styles.saveBtnText}>Сохранить</Text>
              </TouchableOpacity>
              <View style={styles.calcGrid}>
                {['1','2','3','4','5','6','7','8','9','.', '0', 'delete'].map(num => (
                  <TouchableOpacity key={num} style={styles.calcKey} onPress={() => handleCalcPress(num)}>
                    {num === 'delete' ? (
                      <SymbolView name="delete.left" size={24} tintColor="white" />
                    ) : (
                      <Text style={styles.calcKeyText}>{num}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {!showCalc && (
            <TouchableOpacity style={styles.bottomSaveBtn} onPress={onFinalSave}>
                <Text style={styles.saveBtnText}>Сохранить</Text>
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: '600' },
  centerBlock: { alignItems: 'center', marginVertical: 20 },
  topCatName: { color: '#8E8E93', fontSize: 16, marginBottom: 5 },
  mainAmount: { color: 'white', fontSize: 44, fontWeight: '800' },
  pathContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 25, marginBottom: 25 },
  pathItem: { alignItems: 'center', width: 110 },
  pathLabel: { color: '#444', fontSize: 10, marginBottom: 8, textTransform: 'uppercase' },
  iconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  pathName: { color: 'white', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  pathValue: { color: '#8E8E93', fontSize: 11 },
  inputSection: { paddingHorizontal: 20, marginBottom: 20 },
  commentInput: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 15, color: 'white', fontSize: 16 },
  dateSection: { paddingLeft: 20, marginBottom: 20 },
  sectionLabel: { color: '#007AFF', fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
  dateCard: { backgroundColor: '#1C1C1E', padding: 12, borderRadius: 12, marginRight: 10, width: 75, alignItems: 'center' },
  dateCardActive: { backgroundColor: '#007AFF' },
  dateCardText: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  historySection: { marginTop: 20, padding: 20, backgroundColor: '#0A0A0A', borderTopLeftRadius: 30, borderTopRightRadius: 30, minHeight: 300 },
  historyTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  hItem: { marginBottom: 15, borderBottomWidth: 0.5, borderBottomColor: '#222', paddingBottom: 10 },
  hRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  hDate: { color: '#444', fontSize: 12 },
  hAmount: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  hNote: { color: '#8E8E93', fontSize: 14 },
  calcContainer: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 },
  bigSaveBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 15 },
  bottomSaveBtn: { backgroundColor: '#007AFF', margin: 20, padding: 18, borderRadius: 15, alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: 17, fontWeight: '700' },
  calcGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  calcKey: { width: SCREEN_W / 3.8, height: 50, justifyContent: 'center', alignItems: 'center' },
  calcKeyText: { color: 'white', fontSize: 24, fontWeight: '500' },
});