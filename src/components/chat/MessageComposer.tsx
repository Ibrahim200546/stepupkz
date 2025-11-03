import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile } from 'lucide-react';

interface MessageComposerProps {
  onSend: (content: string, attachments?: any[]) => void;
}

export const MessageComposer = ({ onSend }: MessageComposerProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите сообщение..."
            className="min-h-[60px] max-h-[200px] resize-none pr-20"
          />
          <div className="absolute right-2 bottom-2 flex gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={handleSend}
          disabled={!message.trim()}
          size="icon"
          className="h-[60px] w-[60px]"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Нажмите Enter для отправки, Shift+Enter для новой строки
      </p>
    </div>
  );
};
