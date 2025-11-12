-- 🚨 СРОЧНОЕ ИСПРАВЛЕНИЕ - Назначить роль admin
-- User ID: 3ed429a7-f082-463d-869f-6836ea319e02

-- ================================================
-- СПОСОБ 1: Прямое назначение по ID
-- ================================================

-- Удалить старые записи (если есть)
DELETE FROM user_roles 
WHERE user_id = '3ed429a7-f082-463d-869f-6836ea319e02';

-- Назначить роли
INSERT INTO user_roles (user_id, role)
VALUES 
  ('3ed429a7-f082-463d-869f-6836ea319e02', 'customer'),
  ('3ed429a7-f082-463d-869f-6836ea319e02', 'admin');

-- Проверить результат
SELECT * FROM user_roles 
WHERE user_id = '3ed429a7-f082-463d-869f-6836ea319e02';

-- ================================================
-- ЕСЛИ ОШИБКА - Проверить таблицу существует
-- ================================================

-- Проверить что таблица user_roles существует
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_roles'
);
-- Должно вернуть: true

-- ================================================
-- ЕСЛИ ОШИБКА - Проверить структуру таблицы
-- ================================================

-- Посмотреть структуру
\d user_roles;

-- Или через информационную схему
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- ================================================
-- ЕСЛИ ОШИБКА - Создать таблицу заново
-- ================================================

-- Если таблица не существует - создать
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Включить RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Создать политику
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Теперь назначить роль
INSERT INTO user_roles (user_id, role)
VALUES 
  ('3ed429a7-f082-463d-869f-6836ea319e02', 'customer'),
  ('3ed429a7-f082-463d-869f-6836ea319e02', 'admin');

-- ================================================
-- ФИНАЛЬНАЯ ПРОВЕРКА
-- ================================================

-- Проверить что роли назначены
SELECT 
  user_id,
  role,
  created_at,
  '✅ SUCCESS!' as status
FROM user_roles
WHERE user_id = '3ed429a7-f082-463d-869f-6836ea319e02';

-- Проверить что можно прочитать через RLS
-- (выполните это находясь залогиненным как этот пользователь)
SET request.jwt.claim.sub = '3ed429a7-f082-463d-869f-6836ea319e02';
SELECT * FROM user_roles WHERE user_id = auth.uid();
