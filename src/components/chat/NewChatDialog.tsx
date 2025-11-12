import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export const NewChatDialog = ({ open, onClose, onChatCreated }: NewChatDialogProps) => {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  const searchUsers = async () => {
    if (!search.trim()) return;

    setLoading(true);
    try {
      const searchTerm = search.startsWith('@') ? search.slice(1) : search;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .neq('id', currentUser?.id)
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Ошибка поиска пользователей');
    } finally {
      setLoading(false);
    }
  };

  const createDirectChat = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_or_create_direct_chat', {
        other_user_id: userId
      });

      if (error) throw error;
      onChatCreated(data);
      onClose();
      toast.success('Чат создан');
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Ошибка создания чата');
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      toast.error('Укажите название группы и выберите участников');
      return;
    }

    try {
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          type: 'group',
          title: groupName,
          created_by: currentUser?.id
        })
        .select()
        .single();

      if (chatError) throw chatError;

      const members = [currentUser?.id, ...selectedUsers].map(userId => ({
        chat_id: chat.id,
        user_id: userId,
        role: userId === currentUser?.id ? 'admin' : 'member'
      }));

      const { error: membersError } = await supabase
        .from('chat_members')
        .insert(members);

      if (membersError) throw membersError;

      onChatCreated(chat.id);
      onClose();
      toast.success('Группа создана');
      setGroupName('');
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Ошибка создания группы');
    }
  };

  const getUserName = (user: User) => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Пользователь';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новый чат</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="direct">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Личный чат</TabsTrigger>
            <TabsTrigger value="group">Группа</TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по @username или имени"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                className="pl-9"
              />
            </div>

            <Button onClick={searchUsers} disabled={loading} className="w-full">
              Найти
            </Button>

            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => createDirectChat(user.id)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-accent rounded-lg transition-colors"
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{getUserName(user)[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{getUserName(user)}</span>
                  </button>
                ))}

                {users.length === 0 && search && !loading && (
                  <p className="text-center text-muted-foreground py-8">
                    Пользователи не найдены
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="group" className="space-y-4">
            <Input
              placeholder="Название группы"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск участников"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                className="pl-9"
              />
            </div>

            <Button onClick={searchUsers} disabled={loading} className="w-full">
              Найти
            </Button>

            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUsers(prev =>
                        prev.includes(user.id)
                          ? prev.filter(id => id !== user.id)
                          : [...prev, user.id]
                      );
                    }}
                    className={`w-full p-3 flex items-center gap-3 rounded-lg transition-colors ${
                      selectedUsers.includes(user.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{getUserName(user)[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{getUserName(user)}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>

            {selectedUsers.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Выбрано участников: {selectedUsers.length}
              </p>
            )}

            <Button onClick={createGroup} disabled={!groupName.trim() || selectedUsers.length === 0} className="w-full">
              Создать группу
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
