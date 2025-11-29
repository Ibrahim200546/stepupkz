-- FlickMassege Test Data
-- Создание тестовых пользователей и чата для быстрого старта

-- ВНИМАНИЕ: Это тестовые данные! Используйте только для разработки!
-- Пароль для всех: "test123" (hash ниже)

-- Создание 3 тестовых пользователей
INSERT INTO flick_users (id, email, username, password_hash, bio, is_online, avatar) VALUES
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'alice@test.com',
  'Alice',
  '$2a$10$xQRZvMV5P6H7z8f9mNy1cOU1234567890abcdefghijklmnop',  -- test123
  'Привет! Я Алиса 👋',
  true,
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
),
(
  '00000000-0000-0000-0000-000000000002'::uuid,
  'bob@test.com',
  'Bob',
  '$2a$10$xQRZvMV5P6H7z8f9mNy1cOU1234567890abcdefghijklmnop',  -- test123
  'Разработчик из Москвы 🚀',
  false,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
),
(
  '00000000-0000-0000-0000-000000000003'::uuid,
  'charlie@test.com',
  'Charlie',
  '$2a$10$xQRZvMV5P6H7z8f9mNy1cOU1234567890abcdefghijklmnop',  -- test123
  'Дизайнер и путешественник ✈️',
  true,
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop'
)
ON CONFLICT (id) DO NOTHING;

-- Создание контактов (друзья)
INSERT INTO flick_contacts (user_id, contact_id) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (user_id, contact_id) DO NOTHING;

-- Создание личного чата Alice <-> Bob
INSERT INTO flick_chats (id, name, is_group) VALUES
('10000000-0000-0000-0000-000000000001'::uuid, NULL, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO flick_chat_members (chat_id, user_id, role) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'MEMBER'),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'MEMBER')
ON CONFLICT (chat_id, user_id) DO NOTHING;

-- Создание группового чата
INSERT INTO flick_chats (id, name, is_group) VALUES
('10000000-0000-0000-0000-000000000002'::uuid, 'Команда разработки', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO flick_chat_members (chat_id, user_id, role) VALUES
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'ADMIN'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'MEMBER'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'MEMBER')
ON CONFLICT (chat_id, user_id) DO NOTHING;

-- Создание тестовых сообщений
INSERT INTO flick_messages (chat_id, sender_id, content, type) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Привет, Bob! Как дела?', 'TEXT'),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Привет, Alice! Всё отлично, работаю над новым проектом 🚀', 'TEXT'),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Круто! Расскажешь подробнее?', 'TEXT'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Всем привет! 👋', 'TEXT'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Привет всем!', 'TEXT'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Добрый день, коллеги! Готов к обсуждению', 'TEXT');

-- Создание статусов сообщений (прочитано/не прочитано)
DO $$
DECLARE
    msg RECORD;
    usr RECORD;
BEGIN
    -- Для каждого сообщения создаем статус для каждого участника чата
    FOR msg IN SELECT m.id as message_id, m.sender_id, m.chat_id FROM flick_messages m
    LOOP
        FOR usr IN SELECT user_id FROM flick_chat_members WHERE chat_id = msg.chat_id
        LOOP
            -- Если это отправитель - статус SENT, иначе DELIVERED
            INSERT INTO flick_message_status (message_id, user_id, status)
            VALUES (
                msg.message_id,
                usr.user_id,
                CASE WHEN usr.user_id = msg.sender_id THEN 'SENT' ELSE 'DELIVERED' END
            )
            ON CONFLICT (message_id, user_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Вывод информации о созданных данных
DO $$
DECLARE
    user_count INT;
    chat_count INT;
    message_count INT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM flick_users;
    SELECT COUNT(*) INTO chat_count FROM flick_chats;
    SELECT COUNT(*) INTO message_count FROM flick_messages;
    
    RAISE NOTICE '✅ Тестовые данные созданы:';
    RAISE NOTICE '   - Пользователей: %', user_count;
    RAISE NOTICE '   - Чатов: %', chat_count;
    RAISE NOTICE '   - Сообщений: %', message_count;
    RAISE NOTICE '';
    RAISE NOTICE '📧 Тестовые аккаунты:';
    RAISE NOTICE '   - alice@test.com / test123';
    RAISE NOTICE '   - bob@test.com / test123';
    RAISE NOTICE '   - charlie@test.com / test123';
END $$;
