export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    SYNC: '/auth/sync',
    CATEGORIES: '/categories',
    ACCOUNTS: '/accounts',
    TRANSACTIONS: '/transactions',
    SUMMARY: '/stats/summary',
    WEEKLY: '/stats/weekly',
    HISTORY: '/transactions/history',
  },
};