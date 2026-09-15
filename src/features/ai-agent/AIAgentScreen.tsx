import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FlatList, 
  Keyboard, 
  Platform, 
  Pressable, 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  KeyboardAvoidingView 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { FinanceColors } from '@/constants/theme';
import { ChatMessage, useChat } from '@/context/ChatContext';

const TAB_BAR_HEIGHT = 0;

export default function AIAgentScreen() {
  const insets = useSafeAreaInsets();
  const { messages, isSending, sendMessage } = useChat();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const invertedMessages = useMemo(() => {
    const grouped = [];
    let lastDate = '';
    
    const reversed = [...messages].reverse();

    reversed.forEach((msg, index) => {
      const msgDate = new Date(msg.createdAt);
      const dateLabel = formatDateSeparator(msgDate);
      
      grouped.push(msg);

      const nextMsg = reversed[index + 1];
      const nextDateLabel = nextMsg ? formatDateSeparator(new Date(nextMsg.createdAt)) : '';
      
      if (dateLabel !== nextDateLabel) {
        grouped.push({ id: `date-${msg.id}`, isDate: true, text: dateLabel });
      }
    });

    return grouped;
  }, [messages]);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const currentBottomPadding = isKeyboardVisible 
    ? 8 
    : insets.bottom + TAB_BAR_HEIGHT + 12;

  const handleSend = async () => {
    const message = text.trim();
    if (!message || isSending) return;
    setText('');
    await sendMessage(message);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.agentIcon}>
          <SymbolView name="sparkles" size={22} tintColor={FinanceColors.accent} />
        </View>
        <View>
          <Text style={styles.title}>ИИ Агент</Text>
          <Text style={styles.subtitle}>Ваш финансовый помощник</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={TAB_BAR_HEIGHT + (Platform.OS === 'ios' ? 0 : 20)}
      >
        <FlatList
          ref={listRef}
          data={invertedMessages}
          inverted 
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.isDate) {
              return (
                <View style={styles.dateSeparatorContainer}>
                  <View style={styles.line} />
                  <Text style={styles.dateSeparatorText}>{item.text}</Text>
                  <View style={styles.line} />
                </View>
              );
            }
            return <MessageBubble message={item} />;
          }}
          ListFooterComponent={
            messages.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Начните разговор</Text>
                <Text style={styles.emptyText}>Напишите о покупке или задайте вопрос.</Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            isSending ? <MessageBubble message={{ id: 'typing', role: 'assistant', text: 'Думаю...', createdAt: Date.now() }} /> : null
          }
          contentContainerStyle={styles.listContent}
        />

        <View style={[styles.composerContainer, { paddingBottom: currentBottomPadding }]}>
          <View style={styles.composerInner}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Напишите сообщение..."
              placeholderTextColor={FinanceColors.textMuted}
              style={styles.input}
              multiline
            />
            <Pressable 
              style={[styles.sendButton, (!text.trim() || isSending) && styles.sendButtonDisabled]} 
              onPress={handleSend}
              disabled={!text.trim() || isSending}
            >
              <SymbolView name="arrow.up" size={19} tintColor="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({ message }: { message: any }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.messageRow, isUser && styles.userMessageRow]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const formatDateSeparator = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FinanceColors.backgroundGrouped,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D9D9DE',
    zIndex: 10,
  },
  agentIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: FinanceColors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: FinanceColors.textMuted,
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
    marginTop: '50%',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: FinanceColors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    lineHeight: 23,
    color: FinanceColors.textSecondary,
    textAlign: 'center',
  },
  messageRow: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '84%',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: FinanceColors.accent,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: FinanceColors.textPrimary,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  composerContainer: {
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    paddingTop: 8,
  },
  composerInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: FinanceColors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FinanceColors.accent,
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  dateSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dateSeparatorText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '700',
    paddingHorizontal: 14,
    letterSpacing: 0.5,
  },
});