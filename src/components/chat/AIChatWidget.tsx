import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, X, Minimize2, Maximize2, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductRecommendation {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  brand: string;
  category: string;
  image: string;
  description: string;
  reason: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: ProductRecommendation[];
}

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет! 👋 Я AI-помощник StepUp Shoes. Чем могу помочь?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call AI Product Recommendations Edge Function
      const { data, error } = await supabase.functions.invoke('ai-product-recommendations', {
        body: {
          message: input,
        }
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw error;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || 'Извините, не удалось получить ответ.',
        timestamp: new Date(),
        products: data.products || [],
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('AI chat error:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Извините, произошла ошибка 😔\n\nВозможные причины:\n- AI-помощник временно недоступен\n- Проверьте настройки API ключа\n\nПожалуйста, попробуйте позже или свяжитесь с менеджером.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast.error('Не удалось отправить сообщение');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Bot className="h-5 w-5 md:h-6 md:w-6" />
      </Button>
    );
  }

  return (
    <Card 
      className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 shadow-2xl z-50 flex flex-col transition-all ${
        isMinimized 
          ? 'h-14 w-[280px] sm:w-80' 
          : 'h-[500px] w-[calc(100vw-2rem)] sm:w-96 max-w-[400px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">AI Помощник</h3>
            <p className="text-xs opacity-90">StepUp Shoes</p>
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  <div
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Product Recommendations */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {msg.products.map((product) => {
                        const discount = product.oldPrice
                          ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                          : 0;

                        return (
                          <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="block"
                          >
                            <Card className="p-3 hover:shadow-md transition-shadow">
                              <div className="flex gap-3">
                                <div className="w-20 h-20 flex-shrink-0 bg-muted rounded overflow-hidden">
                                  <img
                                    src={product.image || '/placeholder-shoe.svg'}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder-shoe.svg';
                                    }}
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">{product.name}</p>
                                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0">
                                      <ShoppingCart className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="font-semibold text-sm">
                                      {product.price.toLocaleString('ru-KZ')} ₸
                                    </span>
                                    {discount > 0 && (
                                      <>
                                        <span className="text-xs text-muted-foreground line-through">
                                          {product.oldPrice!.toLocaleString('ru-KZ')} ₸
                                        </span>
                                        <Badge variant="destructive" className="text-xs px-1 py-0">
                                          -{discount}%
                                        </Badge>
                                      </>
                                    )}
                                  </div>

                                  {product.category && (
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {product.category}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Задайте вопрос..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by OpenAI GPT-4
            </p>
          </div>
        </>
      )}
    </Card>
  );
};
