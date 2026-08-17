import * as SQLite from 'expo-sqlite';

// Открываем базу данных. 
// Если ты меняла структуру колонок (добавляла type или note), 
// лучше сменить имя на local_finance_v3.db для чистого теста.
const db = SQLite.openDatabaseSync('local_finance2.db');

export const initLocalDb = async () => {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      balance REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      emoji TEXT,
      color TEXT,
      amount REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      account_id INTEGER,
      category_id INTEGER,
      note TEXT,
      type TEXT DEFAULT 'expense',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (account_id) REFERENCES accounts (id),
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );
  `);

  const accountsCount = await db.getFirstAsync<{count: number}>('SELECT COUNT(*) as count FROM accounts');
  
  if (accountsCount && accountsCount.count === 0) {
    // Вставляем дефолтные счета
    await db.runAsync('INSERT INTO accounts (name, balance) VALUES (?, ?), (?, ?)', ['Карта', 0, 'Наличные', 0]);
    
    // Вставляем твои категории
    await db.runAsync(`
      INSERT INTO categories (name, emoji, color) VALUES 
      ('Продукты', '🛒', '#FF9500'),
      ('Еда', '🍔', '#FFCC00'),
      ('Транспорт', '🚗', '#5856D6'),
      ('Развлечения', '🍿', '#AF52DE'),
      ('Здоровье', '💊', '#34C759'),
      ('Одежда', '👕', '#FF2D55'),
      ('Косметика', '💄', '#FF3B30')
    `);
    console.log('✅ Локальная база инициализирована дефолтными данными');
  }
};

// --- ФУНКЦИИ ПОЛУЧЕНИЯ ДАННЫХ ---

export const getLocalAccounts = async () => {
  return await db.getAllAsync<any>('SELECT * FROM accounts');
};

export const getLocalCategories = async () => {
  // Считаем сумму транзакций для каждой категории (только расходы)
  return await db.getAllAsync<any>(`
    SELECT c.*, 
    (SELECT TOTAL(amount) FROM transactions WHERE category_id = c.id AND type = 'expense') as amount 
    FROM categories c
  `);
};

// --- ФУНКЦИЯ СОХРАНЕНИЯ ТРАТЫ (ОФФЛАЙН) ---

export const addLocalTransaction = async (amount: number, accountId: number, categoryId: number, note: string) => {
  // 1. Записываем транзакцию (используем текущее время)
  const now = new Date().toISOString().replace('T', ' ').split('.')[0];
  
  await db.runAsync(
    'INSERT INTO transactions (amount, account_id, category_id, note, type, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [amount, accountId, categoryId, note, 'expense', now]
  );

  // 2. Обновляем баланс счета (вычитаем расход)
  await db.runAsync(
    'UPDATE accounts SET balance = balance - ? WHERE id = ?',
    [amount, accountId]
  );
  
  console.log('✅ Трата сохранена в память телефона');
};

// --- ФУНКЦИИ ДЛЯ СИНХРОНИЗАЦИИ ---

/**
 * Собирает все данные для отправки на сервер.
 * Прикрепляет имена счетов и категорий, так как сервер не знает локальные ID.
 */
export const getFullDataForSync = async () => {
  const accounts = await db.getAllAsync<any>('SELECT * FROM accounts');
  const categories = await db.getAllAsync<any>('SELECT * FROM categories');
  
  // Берем транзакции и через JOIN узнаем названия их счета и категории
  const transactions = await db.getAllAsync<any>(`
    SELECT t.*, a.name as account_name, c.name as category_name 
    FROM transactions t
    LEFT JOIN accounts a ON t.account_id = a.id
    LEFT JOIN categories c ON t.category_id = c.id
  `);
  
  return { accounts, categories, transactions };
};

/**
 * Очищает локальные данные после успешной выгрузки на сервер.
 * Транзакции удаляются, а балансы счетов сбрасываются в 0, 
 * так как теперь они будут приходить с сервера.
 */
export const clearLocalData = async () => {
  await db.execAsync('DELETE FROM transactions');
  await db.runAsync('UPDATE accounts SET balance = 0');
  console.log('✅ Локальная база очищена после синхронизации');
};

export default db;