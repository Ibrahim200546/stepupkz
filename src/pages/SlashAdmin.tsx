import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Loading component
const AdminLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
  </div>
);

// Admin Guard - check if user is admin
const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Checking admin status for user:', user.id);
        
        // Вызываем функцию напрямую
        const { data, error } = await supabase
          .rpc('is_current_user_admin');

        if (error) {
          console.error('❌ Error calling is_current_user_admin:', error);
          // Если функции нет, пробуем прямой запрос
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .maybeSingle();

          if (profileError) {
            console.error('❌ Error fetching profile:', profileError);
            setIsAdmin(false);
          } else {
            const adminStatus = profile?.is_admin || false;
            console.log('✅ Admin status from profile:', adminStatus);
            setIsAdmin(adminStatus);
          }
        } else {
          console.log('✅ Admin status from function:', data);
          setIsAdmin(data === true);
        }
      } catch (error) {
        console.error('❌ Unexpected error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading) {
    return <AdminLoading />;
  }

  if (!user) {
    console.log('⚠️ No user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  if (isAdmin === false) {
    console.log('⚠️ User is not admin, redirecting to /');
    return <Navigate to="/" replace />;
  }

  console.log('✅ Admin access granted');
  return <>{children}</>;
};

const SlashAdminPlaceholder = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="max-w-2xl w-full p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-3xl font-bold mb-2">Slash Admin</h1>
          <p className="text-muted-foreground mb-4">
            Профессиональная админ панель с полным функционалом
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold mb-2 text-green-800">✅ Готово к работе!</h3>
          <p className="text-sm mb-2 text-green-700">
            Slash Admin полностью настроен и работает на отдельном порту.
            Используйте кнопку ниже для доступа через iframe или откройте напрямую.
          </p>
          <p className="text-sm text-green-600">
            Функции: Dashboard, Analytics, User Management, Charts, Calendar, Kanban и многое другое.
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>✅</span> Что работает:
            </h3>
            <ul className="text-sm space-y-1">
              <li>• Проверка прав администратора</li>
              <li>• Supabase интеграция</li>
              <li>• User: {user?.email}</li>
              <li>• Старая админ панель доступна</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-center pt-4">
            <Button onClick={() => window.location.href = '/admin-iframe'} size="lg" className="bg-purple-600 hover:bg-purple-700">
              🚀 Открыть Slash Admin (iframe)
            </Button>
            <Button onClick={() => window.location.href = '/admin-old'} variant="outline" size="lg">
              📊 Старая админка
            </Button>
            <Button onClick={() => window.location.href = '/admin-test'} variant="outline" size="lg">
              🧪 Тест доступа
            </Button>
          </div>

          <Button onClick={() => window.location.href = '/'} variant="ghost" className="w-full">
            ← На главную
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t text-xs text-muted-foreground">
          <p>
            💡 Для разработчиков: см. <code>ADMIN_FIX_GUIDE.md</code> для решения проблемы путей
          </p>
        </div>
      </Card>
    </div>
  );
};

const SlashAdmin = () => {
  return (
    <AdminGuard>
      <SlashAdminPlaceholder />
    </AdminGuard>
  );
};

export default SlashAdmin;
