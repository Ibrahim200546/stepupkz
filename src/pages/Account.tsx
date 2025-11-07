import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Package, User, Heart, Store } from "lucide-react";
import RegisterVendorDialog from "@/components/vendor/RegisterVendorDialog";

const Account = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadOrders();
      checkVendorStatus();
    }
  }, [user]);

  const checkVendorStatus = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('vendors')
        .select('*')
        .eq('owner_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setVendor(data);
        setIsVendor(true);
      }
    } catch (error) {
      console.error('Error checking vendor status:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product_variants (
              *,
              products (name, product_images(url))
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  if (authLoading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      processing: 'default',
      shipped: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    };

    const labels: Record<string, string> = {
      pending: 'Ожидает',
      processing: 'В обработке',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменен',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">
              <Package className="mr-2 h-4 w-4" />
              Заказы
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              <Heart className="mr-2 h-4 w-4" />
              Избранное
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">У вас пока нет заказов</p>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">Заказ #{order.id.slice(0, 8)}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {order.total.toLocaleString('ru-KZ')} ₸
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.order_items.length} товар(ов)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                        <img 
                          src={item.product_variants.products.product_images[0]?.url || '/placeholder.svg'}
                          alt={item.product_variants.products.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product_variants.products.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Размер: {item.product_variants.size} | Количество: {item.quantity}
                          </p>
                        </div>
                        <div className="font-semibold">
                          {item.price.toLocaleString('ru-KZ')} ₸
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Личные данные</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Имя</span>
                  <p className="font-medium">{profile?.first_name || 'Не указано'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Фамилия</span>
                  <p className="font-medium">{profile?.last_name || 'Не указано'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Телефон</span>
                  <p className="font-medium">{profile?.phone || 'Не указано'}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Store className="h-5 w-5" />
                Мой магазин
              </h2>
              
              {isVendor ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      {vendor?.logo && (
                        <img 
                          src={vendor.logo} 
                          alt={vendor.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{vendor?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {vendor?.verified ? "✓ Проверен" : "Ожидает проверки"}
                        </p>
                      </div>
                    </div>
                    {vendor?.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {vendor.description}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="w-full"
                    onClick={() => navigate('/vendor/dashboard')}
                  >
                    <Store className="mr-2 h-5 w-5" />
                    Войти в магазин
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Зарегистрируйте свой магазин и начните продавать товары на StepUp Shoes
                  </p>
                  <RegisterVendorDialog onSuccess={checkVendorStatus} />
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card className="p-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">В избранном пока ничего нет</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
