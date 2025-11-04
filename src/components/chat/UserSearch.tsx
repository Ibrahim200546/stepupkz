import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';

interface UserSearchProps {
  onSelectUser: (userId: string) => void;
  placeholder?: string;
}

export const UserSearch = ({ onSelectUser, placeholder }: UserSearchProps) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.length > 0) {
      searchUsers();
    } else {
      setResults([]);
    }
  }, [search]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const isNicknameSearch = search.startsWith('@');
      const searchTerm = isNicknameSearch ? search.slice(1).toLowerCase() : search.toLowerCase();

      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, nickname, phone, avatar_url');

      if (isNicknameSearch) {
        query = query.ilike('nickname', `${searchTerm}%`);
      } else {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,nickname.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (user: any) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.nickname ? `@${user.nickname}` : 'Пользователь';
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder || 'Поиск по @nickname, имени или телефону'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-popover border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onSelectUser(user.id);
                setSearch('');
                setResults([]);
              }}
              className="w-full p-3 flex items-center gap-3 hover:bg-accent transition-colors text-left"
            >
              <Avatar>
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>
                  {user.nickname ? user.nickname[0].toUpperCase() : (user.first_name?.[0] || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{getDisplayName(user)}</div>
                {user.nickname && (
                  <div className="text-sm text-muted-foreground">@{user.nickname}</div>
                )}
              </div>
              <Badge variant="outline">Online</Badge>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute z-50 w-full mt-2 bg-popover border rounded-lg shadow-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Поиск...</p>
        </div>
      )}
    </div>
  );
};