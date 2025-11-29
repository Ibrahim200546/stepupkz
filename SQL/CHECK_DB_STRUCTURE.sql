-- ============================================================
-- Скрипт для проверки структуры БД StepUpKZ
-- ============================================================
-- Запустите этот скрипт в Supabase SQL Editor
-- Он покажет, какие колонки есть в ваших таблицах

-- 1. Структура таблицы brands
SELECT 
  'brands' as table_name,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'brands'
ORDER BY ordinal_position;

-- 2. Структура таблицы categories  
SELECT 
  'categories' as table_name,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'categories'
ORDER BY ordinal_position;

-- 3. Структура таблицы products
SELECT 
  'products' as table_name,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'products'
ORDER BY ordinal_position;

-- 4. Структура таблицы product_variants
SELECT 
  'product_variants' as table_name,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'product_variants'
ORDER BY ordinal_position;

-- 5. Структура таблицы product_images
SELECT 
  'product_images' as table_name,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'product_images'
ORDER BY ordinal_position;
