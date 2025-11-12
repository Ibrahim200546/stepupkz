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
import VendorsManagement from "@/components/admin/VendorsManagement";
import ReportsManagement from "@/components/admin/ReportsManagement";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (user) {
      checkAdminRole();
    } else if (!authLoading) {
      setCheckingRole(false);
    }
  }, [user, authLoading]);

  const checkAdminRole = async () => {
    try {
      setCheckingRole(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .in('role', ['admin', 'manager']);

      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data && data.length > 0);
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    } finally {
      setCheckingRole(false);
    }
  };

  // Show loading while checking auth or admin role
  if (authLoading || checkingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  // Redirect if not logged in or not admin
  if (!user || isAdmin === false) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<OrdersManagement />} />
        <Route path="products" element={<ProductsManagement />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="vendors" element={<VendorsManagement />} />
        <Route path="chats" element={<ChatsManagement />} />
        <Route path="reports" element={<ReportsManagement />} />
        <Route path="analytics" element={<Dashboard />} />
        <Route path="settings" element={<div className="p-6"><h1 className="text-3xl font-bold">Настройки</h1><p className="text-muted-foreground mt-2">Страница в разработке</p></div>} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;
