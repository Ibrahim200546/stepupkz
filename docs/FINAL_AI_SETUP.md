# ✅ ФИНАЛЬНАЯ НАСТРОЙКА AI CHAT

## Проблемы исправлены:

1. ✅ Убраны ошибки TypeScript в Edge Function
2. ✅ Удалена проверка VITE_OPENAI_API_KEY на фронтенде
3. ✅ Добавлен deno.json для правильной работы

---

## 🚀 КАК НАСТРОИТЬ (ПРОСТАЯ ИНСТРУКЦИЯ):

### ШАГ 1: Отозвать старые ключи

```
https://platform.openai.com/api-keys
```

Удалите ВСЕ старые ключи (вы их случайно публиковали).

---

### ШАГ 2: Создать НОВЫЙ ключ

1. https://platform.openai.com/api-keys
2. **"Create new secret key"**
3. Name: `StepUp-Production`
4. **СКОПИРОВАТЬ** (показывается раз!)
5. **НЕ ПУБЛИКОВАТЬ НИГДЕ!**

---

### ШАГ 3: Добавить в Supabase Dashboard

```
https://supabase.com/dashboard/project/uoziiapuqunqbvevfzyu/settings/secrets
```

1. **Add new secret**
2. **Name:** `OPENAI_API_KEY`
3. **Value:** вставить новый ключ
4. **Add secret**

---

### ШАГ 4: Скопировать исправленный код функции

Откройте файл:
```
C:\Users\user\stepupkz\supabase\functions\ai-chat\index.ts
```

Скопируйте ВЕСЬ код (Ctrl+A, Ctrl+C)

---

### ШАГ 5: Deploy функцию

```
https://supabase.com/dashboard/project/uoziiapuqunqbvevfzyu/functions
```

**Если функция уже есть:**
1. Откройте `ai-chat`
2. **Details** → **Edit**
3. Удалить старый код
4. Вставить новый (Ctrl+V)
5. **Deploy**

**Если функции нет:**
1. **New function**
2. Name: `ai-chat`
3. Вставить код
4. **Deploy**

---

### ШАГ 6: Обновить .env (БЕЗ публикации!)

```env
# В файле .env (локально)
VITE_OPENAI_API_KEY=ваш-новый-ключ-для-локального-теста
```

⚠️ **НЕ ПОКАЗЫВАЙТЕ** этот файл никому!

---

### ШАГ 7: Перезапустить dev сервер

```bash
npm run dev
```

---

### ШАГ 8: Тест

1. http://localhost:8081
2. Кнопка 🤖 справа внизу
3. Написать "Привет"
4. Должен ответить!

---

## 🔍 Если ошибка 500:

### Посмотреть логи:

```
Dashboard → Functions → ai-chat → Logs
```

### Частые ошибки:

**1. "OPENAI_API_KEY is not configured"**

**Решение:**
- Добавить секрет в Supabase (Шаг 3)
- Redeploy функцию

**2. "Invalid API key"**

**Решение:**
- Проверить ключ на platform.openai.com
- Убедиться что не отозван
- Создать новый ключ

**3. "Insufficient quota"**

**Решение:**
- Пополнить баланс OpenAI
- https://platform.openai.com/settings/organization/billing

---

## 📊 Исправленный код Edge Function:

```typescript
// @deno-types="https://deno.land/x/xhr@0.1.0/mod.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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

    console.log('OpenAI response received');

    return new Response(JSON.stringify({ 
      message: botMessage,
      usage: data.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI chat function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: 'Извините, AI-помощник временно недоступен 😔' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

---

## ✅ Checklist:

- [ ] Старые ключи отозваны
- [ ] Новый ключ создан
- [ ] Ключ добавлен в Supabase Secrets
- [ ] Функция ai-chat задеплоена с новым кодом
- [ ] .env обновлен локально
- [ ] Dev сервер перезапущен
- [ ] Кнопка 🤖 видна на сайте
- [ ] Тест отправлен
- [ ] AI ответил!

---

## 💡 ВАЖНО:

1. **Ключ в .env** - только для локальных тестов
2. **Ключ в Supabase Secrets** - используется Edge Function
3. **НЕ ПУБЛИКУЙТЕ** ключи в чатах/форумах!
4. **После добавления секрета** - обязательно Redeploy функцию!

---

**Dashboard:** https://supabase.com/dashboard/project/uoziiapuqunqbvevfzyu

**Secrets:** https://supabase.com/dashboard/project/uoziiapuqunqbvevfzyu/settings/secrets

**Functions:** https://supabase.com/dashboard/project/uoziiapuqunqbvevfzyu/functions

---

Следуйте инструкции и AI заработает! 🤖✨
