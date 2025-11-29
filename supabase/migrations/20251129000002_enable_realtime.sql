-- Включение Realtime для таблиц FlickMassege
-- Выполните этот файл в SQL Editor если не получается через UI

-- Проверяем существование публикации
DO $$
BEGIN
    -- Добавляем таблицы в realtime публикацию
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        -- Удаляем таблицы если они уже добавлены (для перезапуска)
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS flick_messages;
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS flick_message_status;
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS flick_users;
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS flick_chat_members;
        
        -- Добавляем таблицы заново
        ALTER PUBLICATION supabase_realtime ADD TABLE flick_messages;
        ALTER PUBLICATION supabase_realtime ADD TABLE flick_message_status;
        ALTER PUBLICATION supabase_realtime ADD TABLE flick_users;
        ALTER PUBLICATION supabase_realtime ADD TABLE flick_chat_members;
        
        RAISE NOTICE '✅ Realtime включен для FlickMassege таблиц!';
    ELSE
        RAISE EXCEPTION '❌ Publication supabase_realtime не найдена. Создайте ее в настройках Supabase.';
    END IF;
END $$;

-- Проверка что таблицы добавлены
SELECT 
    schemaname, 
    tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename LIKE 'flick_%';

-- Должны увидеть 4 таблицы:
-- public | flick_messages
-- public | flick_message_status  
-- public | flick_users
-- public | flick_chat_members
