import { useState, useEffect } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Dashboard from "@/components/admin/Dashboard";
import OrdersManagement from "@/components/admin/OrdersManagement";
import ProductsManagement from "@/components/admin/ProductsManagement";
import UsersManagement from "@/components/admin/UsersManagement";
import ChatsManagement from "@/components/admin/ChatsManagement";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .in('role', ['admin', 'manager'])
        .single();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    }
  };

  if (authLoading) {
    return <div>Загрузка...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<OrdersManagement />} />
        <Route path="products" element={<ProductsManagement />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="chats" element={<ChatsManagement />} />
        <Route path="analytics" element={<Dashboard />} />
        <Route path="settings" element={<div>Настройки (в разработке)</div>} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;
