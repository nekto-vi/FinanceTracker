import React, { useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  isVisible: boolean;
  category: any;
  onClose: () => void;
  onSave: (amount: number) => void;
}

export function AddExpenseModal({ isVisible, category, onClose, onSave }: Props) {
  const [amount, setAmount] = useState('');

  if (!isVisible || !category) {
    return null;
  }

  const handleSave = () => {
    const num = parseFloat(amount.replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      onSave(num);
      setAmount('');
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Расход: {category.name}</Text> 
          <TextInput
            style={styles.input}
            placeholder="0.00 BYN"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            //autoFocus
          />
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Отмена</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => {
              onSave(Number(amount));
              setAmount('');
            }}><Text style={styles.save}>Добавить</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  content: { 
    backgroundColor: 'white', 
    padding: 25, 
    borderRadius: 20, 
    width: '80%' 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
  input: { 
    backgroundColor: '#F2F2F7', 
    padding: 15, 
    borderRadius: 10, 
    fontSize: 20, 
    marginBottom: 20 
  },
  buttons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  cancel: { 
    color: 'red', 
    fontSize: 16 
  },
  save: { 
    color: '#007AFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});
