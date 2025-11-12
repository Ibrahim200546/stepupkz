import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message, MessageAttachment } from '@/hooks/useChat';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';
import { ImageWithLightbox } from '@/components/ui/image-with-lightbox';
import { useState } from 'react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  const senderName = message.sender
    ? `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim() || 'Пользователь'
    : 'Пользователь';

  const isRead = message.reads && message.reads.length > 0;
  
  const imageAttachments = message.attachments?.filter(a => a.type === 'image') || [];
  const otherAttachments = message.attachments?.filter(a => a.type !== 'image') || [];

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
        
        <div className="space-y-2">
          {/* Images */}
          {imageAttachments.length > 0 && (
            <div className={`grid gap-2 ${imageAttachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {imageAttachments.map((attachment, idx) => (
                <div
                  key={idx}
                  className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
                  onClick={() => setLightboxIndex(idx)}
                >
                  <img
                    src={attachment.url}
                    alt={attachment.name || 'Image'}
                    loading="lazy"
                    className="w-full h-auto max-h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Text content */}
          {message.content && (
            <div
              className={`rounded-lg px-4 py-2 ${
                isOwn
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          )}
          
          {/* Other attachments */}
          {otherAttachments.length > 0 && (
            <div
              className={`rounded-lg px-4 py-2 ${
                isOwn
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <div className="space-y-2">
                {otherAttachments.map((attachment, idx) => (
                  <a
                    key={idx}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs hover:underline"
                  >
                    📎 {attachment.name}
                  </a>
                ))}
              </div>
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
