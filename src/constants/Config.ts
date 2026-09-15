interface ApiConfig {
  BASE_URL: string;
  ENDPOINTS: {
    LOGIN: string;
    REGISTER: string;
    CATEGORIES: string;
    ACCOUNTS: string;
    TRANSACTIONS: string;
    SUMMARY: string;
    WEEKLY: string;
  };
}

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    CATEGORIES: '/categories',
    ACCOUNTS: '/accounts',
    TRANSACTIONS: '/transactions',
    SUMMARY: '/stats/summary',
    WEEKLY: '/stats/weekly',
  },
};