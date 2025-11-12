-- 🚀 БЫСТРОЕ ИСПРАВЛЕНИЕ: Назначить себе роль admin
-- Скопируйте и выполните в Supabase Dashboard → SQL Editor

-- ================================================
-- ШАГ 1: Проверка текущего состояния
-- ================================================

-- Посмотреть текущего пользователя
SELECT 
  auth.uid() as "Ваш User ID",
  auth.email() as "Ваш Email";

-- Посмотреть существующие роли
SELECT 
  user_id,
  role,
  created_at
FROM user_roles
WHERE user_id = auth.uid();

-- ================================================
-- ШАГ 2: Назначить роль admin (если нет)
-- ================================================

-- Удалить старые роли (на всякий случай)
DELETE FROM user_roles WHERE user_id = auth.uid();

-- Назначить роли customer и admin
INSERT INTO user_roles (user_id, role)
VALUES 
  (auth.uid(), 'customer'),
  (auth.uid(), 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- ================================================
-- ШАГ 3: Проверка результата
-- ================================================

SELECT 
  'SUCCESS! ✅' as status,
  user_id,
  array_agg(role) as roles
FROM user_roles
WHERE user_id = auth.uid()
GROUP BY user_id;

-- Должны увидеть:
-- status: SUCCESS! ✅
-- roles: {customer, admin}

-- ================================================
-- ЕСЛИ НЕ РАБОТАЕТ - ПРОВЕРИТЬ RLS ПОЛИТИКИ
-- ================================================

-- Посмотреть политики для user_roles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_roles';

-- Если политик нет - создать
CREATE POLICY IF NOT EXISTS "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- ================================================
-- АЛЬТЕРНАТИВНЫЙ СПОСОБ (если auth.uid() не работает)
-- ================================================

-- 1. Получить свой ID из другой таблицы
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Скопировать ID и вставить ниже
-- INSERT INTO user_roles (user_id, role)
-- VALUES 
--   ('ВСТАВЬТЕ-ВАШ-ID-СЮДА', 'customer'),
--   ('ВСТАВЬТЕ-ВАШ-ID-СЮДА', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;
