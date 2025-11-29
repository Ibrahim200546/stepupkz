-- Добавление изображений и вариантов (ИСПРАВЛЕННАЯ ВЕРСИЯ)
-- Запустите ПОСЛЕ SIMPLE_DEMO_DATA.sql

-- Добавляем изображения
DO $$
DECLARE
  p_id UUID;
BEGIN
  -- Nike Air Max 270
  SELECT id INTO p_id FROM products WHERE name = 'Nike Air Max 270' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, alt, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'Nike Air Max 270', 0),
      (p_id, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80', 'Nike Air Max 270 - вид сверху', 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Adidas Ultraboost 22
  SELECT id INTO p_id FROM products WHERE name = 'Adidas Ultraboost 22' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Puma RS-X Blue
  SELECT id INTO p_id FROM products WHERE name = 'Puma RS-X Blue' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1608667508764-33cf0726b13a?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- New Balance 574
  SELECT id INTO p_id FROM products WHERE name = 'New Balance 574 Classic' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Nike Zoom Freak 4
  SELECT id INTO p_id FROM products WHERE name = 'Nike Zoom Freak 4' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Nike Manoa Leather Boot
  SELECT id INTO p_id FROM products WHERE name = 'Nike Manoa Leather Boot' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Adidas Terrex Winter Boot
  SELECT id INTO p_id FROM products WHERE name = 'Adidas Terrex Winter Boot' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Puma Desierto Taupe
  SELECT id INTO p_id FROM products WHERE name = 'Puma Desierto Taupe' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Reebok Classic Leather Oxford
  SELECT id INTO p_id FROM products WHERE name = 'Reebok Classic Leather Oxford' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1614252235916-298e59d24a74?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Nike SB Stefan Janoski
  SELECT id INTO p_id FROM products WHERE name = 'Nike SB Stefan Janoski' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Nike Air Max 97 White
  SELECT id INTO p_id FROM products WHERE name = 'Nike Air Max 97 White' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80', 0),
      (p_id, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80', 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Adidas Superstar Pink
  SELECT id INTO p_id FROM products WHERE name = 'Adidas Superstar Pink' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Puma Cali White
  SELECT id INTO p_id FROM products WHERE name = 'Puma Cali White' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- New Balance 327 Beige
  SELECT id INTO p_id FROM products WHERE name = 'New Balance 327 Beige' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1628253747716-c1a79a0e3e3d?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Converse Chuck Taylor High Top
  SELECT id INTO p_id FROM products WHERE name = 'Converse Chuck Taylor High Top' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Nike Blazer Mid 77 Vintage
  SELECT id INTO p_id FROM products WHERE name = 'Nike Blazer Mid 77 Vintage' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Puma Mayze Stack Blue
  SELECT id INTO p_id FROM products WHERE name = 'Puma Mayze Stack Blue' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Adidas Samba White
  SELECT id INTO p_id FROM products WHERE name = 'Adidas Samba White' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Reebok Furylite Winter Boot
  SELECT id INTO p_id FROM products WHERE name = 'Reebok Furylite Winter Boot' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Nike Tanjun Winter Boot
  SELECT id INTO p_id FROM products WHERE name = 'Nike Tanjun Winter Boot' LIMIT 1;
  IF p_id IS NOT NULL THEN
    INSERT INTO product_images (product_id, url, position) VALUES
      (p_id, 'https://images.unsplash.com/photo-1612724189298-89d36b10b26d?w=800&q=80', 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Детские товары
  SELECT id INTO p_id FROM products WHERE name = 'Nike Dynamo Red Kids' LIMIT 1;
  IF p_id IS NOT NULL THEN INSERT INTO product_images (product_id, url, position) VALUES (p_id, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80', 0) ON CONFLICT DO NOTHING; END IF;

  SELECT id INTO p_id FROM products WHERE name = 'Adidas Superstar Kids Blue' LIMIT 1;
  IF p_id IS NOT NULL THEN INSERT INTO product_images (product_id, url, position) VALUES (p_id, 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&q=80', 0) ON CONFLICT DO NOTHING; END IF;

  SELECT id INTO p_id FROM products WHERE name = 'Puma Smash Kids White' LIMIT 1;
  IF p_id IS NOT NULL THEN INSERT INTO product_images (product_id, url, position) VALUES (p_id, 'https://images.unsplash.com/photo-1595461505035-08cd2d7dd15e?w=800&q=80', 0) ON CONFLICT DO NOTHING; END IF;

  SELECT id INTO p_id FROM products WHERE name = 'New Balance 570 Pink Kids' LIMIT 1;
  IF p_id IS NOT NULL THEN INSERT INTO product_images (product_id, url, position) VALUES (p_id, 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=80', 0) ON CONFLICT DO NOTHING; END IF;

  SELECT id INTO p_id FROM products WHERE name = 'Converse Chuck Taylor Kids Black' LIMIT 1;
  IF p_id IS NOT NULL THEN INSERT INTO product_images (product_id, url, position) VALUES (p_id, 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800&q=80', 0) ON CONFLICT DO NOTHING; END IF;

  SELECT id INTO p_id FROM products WHERE name = 'Nike Manoa Kids Brown' LIMIT 1;
  IF p_id IS NOT NULL THEN INSERT INTO product_images (product_id, url, position) VALUES (p_id, 'https://images.unsplash.com/photo-1501523460185-2aa5d2a0f981?w=800&q=80', 0) ON CONFLICT DO NOTHING; END IF;

  SELECT id INTO p_id FROM products WHERE name = 'Adidas Terrex Kids Black' LIMIT 1;
  IF p_id IS NOT NULL THEN INSERT INTO product_images (product_id, url, position) VALUES (p_id, 'https://images.unsplash.com/photo-1494496195158-c3becb4f2475?w=800&q=80', 0) ON CONFLICT DO NOTHING; END IF;

  SELECT id INTO p_id FROM products WHERE name = 'Puma Desierto Kids Beige' LIMIT 1;
  IF p_id IS NOT NULL THEN INSERT INTO product_images (product_id, url, position) VALUES (p_id, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80', 0) ON CONFLICT DO NOTHING; END IF;

  SELECT id INTO p_id FROM products WHERE name = 'Reebok Classic Leather White' LIMIT 1;
  IF p_id IS NOT NULL THEN INSERT INTO product_images (product_id, url, position) VALUES (p_id, 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80', 0) ON CONFLICT DO NOTHING; END IF;

  SELECT id INTO p_id FROM products WHERE name = 'Adidas Ozweego Grey' LIMIT 1;
  IF p_id IS NOT NULL THEN INSERT INTO product_images (product_id, url, position) VALUES (p_id, 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&q=80', 0) ON CONFLICT DO NOTHING; END IF;

  RAISE NOTICE '✅ Изображения добавлены';
END $$;

-- Добавляем варианты (размеры)
DO $$
DECLARE
  p RECORD;
  sizes TEXT[];
  s TEXT;
BEGIN
  -- Мужские (40-45)
  sizes := ARRAY['40','41','42','43','44','45'];
  FOR p IN SELECT id FROM products WHERE name IN ('Nike Air Max 270','Adidas Ultraboost 22','Puma RS-X Blue','New Balance 574 Classic','Nike Zoom Freak 4','Nike Manoa Leather Boot','Adidas Terrex Winter Boot','Puma Desierto Taupe','Reebok Classic Leather Oxford','Nike SB Stefan Janoski') LOOP
    FOREACH s IN ARRAY sizes LOOP
      INSERT INTO product_variants (product_id, size, stock) VALUES (p.id, s, 5 + floor(random()*10)::int) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  -- Женские (36-41)
  sizes := ARRAY['36','37','38','39','40','41'];
  FOR p IN SELECT id FROM products WHERE name IN ('Nike Air Max 97 White','Adidas Superstar Pink','Puma Cali White','New Balance 327 Beige','Converse Chuck Taylor High Top','Nike Blazer Mid 77 Vintage','Puma Mayze Stack Blue','Adidas Samba White','Reebok Furylite Winter Boot','Nike Tanjun Winter Boot') LOOP
    FOREACH s IN ARRAY sizes LOOP
      INSERT INTO product_variants (product_id, size, stock) VALUES (p.id, s, 5 + floor(random()*10)::int) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  -- Детские (28-35)
  sizes := ARRAY['28','29','30','31','32','33','34','35'];
  FOR p IN SELECT id FROM products WHERE name IN ('Nike Dynamo Red Kids','Adidas Superstar Kids Blue','Puma Smash Kids White','New Balance 570 Pink Kids','Converse Chuck Taylor Kids Black','Nike Manoa Kids Brown','Adidas Terrex Kids Black','Puma Desierto Kids Beige') LOOP
    FOREACH s IN ARRAY sizes LOOP
      INSERT INTO product_variants (product_id, size, stock) VALUES (p.id, s, 4 + floor(random()*8)::int) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  -- Унисекс (38-44)
  sizes := ARRAY['38','39','40','41','42','43','44'];
  FOR p IN SELECT id FROM products WHERE name IN ('Reebok Classic Leather White','Adidas Ozweego Grey') LOOP
    FOREACH s IN ARRAY sizes LOOP
      INSERT INTO product_variants (product_id, size, stock) VALUES (p.id, s, 6 + floor(random()*10)::int) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  RAISE NOTICE '✅ Варианты добавлены';
END $$;

SELECT 
  (SELECT COUNT(*) FROM product_images) as images,
  (SELECT COUNT(*) FROM product_variants) as variants;

RAISE NOTICE '🎉 ГОТОВО! Изображения и размеры добавлены. Теперь можно добавлять товары в корзину!';
