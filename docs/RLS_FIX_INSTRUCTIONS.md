# 🔧 Исправление ошибки "infinite recursion in policy for relation chat_members"

## 🐛 Проблема

**Ошибка:**
```
infinite recursion detected in policy for relation "chat_members"
```

**Причина:**
Циклическая зависимость в RLS (Row Level Security) политиках:

1. Политика на `messages` проверяет: "пользователь есть в `chat_members`"
2. Политика на `chat_members` проверяет: "пользователь есть в `chat_members`" (рекурсия!)
3. PostgreSQL обнаруживает бесконечный цикл и выдает ошибку

### Пример проблемной политики:

```sql
-- ПРОБЛЕМНАЯ политика (рекурсия)
CREATE POLICY "Users can view chat members"
ON public.chat_members
FOR SELECT
USING (
  -- Это вызывает рекурсию!
  EXISTS (
    SELECT 1 FROM public.chat_members cm
    WHERE cm.chat_id = chat_members.chat_id
    AND cm.user_id = auth.uid()
  )
);
```

---

## ✅ Решение

### Вариант 1: Применить миграцию (РЕКОМЕНДУЕТСЯ)

Миграция уже создана: `supabase/migrations/20251111130000_fix_chat_rls_recursion.sql`

**Шаги:**

1. **Если используете Supabase CLI:**

```bash
# Применить миграцию
supabase db push

# Или если используете удаленную БД
supabase db push --db-url "postgresql://..."
```

2. **Если используете Supabase Dashboard:**

   a. Откройте Supabase Dashboard
   
   b. SQL Editor
   
   c. Скопируйте содержимое файла `supabase/migrations/20251111130000_fix_chat_rls_recursion.sql`
   
   d. Вставьте в SQL Editor
   
   e. Нажмите "RUN"

3. **Проверить результат:**

```sql
-- Должно вернуть список политик без рекурсии
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('chat_members', 'messages')
ORDER BY tablename, policyname;
```

---

### Вариант 2: Ручное исправление через Dashboard

Если миграция не работает, выполните вручную:

#### Шаг 1: Удалить старые политики

```sql
-- Удалить проблемные политики chat_members
DROP POLICY IF EXISTS "Users can view chat members" ON public.chat_members;
DROP POLICY IF EXISTS "Users can add members to their chats" ON public.chat_members;
DROP POLICY IF EXISTS "Chat admins can remove members" ON public.chat_members;
DROP POLICY IF EXISTS "Users can leave chats" ON public.chat_members;

-- Удалить связанные политики messages
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON public.messages;
```

#### Шаг 2: Создать новые политики БЕЗ рекурсии

```sql
-- ИСПРАВЛЕННАЯ политика для chat_members (без рекурсии)
CREATE POLICY "Users can view chat members"
ON public.chat_members
FOR SELECT
TO authenticated
USING (true); -- Разрешить просмотр всех участников

CREATE POLICY "Users can add members to their chats"
ON public.chat_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_members cm
    WHERE cm.chat_id = chat_members.chat_id
    AND cm.user_id = auth.uid()
    AND cm.role = 'admin'
  )
  OR 
  NOT EXISTS (
    SELECT 1 FROM public.chat_members cm
    WHERE cm.chat_id = chat_members.chat_id
  )
);

CREATE POLICY "Chat admins can remove members"
ON public.chat_members
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.chat_members
    WHERE chat_id = chat_members.chat_id
    AND role = 'admin'
  )
  OR auth.uid() = user_id
);

-- ИСПРАВЛЕННЫЕ политики для messages (используют IN вместо EXISTS)
CREATE POLICY "Users can view messages in their chats"
ON public.messages
FOR SELECT
TO authenticated
USING (
  NOT deleted AND
  chat_id IN (
    SELECT cm.chat_id 
    FROM public.chat_members cm
    WHERE cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their chats"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  chat_id IN (
    SELECT cm.chat_id 
    FROM public.chat_members cm
    WHERE cm.user_id = auth.uid()
  )
);
```

#### Шаг 3: Добавить индекс для оптимизации

```sql
CREATE INDEX IF NOT EXISTS idx_chat_members_user_chat 
ON public.chat_members(user_id, chat_id);
```

---

## 🧪 Тестирование исправления

### 1. Проверить политики:

```sql
-- Посмотреть все политики
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies 
WHERE tablename IN ('chat_members', 'messages')
ORDER BY tablename, policyname;
```

### 2. Тест отправки сообщения:

