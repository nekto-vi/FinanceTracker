import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  TOKEN: 'user_token',
  USERNAME: 'user_name',
} as const;

interface AuthContextType {
  userToken: string | null;
  userName: string | null;
  isLoading: boolean;
  signIn: (token: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const [token, name] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEYS.TOKEN),
          SecureStore.getItemAsync(STORAGE_KEYS.USERNAME),
        ]);

        if (token) setUserToken(token);
        if (name) setUserName(name);
      } catch (error) {
        console.error('[AuthContext]: Failed to restore session', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = async (token: string, username: string) => {
    try {
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token),
        SecureStore.setItemAsync(STORAGE_KEYS.USERNAME, username),
      ]);
      
      setUserToken(token);
      setUserName(username);
    } catch (error) {
      console.error('[AuthContext]: Sign in storage error', error);
      throw error; 
    }
  };

  const signOut = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USERNAME),
      ]);
      
      setUserToken(null);
      setUserName(null);
    } catch (error) {
      console.error('[AuthContext]: Sign out storage error', error);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, userName, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};