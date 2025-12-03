/**
 * Компонент для загрузки Slash Admin через iframe
 * Slash Admin собирается отдельно и загружается здесь
 */
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';

const AdminLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
  </div>
);

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
        const { data, error } = await supabase.rpc('is_current_user_admin');

        if (error) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .maybeSingle();

          setIsAdmin(profile?.is_admin || false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
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
    return <Navigate to="/auth" replace />;
  }

  if (isAdmin === false) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const SlashAdminIframe = () => {
  const [adminUrl, setAdminUrl] = useState<string | null>(null);

  useEffect(() => {
    // В dev используем отдельный порт
    if (import.meta.env.DEV) {
      setAdminUrl('http://localhost:3001');
    } else {
      // В production используем собранные файлы
      setAdminUrl('/admin-app');
    }
  }, []);

  if (!adminUrl) {
    return <AdminLoading />;
  }

  return (
    <AdminGuard>
      <div className="fixed inset-0 w-full h-full">
        <iframe
          src={adminUrl}
          className="w-full h-full border-0"
          title="Slash Admin"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>
    </AdminGuard>
  );
};

export default SlashAdminIframe;
