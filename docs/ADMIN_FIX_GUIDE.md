# 🔧 Руководство по исправлению админки

## ❌ Проблемы которые были:

1. **Infinite recursion** в RLS policies → ИСПРАВЛЕНО ✅
2. **500 ошибка** при запросе к profiles → ИСПРАВЛЕНО ✅  
3. **Редирект не работает** → ИСПРАВЛЕНО ✅
4. **AdminGuard неправильно проверяет права** → ИСПРАВЛЕНО ✅

## 🚀 Пошаговое исправление

### Шаг 1: Запустите SQL скрипт в Supabase

1. Откройте **Supabase Dashboard**
2. Перейдите в **SQL Editor**
3. Скопируйте и запустите: `SQL/fix_admin_quick.sql`

**ИЛИ выполните вручную:**

```sql
-- 1. ОТКЛЮЧИТЬ RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Добавить колонку
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 3. СДЕЛАТЬ СЕБЯ АДМИНОМ (замените email!)
UPDATE profiles SET is_admin = true WHERE email = 'ВАШ_EMAIL@example.com';

-- 4. Удалить старые политики
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 5. Создать функцию БЕЗ рекурсии
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO user_admin FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(user_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ВКЛЮЧИТЬ RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Создать правильные политики
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT TO authenticated
USING (is_current_user_admin() = true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE TO authenticated
USING (is_current_user_admin() = true)
WITH CHECK (is_current_user_admin() = true);

-- 8. Создать индекс
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
```

### Шаг 2: Проверьте что вы админ

```sql
-- В SQL Editor выполните:
SELECT id, email, is_admin FROM profiles WHERE is_admin = true;

-- Должны увидеть свой email с is_admin = true
```

### Шаг 3: Протестируйте доступ

1. Откройте в браузере: **http://localhost:8080/admin-test**
2. Вы увидите результаты всех тестов:
   - ✅ Test 1: Профиль загружен
   - ✅ Test 2: Функция работает
   - ✅ Test 3: Доступ к списку профилей
   - ✅ Test 4: Статистика
   - ✅ Test 5: Роли

3. Если все зелёное ✅ → всё работает!

### Шаг 4: Откройте админку

1. **Новая Slash Admin**: http://localhost:8080/admin
2. **Старая админка**: http://localhost:8080/admin-old

## 🔍 Что изменилось в коде?

### 1. SQL - Убрана рекурсия

**Было (НЕПРАВИЛЬНО):**
```sql
CREATE POLICY "Admins can view all profiles"
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true  ← РЕКУРСИЯ!
  )
);
```

**Стало (ПРАВИЛЬНО):**
```sql
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO user_admin FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(user_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can view all profiles"
USING (is_current_user_admin() = true);  ← Используем функцию
```

### 2. AdminGuard - Улучшена логика

**Добавлено:**
- ✅ Подробное логирование в console
- ✅ Fallback на прямой запрос если функции нет
- ✅ Правильные редиректы (не админ → `/`, не залогинен → `/auth`)
- ✅ Использование `maybeSingle()` вместо `single()`

**Код:**
```tsx
// Сначала пробуем функцию
const { data, error } = await supabase.rpc('is_current_user_admin');

if (error) {
  // Fallback на прямой запрос
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  
  setIsAdmin(profile?.is_admin || false);
}
```

### 3. Тестовая страница - /admin-test

Создана страница для диагностики:
- Проверяет профиль
- Проверяет функцию RPC
- Проверяет доступ к данным
- Показывает статистику
- Показывает роли пользователя

## 🐛 Troubleshooting

### Проблема: "infinite recursion detected"

**Решение:**
1. Запустите `SQL/fix_admin_quick.sql`
2. Убедитесь что функция `is_current_user_admin()` создана
3. Проверьте что старые политики удалены

### Проблема: "Access Denied" при входе в /admin

**Решение:**
1. Проверьте: `SELECT is_admin FROM profiles WHERE id = 'ваш-id'`
2. Если `false` → выполните: `UPDATE profiles SET is_admin = true WHERE id = 'ваш-id'`
3. Перезагрузите страницу

### Проблема: Редирект не работает

**Решение:**
- Очистите кеш браузера (Ctrl+Shift+Delete)
- Откройте в режиме инкогнито
- Проверьте Console на ошибки

### Проблема: 500 ошибка при запросе

**Решение:**
1. Отключите RLS: `ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;`
2. Удалите все политики
3. Следуйте инструкции заново

## ✅ Проверочный список

После исправлений проверьте:

- [ ] SQL скрипт выполнен без ошибок
- [ ] `is_admin = true` в вашем профиле
- [ ] Функция `is_current_user_admin()` создана
- [ ] RLS политики созданы правильно
- [ ] Тест страница `/admin-test` показывает всё зелёное
- [ ] Админка `/admin` открывается без ошибок
- [ ] Нет ошибок в Console (F12)

## 📊 URL для тестирования

- **Тест доступа**: http://localhost:8080/admin-test
- **Новая админка**: http://localhost:8080/admin
- **Старая админка**: http://localhost:8080/admin-old
- **Главная**: http://localhost:8080/

## 🎯 Следующие шаги

После того как всё заработало:

1. **Протестируйте функции:**
   - Dashboard
   - User management
   - Products management
   - Orders management

2. **Настройте Slash Admin:**
   - Измените тему в `src/admin-panel/theme/`
   - Добавьте свои страницы
   - Интегрируйте с Supabase через `supabaseAdapter`

3. **Deploy:**
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name=stepupshoes
   ```

## 💡 Tips

- **Console logs**: Проверяйте Console (F12) для debug логов
- **SQL тесты**: Используйте SQL Editor для быстрых проверок
- **Admin test**: Страница `/admin-test` - ваш лучший друг
- **RLS**: Если что-то не работает - временно отключите RLS для теста

## 📚 Документация

- `SQL/fix_admin_quick.sql` - Быстрое исправление SQL
- `SQL/add_admin_column.sql` - Полный SQL скрипт
- `FINAL_SETUP_GUIDE.md` - Полная настройка
- `SLASH_ADMIN_INTEGRATION.md` - Документация по Slash Admin

## 🎉 Готово!

Если всё сделано правильно:
- ✅ Нет ошибок в console
- ✅ `/admin-test` показывает всё зелёное
- ✅ `/admin` открывается
- ✅ Вы видите dashboard

**Удачи! 🚀**
