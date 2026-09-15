<h1 align="center">💰 Finance Tracker - Умный учет личных финансов</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"/>
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Ollama_Qwen_2.5-000000?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License"/>
</p>

<p align="center">
  Современное мобильное приложение для ведения личного бюджета с интерактивной аналитикой, наглядным распределением расходов и встроенным <b>ИИ-ассистентом на базе локальной LLM (Ollama)</b> для ввода операций текстом.
</p>

<p align="center">
  <a href="https://github.com/nekto-vi/FinanceTracker">📱 Frontend Репозиторий</a> • 
  <a href="https://github.com/nekto-vi/FinanceTracker-Backend">⚙️ Backend Репозиторий</a>
</p>

---

## 📸 Скриншоты интерфейса

<p align="center">
  <img src="https://github.com/user-attachments/assets/6d5c8af8-a3e4-4990-b207-975335fda46c" width="19%" alt="Главный экран"/>
  <img src="https://github.com/user-attachments/assets/58d0ff36-3413-4ef2-afbc-98235573cfe8" width="19%" alt="История расходов"/>
  <img src="https://github.com/user-attachments/assets/37b4f180-2b5a-4d6b-8639-09cdd147344f" width="19%" alt="Добавление трат"/>
  <img src="https://github.com/user-attachments/assets/98edcf54-6d49-454b-9dfd-268abe1a2daf" width="19%" alt="Чат с ИИ-ассистентом"/>
  <img src="https://github.com/user-attachments/assets/25cc9fdd-76d0-49d0-b88d-727c6c6e86ad" width="19%" alt="Ответ ИИ-ассистента"/>
</p>

---

## ✨ Основные возможности

### 📊 1. Интерактивная аналитика и диаграммы
* **Недельный график (Profit Chart):** Столбчатая диаграмма распределения трат по дням недели (Пн–Вс) с цветовой сегментацией категорий.
* **Детализация по клику:** Нажатие на любой день открывает полный список операций с суммами и заметками.
* **Навигация по периодам:** Быстрое переключение недель и выбор любого месяца года.
* **Подсчет итогов:** Автоматический расчет чистой прибыли/дефицита за выбранный период.

### 💳 2. Мультисчета и контроль баланса
* Раздельный учет средств: **«Карта»** и **«Наличные»** с актуальными балансами.
* Моментальное пополнение счетов нажатием одной кнопки `+`.
* Автоматический перерасчет остатка при добавлении, редактировании или удалении операций.

### 🏷️ 3. Гибкие категории расходов
* Готовые базовые категории с эмодзи и акцентными цветами (Еда, Транспорт, Связь, Здоровье, Продукты, Развлечения, Одежда).
* **Создание собственных категорий:** Пользователь может задать имя, выбрать цвет из палитры и эмодзи.
* Удобная сетка с отображением суммарных затрат по каждой категории за месяц.

### 🤖 4. Локальный ИИ-помощник (Ollama / Qwen 2.5)
* Запись расходов и доходов естественным языком без ручного заполнения форм.
* **100% приватность:** обработка запросов происходит локально через нейросеть **Ollama (`qwen2.5:7b`)**, данные о финансах не отправляются в сторонние облачные сервисы.
* **Примеры запросов:**
  * `«Кофе 8.50 BYN»` ➔ определит сумму и запишет расход в категорию **«Еда»**.
  * `«Такси 14 BYN»` ➔ внесет запись в **«Транспорт»**.
  * `«Купил продукты на 45 руб»` ➔ зафиксирует операцию в **«Продукты»**.
  * `«Пополнил карту на 500 BYN»` ➔ зачислит доход на счет **«Карта»**.
* История сообщений чата с ассистентом сохраняется в базе данных.

### 📜 5. История операций и фильтрация
* Сводка за месяц: **Доходы (+)**, **Расходы (-)**, **Итог (=)**.
* Группировка транзакций по дням (*Сегодня*, *Вчера*, календарные даты).
* Фильтрация и мгновенное удаление ошибочных записей с автоматическим возвратом средств на баланс.

---

## 🛠️ Стек технологий

### Frontend ([FinanceTracker](https://github.com/nekto-vi/FinanceTracker))
* **Фреймворк:** [React Native](https://reactnative.dev) / [Expo SDK 57](https://expo.dev)
* **Язык:** TypeScript
* **Навигация:** [Expo Router](https://expo.dev) (вкладки, стеки)
* **Стили и UI:** Tailwind CSS, iOS Guidelines, Lucide Icons
* **Состояние и хранилище:** React Context API, `expo-secure-store`

### Backend ([FinanceTracker-Backend](https://github.com/nekto-vi/FinanceTracker-Backend))
* **Язык и фреймворк:** Python 3.12+, [FastAPI](https://tiangolo.com) (Uvicorn, Starlette)
* **База данных:** PostgreSQL, SQLAlchemy ORM + Psycopg2
* **Валидация:** Pydantic
* **Аутентификация:** JWT (`python-jose`, HS256), хеширование паролей (`passlib`, `bcrypt`)
* **ИИ-парсинг:** Локальная LLM **Ollama (`qwen2.5:7b`)**
* **Контейнеризация:** Docker, Docker Compose

---

## 🚀 Быстрый старт

### 1. Клонирование репозиториев
```bash
git clone https://github.com/nekto-vi/FinanceTracker.git
git clone https://github.com/nekto-vi/FinanceTracker-Backend.git
```

### 2. Запуск бэкенда через Docker 🐳
Сервер FastAPI и база данных PostgreSQL запускаются одной командой:
```bash
cd FinanceTracker-Backend
docker compose up -d --build
```
> * **API:** `http://localhost:8000`  
> * **Swagger UI:** `http://localhost:8000/docs`  
> * **ReDoc:** `http://localhost:8000/redoc`

<details>
<summary><b>🔧 Ручной запуск бэкенда (без Docker)</b></summary>

1. Создание виртуального окружения и установка пакетов:
```bash
cd FinanceTracker-Backend
python -m venv venv
# Linux / macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

pip install -r requirements.txt
```

2. Настройка `.env` файла:
```ini
DATABASE_URL=postgresql://user:password@localhost:5432/finance_db
SECRET_KEY=your-secret-key-for-jwt-signing
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

3. Запуск сервера:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
</details>

### 3. Запуск мобильного приложения
```bash
cd ../FinanceTracker

# Установка зависимостей
npm install

# Запуск среды Expo
npx expo start
```
> **Подключение к API:**
> * В браузере (нажмите `w` в терминале): запросы пойдут на `http://localhost:8000`.
> * В стандартном **Android-эмуляторе**: адрес бэкенда — `http://10.0.2.2:8000`.
> * На **реальном телефоне** (через Expo Go): укажите в конфигурации локальный IP-адрес вашего компьютера (например, `http://192.168.1.50:8000`).

---

## 📁 Структура проекта (Frontend)

```text
├── assets/               # Графика, иконки, сплеш-скрин
├── docs/                 # Документация и скриншоты для README
├── src/
│   ├── components/       # Переиспользуемые компоненты (MonthPicker, ProfitChart, Modals)
│   ├── context/          # Контекст состояния финансов и авторизации
│   ├── types/            # TypeScript интерфейсы (Transaction, Category, Account)
│   ├── views/            # Экраны (Home, History, AIAgent, Settings)
│   └── config/           # Конфигурация API и эндпоинтов
├── package.json
└── README.md
```

---

## 📄 Лицензия

Проект распространяется под лицензией [MIT](LICENSE).

---

<div align="center">
Разработано для удобного и осознанного управления личными финансами.
</div>
