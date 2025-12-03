import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const AdminTest = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    if (!user) {
      setResults({ error: 'Нет авторизованного пользователя' });
      return;
    }

    setLoading(true);
    const testResults: any = {};

    try {
      // Test 1: Проверка профиля
      console.log('Test 1: Checking profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, is_admin, first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();

      testResults.profile = {
        success: !profileError,
        data: profile,
        error: profileError?.message,
      };

      // Test 2: Проверка функции is_current_user_admin
      console.log('Test 2: Checking RPC function...');
      try {
        const { data: isAdmin, error: rpcError } = await supabase
          .rpc('is_current_user_admin');

        testResults.rpcFunction = {
          success: !rpcError,
          data: isAdmin,
          error: rpcError?.message,
        };
      } catch (e: any) {
        testResults.rpcFunction = {
          success: false,
          error: e.message || 'Function not found',
        };
      }

      // Test 3: Проверка списка профилей (доступно только админам)
      console.log('Test 3: Checking profiles list...');
      const { data: profiles, error: listError } = await supabase
        .from('profiles')
        .select('id, email, is_admin')
        .limit(5);

      testResults.profilesList = {
        success: !listError,
        data: profiles,
        error: listError?.message,
        count: profiles?.length || 0,
      };

      // Test 4: Статистика таблиц
      console.log('Test 4: Checking statistics...');
      const stats: any = {};

      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      stats.users = usersCount;
      stats.products = productsCount;
      stats.orders = ordersCount;

      testResults.statistics = stats;

      // Test 5: Проверка ролей пользователя
      console.log('Test 5: Checking user roles...');
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      testResults.userRoles = {
        success: !rolesError,
        data: roles,
        error: rolesError?.message,
      };

    } catch (error: any) {
      testResults.generalError = error.message;
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      runTests();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card className="p-8">
            <h1 className="text-2xl font-bold mb-4">Тест админ доступа</h1>
            <p className="text-red-500">Необходима авторизация!</p>
            <Button onClick={() => window.location.href = '/auth'} className="mt-4">
              Войти
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">🧪 Тест админ доступа</h1>
          
          <div className="mb-4">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>

          <Button onClick={runTests} disabled={loading} className="mb-6">
            {loading ? 'Тестирование...' : 'Запустить тесты заново'}
          </Button>

          {loading && <p className="text-blue-500">Выполняются тесты...</p>}

          {!loading && Object.keys(results).length > 0 && (
            <div className="space-y-6">
              {/* Test 1: Profile */}
              <div className="border rounded p-4">
                <h3 className="font-bold text-lg mb-2">
                  ✅ Test 1: Проверка профиля
                </h3>
                {results.profile?.success ? (
                  <div className="text-green-600">
                    <p>✅ Успешно!</p>
                    <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-x-auto">
                      {JSON.stringify(results.profile.data, null, 2)}
                    </pre>
                    {results.profile.data?.is_admin && (
                      <p className="text-green-700 font-bold mt-2">🎉 ВЫ АДМИН!</p>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p>❌ Ошибка: {results.profile?.error}</p>
                  </div>
                )}
              </div>

              {/* Test 2: RPC Function */}
              <div className="border rounded p-4">
                <h3 className="font-bold text-lg mb-2">
                  ✅ Test 2: Функция is_current_user_admin()
                </h3>
                {results.rpcFunction?.success ? (
                  <div className="text-green-600">
                    <p>✅ Функция работает!</p>
                    <p className="mt-2">
                      Результат: <strong>{results.rpcFunction.data ? 'TRUE' : 'FALSE'}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p>❌ Ошибка: {results.rpcFunction?.error}</p>
                    <p className="text-sm mt-2">
                      Возможно функция не создана. Запустите SQL скрипт!
                    </p>
                  </div>
                )}
              </div>

              {/* Test 3: Profiles List */}
              <div className="border rounded p-4">
                <h3 className="font-bold text-lg mb-2">
                  ✅ Test 3: Список профилей (админ доступ)
                </h3>
                {results.profilesList?.success ? (
                  <div className="text-green-600">
                    <p>✅ Доступ есть! Найдено: {results.profilesList.count} профилей</p>
                    <pre className="bg-gray-100 p-2 rounded mt-2 text-sm overflow-x-auto">
                      {JSON.stringify(results.profilesList.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p>❌ Ошибка: {results.profilesList?.error}</p>
                  </div>
                )}
              </div>

              {/* Test 4: Statistics */}
              <div className="border rounded p-4">
                <h3 className="font-bold text-lg mb-2">
                  📊 Test 4: Статистика
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <p className="text-2xl font-bold">{results.statistics?.users || 0}</p>
                    <p className="text-sm">Пользователей</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded">
                    <p className="text-2xl font-bold">{results.statistics?.products || 0}</p>
                    <p className="text-sm">Товаров</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded">
                    <p className="text-2xl font-bold">{results.statistics?.orders || 0}</p>
                    <p className="text-sm">Заказов</p>
                  </div>
                </div>
              </div>

              {/* Test 5: User Roles */}
              <div className="border rounded p-4">
                <h3 className="font-bold text-lg mb-2">
                  👤 Test 5: Роли пользователя
                </h3>
                {results.userRoles?.success ? (
                  <div className="text-green-600">
                    <p>✅ Роли загружены!</p>
                    <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
                      {JSON.stringify(results.userRoles.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-yellow-600">
                    <p>⚠️ Не удалось загрузить роли</p>
                    <p className="text-sm">{results.userRoles?.error}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6 space-x-4">
                <Button onClick={() => window.location.href = '/admin'}>
                  🚀 Открыть Slash Admin
                </Button>
                <Button onClick={() => window.location.href = '/admin-old'} variant="outline">
                  📊 Открыть старую админку
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminTest;
