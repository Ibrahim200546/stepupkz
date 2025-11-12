import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdminCheck = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      checkRoles();
    } else {
      setIsAdmin(false);
      setIsManager(false);
      setRoles([]);
      setLoading(false);
    }
  }, [user]);

  const checkRoles = async () => {
    try {
      setLoading(true);
      console.log('🔍 Checking roles for user:', user?.id);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id);

      console.log('📊 Roles query result:', { data, error });

      if (error) throw error;

      const userRoles = data?.map(r => r.role) || [];
      console.log('✅ User roles:', userRoles);
      
      setRoles(userRoles);
      setIsAdmin(userRoles.includes('admin'));
      setIsManager(userRoles.includes('manager'));
      
      console.log('🎯 Admin access:', {
        isAdmin: userRoles.includes('admin'),
        isManager: userRoles.includes('manager'),
        hasAccess: userRoles.includes('admin') || userRoles.includes('manager')
      });
    } catch (error) {
      console.error('❌ Error checking roles:', error);
      setIsAdmin(false);
      setIsManager(false);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string) => roles.includes(role);
  const hasAdminAccess = isAdmin || isManager;

  return {
    isAdmin,
    isManager,
    hasAdminAccess,
    roles,
    loading,
    hasRole,
    refreshRoles: checkRoles,
  };
};
