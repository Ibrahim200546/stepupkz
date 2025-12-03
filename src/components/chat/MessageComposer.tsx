import { useState, KeyboardEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Send, Paperclip, Smile, X, ImageIcon, Loader2, Sticker } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { optimizeImage, isValidImage, formatFileSize } from '@/lib/imageOptimizer';
import { toast } from 'sonner';
import type { MessageAttachment } from '@/hooks/useChat';
import { VoiceRecorder } from './VoiceRecorder';
import { CustomEmojiPicker } from './CustomEmojiPicker';
import { StickerPicker } from './StickerPicker';
import type { EmojiClickData } from 'emoji-picker-react';

interface MessageComposerProps {
  chatId: string;
  onSend: (content: string, attachments?: MessageAttachment[]) => void;
}

export const MessageComposer = ({ chatId, onSend }: MessageComposerProps) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      if (!isValidImage(file)) {
        toast.error(`${file.name} не является допустимым изображением или слишком большой (макс. 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length + attachments.length > 5) {
      toast.error('Максимум 5 изображений за раз');
      return;
    }

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (): Promise<MessageAttachment[]> => {
    if (attachments.length === 0) return [];

    const uploadedUrls: MessageAttachment[] = [];
    
    for (let i = 0; i < attachments.length; i++) {
      const file = attachments[i];
      setUploadProgress(((i + 1) / attachments.length) * 100);

      try {
        // Optimize image before upload
        const optimized = await optimizeImage(file, 1920, 1080, 0.85);
        
        // Upload to Supabase Storage
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        const filePath = `${chatId}/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('chat-attachments')
          .upload(filePath, optimized.blob, {
            contentType: 'image/webp',
            upsert: false,
          });

        if (error) {
          console.error('Upload error:', error);
          
          // Check if bucket doesn't exist
          if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
            toast.error('Хранилище не настроено. Обратитесь к администратору.');
            throw new Error('Storage bucket not configured');
          }
          
          throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(data.path);

        uploadedUrls.push({
          url: publicUrl,
          type: 'image',
          name: file.name,
          size: optimized.optimizedSize,
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        toast.error(`Ошибка загрузки ${file.name}: ${errorMessage}`);
      }
    }

    return uploadedUrls;
  };

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    setUploading(true);
    try {
      const uploadedAttachments = await uploadAttachments();
      onSend(message || 'Изображение', uploadedAttachments);
      
      // Clear state
      setMessage('');
      setAttachments([]);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Ошибка отправки сообщения');
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleStickerClick = async (stickerUrl: string) => {
    try {
      const attachment: MessageAttachment = {
        url: stickerUrl,
        type: 'sticker',
        name: 'Sticker',
        size: 0
      };
      onSend('Стикер', [attachment]);
    } catch (error) {
      console.error('Error sending sticker:', error);
      toast.error('Ошибка отправки стикера');
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    setUploading(true);
    try {
      const fileName = `${Date.now()}-voice.webm`;
      const filePath = `${chatId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
          upsert: false,
        });

      if (error) {
        console.error('Voice upload error:', error);
        
        if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
          toast.error('Хранилище не настроено. Обратитесь к администратору.');
          throw new Error('Storage bucket not configured');
        }
        
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(data.path);

      const attachment: MessageAttachment = {
        url: publicUrl,
        type: 'voice',
        name: 'Голосовое сообщение',
        size: audioBlob.size
      };

      onSend('Голосовое сообщение', [attachment]);
    } catch (error) {
      console.error('Error uploading voice message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toast.error(`Ошибка загрузки: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border-t space-y-3">
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {attachments.map((file, idx) => (
            <div key={idx} className="relative flex-shrink-0">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-20 h-20 object-cover rounded-lg border"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => removeAttachment(idx)}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 rounded-b-lg truncate">
                {formatFileSize(file.size)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-1">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">Загрузка {Math.round(uploadProgress)}%...</p>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <CustomEmojiPicker
          onEmojiClick={handleEmojiClick}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Sticker Picker */}
      {showStickerPicker && (
        <StickerPicker
          onStickerClick={handleStickerClick}
          onClose={() => setShowStickerPicker(false)}
        />
      )}

      <div className="flex gap-2 items-end">
        {/* Voice Recorder */}
        <VoiceRecorder onSend={handleVoiceMessage} />

        {/* Sticker Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            setShowStickerPicker(!showStickerPicker);
            setShowEmojiPicker(false);
          }}
          disabled={uploading}
        >
          <Sticker className="h-5 w-5" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите сообщение..."
            disabled={uploading}
            className="min-h-[60px] max-h-[200px] resize-none pr-20"
          />
          <div className="absolute right-2 bottom-2 flex gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowStickerPicker(false);
              }}
              disabled={uploading}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={handleSend}
          disabled={(!message.trim() && attachments.length === 0) || uploading}
          size="icon"
          className="h-[60px] w-[60px]"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Нажмите Enter для отправки, Shift+Enter для новой строки. Макс. 5 изображений (10MB каждое)
      </p>
    </div>
  );
};
