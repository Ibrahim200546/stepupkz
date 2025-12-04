# Slash Admin - Quick Start Guide

## 🚀 Быстрый старт

### 1. Установка зависимостей (если еще не установлены)

```bash
npm install
```

### 2. Настройка базы данных

Выполните SQL скрипт в Supabase:

```bash
# В Supabase Dashboard → SQL Editor
# Запустите файл: SQL/add_admin_column.sql
```

Или вручную:
```sql
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
UPDATE profiles SET is_admin = true WHERE email = 'ваш-email@example.com';
```

### 3. Создание первого админа

В Supabase Dashboard:
1. Table Editor → profiles
2. Найдите свой профиль
3. Установите `is_admin` = `true`

### 4. Запуск проекта

```bash
npm run dev
```

### 5. Вход в админку

1. Авторизуйтесь на сайте: http://localhost:8080/auth
2. Перейдите в админку: http://localhost:8080/admin

## 📁 Структура

```
/admin                    → Slash Admin (новая админка)
/admin/workbench         → Главная панель
/admin/analysis          → Аналитика
/admin/system/user       → Управление пользователями
/admin/system/role       → Управление ролями
/admin/system/permission → Управление правами

/admin-old               → Старая админка (для совместимости)
```

## 🎨 Основные функции

### Dashboard
- **Workbench** - главная панель с виджетами статистики
- **Analysis** - графики и аналитика продаж

### Management  
- **Users** - управление пользователями
- **Products** - управление товарами
- **Orders** - управление заказами
- **Vendors** - управление продавцами
- **Chats** - мониторинг чатов

### Components
- **Charts** - графики ApexCharts
- **Calendar** - календарь событий
- **Kanban** - доска задач
- **Editor** - текстовый редактор
- **Upload** - загрузка файлов

## 🔧 API

Все данные загружаются из Supabase через адаптер:

```tsx
import { 
  userService, 
  productService, 
  orderService,
  statisticsService 
} from '@/admin-panel/api/supabaseAdapter';

// Получить пользователей
const users = await userService.getUsers(page, pageSize);

// Получить статистику
const stats = await statisticsService.getDashboardStats();

// Получить заказы
const orders = await orderService.getOrders(page, pageSize);
```

## 🎨 Кастомизация

### Изменить тему

В `src/admin-panel/theme/` можно настроить:
- Цвета
- Шрифты
- Отступы
- Тени

### Добавить страницу

1. Создайте файл: `src/admin-panel/pages/my-page/index.tsx`
2. Добавьте роут в `src/pages/SlashAdmin.tsx`:

```tsx
const MyPage = lazy(() => import('@/admin-panel/pages/my-page'));

<Route path="/my-page" element={<MyPage />} />
```

### Добавить сервис

Расширьте `src/admin-panel/api/supabaseAdapter.ts`:

```tsx
export const myNewService = {
  async getData() {
    const { data, error } = await supabase
      .from('my_table')
      .select('*');
    
    if (error) throw error;
    return data;
  },
};
```

## 📊 Доступные данные

Адаптер автоматически загружает данные из таблиц:
- `profiles` - пользователи
- `products` - товары
- `orders` - заказы
- `vendors` - продавцы
- `chats` - чаты
- `messages` - сообщения

## 🔐 Права доступа

Проверка прав происходит автоматически через `AdminGuard`:
- Проверяет `is_admin` в таблице `profiles`
- Редиректит на `/auth` если не админ
- Кэширует результат проверки

## 🚀 Деплой

### Build
```bash
npm run build
```

### Deploy на Cloudflare Pages
```bash
npx wrangler pages deploy dist --project-name=stepupshoes --branch=main
```

### Deploy на Vercel
```bash
vercel --prod
```

## ⚙️ ENV Variables

Убедитесь что установлены:
```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

## 🐛 Troubleshooting

### "Forbidden" или "Access Denied"
→ Проверьте `is_admin = true` в профиле

### Не загружаются данные
→ Проверьте RLS policies в Supabase

### Ошибки импорта
→ Убедитесь что зависимости установлены: `npm install`

### Большой размер бандла
→ Lazy loading уже настроен автоматически

## 📚 Документация

- [SLASH_ADMIN_INTEGRATION.md](./SLASH_ADMIN_INTEGRATION.md) - Полная документация
- [Slash Admin Docs](https://docs-admin.slashspaces.com/)
- [Slash Admin Demo](https://admin.slashspaces.com/)

## 💡 Tips

1. **Theme Toggle** - используйте иконку солнца/луны в header
2. **Fullscreen** - кнопка в header для полноэкранного режима
3. **Multi-tabs** - открывайте несколько страниц одновременно
4. **Search** - Cmd/Ctrl + K для глобального поиска
5. **Language** - переключайте язык в header

## 🎯 Roadmap

- [ ] Добавить больше статистики
- [ ] Интегрировать все компоненты slash-admin
- [ ] Настроить уведомления
- [ ] Добавить экспорт данных
- [ ] Настроить permission-based access control

## 💬 Support

При проблемах:
1. Проверьте Console на ошибки
2. Убедитесь что `is_admin = true`
3. Проверьте права доступа в Supabase
4. См. документацию: [SLASH_ADMIN_INTEGRATION.md](./SLASH_ADMIN_INTEGRATION.md)
