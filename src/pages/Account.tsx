import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Package, User, Heart, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { Order, Profile } from "@/types/database";

const Account = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    nickname: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadOrders();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        nickname: profile.nickname || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

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

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          nickname: editForm.nickname.toLowerCase(),
          phone: editForm.phone,
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      toast.success('Профиль обновлён');
      setEditMode(false);
      loadProfile();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка сохранения');
    }
  };

  const copyNickname = () => {
    navigator.clipboard.writeText(`@${profile?.nickname}`);
    setCopied(true);
    toast.success('Никнейм скопирован');
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
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
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                        <img 
                          src={item.product_variants.products.product_images[0]?.url || '/placeholder.svg'}
                          alt={item.product_variants.products.name}
                          loading="lazy"
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200';
                          }}
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

          <TabsContent value="profile">
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Личные данные</h2>
                {!editMode && (
                  <Button onClick={() => setEditMode(true)} variant="outline">
                    Редактировать
                  </Button>
                )}
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="first_name">Имя</Label>
                    <Input 
                      id="first_name"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Фамилия</Label>
                    <Input 
                      id="last_name"
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nickname">@Nickname</Label>
                    <Input 
                      id="nickname"
                      value={editForm.nickname}
                      onChange={(e) => setEditForm({...editForm, nickname: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile}>Сохранить</Button>
                    <Button onClick={() => setEditMode(false)} variant="outline">Отмена</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Email</span>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  {profile?.nickname && (
                    <div>
                      <span className="text-sm text-muted-foreground">Nickname</span>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">@{profile.nickname}</p>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={copyNickname}
                          className="h-8 w-8 p-0"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
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