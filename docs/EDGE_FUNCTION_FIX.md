# 🔧 FIX: Edge Function AI Chat

## Проблема:
```
POST https://...supabase.co/functions/v1/ai-chat 500 (Internal Server Error)
```

## Причина:
Устаревшие импорты Deno и старый синтаксис `serve()`.

## ✅ ИСПРАВЛЕНО:

### 1. Обновлены импорты
**Было:**
```typescript
// @deno-types="https://deno.land/x/xhr@0.1.0/mod.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
```

**Стало:**
```typescript
// Modern Deno 2.x - no need for polyfills
```

### 2. Обновлен синтаксис
**Было:**
```typescript
serve(async (req) => {
```

**Стало:**
```typescript
Deno.serve(async (req) => {
```

### 3. Обновлен deno.json
Добавлены compiler options для Deno 2.x.

## 🚀 КАК ЗАДЕПЛОИТЬ:

### Вариант 1: Через Supabase Dashboard (Рекомендуется)

1. **Откройте Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/functions
   ```

2. **Найдите функцию `ai-chat`**

3. **Нажмите "Edit"**

4. **Замените код:**
   ```typescript
   // Modern Deno 2.x imports - no need for polyfills

   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   };

   Deno.serve(async (req) => {
     // Handle CORS preflight requests
     if (req.method === 'OPTIONS') {
       return new Response(null, { headers: corsHeaders });
     }

     try {
       const { message, conversationHistory } = await req.json();
       
       const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
       if (!OPENAI_API_KEY) {
         throw new Error('OPENAI_API_KEY is not configured in Supabase');
       }

       console.log('Calling OpenAI GPT-4 with message:', message);

       // Prepare messages for OpenAI
       const messages = [
         { 
           role: 'system', 
           content: `Ты — умный AI-помощник магазина StepUp Shoes в Казахстане.

   Твоя роль:
   - Помогать покупателям выбирать обувь
   - Отвечать на вопросы о товарах, размерах, материалах
   - Консультировать по доставке и оплате
   - Помогать с возвратом и обменом товаров
   - Рекомендовать товары на основе предпочтений

   Стиль общения:
   - Дружелюбный и профессиональный
   - Краткие и полезные ответы
   - Отвечай на русском, казахском или английском в зависимости от языка вопроса

   Информация о магазине:
   - Доставка по всему Казахстану (2-5 дней)
   - Оплата: наличными, картой, Kaspi
   - Возврат в течение 30 дней
   - Бесплатная доставка от 50,000 ₸

   Если не знаешь точного ответа, предложи связаться с менеджером.`
         },
         ...(conversationHistory || []),
         { role: 'user', content: message }
       ];

       // Call OpenAI API
       const response = await fetch('https://api.openai.com/v1/chat/completions', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${OPENAI_API_KEY}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           model: 'gpt-4o-mini', // Cost-effective model
           messages: messages,
           max_tokens: 500,
           temperature: 0.7,
         }),
       });

       if (!response.ok) {
         const errorData = await response.json();
         console.error('OpenAI API error:', response.status, errorData);
         
         if (response.status === 429) {
           throw new Error('Превышен лимит запросов. Попробуйте через минуту.');
         }
         if (response.status === 401) {
           throw new Error('Неверный API ключ OpenAI');
         }
         if (response.status === 402) {
           throw new Error('Недостаточно кредитов OpenAI');
         }
         
         throw new Error(`OpenAI API error: ${response.status}`);
       }

       const data = await response.json();
       const botMessage = data.choices[0].message.content;

       console.log('OpenAI response received:', botMessage.substring(0, 100) + '...');

       return new Response(JSON.stringify({ 
         message: botMessage,
         usage: data.usage // For monitoring
       }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       });

     } catch (error) {
       console.error('Error in AI chat function:', error);
       
       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
       
       return new Response(
         JSON.stringify({ 
           error: errorMessage,
           message: 'Извините, AI-помощник временно недоступен 😔\nПопробуйте позже или свяжитесь с нашим менеджером.' 
         }), 
         {
           status: 500,
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         }
       );
     }
   });
   ```

5. **Нажмите "Deploy"**

### Вариант 2: Через Supabase CLI

```bash
# Установите Supabase CLI
npm install -g supabase

# Войдите в Supabase
supabase login

# Свяжите проект
supabase link --project-ref YOUR_PROJECT_REF

# Задеплойте функцию
supabase functions deploy ai-chat
```

## ⚙️ НАСТРОЙТЕ ENVIRONMENT VARIABLES:

1. **Откройте Edge Functions Settings:**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/functions
   ```

2. **Добавьте переменную:**
   ```
   Key: OPENAI_API_KEY
   Value: sk-...your-openai-key...
   ```

3. **Сохраните**

## 🔑 ПОЛУЧИТЕ OPENAI API KEY:

1. **Перейдите:** https://platform.openai.com/api-keys

2. **Создайте новый ключ:**
   - Нажмите "Create new secret key"
   - Скопируйте ключ (он показывается только один раз!)
   - Сохраните в безопасном месте

3. **Добавьте кредиты:**
   - https://platform.openai.com/account/billing/overview
   - Минимум $5 для тестирования

## ✅ ПРОВЕРКА:

После деплоя откройте консоль браузера на вашем сайте:

```javascript
// Проверьте в консоли браузера
const response = await fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/ai-chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  },
  body: JSON.stringify({
    message: 'Привет!',
    conversationHistory: []
  })
});

const data = await response.json();
console.log(data);
```

Должно вернуть:
```json
{
  "message": "Здравствуйте! Добро пожаловать в StepUp Shoes...",
  "usage": { "total_tokens": 123, ... }
}
```

## 🐛 TROUBLESHOOTING:

### Если ошибка 401:
```
Error: OPENAI_API_KEY is not configured in Supabase
```
**Решение:** Добавьте OPENAI_API_KEY в Supabase Edge Functions Settings.

### Если ошибка 402:
```
Error: Недостаточно кредитов OpenAI
```
**Решение:** Пополните баланс на https://platform.openai.com/account/billing

### Если ошибка 500:
```
Error: Edge Function returned a non-2xx status code
```
**Решение:** 
1. Проверьте логи в Supabase Dashboard → Edge Functions → ai-chat → Logs
2. Убедитесь что код обновлен на новый синтаксис

## 📝 АЛЬТЕРНАТИВА БЕЗ OPENAI:

Если нет OpenAI ключа, можете использовать mock ответы:

```typescript
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    // Mock AI response
    const mockResponses = [
      'Здравствуйте! Чем могу помочь?',
      'Отличный выбор! Эта модель очень популярна.',
      'Доставка займет 2-5 дней по Казахстану.',
      'Возврат возможен в течение 30 дней.',
    ];
    
    const botMessage = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    return new Response(JSON.stringify({ message: botMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      message: 'Извините, произошла ошибка.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

## 🎯 ГОТОВО!

После деплоя и настройки OPENAI_API_KEY, AI чат заработает!

Проверьте на сайте:
```
https://stepupkz.vercel.app
```

Откройте чат виджет и напишите сообщение! 💬
