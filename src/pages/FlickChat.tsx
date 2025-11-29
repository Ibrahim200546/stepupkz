import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, LogOut, User, Search, Plus, Settings, Smile, Sticker, Paperclip, Check, CheckCheck } from 'lucide-react';
import { VoiceRecorder } from '@/components/chat/VoiceRecorder';
import { CustomEmojiPicker } from '@/components/chat/CustomEmojiPicker';
import { StickerPicker } from '@/components/chat/StickerPicker';
import { AudioPlayer } from '@/components/chat/AudioPlayer';
import { useFlickChat, useFlickMessages, FlickChat as FlickChatType, FlickMessage } from '@/hooks/useFlickChat';
import { supabase } from '@/integrations/supabase/client';
import type { EmojiClickData } from 'emoji-picker-react';
import { showNotification, requestNotificationPermission } from '@/lib/notificationSound';
import { toast } from 'sonner';

const FlickChat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeChat, setActiveChat] = useState<FlickChatType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const notifiedMessagesRef = useRef<Set<string>>(new Set()); // Отслеживание показанных уведомлений
  const prevMessagesLengthRef = useRef(0); // Отслеживание количества сообщений

  const { chats, loading: chatsLoading, createChat, searchUsers } = useFlickChat(user?.id);
  const { messages, loading: messagesLoading, sendMessage, markAsRead } = useFlickMessages(
    activeChat?.id || null,
    user?.id || null
  );

  // Check auth and get user
  useEffect(() => {
    const flickUser = localStorage.getItem('flick_user');
    if (!flickUser) {
      navigate('/flick-login');
      return;
    }

    try {
      const parsedUser = JSON.parse(flickUser);
      setUser(parsedUser);

      // Update online status
      supabase
        .from('flick_users')
        .update({ is_online: true })
        .eq('id', parsedUser.id)
        .then();

      // Request notification permission
      requestNotificationPermission();

      // Apply flick theme
      document.body.classList.add('flick-theme');
    } catch (error) {
      console.error('Error parsing user:', error);
      navigate('/flick-login');
    }

    return () => {
      // Update offline status on unmount
      if (user?.id) {
        supabase
          .from('flick_users')
          .update({ is_online: false, last_seen: new Date().toISOString() })
          .eq('id', user.id)
          .then();
      }
      document.body.classList.remove('flick-theme');
    };
  }, [navigate]);

  // Scroll to bottom on new messages (только для новых, не при каждом обновлении)
  useEffect(() => {
    // Скролл только если добавилось новое сообщение
    if (messages.length > prevMessagesLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]); // Зависимость только от длины!

  // Mark messages as read when viewing chat (только при смене чата!)
  useEffect(() => {
    if (activeChat && user) {
      markAsRead();
    }
  }, [activeChat?.id, user?.id]); // Зависимости только ID, не функции!

  // Show notification for NEW messages ONLY
  useEffect(() => {
    if (messages.length === 0 || !user) return;

    // Проверяем только если добавились НОВЫЕ сообщения
    if (messages.length > prevMessagesLengthRef.current) {
      // Берем только новые сообщения
      const newMessages = messages.slice(prevMessagesLengthRef.current);
      
      newMessages.forEach(msg => {
        // Показываем уведомление только если:
        // 1. Сообщение не от меня
        // 2. Еще не показывали уведомление для этого сообщения
        if (msg.sender_id !== user.id && !notifiedMessagesRef.current.has(msg.id)) {
          const senderName = msg.sender?.username || 'Пользователь';
          let notificationText = msg.content || '';
          
          if (msg.type === 'VOICE') notificationText = '🎤 Голосовое сообщение';
          if (msg.type === 'STICKER') notificationText = '🎨 Стикер';
          if (msg.type === 'IMAGE') notificationText = '🖼️ Изображение';
          
          showNotification(senderName, notificationText);
          
          // Отмечаем что показали уведомление
          notifiedMessagesRef.current.add(msg.id);
        }
      });
    }

    // Обновляем счетчик
    prevMessagesLengthRef.current = messages.length;
  }, [messages, user?.id]);

  // Очищаем отслеживание при смене чата
  useEffect(() => {
    notifiedMessagesRef.current.clear();
    prevMessagesLengthRef.current = 0;
  }, [activeChat?.id]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const results = await searchUsers(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleStartChat = async (partnerId: string) => {
    const chat = await createChat(partnerId, false);
    if (chat) {
      setActiveChat(chat as any);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    await sendMessage(newMessage, 'TEXT');
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const handleStickerClick = async (stickerUrl: string) => {
    if (!activeChat) return;
    await sendMessage('Стикер', 'STICKER', stickerUrl);
    setShowStickerPicker(false);
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    if (!activeChat) return;
    
    setUploading(true);
    try {
      const fileName = `${Date.now()}-voice.webm`;
      const filePath = `${activeChat.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('flick-attachments')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('flick-attachments')
        .getPublicUrl(data.path);

      await sendMessage('Голосовое сообщение', 'VOICE', publicUrl);
    } catch (error) {
      console.error('Error uploading voice message:', error);
      toast.error('Ошибка загрузки голосового сообщения');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${activeChat.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('flick-attachments')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('flick-attachments')
        .getPublicUrl(data.path);

      const type = file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO';
      await sendMessage(file.name, type, publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Ошибка загрузки файла');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    if (user?.id) {
      supabase
        .from('flick_users')
        .update({ is_online: false })
        .eq('id', user.id)
        .then();
    }
    localStorage.removeItem('flick_user');
    localStorage.removeItem('flick_token');
    navigate('/flick-login');
  };

  const getChatName = (chat: FlickChatType) => {
    if (chat.is_group) return chat.name || 'Группа';
    const partner = chat.members?.find((m) => m.user.id !== user?.id);
    return partner?.user.username || 'Неизвестный';
  };

  const getChatAvatar = (chat: FlickChatType) => {
    if (chat.is_group) return null;
    const partner = chat.members?.find((m) => m.user.id !== user?.id);
    return partner?.user.avatar;
  };

  const getChatStatus = (chat: FlickChatType) => {
    if (chat.is_group) return null;
    const partner = chat.members?.find((m) => m.user.id !== user?.id);
    if (!partner) return null;
    if (partner.user.is_online) return 'онлайн';
    if (partner.user.last_seen) {
      const date = new Date(partner.user.last_seen);
      return `был(а) в сети ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return 'оффлайн';
  };

  const getMessageStatusIcon = (msg: FlickMessage) => {
    if (msg.sender_id !== user?.id) return null;
    
    const isRead = msg.statuses?.some(s => s.status === 'READ' && s.user_id !== user.id);
    if (isRead) return <CheckCheck size={14} className="text-flick-blue" />;
    
    const chat = chats.find(c => c.id === msg.chat_id);
    const partner = chat?.members.find(m => m.user.id !== user.id);
    const isDelivered = partner?.user.is_online;

    if (isDelivered) return <CheckCheck size={14} className="text-white/30" />;
    return <Check size={14} className="text-white/30" />;
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-flick-dark">
        <div className="animate-spin w-8 h-8 border-4 border-flick-orange border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-flick-dark overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 glass-panel border-r border-white/10 flex flex-col flex-shrink-0 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flick-orange to-flick-blue p-[2px]">
              <div className="w-full h-full rounded-full bg-flick-dark flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-white" />
                )}
              </div>
            </div>
            <span className="font-pixel text-xs text-white">{user?.username}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="text-white/50 hover:text-flick-blue transition-colors"
              title="На главную"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <button onClick={handleLogout} className="text-white/50 hover:text-flick-orange transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Поиск"
              className="pixel-input w-full pl-10 rounded-lg text-xs"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-2 glass-panel rounded-lg overflow-hidden left-0 right-0 mx-4">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleStartChat(result.id)}
                  className="p-3 hover:bg-white/10 cursor-pointer flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    {result.avatar ? (
                      <img src={result.avatar} alt={result.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="font-pixel text-[10px] text-white">
                        {result.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="font-pixel text-xs text-white">{result.username}</span>
                  <Plus size={14} className="ml-auto text-flick-blue" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto flick-scroll">
          {chatsLoading ? (
            <div className="p-4 text-center text-white/50 font-pixel text-xs">Загрузка...</div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-white/50 font-pixel text-xs">Нет чатов</div>
          ) : (
            chats.map((chat) => {
              const avatar = getChatAvatar(chat);
              const isOnline = !chat.is_group && chat.members?.find(m => m.user.id !== user?.id)?.user.is_online;
              
              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`p-4 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 ${
                    activeChat?.id === chat.id ? 'bg-white/10 border-l-4 border-l-flick-orange' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        {avatar ? (
                          <img src={avatar} alt={getChatName(chat)} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-pixel text-xs text-flick-blue">
                            {getChatName(chat).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {!chat.is_group && (
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-flick-dark ${
                          isOnline ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-pixel text-xs text-white truncate">{getChatName(chat)}</h3>
                        {chat.last_message && (
                          <span className="text-[10px] text-white/30">
                            {new Date(chat.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-white/50 truncate w-32">
                          {chat.last_message ? (
                            <>
                              {chat.last_message.type === 'VOICE' && '🎤 Голосовое'}
                              {chat.last_message.type === 'STICKER' && '🎨 Стикер'}
                              {chat.last_message.type === 'IMAGE' && '🖼️ Изображение'}
                              {chat.last_message.type === 'TEXT' && chat.last_message.content}
                            </>
                          ) : (
                            'Нет сообщений'
                          )}
                        </p>
                        {chat.unread_count > 0 && (
                          <div className="w-5 h-5 rounded-full bg-flick-blue flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">{chat.unread_count}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* Header */}
            <div className="h-16 glass-panel border-b border-white/10 flex items-center px-4 md:px-6 justify-between z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveChat(null)}
                  className="md:hidden text-white/50 hover:text-white mr-2"
                >
                  ←
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flick-blue to-flick-orange p-[2px]">
                    <div className="w-full h-full rounded-full bg-flick-dark flex items-center justify-center overflow-hidden">
                      {getChatAvatar(activeChat) ? (
                        <img
                          src={getChatAvatar(activeChat)!}
                          alt={getChatName(activeChat)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-pixel text-xs text-white">
                          {getChatName(activeChat).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-pixel text-sm text-white">{getChatName(activeChat)}</h2>
                    <span className="text-xs text-flick-blue">{getChatStatus(activeChat)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flick-scroll">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin w-8 h-8 border-4 border-flick-orange border-t-transparent rounded-full" />
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] p-3 rounded-lg backdrop-blur-sm ${
                            isMe
                              ? 'bg-flick-blue/20 border border-flick-blue/50 rounded-tr-none'
                              : 'bg-white/10 border border-white/20 rounded-tl-none'
                          }`}
                        >
                          {!isMe && (
                            <p className="text-[10px] text-flick-orange font-pixel mb-1">
                              {msg.sender.username}
                            </p>
                          )}
                          
                          {msg.type === 'VOICE' && msg.file_url ? (
                            <AudioPlayer src={msg.file_url} />
                          ) : msg.type === 'STICKER' && msg.file_url ? (
                            <img src={msg.file_url} alt="Sticker" className="w-32 h-32 object-contain" />
                          ) : msg.type === 'IMAGE' && msg.file_url ? (
                            <img src={msg.file_url} alt="Image" className="max-w-full rounded-lg" />
                          ) : msg.type === 'VIDEO' && msg.file_url ? (
                            <video src={msg.file_url} controls className="max-w-full rounded-lg" />
                          ) : (
                            <p className="text-sm text-white">{msg.content}</p>
                          )}
                          
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <p className="text-[10px] text-white/30">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {getMessageStatusIcon(msg)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-4 glass-panel border-t border-white/10 relative">
              {showEmojiPicker && (
                <CustomEmojiPicker
                  onEmojiClick={handleEmojiClick}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
              {showStickerPicker && (
                <StickerPicker
                  onStickerClick={handleStickerClick}
                  onClose={() => setShowStickerPicker(false)}
                />
              )}
              
              <div className="flex gap-2 md:gap-4 items-center">
                <VoiceRecorder onSend={handleVoiceMessage} />
                
                <button
                  onClick={() => {
                    setShowStickerPicker(!showStickerPicker);
                    setShowEmojiPicker(false);
                  }}
                  disabled={uploading}
                  className="text-white/50 hover:text-flick-blue transition-colors hidden md:block"
                >
                  <Sticker size={20} />
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-white/50 hover:text-flick-blue transition-colors"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,video/*"
                />
                
                <form onSubmit={handleSendMessage} className="flex-1 flex gap-2 md:gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Сообщение..."
                      disabled={uploading}
                      className="pixel-input w-full rounded-lg pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowStickerPicker(false);
                      }}
                      disabled={uploading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-flick-orange transition-colors"
                    >
                      <Smile size={18} />
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={uploading || !newMessage.trim()}
                    className="bg-flick-orange hover:bg-flick-blue text-white p-3 rounded-lg transition-colors shadow-pixel active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30">
            <div className="w-32 h-32 mb-6 animate-pulse">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-flick-orange to-flick-blue opacity-20" />
            </div>
            <p className="font-pixel text-sm mb-2">FLICK MESSENGER</p>
            <p className="font-pixel text-xs text-white/20">Выберите чат</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlickChat;
