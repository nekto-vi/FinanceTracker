import React, { useState, useEffect } from 'react';
import { 
  Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ScrollView, SafeAreaView, Dimensions, Keyboard, FlatList 
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as SecureStore from 'expo-secure-store';

const { width: SCREEN_W } = Dimensions.get('window');

interface Props {
  isVisible: boolean;
  category: any;
  account: any;
  allCategories: any[];
  allAccounts: any[];
  onClose: () => void;
  onSave: (data: any) => void;
  initialType?: 'expense' | 'income';
}

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export function AddExpenseModal({ 
  isVisible, 
  category, 
  account, 
  allCategories, 
  allAccounts, 
  onClose, 
  onSave, 
  initialType = 'expense' 
}: Props) {
  const [amount, setAmount] = useState('0');
  const [comment, setComment] = useState('');
  const [showCalc, setShowCalc] = useState(false);
  
  const [selectedCat, setSelectedCat] = useState(category);
  const [selectedAcc, setSelectedAcc] = useState(account);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [history, setHistory] = useState<any[]>([]);
  const [type, setType] = useState<'expense' | 'income'>(initialType);

  const dates = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  useEffect(() => {
    if (isVisible) {
      setType(initialType);
      setSelectedCat(category);
      setSelectedAcc(account);
      setAmount('0');
      setComment('');
      setShowCalc(false);
      fetchHistory();
    }
  }, [isVisible, category, account, initialType]);

  const fetchHistory = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) return;
    try {
      const month = new Date().getMonth() + 1;
      const res = await fetch(`http://127.0.0.1:8000/transactions/history?month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) { 
      setHistory([]); 
    }
  };

  const handleCalcPress = (val: string) => {
    if (val === 'C') return setAmount('0');
    if (val === 'delete') return setAmount(amount.length > 1 ? amount.slice(0, -1) : '0');
    setAmount(prev => (prev === '0' ? val : prev + val));
  };

  const onFinalSave = () => {
    onSave({
      amount: parseFloat(amount),
      account_id: selectedAcc?.id,
      category_id: type === 'expense' ? selectedCat?.id : null, 
      note: comment,
      date: selectedDate.toISOString().split('T')[0],
      type: type 
    });
  };

  const themeColor = type === 'expense' ? '#007AFF' : '#34C759';

  if (!isVisible || !selectedAcc) return null;

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          
          <View style={styles.header}>
             <TouchableOpacity onPress={onClose} hitSlop={15}>
                <SymbolView name="xmark" size={20} tintColor="#000" />
             </TouchableOpacity>
             
             <View style={styles.headerToggle}>
                <TouchableOpacity 
                  onPress={() => setType('expense')}
                  style={[styles.toggleBtn, type === 'expense' && styles.toggleBtnActive]}
                >
                  <Text style={[styles.toggleText, type === 'expense' && { color: '#007AFF' }]}>Расход</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setType('income')}
                  style={[styles.toggleBtn, type === 'income' && styles.toggleBtnActive]}
                >
                  <Text style={[styles.toggleText, type === 'income' && { color: '#34C759' }]}>Доход</Text>
                </TouchableOpacity>
             </View>

             <View style={{width: 20}} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            <View style={styles.centerBlock}>
              <Text style={styles.topCatName}>
                {type === 'expense' ? (selectedCat?.name || 'Выберите категорию') : 'Пополнение счета'}
              </Text>
              <TouchableOpacity onPress={() => { Keyboard.dismiss(); setShowCalc(true); }}>
                <Text style={[styles.mainAmount, { color: themeColor }]}>{amount} BYN</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pathContainer}>
                <View style={styles.pathItem}>
                    <Text style={styles.pathLabel}>{type === 'expense' ? 'Со счета' : 'Источник'}</Text>
                    <TouchableOpacity 
                        disabled={type === 'income'}
                        onPress={() => {
                            const idx = allAccounts.findIndex(a => a.id === selectedAcc.id);
                            setSelectedAcc(allAccounts[(idx + 1) % allAccounts.length]);
                        }}
                        style={[styles.iconCircle, { backgroundColor: type === 'expense' ? '#FF3B30' : '#E5E5EA' }]}
                    >
                        <SymbolView 
                          name={type === 'expense' ? "creditcard.fill" : "arrow.down.circle.fill"} 
                          size={24} 
                          tintColor={type === 'expense' ? "white" : "#8E8E93"} 
                        />
                    </TouchableOpacity>
                    <Text style={styles.pathName}>{type === 'expense' ? selectedAcc?.name : 'Пополнение'}</Text>
                    {type === 'expense' && <Text style={styles.pathValue}>{selectedAcc?.balance.toLocaleString()} BYN</Text>}
                </View>

                <SymbolView name="chevron.right" size={18} tintColor="#C7C7CC" />

                <View style={styles.pathItem}>
                    <Text style={styles.pathLabel}>{type === 'expense' ? 'В категорию' : 'На счет'}</Text>
                    <TouchableOpacity 
                        onPress={() => {
                          if (type === 'expense') {
                            const idx = allCategories.findIndex(c => c.id === selectedCat?.id);
                            setSelectedCat(allCategories[(idx + 1) % allCategories.length]);
                          } else {
                            const idx = allAccounts.findIndex(a => a.id === selectedAcc.id);
                            setSelectedAcc(allAccounts[(idx + 1) % allAccounts.length]);
                          }
                        }}
                        style={[styles.iconCircle, { backgroundColor: type === 'expense' ? (selectedCat?.color || '#EEE') : '#34C759' }]}
                    >
                        {type === 'expense' ? (
                          <Text style={{fontSize: 24}}>{selectedCat?.icon || '?'}</Text>
                        ) : (
                          <SymbolView name="dollarsign.circle.fill" size={24} tintColor="white" />
                        )}
                    </TouchableOpacity>
                    <Text style={styles.pathName}>{type === 'expense' ? (selectedCat?.name || '---') : selectedAcc?.name}</Text>
                    <Text style={styles.pathValue}>
                      {type === 'expense' 
                        ? `${(selectedCat?.amount || 0).toLocaleString()} BYN потрачено` 
                        : `${(selectedAcc?.balance || 0).toLocaleString()} BYN сейчас`
                      }
                    </Text>
                </View>
            </View>

            <View style={styles.inputSection}>
                <Text style={[styles.sectionLabel, { color: themeColor }]}>Комментарий</Text>
                <TextInput 
                  style={styles.commentInput}
                  placeholder={type === 'expense' ? "На что потратили?" : "Источник средств"}
                  placeholderTextColor="#C7C7CC"
                  value={comment}
                  onChangeText={setComment}
                  onFocus={() => setShowCalc(false)}
                />
            </View>

            <View style={styles.dateSection}>
                <Text style={[styles.sectionLabel, { color: themeColor }]}>Дата</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {dates.map((d, i) => {
                        const isSelected = d.toDateString() === selectedDate.toDateString();
                        return (
                            <TouchableOpacity 
                                key={i} 
                                style={[styles.dateCard, isSelected && { backgroundColor: themeColor }]}
                                onPress={() => setSelectedDate(d)}
                            >
                                <Text style={[styles.dateCardText, isSelected && { color: 'white' }]}>
                                    {d.getDate()} {MONTHS[d.getMonth()]}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <View style={styles.historySection}>
                <Text style={styles.historyTitle}>Последние операции</Text>
                {history.length > 0 ? history.map((h, i) => (
                    <View key={i} style={styles.hItem}>
                        <View style={styles.hRow}>
                            <Text style={styles.hDate}>{new Date(h.created_at).toLocaleDateString('ru-RU')}</Text>
                            <Text style={[styles.hAmount, { color: h.type === 'income' ? '#34C759' : '#000' }]}>
                              {h.type === 'income' ? '+' : '-'}{h.amount} BYN
                            </Text>
                        </View>
                        <Text style={styles.hNote}>{h.note || 'Без комментария'}</Text>
                    </View>
                )) : (
                  <Text style={{ color: '#C7C7CC', textAlign: 'center', marginTop: 20 }}>Нет операций</Text>
                )}
            </View>
          </ScrollView>

          {showCalc && (
            <View style={styles.calcContainer}>
              <TouchableOpacity style={[styles.bigSaveBtn, { backgroundColor: themeColor }]} onPress={onFinalSave}>
                  <Text style={styles.saveBtnText}>Сохранить</Text>
              </TouchableOpacity>
              <View style={styles.calcGrid}>
                {['1','2','3','4','5','6','7','8','9','.', '0', 'delete'].map(num => (
                  <TouchableOpacity key={num} style={styles.calcKey} onPress={() => handleCalcPress(num)}>
                    {num === 'delete' ? (
                      <SymbolView name="delete.left" size={24} tintColor="#000" />
                    ) : (
                      <Text style={styles.calcKeyText}>{num}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {!showCalc && (
            <TouchableOpacity 
              style={[styles.bottomSaveBtn, { backgroundColor: themeColor }]} 
              onPress={onFinalSave}
            >
                <Text style={styles.saveBtnText}>Сохранить</Text>
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
  headerTitle: { color: '#000', fontSize: 17, fontWeight: '700' },
  headerToggle: { flexDirection: 'row', backgroundColor: '#F2F2F7', borderRadius: 8, padding: 2 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
  centerBlock: { alignItems: 'center', marginVertical: 20 },
  topCatName: { color: '#8E8E93', fontSize: 16, marginBottom: 5 },
  mainAmount: { fontSize: 48, fontWeight: '800' },
  pathContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 25 },
  pathItem: { alignItems: 'center', width: 110 },
  pathLabel: { color: '#8E8E93', fontSize: 10, textTransform: 'uppercase', marginBottom: 8, fontWeight: '600' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  pathName: { color: '#000', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  pathValue: { color: '#8E8E93', fontSize: 11, textAlign: 'center' },
  inputSection: { paddingHorizontal: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
  commentInput: { backgroundColor: '#F2F2F7', borderRadius: 14, padding: 16, color: '#000', fontSize: 16 },
  dateSection: { paddingLeft: 20, marginBottom: 25 },
  dateCard: { backgroundColor: '#F2F2F7', padding: 12, borderRadius: 12, marginRight: 10, width: 75, alignItems: 'center' },
  dateCardText: { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  historySection: { marginTop: 20, padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F2F2F7', minHeight: 300 },
  historyTitle: { color: '#000', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  hItem: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', paddingBottom: 10 },
  hRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  hDate: { color: '#8E8E93', fontSize: 12 },
  hAmount: { fontSize: 15, fontWeight: 'bold' },
  hNote: { color: '#444', fontSize: 14 },
  calcContainer: { backgroundColor: '#F2F2F7', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  bigSaveBtn: { padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 15 },
  bottomSaveBtn: { margin: 20, padding: 18, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  calcGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  calcKey: { width: SCREEN_W / 3.8, height: 55, justifyContent: 'center', alignItems: 'center' },
  calcKeyText: { color: '#000', fontSize: 24, fontWeight: '500' },
});