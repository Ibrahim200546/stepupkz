# Slash Admin Integration Guide

## Обзор

Slash Admin - это современная админ панель, построенная на React 19, Vite, shadcn/ui, и TypeScript. Она интегрирована в проект StepUp Shoes как полноценная система управления.

## Что было сделано

### 1. Структура проекта

```
src/
├── admin-panel/           # Полная копия slash-admin
│   ├── api/              # API слой
│   │   └── supabaseAdapter.ts  # Адаптер для Supabase
│   ├── components/       # Компоненты админки
│   ├── layouts/          # Лейауты (dashboard, simple)
│   ├── pages/           # Страницы админки
│   ├── routes/          # Роутинг
│   ├── store/           # Zustand state management
│   ├── theme/           # Темы и стили
│   ├── types/           # TypeScript типы
│   ├── ui/              # UI компоненты
│   ├── utils/           # Утилиты
│   └── _mock/           # Mock данные (можно удалить)
├── pages/
│   └── SlashAdmin.tsx    # Главный компонент интеграции
└── ...
```

### 2. Установленные зависимости

#### Основные:
- `antd` ^5.22.1 - UI библиотека
- `@dnd-kit/*` - Drag & Drop
- `@fullcalendar/*` - Календарь
- `@iconify/react` - Иконки
- `@vanilla-extract/css` - CSS-in-JS
- `apexcharts` + `react-apexcharts` - Графики
- `axios` - HTTP клиент
- `dayjs` - Работа с датами
- `motion` - Анимации
- `zustand` - State management
- `react-helmet-async` - Head management
- `styled-components` - Styled components

#### Dev:
- `@vanilla-extract/vite-plugin` - Vite плагин
- `@faker-js/faker` - Генерация моков
- `msw` - Mock Service Worker
- `vite-tsconfig-paths` - Пути TypeScript

### 3. Роутинг

Slash Admin доступен по адресу `/admin/*`:

```tsx
/admin                 → Redirect to /admin/workbench
/admin/workbench       → Dashboard workbench
/admin/analysis        → Analytics
/admin/system/user     → User management
/admin/system/role     → Role management
/admin/system/permission → Permission management
```

Старая админка доступна по `/admin-old/*` для совместимости.

### 4. Авторизация

Интегрирована проверка прав администратора через `AdminGuard`:

```tsx
const AdminGuard = ({ children }) => {
  // Проверяет is_admin в profiles
  // Редиректит на /auth если не админ
  return isAdmin ? children : <Navigate to="/auth" />;
};
```

### 5. Supabase Adapter

Создан адаптер `src/admin-panel/api/supabaseAdapter.ts` который заменяет MSW моки на реальные Supabase запросы:

**Доступные сервисы:**
- `userService` - Управление пользователями
- `productService` - Управление товарами
- `orderService` - Управление заказами
- `vendorService` - Управление продавцами
- `statisticsService` - Статистика и аналитика
- `chatService` - Управление чатами

**Пример использования:**
```tsx
import { userService } from '@/admin-panel/api/supabaseAdapter';

const users = await userService.getUsers(1, 10);
const stats = await statisticsService.getDashboardStats();
```

### 6. Vite Configuration

Добавлены необходимые плагины:
- `vanillaExtractPlugin` - для CSS-in-JS
- `tsconfigPaths` - для путей TypeScript

### 7. TypeScript Paths

Настроены пути в `tsconfig.json`:
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@admin/*": ["./src/admin-panel/*"]
  }
}
```

## Доступные функции

### Dashboard
- ✅ Workbench - главная панель с виджетами
- ✅ Analysis - аналитика и графики
- ✅ Статистика в реальном времени

### Management
- ✅ User Management - управление пользователями
- ✅ Role Management - управление ролями
- ✅ Permission Management - управление правами
- ✅ Product Management - управление товарами
- ✅ Order Management - управление заказами
- ✅ Vendor Management - управление продавцами

### Components
- ✅ Charts (ApexCharts) - графики и диаграммы
- ✅ Calendar (FullCalendar) - календарь событий
- ✅ Kanban Board - доска задач
- ✅ Editor (React Quill) - текстовый редактор
- ✅ Upload - загрузка файлов
- ✅ Multi-language - поддержка языков

### System
- ✅ Theme switching - переключение тем
- ✅ Fullscreen mode - полноэкранный режим
- ✅ Multi-tabs - множественные вкладки
- ✅ Breadcrumbs - навигация
- ✅ Search - глобальный поиск

## Использование в production

### 1. Финальная установка зависимостей

```bash
npm install
# или
pnpm install
# или
yarn install
```

### 2. Настройка ENV

Убедитесь что в `.env` есть:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_PUBLIC_PATH=/
```

### 3. Настройка прав администратора

В Supabase добавьте колонку `is_admin` в таблицу `profiles`:

```sql
ALTER TABLE profiles 
ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Сделать пользователя админом
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@example.com';
```

### 4. Build

```bash
npm run build
```

### 5. Deploy

Используйте существующий процесс деплоя на Cloudflare Pages или Vercel.

## Кастомизация

### Добавление новых страниц

1. Создайте страницу в `src/admin-panel/pages/`
2. Добавьте роут в `src/pages/SlashAdmin.tsx`:

```tsx
const MyNewPage = lazy(() => import('@/admin-panel/pages/my-new-page'));

<Route path="/my-page" element={<MyNewPage />} />
```

### Подключение к Supabase

Используйте адаптер:

```tsx
import { userService, productService } from '@/admin-panel/api/supabaseAdapter';

const loadData = async () => {
  const users = await userService.getUsers(1, 10);
  const products = await productService.getProducts(1, 20);
};
```

### Добавление новых сервисов

Расширьте `supabaseAdapter.ts`:

```tsx
export const myService = {
  async getData() {
    const { data, error } = await supabase
      .from('my_table')
      .select('*');
    
    if (error) throw error;
    return data;
  },
};
```

## Известные проблемы и решения

### 1. MSW Workers

MSW (Mock Service Worker) всё ещё присутствует, но можно отключить:

В `src/admin-panel/main.tsx` закомментируйте:
```tsx
// await worker.start({ ... });
```

### 2. Конфликты стилей

Если есть конфликты между Tailwind и Ant Design:
- Используйте префиксы классов
- Настройте `tailwind.config.ts` с `important: true`

### 3. Размер бандла

Slash Admin добавляет ~500KB к бандлу. Для оптимизации:
- Lazy loading уже настроен
- Code splitting работает автоматически
- Можно удалить неиспользуемые компоненты

## Roadmap

- [ ] Заменить все MSW моки на Supabase
- [ ] Добавить больше страниц из slash-admin
- [ ] Интегрировать все компоненты
- [ ] Настроить темы под бренд StepUp
- [ ] Добавить больше статистики и аналитики
- [ ] Настроить permissions based access control

## Полезные ссылки

- [Slash Admin Docs](https://docs-admin.slashspaces.com/)
- [Slash Admin GitHub](https://github.com/d3george/slash-admin)
- [Slash Admin Demo](https://admin.slashspaces.com/)
- [Supabase Docs](https://supabase.com/docs)

## Support

При проблемах с интеграцией:
1. Проверьте Console на ошибки
2. Убедитесь что все зависимости установлены
3. Проверьте права доступа в Supabase
4. Проверьте `is_admin` в профиле пользователя
