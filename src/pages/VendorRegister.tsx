import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Store } from 'lucide-react';

const VendorRegister = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    logo: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Необходимо войти в систему');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('vendors')
        .insert({
          owner_id: user.id,
          name: form.name,
          description: form.description,
          phone: form.phone,
          address: form.address,
          logo: form.logo,
        });

      if (error) throw error;

      toast.success('Заявка на регистрацию магазина отправлена! Ожидайте подтверждения.');
      navigate('/account');
    } catch (error: any) {
      console.error('Error registering vendor:', error);
      toast.error(error.message || 'Ошибка регистрации магазина');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <Card className="p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Store className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Регистрация магазина</h1>
          </div>

          <p className="text-muted-foreground mb-8">
            Заполните форму, чтобы зарегистрировать свой магазин на платформе StepUp Shoes. 
            После проверки администратором вы сможете добавлять свои товары.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Название магазина *</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Мой магазин обуви"
              />
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Расскажите о вашем магазине..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="phone">Контактный телефон *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+7 (777) 123-45-67"
              />
            </div>

            <div>
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="г. Алматы, ул. Абая 123"
              />
            </div>

            <div>
              <Label htmlFor="logo">URL логотипа</Label>
              <Input
                id="logo"
                type="url"
                value={form.logo}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Отправка...' : 'Подать заявку'}
            </Button>
          </form>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default VendorRegister;