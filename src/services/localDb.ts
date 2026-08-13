import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('local_finance.db');

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
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (account_id) REFERENCES accounts (id),
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );
  `);

  const accountsCount = await db.getFirstAsync<{count: number}>('SELECT COUNT(*) as count FROM accounts');
  
  if (accountsCount?.count === 0) {
    await db.runAsync('INSERT INTO accounts (name, balance) VALUES (?, ?), (?, ?)', ['Карта', 0, 'Наличные', 0]);
    
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

export default db;