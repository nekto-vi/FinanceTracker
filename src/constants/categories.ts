export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Еда', color: '#FF9500', icon: '🍔' },
  { id: 'transport', name: 'Транспорт', color: '#FF3B30', icon: '🚗' },
  { id: 'shopping', name: 'Шоппинг', color: '#FF2D92', icon: '🛍️' },
  { id: 'health', name: 'Здоровье', color: '#FF6B35', icon: '💊' },
  { id: 'home', name: 'Дом', color: '#C75B39', icon: '🏠' },
  { id: 'sport', name: 'Спорт', color: '#F5A623', icon: '🏀' },
  { id: 'mobile', name: 'Связь', color: '#5856D6', icon: '📱' },
  { id: 'entertainment', name: 'Отдых', color: '#FF6482', icon: '🍿' },
  { id: 'gifts', name: 'Подарки', color: '#E83F3F', icon: '🎁' },
];

export const getCategoryById = (id: string): Category | undefined =>
  EXPENSE_CATEGORIES.find((c) => c.id === id);