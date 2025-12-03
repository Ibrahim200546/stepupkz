/**
 * StepUp Auth Integration для Slash Admin
 * Интегрирует Supabase авторизацию с Slash Admin
 */
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { supabase } from '../integrations/supabase/client';
import { Spin } from 'antd';

interface StepUpAuthGuardProps {
  children: React.ReactNode;
}

export function StepUpAuthGuard({ children }: StepUpAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Проверяем авторизацию
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // Проверяем права админа
        const { data, error } = await supabase.rpc('is_current_user_admin');

        if (error) {
          // Fallback на прямой запрос
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .maybeSingle();

          setIsAdmin(profile?.is_admin || false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Подписка на изменения auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setIsAdmin(false);
        } else if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          // Перепроверяем права админа
          checkAuth();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Редирект на страницу авторизации основного приложения
    window.location.href = '/auth';
    return null;
  }

  if (!isAdmin) {
    // Редирект на главную если не админ
    window.location.href = '/';
    return null;
  }

  return <>{children}</>;
}
