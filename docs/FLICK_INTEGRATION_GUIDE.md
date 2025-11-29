# FlickMassege Integration Guide для StepUpKZ

## Обзор

Интеграция полнофункционального мессенджера FlickMassege в проект StepUpKZ с адаптацией под Supabase вместо Socket.io + Prisma.

## Шаг 1: Выполните SQL миграции в Supabase

### 1.1 Откройте Supabase SQL Editor

Перейдите в ваш проект Supabase → SQL Editor

### 1.2 Выполните основную миграцию

Скопируйте и выполните файл:
```
supabase/migrations/20251129000000_flick_messenger_schema.sql
```

Этот файл создаст:
- ✅ Таблицы: `flick_users`, `flick_contacts`, `flick_chats`, `flick_chat_members`, `flick_messages`, `flick_message_status`
- ✅ Индексы для производительности
- ✅ RLS (Row Level Security) политики
- ✅ Триггеры для автообновления `updated_at`
- ✅ Функцию `get_unread_count()` для подсчета непрочитанных
- ✅ Realtime публикации для real-time обновлений
- ✅ Storage bucket `flick-attachments` для файлов

## Шаг 2: Проверьте создание таблиц

Выполните в SQL Editor:

```sql
-- Проверка созданных таблиц
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'flick_%';

-- Должны увидеть:
-- flick_users
-- flick_contacts
-- flick_chats
-- flick_chat_members
-- flick_messages
-- flick_message_status
```

## Шаг 3: Создайте тестовых пользователей (опционально)

```sql
-- Создание 2 тестовых пользователей
INSERT INTO flick_users (email, username, password_hash, bio, is_online)
VALUES 
  ('test1@example.com', 'TestUser1', '$2a$10$dummy', 'Привет! Я первый тестовый пользователь', true),
  ('test2@example.com', 'TestUser2', '$2a$10$dummy', 'Второй тестовый пользователь', false);

-- Получите их ID
SELECT id, username FROM flick_users;
```

## Шаг 4: Создайте тестовый чат (опционально)

```sql
-- Замените UUID на реальные ID из предыдущего шага
WITH user_ids AS (
  SELECT id FROM flick_users LIMIT 2
),
new_chat AS (
  INSERT INTO flick_chats (name, is_group)
  VALUES ('Test Chat', false)
  RETURNING id
)
INSERT INTO flick_chat_members (chat_id, user_id, role)
SELECT new_chat.id, user_ids.id, 'MEMBER'
FROM new_chat, user_ids;
```

## Шаг 5: Проверьте Storage Bucket

В Supabase Dashboard → Storage → Buckets:
- Должен быть создан bucket `flick-attachments` (public)
- Если нет, создайте вручную:
  - Name: `flick-attachments`
  - Public: ✅ Yes

## Шаг 6: Включите Realtime

В Supabase Dashboard → Database → Replication:

Включите Realtime для таблиц:
- ✅ `flick_messages`
- ✅ `flick_message_status`
- ✅ `flick_users` (для онлайн-статусов)
- ✅ `flick_chat_members`

## Шаг 7: Настройте аутентификацию

### Вариант A: Интеграция с существующей auth

Если у вас уже есть auth.users в Supabase:

```sql
-- Создайте связь между auth.users и flick_users
ALTER TABLE flick_users ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);

-- Обновите RLS политики для использования auth.uid()
-- (уже настроено в миграции)
```

### Вариант B: Отдельная auth для Flick

FlickMassege использует собственную auth с JWT токенами.
Создайте API endpoints для регистрации/логина (см. ниже).

## Шаг 8: Установите зависимости

```bash
cd stepupkz
npm install socket.io-client simple-peer
```

(Уже установлены: wavesurfer.js, emoji-picker-react)

## Шаг 9: Запустите проект

```bash
npm run dev
```

## Шаг 10: Тестирование

1. Откройте `http://localhost:5173/flick-chat`
2. Зарегистрируйтесь/войдите
3. Создайте чат или найдите пользователя
4. Отправьте сообщения (текст, голос, стикеры)
5. Проверьте realtime обновления в разных вкладках

## Структура базы данных

### flick_users
```
- id (UUID)
- email (TEXT, unique)
- username (TEXT, unique)
- password_hash (TEXT)
- avatar (TEXT)
- bio (TEXT)
- relationship_status (TEXT)
- is_online (BOOLEAN)
- last_seen (TIMESTAMPTZ)
- notifications_enabled (BOOLEAN)
```

### flick_chats
```
- id (UUID)
- name (TEXT)
- is_group (BOOLEAN)
```

### flick_messages
```
- id (UUID)
- content (TEXT)
- type (TEXT: TEXT|IMAGE|VIDEO|DOCUMENT|STICKER|VOICE)
- file_url (TEXT)
- sender_id (UUID)
- chat_id (UUID)
```

### flick_message_status
```
- id (UUID)
- message_id (UUID)
- user_id (UUID)
- status (TEXT: SENT|DELIVERED|READ)
```

## API Endpoints (нужно создать)

Если используете отдельную auth для Flick:

### POST /api/flick/register
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password"
}
```

### POST /api/flick/login
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

### GET /api/flick/users/search?query=username
Headers: `Authorization: Bearer <token>`

### POST /api/flick/chats
```json
{
  "partnerId": "uuid",
  "isGroup": false
}
```

## Troubleshooting

### Ошибка: "permission denied for table flick_users"
- Проверьте RLS политики
- Убедитесь что используется `auth.uid()` в WHERE clauses

### Realtime не работает
- Проверьте что таблицы добавлены в публикацию: `ALTER PUBLICATION supabase_realtime ADD TABLE flick_messages;`
- Перезапустите Supabase Realtime в Dashboard

### Storage upload fails
- Проверьте что bucket `flick-attachments` создан и public
- Проверьте Storage policies

### Сообщения не отправляются
- Проверьте что пользователь является членом чата в `flick_chat_members`
- Проверьте RLS политики для `flick_messages`

## Безопасность

⚠️ **ВАЖНО:**
- Пароли хешируются с bcrypt (минимум 10 раундов)
- JWT токены с коротким сроком действия
- RLS политики ограничивают доступ к данным других пользователей
- Файлы загружаются через Supabase Storage с проверкой размера
- SQL инъекции предотвращаются через параметризованные запросы

## Следующие шаги

1. ✅ Выполните SQL миграции
2. ✅ Создайте тестовых пользователей
3. ✅ Проверьте Storage bucket
4. ✅ Включите Realtime
5. ⏳ Создайте auth endpoints (или интегрируйте с существующей auth)
6. ⏳ Адаптируйте FlickChat.tsx для Supabase
7. ⏳ Тестируйте функционал

## Контакты

Если возникли вопросы по интеграции - проверьте:
- Supabase Logs (Dashboard → Logs)
- Browser Console (F12)
- Network tab для API requests

---

**FlickMassege** - современный мессенджер с pixel-art дизайном и liquid glass эффектами 🎨✨
