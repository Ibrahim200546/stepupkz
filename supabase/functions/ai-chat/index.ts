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
