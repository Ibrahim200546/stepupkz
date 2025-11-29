-- ============================================================
-- Демонстрационные данные для магазина StepUpKZ
-- АДАПТИВНАЯ ВЕРСИЯ - автоматически определяет структуру БД
-- ============================================================

-- 1. Добавляем бренды
DO $$
DECLARE
  has_logo_url BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'brands' AND column_name = 'logo_url'
  ) INTO has_logo_url;

  IF has_logo_url THEN
    INSERT INTO public.brands (id, name, slug, logo_url) VALUES
      ('11111111-1111-1111-1111-111111111111', 'Nike', 'nike', NULL),
      ('22222222-2222-2222-2222-222222222222', 'Adidas', 'adidas', NULL),
      ('33333333-3333-3333-3333-333333333333', 'Puma', 'puma', NULL),
      ('44444444-4444-4444-4444-444444444444', 'Reebok', 'reebok', NULL),
      ('55555555-5555-5555-5555-555555555555', 'New Balance', 'new-balance', NULL),
      ('66666666-6666-6666-6666-666666666666', 'Converse', 'converse', NULL)
    ON CONFLICT (slug) DO NOTHING;
  ELSE
    INSERT INTO public.brands (id, name, slug) VALUES
      ('11111111-1111-1111-1111-111111111111', 'Nike', 'nike'),
      ('22222222-2222-2222-2222-222222222222', 'Adidas', 'adidas'),
      ('33333333-3333-3333-3333-333333333333', 'Puma', 'puma'),
      ('44444444-4444-4444-4444-444444444444', 'Reebok', 'reebok'),
      ('55555555-5555-5555-5555-555555555555', 'New Balance', 'new-balance'),
      ('66666666-6666-6666-6666-666666666666', 'Converse', 'converse')
    ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  RAISE NOTICE '✅ Добавлено 6 брендов';
END $$;

-- 2. Добавляем категории
DO $$
DECLARE
  has_image_url BOOLEAN;
  has_parent_id BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'image_url'
  ) INTO has_image_url;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'parent_id'
  ) INTO has_parent_id;

  IF has_image_url AND has_parent_id THEN
    INSERT INTO public.categories (id, name, slug, parent_id, image_url) VALUES
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Мужская обувь', 'men', NULL, NULL),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Женская обувь', 'women', NULL, NULL),
      ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Детская обувь', 'kids', NULL, NULL),
      ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Спортивная обувь', 'sport', NULL, NULL)
    ON CONFLICT (slug) DO NOTHING;
  ELSE
    INSERT INTO public.categories (id, name, slug) VALUES
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Мужская обувь', 'men'),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Женская обувь', 'women'),
      ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Детская обувь', 'kids'),
      ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Спортивная обувь', 'sport')
    ON CONFLICT (slug) DO NOTHING;
  END IF;
  
  RAISE NOTICE '✅ Добавлено 4 категории';
END $$;

-- 3. Добавляем товары (адаптивно)
DO $$
DECLARE
  has_slug BOOLEAN;
  has_sku BOOLEAN;
  has_brand_id BOOLEAN;
  has_category_id BOOLEAN;
  has_old_price BOOLEAN;
  has_is_featured BOOLEAN;
  has_is_active BOOLEAN;
  insert_query TEXT;
BEGIN
  -- Проверяем наличие всех колонок
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'slug') INTO has_slug;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'sku') INTO has_sku;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'brand_id') INTO has_brand_id;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'category_id') INTO has_category_id;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'old_price') INTO has_old_price;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_featured') INTO has_is_featured;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_active') INTO has_is_active;

  -- Формируем запрос в зависимости от наличия колонок
  insert_query := 'INSERT INTO public.products (id';
  
  IF has_sku THEN insert_query := insert_query || ', sku'; END IF;
  insert_query := insert_query || ', name';
  IF has_slug THEN insert_query := insert_query || ', slug'; END IF;
  IF has_brand_id THEN insert_query := insert_query || ', brand_id'; END IF;
  IF has_category_id THEN insert_query := insert_query || ', category_id'; END IF;
  insert_query := insert_query || ', description, price';
  IF has_old_price THEN insert_query := insert_query || ', old_price'; END IF;
  IF has_is_featured THEN insert_query := insert_query || ', is_featured'; END IF;
  IF has_is_active THEN insert_query := insert_query || ', is_active'; END IF;
  insert_query := insert_query || ') VALUES ';

  -- Добавляем каждый товар с правильными полями
  -- Мужские товары
  EXECUTE insert_query || format('($1%s, $2, %s $3, $4, $5%s%s%s) ON CONFLICT DO NOTHING',
    CASE WHEN has_sku THEN ', $6' ELSE '' END,
    CASE WHEN has_slug THEN '$7,' ELSE '' END,
    CASE WHEN has_brand_id THEN ', $8' ELSE '' END,
    CASE WHEN has_category_id THEN ', $9' ELSE '' END,
    CASE WHEN has_old_price THEN ', $10' ELSE '' END
  ) USING 
    'p0000001-0001-0001-0001-000000000001'::uuid,
    'Nike Air Max 270',
    'nike-air-max-270',
    'Легкие и удобные кроссовки с амортизацией Air Max.',
    42990::decimal,
    'NK-AM270-BLK-001',
    '11111111-1111-1111-1111-111111111111'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    49990::decimal,
    true;

  RAISE NOTICE '✅ Начато добавление товаров (это упрощенная версия, добавим базовые товары)';
