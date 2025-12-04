# 🎯 Slash Admin - Отдельная сборка

## ✅ Решение проблемы путей

Slash Admin теперь собирается ОТДЕЛЬНО с правильными путями!

## 🏗️ Архитектура

### Два независимых приложения:

1. **Основное приложение** (порт 8080)
   - Главный сайт
   - Старая админка
   - Использует `@/` → `src/`

2. **Slash Admin** (порт 3001 в dev)
   - Отдельное приложение
   - Собственный Vite config
   - Использует `@/` → `src/admin-panel/`

### Интеграция через iframe:

```
Основное приложение (/admin-iframe)
    ↓ загружает
Slash Admin (localhost:3001 в dev, /admin-app в prod)
```

## 🚀 Запуск

### Development

**Вариант 1: Запустить оба приложения**

```bash
# Терминал 1: Основное приложение
npm run dev

# Терминал 2: Slash Admin
npm run dev:admin
```

Затем откройте:
- Основное: http://localhost:8080/
- Админка iframe: http://localhost:8080/admin-iframe
- Slash Admin напрямую: http://localhost:3001/

**Вариант 2: Только основное (без Slash Admin)**

```bash
npm run dev
```

## 📦 Build для production

### Собрать всё:

```bash
npm run build:all
```

Это создаст:
- `dist/` - основное приложение
- `dist-admin/` - Slash Admin

### Собрать только Slash Admin:

```bash
npm run build:admin
```

### Собрать только основное:

```bash
npm run build
```

## 🔧 Конфигурация

### vite.config.admin.ts

Отдельный Vite config для Slash Admin:

```typescript
export default defineConfig({
  root: './src/admin-panel',
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/admin-panel"),
    },
  },
  
  build: {
    outDir: path.resolve(__dirname, './dist-admin'),
  },
});
```

### tsconfig.json для admin-panel

`src/admin-panel/tsconfig.json` с правильными путями:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## 🔐 Авторизация

Slash Admin интегрирован с основной системой:

### StepUpAuthGuard

```tsx
// Проверяет:
1. Авторизацию через Supabase
2. Права админа (is_admin)
3. Редиректит если нет доступа
```

### Общий Supabase

Оба приложения используют один Supabase instance:

```typescript
// src/integrations/supabase/client.ts
export const supabase = createClient(URL, KEY);
```

Slash Admin импортирует его:

```typescript
import { supabase } from '../integrations/supabase/client';
```

## 📁 Структура файлов

```
stepupkz/
├── vite.config.ts              # Основной Vite config
├── vite.config.admin.ts        # Slash Admin Vite config
├── src/
│   ├── admin-panel/            # Slash Admin
│   │   ├── index.html          # HTML для Slash Admin
│   │   ├── main-entry.tsx      # Entry point
│   │   ├── stepup-auth-guard.tsx # Auth integration
│   │   ├── tsconfig.json       # TypeScript config
│   │   └── ...                 # Все файлы Slash Admin
│   │
│   ├── pages/
│   │   ├── SlashAdmin.tsx      # Placeholder (старый)
│   │   └── SlashAdminIframe.tsx # Iframe загрузчик
│   │
│   └── integrations/
│       └── supabase/
│           └── client.ts       # Общий Supabase
│
├── dist/                       # Build основного приложения
└── dist-admin/                 # Build Slash Admin
```

## 🌐 URL структура

### Development:
- **Основное:** http://localhost:8080/
- **Slash Admin iframe:** http://localhost:8080/admin-iframe
- **Slash Admin прямой:** http://localhost:3001/
- **Старая админка:** http://localhost:8080/admin-old
- **Тест:** http://localhost:8080/admin-test

### Production:
- **Основное:** https://stepupshoes.pages.dev/
- **Slash Admin iframe:** https://stepupshoes.pages.dev/admin-iframe
- **Старая админка:** https://stepupshoes.pages.dev/admin-old

## 🚢 Deploy

### Cloudflare Pages (рекомендуется)

**1. Build:**
```bash
npm run build:all
```

**2. Deploy основного приложения:**
```bash
npx wrangler pages deploy dist --project-name=stepupshoes --branch=main
```

**3. Deploy Slash Admin:**

Вариант A - Тот же домен:
```bash
# Скопировать dist-admin в dist/admin-app
mkdir dist/admin-app
cp -r dist-admin/* dist/admin-app/

# Заново задеплоить
npx wrangler pages deploy dist --project-name=stepupshoes --branch=main
```

Вариант B - Отдельный проект:
```bash
npx wrangler pages deploy dist-admin --project-name=stepupshoes-admin --branch=main
```

### Vercel

**package.json scripts для Vercel:**

```json
{
  "scripts": {
    "vercel-build": "npm run build:all && mkdir -p dist/admin-app && cp -r dist-admin/* dist/admin-app/"
  }
}
```

## 📊 Преимущества этого подхода

✅ **Правильные пути импорта**
- Slash Admin использует `@/` → `src/admin-panel/`
- Основное приложение использует `@/` → `src/`
- Нет конфликтов!

✅ **Независимая разработка**
- Можно запускать отдельно
- Быстрая пересборка
- Независимое тестирование

✅ **Изоляция**
- Отдельные зависимости
- Отдельные build конфигурации
- Меньше конфликтов

✅ **Гибкость**
- Можно деплоить отдельно
- Можно использовать разные домены
- Легко обновлять

## 🎯 Использование

### Для пользователей:

Просто откройте: http://localhost:8080/admin-iframe

Всё работает автоматически!

### Для разработчиков:

**Разработка Slash Admin:**
```bash
# Запустить только Slash Admin
npm run dev:admin

# Открыть напрямую
http://localhost:3001/
```

**Разработка основного:**
```bash
npm run dev
```

**Разработка вместе:**
```bash
# Терминал 1
npm run dev

# Терминал 2
npm run dev:admin
```

## 🔍 Troubleshooting

### Slash Admin не загружается в iframe

**Решение:**
1. Проверьте что Slash Admin запущен: http://localhost:3001/
2. Проверьте Console на ошибки CORS
3. Убедитесь что оба сервера запущены

### Ошибки импорта в Slash Admin

**Решение:**
Убедитесь что используете правильный config:
```bash
npm run dev:admin # НЕ npm run dev
```

### Build не работает

**Решение:**
```bash
# Очистить и пересобрать
rm -rf dist dist-admin
npm run build:all
```

## 📚 Команды

```bash
# Development
npm run dev              # Основное приложение (8080)
npm run dev:admin        # Slash Admin (3001)

# Build
npm run build            # Только основное
npm run build:admin      # Только Slash Admin
npm run build:all        # Оба приложения

# Preview
npm run preview          # Preview основного
npm run preview:admin    # Preview Slash Admin

# Deploy
npm run build:all && npx wrangler pages deploy dist
```

## 🎉 Готово!

Теперь Slash Admin работает с правильными путями!

**Попробуйте:**
```bash
# Запустить оба
npm run dev
npm run dev:admin  # в другом терминале

# Открыть
http://localhost:8080/admin-iframe
```

**Удачи! 🚀**
