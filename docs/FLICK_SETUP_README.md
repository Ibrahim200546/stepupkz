# 🚀 Быстрый старт: FlickMassege в StepUpKZ

## ✅ Что уже сделано

1. ✅ SQL схема для Supabase создана
2. ✅ Стили FlickMassege интегрированы в Tailwind
3. ✅ Компоненты (VoiceRecorder, AudioPlayer, Stickers, Emoji) созданы
4. ✅ Тестовые данные подготовлены

## 📋 Что нужно сделать ВАМ

### Шаг 1: Выполните SQL миграции в Supabase

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Выберите свой проект `stepupkz`
3. Перейдите в **SQL Editor**
4. Выполните **ПЕРВЫЙ** файл:

```
📄 supabase/migrations/20251129000000_flick_messenger_schema.sql
```

**Скопируйте весь файл и выполните (Run)**

Этот файл создаст:
- 6 таблиц для мессенджера
- Индексы
- RLS политики
- Realtime публикации
- Storage bucket для файлов

5. (Опционально) Выполните **ВТОРОЙ** файл для тестовых данных:

```
📄 supabase/migrations/20251129000001_flick_test_data.sql
```

Это создаст 3 тестовых пользователя:
- `alice@test.com` / `test123`
- `bob@test.com` / `test123`
- `charlie@test.com` / `test123`

### Шаг 2: Проверьте результат

В SQL Editor выполните:

```sql
-- Должны увидеть 6 таблиц
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'flick_%';
```

### Шаг 3: Включите Realtime

1. В Supabase Dashboard → **Database** → **Replication**
2. Найдите и включите Realtime для таблиц:
   - ✅ `flick_messages`
   - ✅ `flick_message_status`
   - ✅ `flick_users`
   - ✅ `flick_chat_members`

### Шаг 4: Проверьте Storage

1. В Supabase Dashboard → **Storage**
2. Должен быть bucket `flick-attachments` (public)
3. Если нет - создайте:
   - Name: `flick-attachments`
   - Public: ✅ Yes

### Шаг 5: Запустите проект

```bash
cd stepupkz
npm run dev
```

### Шаг 6: Откройте Flick Chat

Откройте в браузере:
```
http://localhost:5173/flick-chat
```

*(Маршрут будет добавлен после создания FlickChat компонента)*

## 🎨 Что изменилось в проекте

### Новые файлы

```
stepupkz/
├── supabase/migrations/
│   ├── 20251129000000_flick_messenger_schema.sql  ← ОСНОВНАЯ СХЕМА
│   └── 20251129000001_flick_test_data.sql         ← ТЕСТОВЫЕ ДАННЫЕ
├── src/
│   ├── components/chat/
│   │   ├── VoiceRecorder.tsx       ← Голосовые сообщения
│   │   ├── AudioPlayer.tsx         ← Плеер для голоса
│   │   ├── StickerPicker.tsx       ← Стикеры
│   │   └── CustomEmojiPicker.tsx   ← Эмодзи
│   └── lib/
│       └── notificationSound.ts    ← Звуковые уведомления
├── FLICK_SETUP_README.md           ← ЭТО РУКОВОДСТВО
├── FLICK_INTEGRATION_GUIDE.md      ← ПОДРОБНАЯ ДОКУМЕНТАЦИЯ
└── CHAT_UPDATE.md                  ← ЧТО ДОБАВЛЕНО
```

### Обновленные файлы

- ✅ `tailwind.config.ts` - добавлены Flick цвета и стили
- ✅ `src/index.css` - добавлены glass-panel, pixel-btn классы
- ✅ `src/hooks/useChat.tsx` - обновлены типы (voice, sticker)
- ✅ `src/components/chat/MessageComposer.tsx` - голос, стикеры, эмодзи
- ✅ `src/components/chat/MessageBubble.tsx` - отображение новых типов
- ✅ `src/components/chat/ChatWindow.tsx` - уведомления
- ✅ `src/components/chat/ChatList.tsx` - онлайн-индикаторы

## 🎯 Что дальше

После выполнения SQL миграций нужно:

1. ✅ Создать полный FlickChat компонент с Supabase Realtime
2. ✅ Добавить маршрут `/flick-chat` в App.tsx
3. ✅ Создать auth для FlickChat (регистрация/логин)
4. ✅ Протестировать весь функционал

## 📊 Структура БД FlickMassege

```
flick_users (пользователи)
├── id, email, username, password_hash
├── avatar, bio, relationship_status
└── is_online, last_seen, notifications_enabled

flick_contacts (друзья)
└── user_id → contact_id

flick_chats (чаты)
├── id, name
└── is_group (true/false)

flick_chat_members (участники чатов)
├── chat_id → user_id
└── role (ADMIN/MEMBER)

flick_messages (сообщения)
├── id, content, type (TEXT/IMAGE/VIDEO/VOICE/STICKER)
├── file_url, sender_id, chat_id
└── created_at, updated_at

flick_message_status (статусы прочтения)
├── message_id → user_id
└── status (SENT/DELIVERED/READ)
```

## 🎨 FlickMassege Дизайн

### Цвета
- `#FF6B00` - Flick Orange (кнопки, акценты)
- `#00A3FF` - Flick Blue (ссылки, активные элементы)
- `#1A1A1A` - Flick Dark (фон)
- `rgba(255,255,255,0.1)` - Glass эффект

### Стили
```css
.glass-panel       - Стеклянная панель с blur
.pixel-btn         - Пиксельная кнопка с тенью
.pixel-input       - Пиксельный инпут
.shadow-pixel      - Пиксельная тень
font-pixel         - Press Start 2P шрифт
```

### Пример использования
```tsx
<div className="glass-panel p-6 rounded-2xl">
  <button className="pixel-btn">SEND</button>
  <input className="pixel-input" />
</div>
```

## 🐛 Troubleshooting

### "permission denied for table flick_users"
→ Проверьте что RLS политики созданы в миграции

### Realtime не работает
→ Проверьте что таблицы включены в Database → Replication

### Storage upload fails
→ Проверьте что bucket `flick-attachments` создан и public

### "relation flick_users does not exist"
→ Выполните первую миграцию заново

## 📞 Поддержка

Если что-то не работает:
1. Проверьте Supabase Dashboard → Logs
2. Откройте Browser Console (F12)
3. Проверьте что все SQL миграции выполнены
4. Убедитесь что Realtime включен

## ✅ Checklist

После выполнения всех шагов у вас должно быть:

- [ ] ✅ 6 таблиц `flick_*` в Supabase
- [ ] ✅ Storage bucket `flick-attachments`
- [ ] ✅ Realtime включен для 4 таблиц
- [ ] ✅ Тестовые пользователи созданы (опционально)
- [ ] ✅ Проект запускается без ошибок
- [ ] ⏳ FlickChat компонент создан
- [ ] ⏳ Маршрут `/flick-chat` добавлен
- [ ] ⏳ Auth работает

---

## 🎉 Готово!

После выполнения SQL миграций:
1. Напишите мне "SQL выполнен"
2. Я создам полный FlickChat компонент
3. Протестируем весь функционал

**FlickMassege** - pixel-art мессенджер с liquid glass дизайном! 🚀✨
