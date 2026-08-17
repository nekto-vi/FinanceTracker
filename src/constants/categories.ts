export type Category = {
  id: string | number;
  name: string;
  color: string;
  emoji: string; 
};

export const EXPENSE_CATEGORIES: ReadonlyArray<Category> = [
  { id: 1, name: 'Еда', color: '#FF9500', emoji: '🍔' },
  { id: 2, name: 'Транспорт', color: '#FF3B30', emoji: '🚗' },
  { id: 3, name: 'Связь', color: '#5856D6', emoji: '📱' },
  { id: 4, name: 'Здоровье', color: '#34C759', emoji: '💊' },
  { id: 5, name: 'Продукты', color: '#FFCC00', emoji: '🛒' },
  { id: 6, name: 'Развлечения', color: '#AF52DE', emoji: '🍿' },
  { id: 7, name: 'Одежда', color: '#FF2D55', emoji: '👕' },
  { id: 8, name: 'Шоппинг', color: '#FF2D92', emoji: '🛍️' },
  { id: 9, name: 'Спорт', color: '#F5A623', emoji: '🏀' },
] as const;

export const getCategoryById = (id: string | number): Category | undefined =>
  EXPENSE_CATEGORIES.find((category) => category.id === id || category.id.toString() === id.toString());