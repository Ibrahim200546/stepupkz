import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface FlickUser {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  relationship_status: string | null;
  is_online: boolean;
  last_seen: string;
  notifications_enabled: boolean;
}

export interface FlickMessage {
  id: string;
  content: string | null;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'STICKER' | 'VOICE';
  file_url: string | null;
  sender_id: string;
  chat_id: string;
  created_at: string;
  sender: {
    username: string;
    avatar: string | null;
  };
  statuses: Array<{
    user_id: string;
    status: 'SENT' | 'DELIVERED' | 'READ';
  }>;
}

export interface FlickChat {
  id: string;
  name: string | null;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  members: Array<{
    user: FlickUser;
    role: 'ADMIN' | 'MEMBER';
  }>;
  last_message?: FlickMessage;
  unread_count: number;
}

export const useFlickChat = (userId: string | null) => {
  const [chats, setChats] = useState<FlickChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Fetch all chats for user
  const fetchChats = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Get chats where user is a member
      const { data: chatMembers, error: membersError } = await supabase
        .from('flick_chat_members')
        .select('chat_id')
        .eq('user_id', userId);

      if (membersError) throw membersError;

      const chatIds = chatMembers?.map(m => m.chat_id) || [];

      if (chatIds.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      // Get chat details
      const { data: chatsData, error: chatsError } = await supabase
        .from('flick_chats')
        .select(`
          id,
          name,
          is_group,
          created_at,
          updated_at
        `)
        .in('id', chatIds)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      // Get members for each chat
      const chatsWithMembers = await Promise.all(
        (chatsData || []).map(async (chat) => {
          // Get last message FIRST (чтобы фильтровать пустые чаты)
          const { data: lastMessage } = await supabase
            .from('flick_messages')
            .select(`
              id,
              content,
              type,
              file_url,
              sender_id,
              created_at,
              sender:flick_users!sender_id(username, avatar)
            `)
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // ВАЖНО: Пропускаем чаты без сообщений
          if (!lastMessage) {
            return null;
          }

          const { data: members } = await supabase
            .from('flick_chat_members')
            .select(`
              role,
              user:flick_users(
                id,
                username,
                avatar,
                bio,
                relationship_status,
                is_online,
                last_seen,
                notifications_enabled
              )
            `)
            .eq('chat_id', chat.id);

          // Get unread count - упрощенный подход
          // Считаем все сообщения не от меня
          const { data: allMessages } = await supabase
            .from('flick_messages')
            .select('id')
            .eq('chat_id', chat.id)
            .neq('sender_id', userId);

          // Получаем прочитанные статусы
          const { data: readStatuses } = await supabase
            .from('flick_message_status')
            .select('message_id')
            .eq('user_id', userId)
            .eq('status', 'READ');

          const readMessageIds = new Set(readStatuses?.map(s => s.message_id) || []);
          const unreadCount = allMessages?.filter(m => !readMessageIds.has(m.id)).length || 0;

          return {
            ...chat,
            members: members || [],
            last_message: lastMessage,
            unread_count: unreadCount || 0,
          };
        })
      );

      // Фильтруем null значения (чаты без сообщений)
      const filteredChats = chatsWithMembers.filter(chat => chat !== null) as FlickChat[];
      setChats(filteredChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return;

    fetchChats();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('flick_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'flick_messages',
        },
        (payload) => {
          console.log('New message:', payload);
          fetchChats(); // Refresh chats when new message arrives
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'flick_message_status',
        },
        () => {
          fetchChats(); // Refresh when message status changes
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'flick_users',
        },
        () => {
          fetchChats(); // Refresh when user online status changes
        }
      )
      .subscribe();

    setChannel(messagesChannel);

    return () => {
      messagesChannel.unsubscribe();
    };
  }, [userId, fetchChats]);

  // Create new chat
  const createChat = async (partnerId: string, isGroup: boolean = false, name?: string) => {
    if (!userId) return null;

    try {
      // Check if private chat already exists
      if (!isGroup) {
        const { data: existingMembers } = await supabase
          .from('flick_chat_members')
          .select('chat_id')
          .in('user_id', [userId, partnerId]);

        if (existingMembers && existingMembers.length >= 2) {
          const chatIds = existingMembers.map(m => m.chat_id);
          const duplicates = chatIds.filter((id, index) => chatIds.indexOf(id) !== index);
          
          if (duplicates.length > 0) {
            // Chat already exists
            const existingChatId = duplicates[0];
            const existingChat = chats.find(c => c.id === existingChatId);
            return existingChat || null;
          }
        }
      }

      // Create new chat
      const { data: newChat, error: chatError } = await supabase
        .from('flick_chats')
        .insert({
          name: isGroup ? name : null,
          is_group: isGroup,
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add members
      const membersToAdd = isGroup 
        ? [{ chat_id: newChat.id, user_id: userId, role: 'ADMIN' }]
        : [
            { chat_id: newChat.id, user_id: userId, role: 'MEMBER' },
            { chat_id: newChat.id, user_id: partnerId, role: 'MEMBER' },
          ];

      const { error: membersError } = await supabase
        .from('flick_chat_members')
        .insert(membersToAdd);

      if (membersError) throw membersError;

      await fetchChats();
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  };

  // Search users
  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) return [];

    try {
      const { data, error } = await supabase
        .from('flick_users')
        .select('id, username, avatar, bio, is_online')
        .ilike('username', `%${query}%`)
        .neq('id', userId || '')
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  return {
    chats,
    loading,
    createChat,
    searchUsers,
    refreshChats: fetchChats,
  };
};

export const useFlickMessages = (chatId: string | null, userId: string | null) => {
  const [messages, setMessages] = useState<FlickMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('flick_messages')
        .select(`
          id,
          content,
          type,
          file_url,
          sender_id,
          chat_id,
          created_at,
          sender:flick_users!sender_id(username, avatar)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get statuses for each message
      const messagesWithStatuses = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: statuses } = await supabase
            .from('flick_message_status')
            .select('user_id, status')
            .eq('message_id', msg.id);

          return {
            ...msg,
            sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender,
            statuses: statuses || [],
          };
        })
      );

      setMessages(messagesWithStatuses as FlickMessage[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;

    fetchMessages();

    // Subscribe to new messages in this chat
    const messagesChannel = supabase
      .channel(`chat_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'flick_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flick_message_status',
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    setChannel(messagesChannel);

    return () => {
      messagesChannel.unsubscribe();
    };
  }, [chatId, fetchMessages]);

  const sendMessage = async (content: string, type: FlickMessage['type'] = 'TEXT', fileUrl?: string) => {
    if (!chatId || !userId) return;

    try {
      const { data: newMessage, error: messageError } = await supabase
        .from('flick_messages')
        .insert({
          chat_id: chatId,
          sender_id: userId,
          content,
          type,
          file_url: fileUrl || null,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Create status for sender (используем upsert чтобы избежать конфликтов)
      await supabase.from('flick_message_status').upsert({
        message_id: newMessage.id,
        user_id: userId,
        status: 'SENT',
      }, {
        onConflict: 'message_id,user_id'
      });

      // Update chat updated_at
      await supabase
        .from('flick_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      // Не вызываем fetchMessages - Realtime сам обновит
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async () => {
    if (!chatId || !userId) return;

    try {
      // Get all unread messages in this chat
      const { data: unreadMessages } = await supabase
        .from('flick_messages')
        .select('id')
        .eq('chat_id', chatId)
        .neq('sender_id', userId);

      if (!unreadMessages || unreadMessages.length === 0) return;

      // Mark as read (batch upsert для производительности)
      const statusUpdates = unreadMessages.map(msg => ({
        message_id: msg.id,
        user_id: userId,
        status: 'READ' as const,
      }));

      if (statusUpdates.length > 0) {
        await supabase
          .from('flick_message_status')
          .upsert(statusUpdates, {
            onConflict: 'message_id,user_id'
          });
      }

      // Не вызываем fetchMessages - Realtime сам обновит
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    refreshMessages: fetchMessages,
  };
};
