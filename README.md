# 🏛️ BankIM Management Portal

Портал управления BankIM - современная веб-платформа для управления банковскими операциями и клиентским сервисом.

## 📋 Описание проекта

BankIM Management Portal - это комплексная система управления для банковских сотрудников, директоров и администраторов. Платформа предоставляет удобный интерфейс для управления клиентами, заявками, документами и банковскими услугами.

## ✨ Основные возможности

### 🏛️ Сотрудник банка
- **Управление клиентами** - просмотр и редактирование информации о клиентах
- **Обработка заявок** - управление статусами заявок на кредиты и ипотеку
- **Работа с документами** - отслеживание статуса документов
- **Фильтрация и поиск** - мощные инструменты поиска по клиентам
- **Пагинация** - удобная навигация по большим спискам

### 🎛️ Общие компоненты
- **SharedHeader** - единый заголовок с навигацией и языковым переключателем
- **SharedMenu** - боковое меню с ролевой навигацией
- **Адаптивный дизайн** - поддержка мобильных устройств
- **Современный UI** - темная тема с яркими акцентами

### 📊 Функциональность
- **Поиск в реальном времени** - мгновенный поиск по имени, телефону, паспорту
- **Множественные фильтры** - фильтрация по услугам, статусам, датам
- **Управление состояниями** - отслеживание статусов заявок и документов
- **Интерактивные элементы** - кнопки действий для каждого клиента

## 🛠️ Технологический стек

- **Frontend Framework:** React 18 + TypeScript
- **Сборщик:** Vite
- **Маршрутизация:** React Router DOM
- **Стилизация:** CSS3 с CSS Variables
- **База данных:** PostgreSQL (только удаленные)
- **Развертывание:** Railway
- **Языки интерфейса:** Русский, Английский, Иврит
- **Иконки:** Эмодзи и Unicode символы

## 📦 Установка

### Предварительные требования
- Node.js 16+ 
- npm или yarn

### Инструкции по установке

1. **Клонируйте репозиторий:**
```bash
git clone git@github.com:MichaelMishaev/bankimOnlineAdmin.git
cd bankimOnlineAdmin
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Запустите сервер разработки:**
```bash
npm run dev
```

4. **Откройте браузер:**
```
http://localhost:3004
```

## 🗄️ База данных

**Важно:** Проект работает только с PostgreSQL базами данных на удаленных серверах (Railway).

### 🏗️ Архитектура баз данных:
- **Content Database (`bankim_content`):** Для управления контентом, страницами, статьями
- **Management Database (`bankim_management`):** Для основных банковских операций, пользователей, счетов
- **Local SQLite:** Для локальной разработки и тестирования

### ⚙️ Конфигурация:
Все конфигурации баз данных организованы в отдельных файлах:

```bash
server/config/
├── database-content.js      # Конфигурация bankim_content
├── database-management.js   # Конфигурация bankim_management
├── database-config.js       # Мастер-файл конфигурации
└── database-local.js        # Локальная SQLite конфигурация
```

### 🔧 Переменные окружения:
```bash
# Content Database
CONTENT_DATABASE_URL=postgresql://postgres:***@shortline.proxy.rlwy.net:33452/railway

# Management Database  
MANAGEMENT_DATABASE_URL=postgresql://postgres:***@yamanote.proxy.rlwy.net:53119/railway

# Development
USE_LOCAL_DB=false
NODE_ENV=development
```

### 📊 Статус баз данных:
- **bankim_content** (✅ активна): `test_content` с id = 1
- **bankim_management** (✅ активна): `test_management` с id = 1

### ⚙️ Система конфигурации:
Проект использует модульную систему конфигурации для управления базами данных:

```javascript
// Файлы конфигурации
server/config/
├── database-config.js        # Главная конфигурация
├── database-content.js       # Конфигурация bankim_content
├── database-management.js    # Конфигурация bankim_management
└── database-local.js         # Локальная SQLite конфигурация
```

**Использование:**
```javascript
import { databaseConfig, initializeAllDatabases } from './config/database-config.js';

// Инициализация всех баз данных
await initializeAllDatabases();

// Получение конфигурации конкретной базы данных
const contentDb = databaseConfig.content;
const managementDb = databaseConfig.management;
```

### 🚀 Локальная разработка:
```bash
# Запуск локального SQLite сервера для тестирования
npm run test:server
```

## 🚀 Доступные скрипты

```bash
# Запуск сервера разработки
npm run dev

# Сборка для продакшена
npm run build

# Предварительный просмотр продакшен сборки
npm run preview

# Линтинг кода
npm run lint

# Локальное тестирование базы данных (SQLite)
npm run test:server

