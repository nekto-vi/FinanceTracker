import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  userToken: string | null;
  username: string | null; 
  isLoading: boolean;
  signIn: (token: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null); // Состояние имени
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const savedName = await SecureStore.getItemAsync('username');
        setUserToken(token);
        setUsername(savedName);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const signIn = async (token: string, name: string) => {
    await SecureStore.setItemAsync('userToken', token);
    await SecureStore.setItemAsync('username', name);
    setUserToken(token);
    setUsername(name); 
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('username');
    setUserToken(null);
    setUsername(null); 
  };

  return (
    <AuthContext.Provider value={{ userToken, username, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};