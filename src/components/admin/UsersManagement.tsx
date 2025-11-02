import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  user_roles?: Array<{ role: string }>;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Load roles for each user
      if (profilesData) {
        const userIds = profilesData.map(p => p.id);
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);

        const usersWithRoles = profilesData.map(profile => ({
          ...profile,
          user_roles: rolesData?.filter(r => r.user_id === profile.id) || []
        }));

        setUsers(usersWithRoles as any);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пользователей",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Управление пользователями</h2>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Имя</TableHead>
            <TableHead>Фамилия</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Дата регистрации</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.first_name || '-'}</TableCell>
              <TableCell>{user.last_name || '-'}</TableCell>
              <TableCell>{user.phone || '-'}</TableCell>
              <TableCell>
                {user.user_roles?.map((ur) => (
                  <Badge key={ur.role} variant="secondary" className="mr-1">
                    {ur.role}
                  </Badge>
                ))}
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString('ru-RU')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default UsersManagement;