# Тестирование конфигурационной системы баз данных
npm run test:config
```

### База данных скрипты:
```bash
# Создание тестовой таблицы PostgreSQL
node server/create-test-table.sql

# Быстрый тест подключения к bankim_content
node server/quick-content-test.js

# Быстрый тест подключения к bankim_management
node server/quick-management-test.js

# Комплексный тест обеих баз данных
node server/test-both-databases.js

# Тест новой системы конфигурации (РЕКОМЕНДУЕТСЯ)
node server/test-config-system.js
```

## 📁 Структура проекта

```
bankIM_management_portal/
├── src/
│   ├── components/           # Переиспользуемые компоненты
│   │   ├── SharedHeader/     # Компонент заголовка
│   │   ├── SharedMenu/       # Компонент меню
│   │   ├── AdminLayout/      # Лейаут для админки
│   │   └── QAShowcase/       # Компонент демонстрации
│   ├── pages/               # Страницы приложения
│   │   ├── BankEmployee.tsx  # Страница сотрудника банка
│   │   └── BankEmployee.css  # Стили страницы
│   ├── App.tsx              # Главный компонент
│   ├── main.tsx             # Точка входа
│   └── index.css            # Глобальные стили
├── server/                  # Серверные компоненты
│   ├── config/              # Конфигурации баз данных
│   │   ├── database-content.js      # Конфигурация bankim_content
│   │   ├── database-management.js   # Конфигурация bankim_management
│   │   └── database-config.js       # Мастер-файл конфигурации
│   ├── database-railway.js  # PostgreSQL конфигурация (Railway)
│   ├── database-local.js    # Локальная SQLite конфигурация
│   ├── server-railway.js    # Сервер для Railway
│   ├── server-local.js      # Локальный тестовый сервер
│   ├── create-test-table.sql # SQL скрипт для создания тестовой таблицы
│   ├── quick-content-test.js # Быстрый тест bankim_content
│   ├── quick-management-test.js # Быстрый тест bankim_management
│   ├── test-both-databases.js # Комплексный тест обеих БД
│   └── test-config-system.js # Тест системы конфигурации
├── public/                  # Статические файлы
├── package.json             # Зависимости и скрипты
├── tsconfig.json           # Конфигурация TypeScript
├── vite.config.ts          # Конфигурация Vite
└── README.md               # Этот файл
```

## 🎨 Компоненты

### SharedHeader
Универсальный заголовок с функциями:
- Логотип с навигацией
- Заголовок страницы
- Языковой переключатель (EN/RU/HE)
- Подтверждение навигации

### SharedMenu
Боковое меню навигации:
- Ролевая навигация
- Сворачиваемые секции
- Активные состояния
- Мобильная адаптация

### BankEmployee
Основная страница для сотрудников банка:
- Таблица клиентов
- Поиск и фильтрация
- Пагинация
- Управление статусами

## 🔧 Разработка

### Добавление новых страниц

1. Создайте компонент в `src/pages/`
2. Добавьте маршрут в `App.tsx`
3. Обновите меню в `SharedMenu.tsx`

### Стилизация

Проект использует:
- CSS Variables для темизации
- Мобильные медиа-запросы
- Flexbox и Grid для лейаутов
- Hover и focus состояния

### Типизация

Все компоненты типизированы с TypeScript:
- Интерфейсы для пропсов
- Типы для данных
- Строгая типизация событий

## 📱 Адаптивность

Приложение поддерживает:
- **Desktop** (1200px+) - полный функционал
- **Tablet** (768px-1199px) - адаптированное меню
- **Mobile** (до 767px) - мобильная навигация

## 🌐 Многоязычность

Поддерживаемые языки:
- **Русский** (основной)
- **Английский** 
- **Иврит**

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для фичи (`git checkout -b feature/AmazingFeature`)
3. Коммитьте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Пушьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📋 Планы развития

- [ ] Авторизация и аутентификация
- [ ] API интеграция
- [ ] Уведомления в реальном времени
- [ ] Экспорт данных
- [ ] Аналитика и отчеты
- [ ] Мобильное приложение

## 🐛 Сообщение об ошибках

Если вы нашли баг, пожалуйста:
1. Проверьте, что баг еще не был зарепорчен
2. Создайте issue с подробным описанием
3. Укажите шаги для воспроизведения
4. Приложите скриншоты если возможно

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 👨‍💻 Автор

**Michael Mishayev**
- GitHub: [@MichaelMishaev](https://github.com/MichaelMishaev)
- Email: michaelmishayev@example.com

## 🙏 Благодарности

- React команде за отличный фреймворк
- Vite за быструю сборку
- Всем участникам open source сообщества

---

**BankIM Management Portal** - Делаем банковское управление простым и эффективным! 🚀 