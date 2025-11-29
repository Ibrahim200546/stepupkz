import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { useChatMessages } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { showNotification, requestNotificationPermission } from '@/lib/notificationSound';

interface ChatWindowProps {
  chatId: string;
  onBack?: () => void;
}

export const ChatWindow = ({ chatId, onBack }: ChatWindowProps) => {
  const { user } = useAuth();
  const { messages, loading, hasMore, sendMessage, markAsRead, loadMore } = useChatMessages(chatId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      const newMessage = messages[messages.length - 1];
      if (newMessage.sender_id !== user?.id) {
        const senderName = newMessage.sender
          ? `${newMessage.sender.first_name || ''} ${newMessage.sender.last_name || ''}`.trim() || 'Пользователь'
          : 'Пользователь';
        
        let notificationText = newMessage.content || '';
        if (newMessage.attachments && newMessage.attachments.length > 0) {
          const attachment = newMessage.attachments[0];
          if (attachment.type === 'voice') notificationText = '🎤 Голосовое сообщение';
          if (attachment.type === 'sticker') notificationText = '🎨 Стикер';
          if (attachment.type === 'image') notificationText = '🖼️ Изображение';
        }
        
        showNotification(`${senderName}`, notificationText);
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, user]);

  useEffect(() => {
    // Mark messages as read when viewing
    messages.forEach(msg => {
      if (msg.sender_id !== user?.id) {
        markAsRead(msg.id);
      }
    });
  }, [messages, user, markAsRead]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.target.scrollTop === 0 && hasMore && !loading) {
      loadMore();
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-3/4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h3 className="font-semibold">Чат</h3>
            <p className="text-xs text-muted-foreground">онлайн</p>
          </div>
        </div>
        
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" onScroll={handleScroll}>
        {hasMore && (
          <div className="text-center mb-4">
            <Button variant="ghost" size="sm" onClick={loadMore} disabled={loading}>
              {loading ? 'Загрузка...' : 'Загрузить еще'}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <MessageComposer chatId={chatId} onSend={sendMessage} />
    </div>
  );
};
