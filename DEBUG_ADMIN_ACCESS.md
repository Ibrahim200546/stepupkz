# 🐛 Отладка проблемы с кнопкой админ панели

## Проблема
Кнопка админ панели не появляется в профиле, хотя роль admin назначена в БД.

## Шаги для отладки

### Шаг 1: Проверить консоль браузера

1. Откройте http://localhost:8081/account
2. Нажмите F12 → Console
3. Перейдите на вкладку "Profile"
4. Посмотрите логи:

**Должны увидеть:**
```
🔍 Checking roles for user: [ваш-user-id]
📊 Roles query result: {data: [{role: 'admin'}], error: null}
✅ User roles: ['admin']
🎯 Admin access: {isAdmin: true, isManager: false, hasAccess: true}
```

**Если видите пустой массив:**
```
📊 Roles query result: {data: [], error: null}
✅ User roles: []
```
→ Роль не назначена в БД!

### Шаг 2: Проверить Debug Info на странице

В профиле должна быть желтая карточка с отладочной информацией:

```
🐛 Debug Info:
hasAdminAccess: true
isAdmin: true
isManager: false
rolesLoading: false
User ID: [ваш-id]
```

**Если hasAdminAccess = false:**
→ Роль не найдена в БД

**Если rolesLoading = true (долго):**
→ Запрос к БД завис

### Шаг 3: Проверить роль в БД напрямую

```sql
-- Supabase Dashboard → SQL Editor

-- Получить текущего пользователя
SELECT auth.uid() as current_user_id;

-- Проверить роли текущего пользователя
SELECT * FROM user_roles WHERE user_id = auth.uid();

-- Если пусто - назначить роль
INSERT INTO user_roles (user_id, role)
VALUES (auth.uid(), 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Проверить снова
SELECT * FROM user_roles WHERE user_id = auth.uid();
```

### Шаг 4: Проверить RLS политики

```sql
-- Проверить что политика существует
SELECT * FROM pg_policies 
WHERE tablename = 'user_roles';

-- Если политик нет - создать
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);
```

### Шаг 5: Проверить что миграции применены

```sql
-- Проверить существование таблицы
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_roles'
);

-- Должно вернуть: true
```

### Шаг 6: Проверить структуру таблицы

```sql
-- Посмотреть структуру
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_roles';

-- Должно быть:
-- id, uuid
-- user_id, uuid
-- role, app_role (или text)
-- created_at, timestamp
```

### Шаг 7: Жесткая перезагрузка

1. Очистить кэш браузера (Ctrl+Shift+Delete)
2. Перезапустить dev сервер:
   ```bash
   # Ctrl+C
   npm run dev
   ```
3. Открыть в инкогнито режиме
4. Залогиниться заново

### Шаг 8: Проверить что hook вызывается

В консоли должны быть логи при переходе на вкладку Profile:

```
🔍 Checking roles for user: ...
```

**Если логов нет:**
→ Hook не вызывается, проблема в импорте

## Частые причины

### Причина 1: Роль не назначена

**Проверка:**
```sql
SELECT * FROM user_roles WHERE user_id = auth.uid();
-- Пусто
```

**Решение:**
```sql
INSERT INTO user_roles (user_id, role)
VALUES (auth.uid(), 'admin');
```

### Причина 2: RLS блокирует запрос

**Проверка:**
```sql
-- В консоли браузера
📊 Roles query result: {data: null, error: {...}}
```

**Решение:**
```sql
-- Создать политику
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);
```

### Причина 3: Таблица не существует

**Проверка:**
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'user_roles'
);
-- Вернет: false
```

**Решение:**
Применить миграции из `FIXED_MIGRATIONS_ORDER.sql`

### Причина 4: Неправильный user_id

**Проверка:**
```sql
-- ID из консоли
User ID: abc-123-def

-- ID в БД
SELECT id FROM auth.users;
-- xyz-456-ghi (не совпадает!)
```

**Решение:**
Используйте правильный ID:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('xyz-456-ghi', 'admin'); -- Правильный ID
```

### Причина 5: Кэш браузера

**Решение:**
1. Ctrl+Shift+Delete
2. Очистить всё
3. Перезайти на сайт

## Тестовый SQL скрипт

Выполните всё одной командой:

```sql
-- Полная проверка и исправление
DO $$
DECLARE
  current_uid uuid;
  role_count int;
BEGIN
  -- Получить текущего пользователя
  current_uid := auth.uid();
  
  RAISE NOTICE 'Current user ID: %', current_uid;
  
  IF current_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated!';
  END IF;
  
  -- Проверить роли
  SELECT COUNT(*) INTO role_count
  FROM user_roles
  WHERE user_id = current_uid;
  
  RAISE NOTICE 'Roles count: %', role_count;
  
  -- Если нет ролей - назначить admin
  IF role_count = 0 THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (current_uid, 'customer');
    
    INSERT INTO user_roles (user_id, role)
    VALUES (current_uid, 'admin');
    
    RAISE NOTICE 'Admin role assigned!';
  END IF;
  
  -- Показать результат
  RAISE NOTICE 'Final roles: %', (
    SELECT array_agg(role) 
    FROM user_roles 
    WHERE user_id = current_uid
  );
END $$;

-- Проверить результат
SELECT * FROM user_roles WHERE user_id = auth.uid();
```

## Быстрое решение

Если ничего не помогает - попробуйте это:

```sql
-- 1. Удалить все роли текущего пользователя
DELETE FROM user_roles WHERE user_id = auth.uid();

-- 2. Назначить заново
INSERT INTO user_roles (user_id, role)
VALUES (auth.uid(), 'customer');

INSERT INTO user_roles (user_id, role)
VALUES (auth.uid(), 'admin');

-- 3. Проверить
SELECT * FROM user_roles WHERE user_id = auth.uid();
```

После этого:
1. Обновить страницу профиля (F5)
2. Проверить Debug Info
3. Кнопка должна появиться!

## Проверка после исправления

✅ В консоли браузера:
```
✅ User roles: ['customer', 'admin']
🎯 Admin access: {isAdmin: true, hasAccess: true}
```

✅ В Debug Info:
```
hasAdminAccess: true
isAdmin: true
```

✅ На странице:
Видна карточка "Админ панель" с кнопкой!

---

**Если всё равно не работает:**
Напишите мне что видите в:
1. Консоли браузера (логи)
2. Debug Info (все значения)
3. SQL запросе (результат SELECT * FROM user_roles)
