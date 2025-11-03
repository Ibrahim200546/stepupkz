import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from '@/hooks/useChat';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
  const senderName = message.sender
    ? `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim() || 'Пользователь'
    : 'Пользователь';

  const isRead = message.reads && message.reads.length > 0;

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender?.avatar_url} />
          <AvatarFallback>{senderName[0]}</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {!isOwn && (
          <span className="text-xs text-muted-foreground mb-1">{senderName}</span>
        )}
        
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment: any, idx: number) => (
                <div key={idx} className="text-xs opacity-80">
                  📎 {attachment.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
              locale: ru
            })}
          </span>
          {isOwn && (
            <span className="text-muted-foreground">
              {isRead ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
