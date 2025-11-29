-- ============================================================
-- Демонстрационные данные для магазина StepUpKZ (Упрощенная версия)
-- ============================================================
-- Используйте этот файл, если основной скрипт вызывает ошибки

-- 1. Добавляем бренды (минимальные поля)
INSERT INTO public.brands (id, name, slug) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Nike', 'nike'),
  ('22222222-2222-2222-2222-222222222222', 'Adidas', 'adidas'),
  ('33333333-3333-3333-3333-333333333333', 'Puma', 'puma'),
  ('44444444-4444-4444-4444-444444444444', 'Reebok', 'reebok'),
  ('55555555-5555-5555-5555-555555555555', 'New Balance', 'new-balance'),
  ('66666666-6666-6666-6666-666666666666', 'Converse', 'converse')
ON CONFLICT (slug) DO NOTHING;

-- 2. Добавляем категории (минимальные поля)
INSERT INTO public.categories (id, name, slug) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Мужская обувь', 'men'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Женская обувь', 'women'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Детская обувь', 'kids'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Спортивная обувь', 'sport')
ON CONFLICT (slug) DO NOTHING;

-- 3. Добавляем товары
-- Мужские кроссовки
INSERT INTO public.products (id, sku, name, slug, brand_id, category_id, description, price, old_price, is_featured, is_active) VALUES
  ('p0000001-0001-0001-0001-000000000001', 'NK-AM270-BLK-001', 'Nike Air Max 270', 'nike-air-max-270', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Легкие и удобные кроссовки с амортизацией Air Max. Идеально подходят для повседневной носки и занятий спортом. Дышащий верх из сетки обеспечивает комфорт в течение всего дня.', 42990, 49990, true, true),
  ('p0000002-0002-0002-0002-000000000002', 'AD-UB22-WHT-002', 'Adidas Ultraboost 22', 'adidas-ultraboost-22', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Премиальные беговые кроссовки с технологией Boost для максимальной энергии возврата. Primeknit верх адаптируется к форме стопы.', 54990, 64990, true, true),
  ('p0000003-0003-0003-0003-000000000003', 'PM-RS-X-BLU-003', 'Puma RS-X Blue', 'puma-rs-x-blue', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Стильные кроссовки в ретро стиле с яркими деталями. Массивная подошва обеспечивает отличную амортизацию.', 35990, NULL, false, true),
  ('p0000004-0004-0004-0004-000000000004', 'NB-574-GRY-004', 'New Balance 574 Classic', 'new-balance-574-classic', '55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Классические кроссовки с превосходной поддержкой. Замшевый и сетчатый верх, культовый силуэт.', 29990, 34990, false, true),
  ('p0000005-0005-0005-0005-000000000005', 'NK-ZFRK-BLK-005', 'Nike Zoom Freak 4', 'nike-zoom-freak-4', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Баскетбольные кроссовки с технологией Zoom Air. Обеспечивают отличное сцепление и взрывную отзывчивость.', 47990, NULL, true, true),
  
-- Мужские ботинки
  ('p0000006-0006-0006-0006-000000000006', 'NK-MNOA-BRN-006', 'Nike Manoa Leather Boot', 'nike-manoa-leather-boot', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Прочные кожаные ботинки для любых погодных условий. Водоотталкивающая поверхность и рельефная подошва.', 38990, 44990, false, true),
  ('p0000007-0007-0007-0007-000000000007', 'AD-TERR-BLK-007', 'Adidas Terrex Winter Boot', 'adidas-terrex-winter-boot', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Зимние ботинки с утеплителем PrimaLoft. Водонепроницаемая мембрана и агрессивный протектор Continental.', 52990, NULL, false, true),
  ('p0000008-0008-0008-0008-000000000008', 'PM-DSRT-BRN-008', 'Puma Desierto Taupe', 'puma-desierto-taupe', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Стильные ботинки-дезерты из натуральной замши. Легкие и комфортные для повседневной носки.', 31990, 36990, false, true),
  
-- Классические мужские туфли
  ('p0000009-0009-0009-0009-000000000009', 'RB-CLS-BLK-009', 'Reebok Classic Leather Oxford', 'reebok-classic-leather-oxford', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Классические кожаные туфли для офиса и официальных мероприятий. Минималистичный дизайн и высокое качество.', 27990, NULL, false, true),
  ('p0000010-0010-0010-0010-000000000010', 'NK-SB-BRN-010', 'Nike SB Stefan Janoski', 'nike-sb-stefan-janoski', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Стильные кеды для скейтбординга и повседневной носки. Прочная замшевая конструкция.', 24990, 29990, false, true),

-- Женские кроссовки
  ('p0000011-0011-0011-0011-000000000011', 'NK-AM97-WHT-011', 'Nike Air Max 97 White', 'nike-air-max-97-white', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Культовые кроссовки с волнообразным дизайном. Полноразмерная подушка Air Max обеспечивает непревзойденный комфорт.', 48990, 56990, true, true),
  ('p0000012-0012-0012-0012-000000000012', 'AD-SMCT-PNK-012', 'Adidas Superstar Pink', 'adidas-superstar-pink', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Легендарные кроссовки с культовым носком-ракушкой. Стильный розовый оттенок добавляет женственности.', 32990, NULL, true, true),
  ('p0000013-0013-0013-0013-000000000013', 'PM-CALY-WHT-013', 'Puma Cali White', 'puma-cali-white', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Женские кроссовки в калифорнийском стиле. Минималистичный дизайн с акцентом на комфорт.', 28990, 33990, false, true),
  ('p0000014-0014-0014-0014-000000000014', 'NB-327-BEG-014', 'New Balance 327 Beige', 'new-balance-327-beige', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ретро-кроссовки с современными материалами. Увеличенная подошва и яркие детали.', 31990, NULL, false, true),
  ('p0000015-0015-0015-0015-000000000015', 'CV-HIGHTOP-BLK-015', 'Converse Chuck Taylor High Top', 'converse-chuck-taylor-high-top', '66666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Классические высокие кеды из канваса. Вневременной дизайн, который никогда не выходит из моды.', 19990, NULL, true, true),

-- Женские туфли
  ('p0000016-0016-0016-0016-000000000016', 'NK-BLAZE-BLK-016', 'Nike Blazer Mid 77 Vintage', 'nike-blazer-mid-77-vintage', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Винтажные кроссовки средней высоты. Классический баскетбольный стиль с современным комфортом.', 36990, 42990, false, true),
  ('p0000017-0017-0017-0017-000000000017', 'PM-MYSL-BLU-017', 'Puma Mayze Stack Blue', 'puma-mayze-stack-blue', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Модные кроссовки на платформе. Смелый дизайн и дополнительная высота.', 33990, NULL, true, true),
  ('p0000018-0018-0018-0018-000000000018', 'AD-SMBLT-WHT-018', 'Adidas Samba White', 'adidas-samba-white', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Классические футбольные кроссовки в белом цвете. Замшевые детали и каучуковая подошва.', 29990, 34990, false, true),

-- Женские сапоги
  ('p0000019-0019-0019-0019-000000000019', 'RB-FURYL-BLK-019', 'Reebok Furylite Winter Boot', 'reebok-furylite-winter-boot', '44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Зимние ботинки с современным дизайном. Утеплитель и водоотталкивающая поверхность.', 44990, 52990, false, true),
  ('p0000020-0020-0020-0020-000000000020', 'NK-TANJ-BRN-020', 'Nike Tanjun Winter Boot', 'nike-tanjun-winter-boot', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Удобные зимние ботинки для города. Легкие и теплые с хорошей защитой от влаги.', 39990, NULL, false, true),

-- Детские кроссовки
  ('p0000021-0021-0021-0021-000000000021', 'NK-DYNA-RED-021', 'Nike Dynamo Red Kids', 'nike-dynamo-red-kids', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Детские кроссовки без шнурков. Легко надевать и снимать, удобны для активных игр.', 15990, 18990, true, true),
  ('p0000022-0022-0022-0022-000000000022', 'AD-SSTN-BLU-022', 'Adidas Superstar Kids Blue', 'adidas-superstar-kids-blue', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Детская версия культовых Superstar. Прочные и стильные для маленьких модников.', 13990, NULL, false, true),
  ('p0000023-0023-0023-0023-000000000023', 'PM-SMSH-WHT-023', 'Puma Smash Kids White', 'puma-smash-kids-white', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Классические детские кроссовки в белом цвете. Простой уход и универсальный стиль.', 11990, 14990, false, true),
  ('p0000024-0024-0024-0024-000000000024', 'NB-570-PNK-024', 'New Balance 570 Pink Kids', 'new-balance-570-pink-kids', '55555555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Яркие розовые кроссовки для девочек. Отличная поддержка и амортизация.', 12990, NULL, false, true),
  ('p0000025-0025-0025-0025-000000000025', 'CV-CTKIDS-BLK-025', 'Converse Chuck Taylor Kids Black', 'converse-chuck-taylor-kids-black', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Детские версии легендарных кед. Классический стиль для самых маленьких.', 9990, NULL, true, true),

-- Детские ботинки
  ('p0000026-0026-0026-0026-000000000026', 'NK-MNOKIDS-BRN-026', 'Nike Manoa Kids Brown', 'nike-manoa-kids-brown', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Прочные детские ботинки для активного отдыха. Водоотталкивающий материал.', 21990, 25990, false, true),
  ('p0000027-0027-0027-0027-000000000027', 'AD-TRXKIDS-BLK-027', 'Adidas Terrex Kids Black', 'adidas-terrex-kids-black', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Детские треккинговые ботинки. Надежная защита и комфорт для маленьких путешественников.', 24990, NULL, false, true),
  ('p0000028-0028-0028-0028-000000000028', 'PM-DSKIDS-BEG-028', 'Puma Desierto Kids Beige', 'puma-desierto-kids-beige', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Стильные детские ботинки в нейтральном оттенке. Подходят для школы и прогулок.', 18990, 22990, false, true),

-- Дополнительные популярные модели
  ('p0000029-0029-0029-0029-000000000029', 'RB-CLLTHR-WHT-029', 'Reebok Classic Leather White', 'reebok-classic-leather-white', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Культовые кроссовки из мягкой кожи. Минималистичный дизайн и непревзойденный комфорт.', 26990, 31990, true, true),
  ('p0000030-0030-0030-0030-000000000030', 'AD-OZWGO-GRY-030', 'Adidas Ozweego Grey', 'adidas-ozweego-grey', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Футуристические кроссовки с технологией Adiprene. Уникальный дизайн и современный комфорт.', 37990, 44990, true, true)
ON CONFLICT (slug) DO NOTHING;

RAISE NOTICE '✅ Добавлено 30 товаров!';
