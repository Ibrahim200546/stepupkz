import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: 'Алматы',
    address: '',
    shippingMethod: 'courier',
    paymentMethod: 'card',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Войдите в систему для оформления заказа');
      navigate('/auth');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Корзина пуста');
      return;
    }

    try {
      setLoading(true);

      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
      };

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: cartTotal,
          shipping_address: shippingAddress,
          shipping_method: formData.shippingMethod,
          payment_method: formData.paymentMethod,
          notes: formData.notes,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        price: item.product?.price || 0,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await clearCart();
      toast.success('Заказ успешно оформлен!');
      navigate('/account');
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error('Ошибка оформления заказа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Контактные данные</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Имя *</Label>
                    <Input 
                      id="firstName" 
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Фамилия *</Label>
                    <Input 
                      id="lastName" 
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      required
                      placeholder="+7 (700) 123-45-67"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Адрес доставки</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="city">Город *</Label>
                    <Input 
                      id="city" 
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Адрес *</Label>
                    <Textarea 
                      id="address" 
                      required
                      placeholder="Улица, дом, квартира"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Способ доставки</h2>
                <RadioGroup 
                  value={formData.shippingMethod}
                  onValueChange={(value) => setFormData({...formData, shippingMethod: value})}
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="courier" id="courier" />
                    <Label htmlFor="courier" className="flex-1 cursor-pointer">
                      <div className="font-medium">Курьерская доставка</div>
                      <div className="text-sm text-muted-foreground">1-3 дня, бесплатно</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                      <div className="font-medium">Самовывоз</div>
                      <div className="text-sm text-muted-foreground">г. Алматы, ул. Абая 150</div>
                    </Label>
                  </div>
                </RadioGroup>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Способ оплаты</h2>
                <RadioGroup 
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      Картой онлайн
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="kaspi" id="kaspi" />
                    <Label htmlFor="kaspi" className="flex-1 cursor-pointer">
                      Kaspi Pay
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      Наличными при получении
                    </Label>
                  </div>
                </RadioGroup>
              </Card>

              <Card className="p-6">
                <Label htmlFor="notes">Комментарий к заказу</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Дополнительная информация..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Ваш заказ</h2>
                
                <div className="space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product?.name} x {item.quantity}</span>
                      <span className="font-medium">
                        {((item.product?.price || 0) * item.quantity).toLocaleString('ru-KZ')} ₸
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Товары</span>
                    <span className="font-medium">{cartTotal.toLocaleString('ru-KZ')} ₸</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Доставка</span>
                    <span className="font-medium">Бесплатно</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Итого:</span>
                    <span>{cartTotal.toLocaleString('ru-KZ')} ₸</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Оформление...' : 'Подтвердить заказ'}
                </Button>
              </Card>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
