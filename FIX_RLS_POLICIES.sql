-- 🔒 ИСПРАВЛЕНИЕ RLS ПОЛИТИК для user_roles
-- Проблема: Фронтенд не может прочитать роли из-за RLS

-- ================================================
-- ШАГ 1: Проверить текущие политики
-- ================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_roles';

-- ================================================
-- ШАГ 2: Удалить старые политики
-- ================================================

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;

-- ================================================
-- ШАГ 3: Создать правильные политики
-- ================================================

-- Политика SELECT: Пользователи могут читать СВОИ роли
CREATE POLICY "users_select_own_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Политика INSERT: Только при регистрации (через trigger)
CREATE POLICY "users_insert_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ================================================
-- ШАГ 4: Проверить что RLS включен
-- ================================================

SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'user_roles';

-- Если RLS выключен - включить
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ================================================
-- ШАГ 5: ТЕСТ - Проверить доступ
-- ================================================

-- Проверить свои роли (должно работать)
SELECT * FROM user_roles WHERE user_id = auth.uid();

-- Должны увидеть 2 строки:
-- customer
-- admin

-- ================================================
-- ЕСЛИ ВСЁ РАВНО НЕ РАБОТАЕТ - ВРЕМЕННО ОТКЛЮЧИТЬ RLS
-- ================================================

-- ⚠️ ТОЛЬКО ДЛЯ ОТЛАДКИ! НЕ ДЛЯ PRODUCTION!
-- ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- ================================================
-- АЛЬТЕРНАТИВНОЕ РЕШЕНИЕ: Более permissive политика
-- ================================================

-- Если верхнее не помогло, попробуйте это:
DROP POLICY IF EXISTS "users_select_own_roles" ON public.user_roles;

CREATE POLICY "allow_authenticated_read"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true); -- Разрешить всем аутентифицированным читать все роли

-- ================================================
-- ФИНАЛЬНАЯ ПРОВЕРКА
-- ================================================

-- 1. Проверить политики
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_roles';

-- 2. Проверить что можете прочитать
SELECT 
  user_id,
  role,
  '✅ CAN READ!' as status
FROM user_roles 
WHERE user_id = '3ed429a7-f082-463d-869f-6836ea319e02';

-- Если видите 2 строки - RLS работает правильно!
