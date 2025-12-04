# Deployment Guide - StepUp Shoes

## Требования перед деплоем

### 1. Настройка Supabase

#### 1.1 Создание Storage Bucket для чатов

1. Откройте Supabase Dashboard → Storage
2. Создайте новый bucket с именем `chat-attachments`
3. Настройте Public access:
   - Перейдите в Policies
   - Создайте политики:

```sql
-- Policy for SELECT (public read)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments');

-- Policy for INSERT (authenticated users)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND auth.role() = 'authenticated'
);

-- Policy for DELETE (own files)
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 1.2 Включение Realtime

1. Supabase Dashboard → Database → Replication
2. Включите Realtime для таблиц:
   - `messages`
   - `chats`
   - `chat_members`
   - `user_presence`

#### 1.3 Проверка RLS (Row Level Security)

Убедитесь, что RLS включен для всех таблиц чатов и правильно настроены политики доступа.

### 2. Environment Variables

Создайте файл `.env` со следующими переменными:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=your-openai-key  # Optional
```

## Деплой на Cloudflare Pages

### Через Wrangler CLI

1. Установите зависимости:
```bash
npm install
```

2. Соберите проект:
```bash
npm run build
```

3. Деплой:
```bash
npx wrangler pages deploy dist --project-name=stepupshoes --branch=main
```

### Через Cloudflare Dashboard

1. Подключите Git репозиторий
2. Настройте Build:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`

3. Environment Variables (добавьте в Dashboard):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENAI_API_KEY` (optional)

4. Production branch: `main`

## Деплой на Vercel

### Через Vercel CLI

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Деплой:
```bash
vercel
```

3. Для production:
```bash
vercel --prod
```

### Через Vercel Dashboard

1. Импортируйте Git репозиторий
2. Framework: Vite
3. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENAI_API_KEY` (optional)

## Проверка после деплоя

### 1. Проверьте Console

Откройте DevTools → Console и убедитесь:
- ✅ Нет ошибок Supabase connection
- ✅ Realtime subscriptions работают
- ✅ ENV переменные загружены

### 2. Тест функциональности

- [ ] Авторизация работает
- [ ] Catalog загружается
- [ ] Чаты открываются
- [ ] Сообщения отправляются
- [ ] Realtime обновления работают
- [ ] Загрузка файлов работает (если настроен bucket)
- [ ] Vendor marketplace работает

### 3. Performance

Проверьте в Network tab:
- Initial load < 3s
- Lazy loading работает
- Chunks загружаются по требованию

## Оптимизации

### Включенные оптимизации:

✅ **Code Splitting** - критические зависимости разделены на chunks
✅ **Lazy Loading** - все страницы загружаются по требованию
✅ **Tree Shaking** - неиспользуемый код удалён
✅ **Minification** - esbuild minify для JS/CSS
✅ **Image Optimization** - автоматическая оптимизация в WebP
✅ **PWA** - Service Worker для offline работы

### Размер бандла:

- react-vendor: ~150KB
- ui-vendor: ~200KB
- supabase: ~80KB
- main chunk: ~300-500KB (с lazy loading)

## Troubleshooting

### Ошибка "Missing environment variables"

Решение:
1. Проверьте `.env` файл в корне проекта
2. В Cloudflare/Vercel добавьте ENV переменные в настройках проекта
3. Убедитесь, что переменные начинаются с `VITE_`

### Realtime не работает

Решение:
1. Проверьте, что Realtime включен в Supabase для нужных таблиц
2. Проверьте Console на ошибки подписки
3. Убедитесь, что RLS политики не блокируют realtime

### 404 на страницах

Решение:
1. Убедитесь, что файл `public/_redirects` существует
2. Для Vercel проверьте `vercel.json`
3. Для Cloudflare - настройки rewrites в dashboard

### Upload файлов не работает

Решение:
1. Создайте bucket `chat-attachments` в Supabase Storage
2. Настройте правильные policies (см. выше)
3. Проверьте Console на ошибки storage

## Custom Domain

### Cloudflare Pages

1. Dashboard → Custom domains → Add domain
2. Настройте DNS записи
3. SSL автоматически

### Vercel

1. Settings → Domains → Add
2. Настройте DNS
3. SSL автоматически

## CI/CD

Проект готов к автоматическому деплою:
- Push в `main` → Production deployment
- Pull Requests → Preview deployments

## Support

Для вопросов и проблем создайте Issue в репозитории.
