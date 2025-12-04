# ⚡ QUICK START - Slash Admin

## 🚀 Запуск за 3 шага

### Шаг 1: Запустите оба сервера

Откройте **ДВА** терминала:

**Терминал 1 - Основное приложение:**
```bash
npm run dev
```

**Терминал 2 - Slash Admin:**
```bash
npm run dev:admin
```

### Шаг 2: Откройте админку

```
http://localhost:8080/admin-iframe
```

### Шаг 3: Готово! ✅

Slash Admin загрузится в iframe с полной функциональностью!

---

## 📍 Все URL

### Development:
- **Основное:** http://localhost:8080/
- **Slash Admin (iframe):** http://localhost:8080/admin-iframe
- **Slash Admin (прямой):** http://localhost:3001/
- **Старая админка:** http://localhost:8080/admin-old
- **Тест доступа:** http://localhost:8080/admin-test

---

## 🔧 Если что-то не работает

### 1. Проверьте is_admin

```sql
-- В Supabase SQL Editor:
UPDATE profiles SET is_admin = true WHERE email = 'ваш@email.com';
```

### 2. Проверьте что оба сервера запущены

```bash
# Терминал 1
npm run dev
# Должно быть: VITE v5.x.x ready in xxx ms
# ➜  Local:   http://localhost:8080/

# Терминал 2  
npm run dev:admin
# Должно быть: VITE v5.x.x ready in xxx ms
# ➜  Local:   http://localhost:3001/
```

### 3. Проверьте Console

Откройте DevTools (F12) → Console

Не должно быть ошибок вроде:
- ❌ "Failed to fetch"
- ❌ "CORS error"
- ❌ "Module not found"

### 4. Очистите кеш

```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

---

## 📦 Build для production

```bash
# 1. Build всё
npm run build:all

# 2. Скопировать admin в основной dist
mkdir dist/admin-app
cp -r dist-admin/* dist/admin-app/

# 3. Deploy на Cloudflare
npx wrangler pages deploy dist --project-name=stepupshoes --branch=main
```

---

## 💡 Полезные команды

```bash
# Development
npm run dev              # Основное (8080)
npm run dev:admin        # Slash Admin (3001)

# Build
npm run build            # Только основное
npm run build:admin      # Только Slash Admin  
npm run build:all        # Оба приложения

# Preview
npm run preview          # Preview основного
npm run preview:admin    # Preview Slash Admin
```

---

## 🎯 Проверочный список

Перед запуском убедитесь:

- [ ] Node.js установлен
- [ ] `npm install` выполнен
- [ ] `.env` с Supabase credentials
- [ ] `is_admin = true` в вашем профиле
- [ ] SQL скрипт выполнен

---

## 📚 Документация

- **QUICK_START_SLASH_ADMIN.md** (этот файл)
- **SLASH_ADMIN_SEPARATE_BUILD.md** - полная документация
- **SLASH_ADMIN_READY.md** - детальная инструкция
- **README_ADMIN.md** - общее руководство

---

## 🎉 Готово!

Теперь запустите оба сервера и наслаждайтесь Slash Admin!

```bash
# Терминал 1
npm run dev

# Терминал 2
npm run dev:admin

# Браузер
http://localhost:8080/admin-iframe
```

**Удачи! 🚀**