END $$;

-- Упрощенная вставка товаров (минимальные поля)
INSERT INTO public.products (id, name, description, price) VALUES
  ('p0000001-0001-0001-0001-000000000001', 'Nike Air Max 270', 'Легкие и удобные кроссовки с амортизацией Air Max. Идеально подходят для повседневной носки.', 42990),
  ('p0000002-0002-0002-0002-000000000002', 'Adidas Ultraboost 22', 'Премиальные беговые кроссовки с технологией Boost для максимальной энергии возврата.', 54990),
  ('p0000003-0003-0003-0003-000000000003', 'Puma RS-X Blue', 'Стильные кроссовки в ретро стиле с яркими деталями.', 35990),
  ('p0000004-0004-0004-0004-000000000004', 'New Balance 574 Classic', 'Классические кроссовки с превосходной поддержкой.', 29990),
  ('p0000005-0005-0005-0005-000000000005', 'Nike Zoom Freak 4', 'Баскетбольные кроссовки с технологией Zoom Air.', 47990),
  ('p0000006-0006-0006-0006-000000000006', 'Nike Manoa Leather Boot', 'Прочные кожаные ботинки для любых погодных условий.', 38990),
  ('p0000007-0007-0007-0007-000000000007', 'Adidas Terrex Winter Boot', 'Зимние ботинки с утеплителем PrimaLoft.', 52990),
  ('p0000008-0008-0008-0008-000000000008', 'Puma Desierto Taupe', 'Стильные ботинки-дезерты из натуральной замши.', 31990),
  ('p0000009-0009-0009-0009-000000000009', 'Reebok Classic Leather Oxford', 'Классические кожаные туфли для офиса и официальных мероприятий.', 27990),
  ('p0000010-0010-0010-0010-000000000010', 'Nike SB Stefan Janoski', 'Стильные кеды для скейтбординга и повседневной носки.', 24990),
  ('p0000011-0011-0011-0011-000000000011', 'Nike Air Max 97 White', 'Культовые кроссовки с волнообразным дизайном.', 48990),
  ('p0000012-0012-0012-0012-000000000012', 'Adidas Superstar Pink', 'Легендарные кроссовки с культовым носком-ракушкой.', 32990),
  ('p0000013-0013-0013-0013-000000000013', 'Puma Cali White', 'Женские кроссовки в калифорнийском стиле.', 28990),
  ('p0000014-0014-0014-0014-000000000014', 'New Balance 327 Beige', 'Ретро-кроссовки с современными материалами.', 31990),
  ('p0000015-0015-0015-0015-000000000015', 'Converse Chuck Taylor High Top', 'Классические высокие кеды из канваса.', 19990),
  ('p0000016-0016-0016-0016-000000000016', 'Nike Blazer Mid 77 Vintage', 'Винтажные кроссовки средней высоты.', 36990),
  ('p0000017-0017-0017-0017-000000000017', 'Puma Mayze Stack Blue', 'Модные кроссовки на платформе.', 33990),
  ('p0000018-0018-0018-0018-000000000018', 'Adidas Samba White', 'Классические футбольные кроссовки в белом цвете.', 29990),
  ('p0000019-0019-0019-0019-000000000019', 'Reebok Furylite Winter Boot', 'Зимние ботинки с современным дизайном.', 44990),
  ('p0000020-0020-0020-0020-000000000020', 'Nike Tanjun Winter Boot', 'Удобные зимние ботинки для города.', 39990),
  ('p0000021-0021-0021-0021-000000000021', 'Nike Dynamo Red Kids', 'Детские кроссовки без шнурков.', 15990),
  ('p0000022-0022-0022-0022-000000000022', 'Adidas Superstar Kids Blue', 'Детская версия культовых Superstar.', 13990),
  ('p0000023-0023-0023-0023-000000000023', 'Puma Smash Kids White', 'Классические детские кроссовки в белом цвете.', 11990),
  ('p0000024-0024-0024-0024-000000000024', 'New Balance 570 Pink Kids', 'Яркие розовые кроссовки для девочек.', 12990),
  ('p0000025-0025-0025-0025-000000000025', 'Converse Chuck Taylor Kids Black', 'Детские версии легендарных кед.', 9990),
  ('p0000026-0026-0026-0026-000000000026', 'Nike Manoa Kids Brown', 'Прочные детские ботинки для активного отдыха.', 21990),
  ('p0000027-0027-0027-0027-000000000027', 'Adidas Terrex Kids Black', 'Детские треккинговые ботинки.', 24990),
  ('p0000028-0028-0028-0028-000000000028', 'Puma Desierto Kids Beige', 'Стильные детские ботинки в нейтральном оттенке.', 18990),
  ('p0000029-0029-0029-0029-000000000029', 'Reebok Classic Leather White', 'Культовые кроссовки из мягкой кожи.', 26990),
  ('p0000030-0030-0030-0030-000000000030', 'Adidas Ozweego Grey', 'Футуристические кроссовки с технологией Adiprene.', 37990)
ON CONFLICT (id) DO NOTHING;

RAISE NOTICE '✅ Добавлено 30 товаров!';

-- 4. Добавляем изображения (продолжение в следующей части из-за ограничений размера)
-- Используйте основной файл для полной миграции с изображениями и вариантами
RAISE NOTICE 'ℹ️  Для добавления изображений и вариантов см. файл 20251125000000_add_demo_products.sql';
