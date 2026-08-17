interface ApiConfig {
  BASE_URL: string;
  ENDPOINTS: {
    LOGIN: string;
    REGISTER: string;
  };
}

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    SYNC: '/auth/sync', 
  },
};