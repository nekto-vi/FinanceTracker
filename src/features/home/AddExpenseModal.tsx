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
}

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export function AddExpenseModal({ isVisible, category, account, allCategories, allAccounts, onClose, onSave }: Props) {
  const [amount, setAmount] = useState('0');
  const [comment, setComment] = useState('');
  const [showCalc, setShowCalc] = useState(false);
  
  const [selectedCat, setSelectedCat] = useState(category);
  const [selectedAcc, setSelectedAcc] = useState(account);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [history, setHistory] = useState<any[]>([]);

  const dates = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  useEffect(() => {
    if (isVisible && category && account) {
      setSelectedCat(category);
      setSelectedAcc(account);
      setAmount('0');
      setComment('');
      setShowCalc(false);
      fetchHistory();
    }
  }, [isVisible, category, account]);

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

  if (!isVisible || !selectedCat || !selectedAcc) return null;

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
             <TouchableOpacity onPress={onClose} hitSlop={15}>
                <SymbolView name="xmark" size={20} tintColor="#000" />
             </TouchableOpacity>
             <Text style={styles.headerTitle}>Расход</Text>
             <View style={{width: 20}} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Сумма по центру */}
            <View style={styles.centerBlock}>
              <Text style={styles.topCatName}>{selectedCat?.name}</Text>
              <TouchableOpacity onPress={() => { Keyboard.dismiss(); setShowCalc(true); }}>
                <Text style={styles.mainAmount}>{amount} BYN</Text>
              </TouchableOpacity>
            </View>

            {/* Путь: Счет -> Категория */}
            <View style={styles.pathContainer}>
                <View style={styles.pathItem}>
                    <Text style={styles.pathLabel}>Счёт</Text>
                    <TouchableOpacity 
                        onPress={() => {
                            const idx = allAccounts.findIndex(a => a.id === selectedAcc.id);
                            setSelectedAcc(allAccounts[(idx + 1) % allAccounts.length]);
                        }}
                        style={[styles.iconCircle, {backgroundColor: '#FF3B30'}]}
                    >
                        <SymbolView name="creditcard.fill" size={24} tintColor="white" />
                    </TouchableOpacity>
                    <Text style={styles.pathValue}>{(selectedAcc?.balance || 0).toLocaleString()} BYN</Text>
                </View>

                <SymbolView name="chevron.right" size={18} tintColor="#C7C7CC" />

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
                    <Text style={styles.pathValue}>{(selectedCat?.amount || 0).toLocaleString()} BYN</Text>
                </View>
            </View>

            {/* Комментарий */}
            <View style={styles.inputSection}>
                <Text style={styles.sectionLabel}>Комментарий</Text>
                <TextInput 
                  style={styles.commentInput}
                  placeholder="На что потратили?"
                  placeholderTextColor="#C7C7CC"
                  value={comment}
                  onChangeText={setComment}
                  onFocus={() => setShowCalc(false)}
                />
            </View>

            {/* Дата */}
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
                                    {d.getDate()} {MONTHS[d.getMonth()]}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Список операций */}
            <View style={styles.historySection}>
                <Text style={styles.historyTitle}>Последние операции</Text>
                {(history || []).map((h, i) => (
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

          {/* Калькулятор */}
          {showCalc && (
            <View style={styles.calcContainer}>
              <TouchableOpacity 
                style={styles.bigSaveBtn} 
                onPress={() => onSave({
                  amount: parseFloat(amount),
                  account_id: selectedAcc.id,
                  category_id: selectedCat.id,
                  note: comment,
                  date: selectedDate.toISOString().split('T')[0]
                })}
              >
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
              style={styles.bottomSaveBtn} 
              onPress={() => onSave({
                amount: parseFloat(amount),
                account_id: selectedAcc.id,
                category_id: selectedCat.id,
                note: comment,
                date: selectedDate.toISOString().split('T')[0]
              })}
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
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' // ЧИСТО БЕЛЫЙ ФОН
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 15, 
    alignItems: 'center' 
  },
  headerTitle: { 
    color: '#000000', 
    fontSize: 17, 
    fontWeight: '700' 
  },
  centerBlock: { 
    alignItems: 'center', 
    marginVertical: 20 
  },
  topCatName: { 
    color: '#8E8E93', 
    fontSize: 16, 
    marginBottom: 5 
  },
  mainAmount: { 
    color: '#000000', 
    fontSize: 48, 
    fontWeight: '800' 
  },
  pathContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 20, 
    marginBottom: 25 
  },
  pathItem: { 
    alignItems: 'center', 
    width: 110 
  },
  pathLabel: { 
    color: '#8E8E93', 
    fontSize: 11, 
    marginBottom: 8, 
    textTransform: 'uppercase', 
    fontWeight: '600' 
  },
  iconCircle: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2
  },
  pathValue: { 
    color: '#000000', 
    fontSize: 13, 
    fontWeight: '600' 
  },
  inputSection: { 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  sectionLabel: { 
    color: '#007AFF', 
    fontSize: 12, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  commentInput: { 
    backgroundColor: '#F2F2F7', 
    borderRadius: 14, 
    padding: 16, 
    color: '#000000', 
    fontSize: 16 
  },
  dateSection: { 
    paddingLeft: 20, 
    marginBottom: 25 
  },
  dateCard: { 
    backgroundColor: '#F2F2F7', 
    padding: 12, 
    borderRadius: 12, 
    marginRight: 10, 
    width: 75, 
    alignItems: 'center' 
  },
  dateCardActive: { 
    backgroundColor: '#007AFF' 
  },
  dateCardText: { 
    color: '#8E8E93', 
    fontSize: 13, 
    fontWeight: '600' 
  },
  historySection: { 
    marginTop: 20, 
    padding: 20, 
    backgroundColor: '#FFFFFF', // Тоже белый
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    minHeight: 300 
  },
  historyTitle: { 
    color: '#000000', 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
  hItem: { 
    marginBottom: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F2F2F7', 
    paddingBottom: 10 
  },
  hRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 5 
  },
  hDate: { 
    color: '#8E8E93', 
    fontSize: 12 
  },
  hAmount: { 
    color: '#000000', 
    fontSize: 15, 
    fontWeight: 'bold' 
  },
  hNote: { 
    color: '#444444', 
    fontSize: 14 
  },
  calcContainer: { 
    backgroundColor: '#F2F2F7', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 20 
  },
  bigSaveBtn: { 
    backgroundColor: '#007AFF', 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginBottom: 15 
  },
  bottomSaveBtn: { 
    backgroundColor: '#007AFF', 
    margin: 20, 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center' 
  },
  saveBtnText: { 
    color: '#FFFFFF', 
    fontSize: 17, 
    fontWeight: '700' 
  },
  calcGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center' 
  },
  calcKey: { 
    width: SCREEN_W / 3.8, 
    height: 55, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  calcKeyText: { 
    color: '#000000', 
    fontSize: 24, 
    fontWeight: '500' 
  },
});