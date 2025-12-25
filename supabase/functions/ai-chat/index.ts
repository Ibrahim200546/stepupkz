const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizeGeminiModelName(model: string): string {
  const trimmed = (model ?? '').trim();
  if (!trimmed) return '';
  return trimmed.startsWith('models/') ? trimmed.slice('models/'.length) : trimmed;
}

function pickBestGeminiModel(models: string[]): string {
  const normalized = models.map(normalizeGeminiModelName).filter(Boolean);
  const flash = normalized.find((m) => m.includes('flash'));
  return flash || normalized[0] || '';
}

function getFallbackMessage(message: string): string {
  const lowerMsg = (message || '').toLowerCase();

  const responses: Record<string, string> = {
    привет: 'Привет! 👋 Добро пожаловать в StepUp Shoes! Я помогу вам выбрать идеальную пару обуви. Что вас интересует?',
    hello: 'Hello! 👋 Welcome to StepUp Shoes! How can I help you today?',
    сәлем: 'Сәлеметсіз бе! 👋 StepUp Shoes дүкеніне қош келдіңіз! Сізге қалай көмектесе аламын?',
    доставк: 'Доставка по всему Казахстану занимает 2-5 дней. 📦 Бесплатная доставка при заказе от 50,000₸! Курьер привезет заказ прямо к вашей двери.',
    оплат: 'Мы принимаем различные способы оплаты: 💳 банковские карты, 💵 наличные при получении, или через Kaspi Pay. Выбирайте удобный для вас способ!',
    возврат: 'Возврат товара возможен в течение 30 дней с момента покупки. 🔄 Главное условие - обувь должна быть в отличном состоянии, без следов носки.',
    размер: 'У нас есть подробная таблица размеров для каждой модели! 📏 Также можете связаться с нашим менеджером для индивидуальной консультации по подбору размера.',
    каталог: 'У нас большой выбор обуви: 👟 кроссовки, 👠 туфли, 🥾 ботинки, 👡 сандалии для мужчин, женщин и детей. Все модели от проверенных брендов!',
    цена: 'Цены варьируются в зависимости от модели и бренда. У нас регулярно проходят акции и распродажи! Посмотрите каталог на сайте или спросите о конкретной модели.',
    качество: 'Мы работаем только с проверенными производителями и гарантируем качество всей нашей продукции! ⭐ На каждую пару обуви предоставляется гарантия.',
  };

  for (const [keyword, response] of Object.entries(responses)) {
    if (lowerMsg.includes(keyword)) return response;
  }

  return (
    'Здравствуйте! 👋 Я AI-помощник StepUp Shoes.\n\n' +
    'Я могу помочь вам с:\n' +
    '• Выбором обуви\n' +
    '• Вопросами о доставке и оплате\n' +
    '• Информацией о размерах\n' +
    '• Возвратом товара\n\n' +
    'Что вас интересует?'
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ message: 'Method not allowed' }, 405);
  }

  // Parse request body ONCE. (Calling req.json() twice will always fail.)
  const rawBody = await req.text();
  let payload: any = {};

  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return jsonResponse({ message: 'Invalid JSON body' }, 400);
  }

  const message = typeof payload?.message === 'string' ? payload.message : '';
  const conversationHistory = Array.isArray(payload?.conversationHistory)
    ? payload.conversationHistory
    : [];

  if (!message.trim()) {
    return jsonResponse({ message: getFallbackMessage('') }, 200);
  }

  try {
    const systemPrompt =
      'Ты — умный AI-помощник магазина StepUp Shoes в Казахстане. ' +
      'Помогаешь покупателям с выбором обуви, отвечаешь на вопросы о товарах, доставке (2-5 дней по Казахстану, бесплатно от 50,000₸), ' +
      'оплате (карты, наличные, Kaspi Pay), возврате (30 дней). ' +
      'Будь дружелюбным, отвечай кратко и по делу. ' +
      'Отвечай на языке пользователя (русский/қазақша/English).';

    // Prefer Gemini if configured (user requested GEMINI_API_KEY).
    const GEMINI_API_KEY = (Deno.env.get('GEMINI_API_KEY') ?? '').trim();
    const GEMINI_MODEL = normalizeGeminiModelName(
      (Deno.env.get('GEMINI_MODEL') ?? '').trim() || 'gemini-1.5-flash-latest'
    );

    if (GEMINI_API_KEY) {
      const commonHeaders = {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      };

      const contents = [
        ...conversationHistory
          .slice(-5)
          .map((m: any) => {
            const role = m?.role === 'assistant' ? 'model' : 'user';
            const text = typeof m?.content === 'string' ? m.content : '';
            return text ? { role, parts: [{ text }] } : null;
          })
          .filter(Boolean),
        { role: 'user', parts: [{ text: message }] },
      ];

      const callGemini = async (modelId: string) => {
        const normalizedModel = normalizeGeminiModelName(modelId);
        if (!normalizedModel) {
          return { ok: false, status: 0, text: 'Empty Gemini model' };
        }

        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalizedModel)}:generateContent`,
          {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 400,
              },
            }),
          }
        );

        const text = await resp.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = null;
        }

        if (!resp.ok) {
          return { ok: false, status: resp.status, text };
        }

        const parts = data?.candidates?.[0]?.content?.parts;
        const botMessage = Array.isArray(parts)
          ? parts
              .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
              .join('')
              .trim()
          : '';

        if (!botMessage) {
          return { ok: false, status: 200, text: 'Empty Gemini response' };
        }

        return { ok: true, status: 200, text: botMessage };
      };

      const tried = new Set<string>();
      const tryModel = async (modelId: string) => {
        const normalized = normalizeGeminiModelName(modelId);
        if (!normalized || tried.has(normalized)) return null;
        tried.add(normalized);
        return await callGemini(normalized);
      };

      // 1) Try configured/default model.
      let result = await tryModel(GEMINI_MODEL);

      // 2) If model not found, ask API for available models and retry with best match.
      if (result && !result.ok && result.status === 404) {
        const listResp = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
          method: 'GET',
          headers: { 'x-goog-api-key': GEMINI_API_KEY },
        });

        const listText = await listResp.text();
        let listData: any = null;
        try {
          listData = listText ? JSON.parse(listText) : null;
        } catch {
          listData = null;
        }

        if (listResp.ok && Array.isArray(listData?.models)) {
          const supported = listData.models
            .filter((m: any) => Array.isArray(m?.supportedGenerationMethods))
            .filter((m: any) => m.supportedGenerationMethods.includes('generateContent'))
            .map((m: any) => (typeof m?.name === 'string' ? m.name : ''))
            .filter(Boolean);

          const best = pickBestGeminiModel(supported);
          if (best) {
            result = await tryModel(best);
          }
        }
      }

      // 3) Try a few common model ids (depends on account / rollout).
      if (!result || !result.ok) {
        const fallbacks = [
          'gemini-2.5-flash',
          'gemini-2.0-flash',
          'gemini-1.5-flash-latest',
          'gemini-1.5-pro-latest',
        ];

        for (const m of fallbacks) {
          const r = await tryModel(m);
          if (r?.ok) {
            result = r;
            break;
          }
        }
      }

      if (result?.ok) {
        return jsonResponse({ message: result.text }, 200);
      }

      console.error('Gemini API error:', result?.status ?? 0, result?.text ?? 'Unknown error');
      return jsonResponse({ message: getFallbackMessage(message) }, 200);
    }

    // Fallback to OpenAI if Gemini isn't configured.
    const OPENAI_API_KEY = (Deno.env.get('OPENAI_API_KEY') ?? '').trim();
    const OPENAI_MODEL = (Deno.env.get('OPENAI_MODEL') ?? '').trim() || 'gpt-4o-mini';

    if (!OPENAI_API_KEY) {
      console.error('GEMINI_API_KEY / OPENAI_API_KEY not configured');
      return jsonResponse({ message: getFallbackMessage(message) }, 200);
    }

    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
        .slice(-5)
        .map((m: any) => ({
          role: m?.role === 'assistant' ? 'assistant' : 'user',
          content: typeof m?.content === 'string' ? m.content : '',
        }))
        .filter((m: any) => m.content),
      { role: 'user', content: message },
    ];

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const openaiText = await openaiResponse.text();
    let openaiData: any = null;
    try {
      openaiData = openaiText ? JSON.parse(openaiText) : null;
    } catch {
      openaiData = null;
    }

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', openaiResponse.status, openaiText);
      return jsonResponse({ message: getFallbackMessage(message) }, 200);
    }

    const botMessage = String(openaiData?.choices?.[0]?.message?.content ?? '').trim();
    if (!botMessage) {
      console.error('OpenAI returned empty message:', openaiData);
      return jsonResponse({ message: getFallbackMessage(message) }, 200);
    }

    return jsonResponse({ message: botMessage }, 200);
  } catch (error) {
    console.error('Error:', error);
    return jsonResponse({ message: getFallbackMessage(message) }, 200);
  }
});
