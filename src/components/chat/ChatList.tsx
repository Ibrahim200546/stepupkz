import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Users } from 'lucide-react';
import { Chat } from '@/hooks/useChat';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import type { ChatMember } from '@/types/database';

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export const ChatList = ({ chats, selectedChatId, onSelectChat, onNewChat }: ChatListProps) => {
  const [search, setSearch] = useState('');
  const [chatMembers, setChatMembers] = useState<Record<string, ChatMember[]>>({});

  useEffect(() => {
    loadChatMembers();
  }, [chats]);

  const loadChatMembers = async () => {
    const members: Record<string, ChatMember[]> = {};
    
    for (const chat of chats) {
      if (chat.type === 'direct') {
        const { data } = await supabase
          .from('chat_members')
          .select('user_id, profiles(first_name, last_name, nickname, avatar_url)')
          .eq('chat_id', chat.id);
        
        if (data) {
          members[chat.id] = data;
        }
      }
    }
    
    setChatMembers(members);
  };

  const filteredChats = chats.filter(chat => {
    const searchLower = search.toLowerCase();
    if (chat.type === 'group') {
      return chat.title?.toLowerCase().includes(searchLower);
    }
    return true; // For direct chats, we'd need to filter by member names
  });

  const getChatTitle = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.title || 'Группа';
    }
    
    // For direct chats, show the other user's name
    const members = chatMembers[chat.id] || [];
    const otherMember = members.find((m) => m.user_id !== supabase.auth.getUser());
    if (otherMember && otherMember.profiles) {
      const profile = Array.isArray(otherMember.profiles) ? otherMember.profiles[0] : otherMember.profiles;
      if (profile.nickname) return `@${profile.nickname}`;
      if (profile.first_name) return `${profile.first_name} ${profile.last_name || ''}`.trim();
    }
    
    return 'Личный чат';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.avatar) return chat.avatar;
    return undefined;
  };

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Чаты</h2>
          <Button size="sm" onClick={onNewChat}>
            <Plus className="h-4 w-4 mr-1" />
            Новый
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск чатов или @username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors text-left ${
                selectedChatId === chat.id ? 'bg-accent' : ''
              }`}
            >
              <Avatar>
                <AvatarImage src={getChatAvatar(chat)} />
                <AvatarFallback>
                  {chat.type === 'group' ? (
                    <Users className="h-5 w-5" />
                  ) : (
                    getChatTitle(chat)[0]
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium truncate">{getChatTitle(chat)}</h3>
                  {chat.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(chat.lastMessage.created_at), {
                        addSuffix: true,
                        locale: ru
                      })}
                    </span>
                  )}
                </div>
                
                {chat.lastMessage && (
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage.content}
                  </p>
                )}

                {chat.unreadCount && chat.unreadCount > 0 && (
                  <Badge variant="default" className="mt-1">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
            </button>
          ))}

          {filteredChats.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <p>Чатов не найдено</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
