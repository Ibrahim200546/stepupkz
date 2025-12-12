# 🛍️ StepUp Shoes - Интернет-магазин обуви

**[English](./README_EN.md) | [Қазақша](./README_KK.md)**

<div align="center">

![StepUp Shoes](https://img.shields.io/badge/StepUp-Shoes-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)

Современный интернет-магазин обуви с интегрированным мессенджером и админ-панелью

[🌐 Демо](https://stepupkz.vercel.app/) • [📚 Документация](./docs/)

<img width="418" height="421" alt="image" src="https://github.com/user-attachments/assets/58840e0c-632f-4c85-ac51-1e75ccc6acef" /><img width="413" height="416" alt="image" src="https://github.com/user-attachments/assets/b444f855-b168-475f-a05a-7a23922a8de3" />

</div>

---

## 📋 Содержание

- [О проекте](#-о-проекте)
- [Возможности](#-возможности)
- [Технологический стек](#-технологический-стек)
- [Установка](#-установка)
- [Конфигурация](#-конфигурация)
- [Использование](#-использование)
- [Структура проекта](#-структура-проекта)
- [Документация](#-документация)
- [Скрипты](#-скрипты)
- [Лицензия](#-лицензия)

---

## 🎯 О проекте

**StepUp Shoes** — полнофункциональный интернет-магазин обуви, разработанный для Жетысуского Государственного университета. Проект включает:

- 🛒 Каталог товаров с фильтрацией и поиском
- 💬 Встроенный пиксель-арт мессенджер **FlickMassege**
- 👤 Личный кабинет с историей заказов
- 🔐 Админ-панель для управления товарами
- 🌍 Поддержка 3 языков (RU, EN, KK)
- 📱 Адаптивный дизайн для всех устройств

---

## ✨ Возможности

### 🛍️ Для покупателей

- **Каталог товаров**: фильтрация по цене, бренду, размеру
- **Поиск**: быстрый поиск по названию или артикулу
- **Корзина**: добавление товаров и оформление заказа
- **Личный кабинет**: профиль, история заказов
- **Многоязычность**: переключение между RU/EN/KK

### 💬 FlickMassege (Мессенджер)

- **Текстовые сообщения**: мгновенная отправка
- **Голосовые сообщения**: запись и воспроизведение с визуализацией
- **Стикеры**: отправка готовых стикеров
- **Эмодзи**: встроенный эмодзи-пикер
- **Realtime**: обновления в реальном времени через Supabase
- **Уведомления**: браузерные уведомления для новых сообщений
- **Статусы**: онлайн/офлайн, прочитано/не прочитано

### 🔐 Для администраторов

- **Управление товарами**: добавление, редактирование, удаление
- **Управление брендами**: создание и редактирование брендов
- **Управление заказами**: просмотр и обновление статусов
- **Отчёты**: статистика продаж и заказов
- **Роли**: Администратор, Менеджер

---

## 🚀 Технологический стек

### Frontend

- **React 18.3** - UI библиотека
- **TypeScript 5.8** - типизация
- **Vite 5.4** - сборщик
- **TailwindCSS 3.4** - стилизация
- **Shadcn/ui** - компоненты
- **React Router 6** - маршрутизация
- **React Query** - управление состоянием
- **i18next** - интернационализация

### Backend

- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL - база данных
  - Realtime - WebSocket для чата
  - Storage - хранение изображений
  - Auth - аутентификация
  - RLS - Row Level Security

### Мессенджер (FlickMassege)

- **WaveSurfer.js** - визуализация аудио
- **emoji-picker-react** - эмодзи пикер
- **Web Audio API** - звуки уведомлений
- **MediaRecorder API** - запись голоса
- **Notification API** - браузерные уведомления

### Инструменты разработки

- **ESLint** - линтер
- **Prettier** - форматирование
- **TypeScript ESLint** - правила для TS
- **Vite PWA** - поддержка PWA

---

## 📦 Установка

### Требования

- Node.js >= 18.0.0
- npm >= 9.0.0 или pnpm/yarn
- Аккаунт Supabase (бесплатный)

### Шаги установки

1. **Клонируйте репозиторий**

```bash
git clone https://github.com/yourusername/stepupkz.git
cd stepupkz
```

2. **Установите зависимости**

```bash
npm install
# или
pnpm install
# или
yarn install
```

3. **Настройте переменные окружения**

Создайте файл `.env` в корне проекта:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Настройте Supabase**

- Создайте проект в [Supabase](https://supabase.com)
- Выполните миграции из папки `supabase/migrations/`
- Загрузите изображения в Storage бакет `products`

5. **Запустите проект**

```bash
npm run dev
```

Откройте [http://localhost:8080](http://localhost:8080)

---

## ⚙️ Конфигурация

### Supabase миграции

Выполните SQL миграции в Supabase SQL Editor:

1. `20251129000000_flick_messenger_schema.sql` - схема мессенджера
2. `20251129000001_flick_test_data.sql` - тестовые данные (опционально)
3. `20251129000002_enable_realtime.sql` - включение Realtime
4. `20251129000003_fix_rls_registration.sql` - исправление RLS
5. `20251129000004_fix_rls_recursion.sql` - исправление рекурсии

### Тестовые пользователи (FlickMassege)

После выполнения миграций будут созданы 3 тестовых пользователя:

- **Alice**: alice@example.com / password123
- **Bob**: bob@example.com / password123
- **Charlie**: charlie@example.com / password123

---

## 🎮 Использование

### Для разработки

```bash
# Запуск dev сервера
npm run dev

# Сборка для production
npm run build

# Предпросмотр production сборки
npm run preview

# Линтинг
npm run lint
```

### Создание админ пользователя

1. Зарегистрируйтесь на сайте
2. В Supabase SQL Editor выполните:

```sql
-- Добавить роль администратора
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id-from-auth-users', 'admin');
```

3. Перезайдите на сайт

---

## 📁 Структура проекта

```
stepupkz/
├── docs/                      # Документация
│   ├── FLICK_INTEGRATION_GUIDE.md
│   ├── FLICK_SETUP_README.md
│   ├── FIX_409_CONFLICT.md
│   ├── FIX_NOTIFICATIONS.md
│   ├── FIX_RECURSION.md
│   └── CHAT_UPDATE.md
├── public/                    # Статические файлы
│   ├── placeholder-shoe.svg
│   └── ...
├── src/
│   ├── components/           # React компоненты
│   │   ├── admin/           # Админ панель
│   │   ├── cart/            # Корзина
│   │   ├── chat/            # Мессенджер FlickMassege
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── VoiceRecorder.tsx
│   │   │   ├── StickerPicker.tsx
│   │   │   └── CustomEmojiPicker.tsx
│   │   ├── layout/          # Navbar, Footer
│   │   └── products/        # Карточки товаров
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.tsx
│   │   ├── useCart.tsx
│   │   ├── useFlickChat.tsx
│   │   └── useFlickMessages.tsx
│   ├── integrations/        # Интеграции (Supabase)
│   │   └── supabase/
│   ├── locales/             # Переводы (i18n)
│   │   ├── en.json
│   │   ├── ru.json
│   │   └── kk.json
│   ├── pages/               # Страницы приложения
│   │   ├── Home.tsx
│   │   ├── Catalog.tsx
│   │   ├── Product.tsx
│   │   ├── Cart.tsx
│   │   ├── Account.tsx
│   │   ├── Admin.tsx
│   │   ├── FlickChat.tsx
│   │   ├── FlickLogin.tsx
│   │   └── FlickRegister.tsx
│   ├── types/               # TypeScript типы
│   ├── lib/                 # Утилиты
│   │   └── notificationSound.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/          # SQL миграции
├── .env.example             # Пример .env
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📚 Документация

Дополнительная документация находится в папке [`docs/`](./docs/):

- **[FLICK_INTEGRATION_GUIDE.md](./docs/FLICK_INTEGRATION_GUIDE.md)** - техническая интеграция FlickMassege
- **[FLICK_SETUP_README.md](./docs/FLICK_SETUP_README.md)** - быстрый старт FlickMassege
- **[FIX_409_CONFLICT.md](./docs/FIX_409_CONFLICT.md)** - исправление конфликтов 409
- **[FIX_NOTIFICATIONS.md](./docs/FIX_NOTIFICATIONS.md)** - исправление уведомлений
- **[FIX_RECURSION.md](./docs/FIX_RECURSION.md)** - исправление рекурсии RLS
- **[CHAT_UPDATE.md](./docs/CHAT_UPDATE.md)** - обновления чата

---

## 📜 Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev сервера (http://localhost:8080) |
| `npm run build` | Сборка для production в папку `dist/` |
| `npm run preview` | Предпросмотр production сборки |
| `npm run lint` | Проверка кода ESLint |

---

## 🌟 Особенности проекта

### Фильтрация и сортировка

Каталог поддерживает:
- **Фильтр по цене** (слайдер от 0 до 100,000 ₸)
- **Фильтр по бренду** (Nike, Adidas, Puma, Reebok)
- **Фильтр по размеру** (38-45)
- **Сортировка**: Популярные, Цена (дешевле/дороже), Новинки
- **Пагинация**: по 10 товаров на странице

### Пиксель-арт дизайн (FlickMassege)

- Шрифт **Press Start 2P** (Google Fonts)
- Градиентные аватарки
- Пиксельные тени (`shadow-pixel`)
- Стеклянный эффект (`glass-panel`)
- Анимации в стиле ретро

### Realtime обновления

- Мгновенная доставка сообщений
- Обновление статусов "прочитано"
- Индикатор онлайн/офлайн
- Синхронизация между вкладками

---

## 🐛 Известные проблемы и решения

### 409 Conflict в message_status

**Проблема**: Дублирование записей при отправке сообщений.

**Решение**: Используется `.upsert()` вместо `.insert()` с `onConflict: 'message_id,user_id'`.

Подробнее: [docs/FIX_409_CONFLICT.md](./docs/FIX_409_CONFLICT.md)

### Infinite recursion в RLS

**Проблема**: Бесконечная рекурсия в Row Level Security политиках.

**Решение**: Упрощены RLS политики для demo версии.

Подробнее: [docs/FIX_RECURSION.md](./docs/FIX_RECURSION.md)

### Бесконечные уведомления

**Проблема**: Множественные уведомления для одного сообщения.

**Решение**: Добавлено отслеживание показанных уведомлений через `Set`.

Подробнее: [docs/FIX_NOTIFICATIONS.md](./docs/FIX_NOTIFICATIONS.md)

---

## 🤝 Вклад в проект

Мы приветствуем ваш вклад! Для этого:

1. Форкните репозиторий
2. Создайте ветку для вашей фичи (`git checkout -b feature/AmazingFeature`)
3. Закоммитьте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Запушьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

---

## 📞 Контакты

**Жетысуский Государственный университет**

- 📍 И. 187а, Ілияс Жансүгіров көшесі, Талдықорған
- 📧 Email: tanirbergenibrahim44@gmail.com
- 📱 Телефон: +7 (776) 267-59-57

---

## 📄 Лицензия

Этот проект создан для образовательных целей в рамках учебного проекта Жетысуского Государственного университета.

---

## 🙏 Благодарности

- [Supabase](https://supabase.com) - Backend as a Service
- [Shadcn/ui](https://ui.shadcn.com) - UI компоненты
- [TailwindCSS](https://tailwindcss.com) - CSS фреймворк
- [WaveSurfer.js](https://wavesurfer-js.org) - аудио визуализация
- [emoji-picker-react](https://github.com/ealush/emoji-picker-react) - эмодзи пикер

---

<div align="center">

**Сделано с ❤️ в Жетысуском Государственном университете**

[⬆ Наверх](#-stepup-shoes---интернет-магазин-обуви)

</div>
