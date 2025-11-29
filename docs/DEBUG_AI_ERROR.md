# 🐛 Отладка ошибки AI Chat (500 Internal Server Error)

## Проблема

```
POST https://uoziiapuqunqbvevfzyu.supabase.co/functions/v1/ai-chat 500
```

Edge Function возвращает ошибку 500.

---

## 🔍 ШАГ 1: Посмотреть логи функции

1. **Откройте:** https://supabase.com/dashboard/project/uoziiapuqunqbvevfzyu
2. **Edge Functions** → **ai-chat**
3. **Logs** (вкладка)
4. **Обновите** и посмотрите последнюю ошибку

### Частые ошибки в логах:

**Ошибка 1: "OPENAI_API_KEY is not configured"**
```
Error: OPENAI_API_KEY is not configured in Supabase
```

**Решение:**
- Settings → Secrets → Add: `OPENAI_API_KEY` = ваш ключ
- Redeploy функцию

---

**Ошибка 2: "Invalid API key"** 
```
OpenAI API error: 401 {"error": {"code": "invalid_api_key"}}
```

**Решение:**
- Проверить ключ на https://platform.openai.com/api-keys
- Убедиться что ключ начинается с `sk-proj-...`
- Убедиться что ключ НЕ отозван
- Обновить секрет в Supabase

---

**Ошибка 3: "Insufficient quota"**
```
OpenAI API error: 402 {"error": {"code": "insufficient_quota"}}
```

**Решение:**
- Пополнить баланс на https://platform.openai.com/settings/organization/billing
- Или использовать другой API ключ

---

**Ошибка 4: Синтаксическая ошибка в коде**
```
SyntaxError: Unexpected token...
TypeError: Cannot read property...
```

**Решение:**
- Проверить что весь код скопирован правильно
- Убедиться что нет лишних символов
- Redeploy с правильным кодом

---

## 🔧 ШАГ 2: Проверить что секрет добавлен

```sql
-- В Supabase Dashboard → Settings → Secrets
-- Должен быть:
OPENAI_API_KEY = sk-proj-...
```

Если секрета нет:
1. Add new secret
2. Key: `OPENAI_API_KEY`
3. Value: ваш OpenAI ключ
4. Save
5. **ВАЖНО:** Redeploy функцию!

---

## 🔄 ШАГ 3: Redeploy функции

После изменения секретов нужно redeploy:

1. Edge Functions → ai-chat
2. **Deploy** или **Redeploy**
3. Подождать пока статус = Active

---

## 🧪 ШАГ 4: Тест через Dashboard

1. Edge Functions → ai-chat → **Invoke**
2. Body:
```json
{
  "message": "test",
  "conversationHistory": []
}
```
3. **Send**

**Если работает:**
```json
{
  "message": "Привет! 👋...",
  "usage": {...}
}
```

**Если ошибка:**
Посмотрите response body - там будет детали ошибки.

---

## 💡 ШАГ 5: Альтернативное решение (если Dashboard не работает)

Можно вызвать OpenAI напрямую с фронтенда (не безопасно для production!):

### Измените AIChatWidget.tsx:

Замените это:
```typescript
const { data, error } = await supabase.functions.invoke('ai-chat', {
  body: {
    message: input,
    conversationHistory: messages.slice(-5).map(m => ({
      role: m.role,
      content: m.content
    }))
  }
});
```

На это:
```typescript
const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!openaiKey) {
  throw new Error('VITE_OPENAI_API_KEY not found in .env');
}

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${openaiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Ты — AI-помощник магазина StepUp Shoes. Помогай покупателям с выбором обуви, отвечай на вопросы о доставке и возврате. Будь дружелюбным и полезным!'
      },
      ...messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: input }
    ],
    max_tokens: 500,
    temperature: 0.7,
  }),
});

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error?.message || 'OpenAI API error');
}

const data = await response.json();
const assistantMessage: Message = {
  role: 'assistant',
  content: data.choices[0].message.content,
  timestamp: new Date(),
};
```

⚠️ **Минусы:** API ключ виден в браузере (можно украсть)

✅ **Плюсы:** Работает сразу, не нужно настраивать Edge Function

---

## ✅ Checklist отладки:

- [ ] Посмотрел логи функции (Logs tab)
- [ ] Проверил что OPENAI_API_KEY добавлен в Secrets
- [ ] Проверил что ключ правильный (на platform.openai.com)
- [ ] Redeploy функции после изменения секретов
- [ ] Протестировал через Dashboard Invoke
- [ ] Проверил баланс на OpenAI (есть кредиты?)
- [ ] Если не помогло - использовал прямой вызов

---

## 🆘 Если ничего не помогает:

**Напишите мне:**

1. Что в логах функции? (скриншот или текст ошибки)
2. Секрет OPENAI_API_KEY добавлен?
3. Ключ работает? (проверить на platform.openai.com)
4. Response body при тесте через Invoke?

---

**Dashboard URL:** https://supabase.com/dashboard/project/uoziiapuqunqbvevfzyu/functions

**Logs:** Edge Functions → ai-chat → Logs

Посмотрите логи и напишите что там! 🔍
