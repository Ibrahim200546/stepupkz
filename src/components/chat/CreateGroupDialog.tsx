import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserSearch } from './UserSearch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Profile } from '@/types/database';

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onGroupCreated: (chatId: string) => void;
}

export const CreateGroupDialog = ({ open, onClose, onGroupCreated }: CreateGroupDialogProps) => {
  const [title, setTitle] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSelectUser = async (userId: string) => {
    // Don't add if already selected
    if (selectedUsers.find(u => u.id === userId)) {
      toast.error('Пользователь уже добавлен');
      return;
    }

    // Fetch user data
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setSelectedUsers([...selectedUsers, data]);
    }
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!title.trim()) {
      toast.error('Введите название группы');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Выберите хотя бы одного участника');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Не авторизован');

      // Create group chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          type: 'group',
          title: title.trim(),
          created_by: user.id
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add members including creator
      const members = [
        { chat_id: chat.id, user_id: user.id, role: 'admin' },
        ...selectedUsers.map(u => ({ chat_id: chat.id, user_id: u.id, role: 'member' }))
      ];

      const { error: membersError } = await supabase
        .from('chat_members')
        .insert(members);

      if (membersError) throw membersError;

      toast.success('Группа создана');
      onGroupCreated(chat.id);
      onClose();
      
      // Reset form
      setTitle('');
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(error.message || 'Ошибка создания группы');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (user: Profile) => {
    if (user.nickname) return `@${user.nickname}`;
    if (user.first_name) return `${user.first_name} ${user.last_name || ''}`.trim();
    return 'Пользователь';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создать группу</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="group-title">Название группы</Label>
            <Input
              id="group-title"
              placeholder="Моя группа"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label>Добавить участников</Label>
            <UserSearch 
              onSelectUser={handleSelectUser}
              placeholder="Поиск по @nickname..."
            />
          </div>

          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Выбранные участники ({selectedUsers.length})</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.nickname?.[0]?.toUpperCase() || user.first_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-sm">{getDisplayName(user)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeUser(user.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleCreateGroup} disabled={loading} className="flex-1">
              {loading ? 'Создание...' : 'Создать группу'}
            </Button>
            <Button onClick={onClose} variant="outline">
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};