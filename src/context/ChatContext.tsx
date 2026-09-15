import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '@/constants/Config';
import { useAuth } from '@/context/AuthContext';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
};

export type AITransaction = {
  amount: number;
  category_id: number | null;
  account_id: number | null;
  note: string;
};

type ChatContextValue = {
  messages: ChatMessage[];
  isSending: boolean;
  sendMessage: (text: string) => Promise<AITransaction | null>;
  addTransactionMessages: (userText: string, assistantText: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { userToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!userToken) {
      Promise.resolve().then(() => setMessages([]));
      return;
    }

    let isCurrentUser = true;
    const loadMessages = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/ai/messages`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (response.ok && isCurrentUser) setMessages(await response.json());
      } catch {
        // The chat remains available locally if the history cannot be loaded.
      }
    };

    void loadMessages();
    return () => {
      isCurrentUser = false;
    };
  }, [userToken]);

  const appendMessage = (role: ChatMessage['role'], text: string) => {
    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random()}`,
        role,
        text,
        createdAt: Date.now(),
      },
    ]);
  };

  const sendMessage = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending) return null;

    appendMessage('user', trimmedText);
    setIsSending(true);

    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`${API_CONFIG.BASE_URL}/ai/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: trimmedText }),
      });

      if (!response.ok) {
        const error = await response.json();
        appendMessage('assistant', error.detail || 'ИИ не смог обработать запрос.');
        return null;
      }

      const result = await response.json();
      const transaction = result.data as AITransaction;
      appendMessage(
        'assistant',
        `Записал расход ${transaction.amount} BYN на ${transaction.note}`,
      );
      return transaction;
    } catch {
      appendMessage('assistant', 'Не удалось связаться с ИИ. Проверьте подключение.');
      return null;
    } finally {
      setIsSending(false);
    }
  };

  const addTransactionMessages = async (userText: string, assistantText: string) => {
    appendMessage('user', userText);
    appendMessage('assistant', assistantText);

    const token = await SecureStore.getItemAsync('userToken');
    if (!token) return;

    await Promise.all([
      fetch(`${API_CONFIG.BASE_URL}/ai/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: 'user', text: userText }),
      }),
      fetch(`${API_CONFIG.BASE_URL}/ai/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: 'assistant', text: assistantText }),
      }),
    ]);
  };

  return (
    <ChatContext.Provider value={{ messages, isSending, sendMessage, addTransactionMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used inside ChatProvider');
  }
  return context;
}
