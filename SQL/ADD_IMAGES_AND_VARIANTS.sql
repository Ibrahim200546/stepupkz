-- ============================================================
-- Добавление изображений и вариантов к демо-товарам StepUpKZ
-- ============================================================
-- Запустите ПОСЛЕ выполнения SIMPLE_DEMO_DATA.sql

-- 1. Добавляем изображения товаров (от Unsplash)
INSERT INTO public.product_images (product_id, url, alt, position) VALUES
  -- Nike Air Max 270
  ((SELECT id FROM products WHERE name = 'Nike Air Max 270' LIMIT 1), 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'Nike Air Max 270', 0),
  ((SELECT id FROM products WHERE name = 'Nike Air Max 270' LIMIT 1), 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80', 'Nike Air Max 270 - вид сверху', 1),
  
  -- Adidas Ultraboost 22
  ((SELECT id FROM products WHERE name = 'Adidas Ultraboost 22'), 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 'Adidas Ultraboost 22', 0),
  
  -- Puma RS-X Blue
  ((SELECT id FROM products WHERE name = 'Puma RS-X Blue'), 'https://images.unsplash.com/photo-1608667508764-33cf0726b13a?w=800&q=80', 'Puma RS-X Blue', 0),
  
  -- New Balance 574 Classic
  ((SELECT id FROM products WHERE name = 'New Balance 574 Classic'), 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80', 'New Balance 574 Classic', 0),
  
  -- Nike Zoom Freak 4
  ((SELECT id FROM products WHERE name = 'Nike Zoom Freak 4'), 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80', 'Nike Zoom Freak 4', 0),
  
  -- Nike Manoa Leather Boot
  ((SELECT id FROM products WHERE name = 'Nike Manoa Leather Boot'), 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80', 'Nike Manoa Leather Boot', 0),
  
  -- Adidas Terrex Winter Boot
  ((SELECT id FROM products WHERE name = 'Adidas Terrex Winter Boot'), 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80', 'Adidas Terrex Winter Boot', 0),
  
  -- Puma Desierto Taupe
  ((SELECT id FROM products WHERE name = 'Puma Desierto Taupe'), 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80', 'Puma Desierto Taupe', 0),
  
  -- Reebok Classic Leather Oxford
  ((SELECT id FROM products WHERE name = 'Reebok Classic Leather Oxford'), 'https://images.unsplash.com/photo-1614252235916-298e59d24a74?w=800&q=80', 'Reebok Classic Leather Oxford', 0),
  
  -- Nike SB Stefan Janoski
  ((SELECT id FROM products WHERE name = 'Nike SB Stefan Janoski'), 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80', 'Nike SB Stefan Janoski', 0),
  
  -- Nike Air Max 97 White
  ((SELECT id FROM products WHERE name = 'Nike Air Max 97 White'), 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80', 'Nike Air Max 97 White', 0),
  ((SELECT id FROM products WHERE name = 'Nike Air Max 97 White'), 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80', 'Nike Air Max 97 White - детали', 1),
  
  -- Adidas Superstar Pink
  ((SELECT id FROM products WHERE name = 'Adidas Superstar Pink'), 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80', 'Adidas Superstar Pink', 0),
  
  -- Puma Cali White
  ((SELECT id FROM products WHERE name = 'Puma Cali White'), 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&q=80', 'Puma Cali White', 0),
  
  -- New Balance 327 Beige
  ((SELECT id FROM products WHERE name = 'New Balance 327 Beige'), 'https://images.unsplash.com/photo-1628253747716-c1a79a0e3e3d?w=800&q=80', 'New Balance 327 Beige', 0),
  
  -- Converse Chuck Taylor High Top
  ((SELECT id FROM products WHERE name = 'Converse Chuck Taylor High Top'), 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80', 'Converse Chuck Taylor High Top', 0),
  
  -- Nike Blazer Mid 77 Vintage
  ((SELECT id FROM products WHERE name = 'Nike Blazer Mid 77 Vintage'), 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800&q=80', 'Nike Blazer Mid 77 Vintage', 0),
  
  -- Puma Mayze Stack Blue
  ((SELECT id FROM products WHERE name = 'Puma Mayze Stack Blue'), 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80', 'Puma Mayze Stack Blue', 0),
  
  -- Adidas Samba White
  ((SELECT id FROM products WHERE name = 'Adidas Samba White'), 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80', 'Adidas Samba White', 0),
  
  -- Reebok Furylite Winter Boot
  ((SELECT id FROM products WHERE name = 'Reebok Furylite Winter Boot'), 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80', 'Reebok Furylite Winter Boot', 0),
  
  -- Nike Tanjun Winter Boot
  ((SELECT id FROM products WHERE name = 'Nike Tanjun Winter Boot'), 'https://images.unsplash.com/photo-1612724189298-89d36b10b26d?w=800&q=80', 'Nike Tanjun Winter Boot', 0),
  
  -- Nike Dynamo Red Kids
  ((SELECT id FROM products WHERE name = 'Nike Dynamo Red Kids'), 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80', 'Nike Dynamo Red Kids', 0),
  
  -- Adidas Superstar Kids Blue
  ((SELECT id FROM products WHERE name = 'Adidas Superstar Kids Blue'), 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&q=80', 'Adidas Superstar Kids Blue', 0),
  
  -- Puma Smash Kids White
  ((SELECT id FROM products WHERE name = 'Puma Smash Kids White'), 'https://images.unsplash.com/photo-1595461505035-08cd2d7dd15e?w=800&q=80', 'Puma Smash Kids White', 0),
  
  -- New Balance 570 Pink Kids
  ((SELECT id FROM products WHERE name = 'New Balance 570 Pink Kids'), 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=80', 'New Balance 570 Pink Kids', 0),
  
  -- Converse Chuck Taylor Kids Black
  ((SELECT id FROM products WHERE name = 'Converse Chuck Taylor Kids Black'), 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800&q=80', 'Converse Chuck Taylor Kids Black', 0),
  
  -- Nike Manoa Kids Brown
  ((SELECT id FROM products WHERE name = 'Nike Manoa Kids Brown'), 'https://images.unsplash.com/photo-1501523460185-2aa5d2a0f981?w=800&q=80', 'Nike Manoa Kids Brown', 0),
  
  -- Adidas Terrex Kids Black
  ((SELECT id FROM products WHERE name = 'Adidas Terrex Kids Black'), 'https://images.unsplash.com/photo-1494496195158-c3becb4f2475?w=800&q=80', 'Adidas Terrex Kids Black', 0),
  
  -- Puma Desierto Kids Beige
  ((SELECT id FROM products WHERE name = 'Puma Desierto Kids Beige'), 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80', 'Puma Desierto Kids Beige', 0),
  
  -- Reebok Classic Leather White
  ((SELECT id FROM products WHERE name = 'Reebok Classic Leather White'), 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80', 'Reebok Classic Leather White', 0),
  
  -- Adidas Ozweego Grey
  ((SELECT id FROM products WHERE name = 'Adidas Ozweego Grey'), 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&q=80', 'Adidas Ozweego Grey', 0)
ON CONFLICT DO NOTHING;

-- 2. Добавляем варианты товаров (размеры и остатки)
-- Мужские товары (размеры 40-45)
DO $$
DECLARE
  product_record RECORD;
  sizes TEXT[] := ARRAY['40', '41', '42', '43', '44', '45'];
  size_text TEXT;
  stock_val INT;
BEGIN
  -- Мужские товары (первые 10)
  FOR product_record IN 
    SELECT id, name FROM products 
    WHERE name IN (
      'Nike Air Max 270', 'Adidas Ultraboost 22', 'Puma RS-X Blue',
      'New Balance 574 Classic', 'Nike Zoom Freak 4', 'Nike Manoa Leather Boot',
      'Adidas Terrex Winter Boot', 'Puma Desierto Taupe', 
      'Reebok Classic Leather Oxford', 'Nike SB Stefan Janoski'
    )
  LOOP
    FOREACH size_text IN ARRAY sizes
    LOOP
      stock_val := 5 + floor(random() * 10)::int; -- Остаток от 5 до 15
      INSERT INTO public.product_variants (product_id, size, stock)
      VALUES (product_record.id, size_text, stock_val)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Женские товары (размеры 36-41)
DO $$
DECLARE
  product_record RECORD;
  sizes TEXT[] := ARRAY['36', '37', '38', '39', '40', '41'];
  size_text TEXT;
  stock_val INT;
BEGIN
  FOR product_record IN 
    SELECT id, name FROM products 
    WHERE name IN (
      'Nike Air Max 97 White', 'Adidas Superstar Pink', 'Puma Cali White',
      'New Balance 327 Beige', 'Converse Chuck Taylor High Top',
      'Nike Blazer Mid 77 Vintage', 'Puma Mayze Stack Blue',
      'Adidas Samba White', 'Reebok Furylite Winter Boot', 'Nike Tanjun Winter Boot'
    )
  LOOP
    FOREACH size_text IN ARRAY sizes
    LOOP
      stock_val := 5 + floor(random() * 10)::int;
      INSERT INTO public.product_variants (product_id, size, stock)
      VALUES (product_record.id, size_text, stock_val)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Детские товары (размеры 28-35)
DO $$
DECLARE
  product_record RECORD;
  sizes TEXT[] := ARRAY['28', '29', '30', '31', '32', '33', '34', '35'];
  size_text TEXT;
  stock_val INT;
BEGIN
  FOR product_record IN 
    SELECT id, name FROM products 
    WHERE name IN (
      'Nike Dynamo Red Kids', 'Adidas Superstar Kids Blue', 'Puma Smash Kids White',
      'New Balance 570 Pink Kids', 'Converse Chuck Taylor Kids Black',
      'Nike Manoa Kids Brown', 'Adidas Terrex Kids Black', 'Puma Desierto Kids Beige'
    )
  LOOP
    FOREACH size_text IN ARRAY sizes
    LOOP
      stock_val := 4 + floor(random() * 8)::int;
      INSERT INTO public.product_variants (product_id, size, stock)
      VALUES (product_record.id, size_text, stock_val)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Унисекс товары (размеры 38-44)
DO $$
DECLARE
  product_record RECORD;
  sizes TEXT[] := ARRAY['38', '39', '40', '41', '42', '43', '44'];
  size_text TEXT;
  stock_val INT;
BEGIN
  FOR product_record IN 
    SELECT id, name FROM products 
    WHERE name IN ('Reebok Classic Leather White', 'Adidas Ozweego Grey')
  LOOP
    FOREACH size_text IN ARRAY sizes
    LOOP
      stock_val := 6 + floor(random() * 10)::int;
      INSERT INTO public.product_variants (product_id, size, stock)
      VALUES (product_record.id, size_text, stock_val)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Финальная проверка
DO $$
DECLARE
  image_count INT;
  variant_count INT;
  product_count INT;
BEGIN
  SELECT COUNT(*) INTO image_count FROM product_images;
  SELECT COUNT(*) INTO variant_count FROM product_variants;
  SELECT COUNT(*) INTO product_count FROM products;
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ ИЗОБРАЖЕНИЯ И ВАРИАНТЫ ДОБАВЛЕНЫ!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 Статистика:';
  RAISE NOTICE '   • Товаров: %', product_count;
  RAISE NOTICE '   • Изображений: %', image_count;
  RAISE NOTICE '   • Вариантов (размеров): %', variant_count;
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Теперь можно:';
  RAISE NOTICE '   ✅ Добавлять товары в корзину';
  RAISE NOTICE '   ✅ Выбирать размеры';
  RAISE NOTICE '   ✅ Видеть изображения товаров';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Запустите приложение: npm run dev';
  RAISE NOTICE '📱 Откройте: http://localhost:5173/catalog';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