```javascript
// В консоли браузера (F12)
const { data, error } = await supabase
  .from('messages')
  .insert({
    chat_id: 'YOUR_CHAT_ID',
    sender_id: 'YOUR_USER_ID',
    content: 'Test message'
  });

console.log('Result:', data, error);
// Должно быть: data: {...}, error: null
```

### 3. Проверить в UI:

1. Открыть `/chat`
2. Выбрать чат
3. Отправить сообщение: "Тест после исправления"
4. ✅ Должно отправиться без ошибки
5. ✅ Сообщение должно появиться в чате

---

## 📊 Что изменилось

| До (проблема) | После (исправлено) |
|---------------|-------------------|
| `chat_members` политика проверяет сама себя через `EXISTS` | `chat_members` политика использует `USING (true)` или прямые проверки |
| `messages` политика использует `EXISTS` с вложенными запросами | `messages` политика использует `IN` с простым подзапросом |
| Рекурсия → ошибка | Нет рекурсии → работает |

---

## 🔐 Безопасность

### Вопрос: Не опасно ли `USING (true)` для `chat_members`?

**Ответ:** Нет, безопасно, потому что:

1. Безопасность обеспечивается на уровне `chats` и `messages`
2. Пользователь может видеть участников, но не может:
   - Видеть сообщения в чатах, где он не участник
   - Отправлять сообщения в чужие чаты
   - Добавлять/удалять участников без прав админа

3. Альтернатива (если нужна строгая безопасность):

```sql
-- Более строгая политика (но медленнее)
CREATE POLICY "Users can view chat members"
ON public.chat_members
FOR SELECT
TO authenticated
USING (
  -- Показывать только участников чатов, где пользователь является участником
  chat_id IN (
    SELECT cm.chat_id 
    FROM public.chat_members cm
    WHERE cm.user_id = auth.uid()
  )
);
```

Но это может быть избыточно, если у вас нет требования скрывать список участников.

---

## 🚀 Альтернативное решение: SECURITY DEFINER функция

Если проблема повторяется, используйте SECURITY DEFINER функцию:

```sql
-- Создать безопасную функцию
CREATE OR REPLACE FUNCTION public.is_chat_member(
  _chat_id uuid,
  _user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER -- Обходит RLS!
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_members
    WHERE chat_id = _chat_id
    AND user_id = _user_id
  );
$$;

-- Использовать в политиках
CREATE POLICY "Users can send messages to their chats"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  public.is_chat_member(chat_id) -- Использует SECURITY DEFINER
);
```

**Преимущества:**
- Обходит RLS проверки внутри функции
- Нет рекурсии
- Можно переиспользовать

**Недостатки:**
- Нужно быть осторожным с SECURITY DEFINER (bypass security)
- Чуть медленнее из-за вызова функции

---

## 📝 Checklist после исправления

- [ ] Применена миграция `20251111130000_fix_chat_rls_recursion.sql`
- [ ] Проверены политики через SQL: `SELECT * FROM pg_policies WHERE tablename='messages'`
- [ ] Тест отправки сообщения в UI успешен
- [ ] Нет ошибки "infinite recursion" в консоли
- [ ] Realtime подписки работают
- [ ] Сообщения доставляются обоим пользователям

---

## 🆘 Если проблема осталась

### Проверить логи Supabase:

1. Supabase Dashboard → Logs → Postgres Logs
2. Искать "infinite recursion" или "permission denied"

### Проверить текущие политики:

```sql
-- Вывести определения политик
SELECT 
  schemaname,
  tablename,
  policyname,
  pg_get_expr(qual, (schemaname||'.'||tablename)::regclass) as using_clause,
  pg_get_expr(with_check, (schemaname||'.'||tablename)::regclass) as with_check_clause
FROM pg_policies 
WHERE tablename IN ('chat_members', 'messages');
```

### Временное решение (для отладки):

```sql
-- ВРЕМЕННО отключить RLS (НЕ для production!)
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members DISABLE ROW LEVEL SECURITY;

-- Отправить тестовое сообщение
-- Если работает - проблема точно в RLS

-- ВКЛЮЧИТЬ ОБРАТНО
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
```

---

## 📞 Дополнительная помощь

Если ошибка продолжается:

1. Покажите вывод:
```sql
SELECT * FROM pg_policies WHERE tablename IN ('chat_members', 'messages');
```

2. Покажите точный текст ошибки из консоли браузера (F12)

3. Проверьте, что миграция действительно применена:
```sql
SELECT * FROM supabase_migrations.schema_migrations 
ORDER BY version DESC 
LIMIT 5;
```

---

**Статус после исправления:** ✅ Ошибка должна быть полностью устранена!

**Время на исправление:** ~2-5 минут (применение миграции)
