import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  title?: string;
  avatar?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  lastMessage?: Message;
  unreadCount?: number;
  members?: ChatMember[];
}

export interface ChatMember {
  id: string;
  chat_id: string;
  user_id: string;
  role: 'member' | 'admin';
  joined_at: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id?: string;
  content?: string;
  content_format: 'plain' | 'markdown';
  attachments: any[];
  created_at: string;
  edited_at?: string;
  deleted: boolean;
  sender?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  reads?: MessageRead[];
}

export interface MessageRead {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export interface UserPresence {
  user_id: string;
  status: 'online' | 'offline' | 'away';
  last_seen: string;
}

export const useChat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChats = useCallback(async () => {
    if (!user) return;

    try {
      const { data: memberChats, error: memberError } = await supabase
        .from('chat_members')
        .select('chat_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const chatIds = memberChats.map(m => m.chat_id);

      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .in('id', chatIds)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      const typedChatsData = (chatsData || []).map(chat => ({
        ...chat,
        type: chat.type as 'direct' | 'group'
      }));

      // Load last message for each chat
      const chatsWithMessages: Chat[] = await Promise.all(
        typedChatsData.map(async (chat): Promise<Chat> => {
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .eq('deleted', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { data: messages } = await supabase
            .from('messages')
            .select('id')
            .eq('chat_id', chat.id)
            .eq('deleted', false);

          let unreadCount = 0;
          if (messages) {
            for (const msg of messages) {
              const { data: read } = await supabase
                .from('message_reads')
                .select('id')
                .eq('message_id', msg.id)
                .eq('user_id', user.id)
                .single();
              
              if (!read) unreadCount++;
            }
          }

          const typedLastMessage = lastMsg ? {
            ...lastMsg,
            content_format: lastMsg.content_format as 'plain' | 'markdown',
            attachments: (lastMsg.attachments || []) as any[]
          } : undefined;

          return {
            ...chat,
            lastMessage: typedLastMessage,
            unreadCount
          };
        })
      );

      setChats(chatsWithMessages);
    } catch (error: any) {
      console.error('Error loading chats:', error);
      toast.error('Ошибка загрузки чатов');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chats-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages' 
      }, () => {
        loadChats();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chats' 
      }, () => {
        loadChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadChats]);

  const createDirectChat = async (otherUserId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_or_create_direct_chat', {
        other_user_id: otherUserId
      });

      if (error) throw error;
      await loadChats();
      return data;
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast.error('Ошибка создания чата');
      throw error;
    }
  };

  const createGroupChat = async (title: string, memberIds: string[]) => {
    try {
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          type: 'group',
          title,
          created_by: user?.id
        })
        .select()
        .single();

      if (chatError) throw chatError;

      const members = [user?.id, ...memberIds].map(userId => ({
        chat_id: chat.id,
        user_id: userId,
        role: userId === user?.id ? 'admin' : 'member'
      }));

      const { error: membersError } = await supabase
        .from('chat_members')
        .insert(members);

      if (membersError) throw membersError;

      await loadChats();
      return chat.id;
    } catch (error: any) {
      console.error('Error creating group chat:', error);
      toast.error('Ошибка создания группового чата');
      throw error;
    }
  };

  return {
    chats,
    loading,
    createDirectChat,
    createGroupChat,
    refreshChats: loadChats
  };
};

export const useChatMessages = (chatId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMessages = useCallback(async (before?: string) => {
    if (!chatId || !user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('messages')
        .select('*, reads:message_reads(*)')
        .eq('chat_id', chatId)
        .eq('deleted', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data.length < 50) setHasMore(false);

      const typedMessages = (data || []).map((msg: any) => ({
        ...msg,
        content_format: msg.content_format as 'plain' | 'markdown',
        attachments: (msg.attachments || []) as any[]
      }));

      setMessages(prev => before ? [...prev, ...typedMessages.reverse()] : typedMessages.reverse());
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast.error('Ошибка загрузки сообщений');
    } finally {
      setLoading(false);
    }
  }, [chatId, user]);

  useEffect(() => {
    if (chatId) {
      setMessages([]);
      setHasMore(true);
      loadMessages();
    }
  }, [chatId, loadMessages]);

  // Subscribe to new messages
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`messages-${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, async (payload) => {
        const { data: newMsg } = await supabase
          .from('messages')
          .select('*, reads:message_reads(*)')
          .eq('id', payload.new.id)
          .single();

        if (newMsg) {
          const typedMsg: Message = {
            ...newMsg,
            content_format: newMsg.content_format as 'plain' | 'markdown',
            attachments: (newMsg.attachments || []) as any[]
          };
          setMessages(prev => [...prev, typedMsg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const sendMessage = async (content: string, attachments: any[] = []) => {
    if (!chatId || !user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: content.trim(),
          attachments
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Ошибка отправки сообщения');
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('message_reads')
        .upsert({
          message_id: messageId,
          user_id: user.id
        }, {
          onConflict: 'message_id,user_id'
        });
    } catch (error: any) {
      console.error('Error marking message as read:', error);
    }
  };

  return {
    messages,
    loading,
    hasMore,
    sendMessage,
    markAsRead,
    loadMore: () => {
      if (hasMore && messages.length > 0) {
        loadMessages(messages[0].created_at);
      }
    }
  };
};
