import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface OnlineUser {
  id: string;
  nickname: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  status: string;
  last_seen: string;
}

interface OnlineUsersProps {
  onStartChat: (userId: string) => void;
}

export const OnlineUsers = ({ onStartChat }: OnlineUsersProps) => {
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnlineUsers();
    
    // Subscribe to presence changes
    const channel = supabase.channel('online-users');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        loadOnlineUsers();
      })
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(loadOnlineUsers, 30000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadOnlineUsers = async () => {
    try {
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select('user_id, status, last_seen')
        .eq('status', 'online')
        .order('last_seen', { ascending: false });

      if (presenceError) throw presenceError;

      if (!presenceData || presenceData.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const userIds = presenceData.map(p => p.user_id);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nickname, first_name, last_name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const onlineUsers = presenceData.map(presence => {
        const profile = profilesData?.find(p => p.id === presence.user_id);
        return {
          id: presence.user_id,
          nickname: profile?.nickname || null,
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          avatar_url: profile?.avatar_url || null,
          status: presence.status,
          last_seen: presence.last_seen
        };
      });

      setUsers(onlineUsers);
    } catch (error) {
      console.error('Error loading online users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (user: OnlineUser) => {
    if (user.nickname) return `@${user.nickname}`;
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return 'Пользователь';
  };

  const getInitials = (user: OnlineUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.nickname) {
      return user.nickname[0].toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Users className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">Нет пользователей онлайн</p>
        <p className="text-sm text-muted-foreground">
          Сейчас никто не в сети. Проверьте позже.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Онлайн ({users.length})</h2>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {users.map(user => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
              onClick={() => onStartChat(user.id)}
            >
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-background">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{getDisplayName(user)}</p>
                {user.nickname && (user.first_name || user.last_name) && (
                  <p className="text-sm text-muted-foreground truncate">
                    {user.first_name} {user.last_name}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartChat(user.id);
                }}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
