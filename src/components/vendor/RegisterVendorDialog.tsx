import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Store, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface RegisterVendorDialogProps {
  onSuccess: () => void;
}

const RegisterVendorDialog = ({ onSuccess }: RegisterVendorDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    address: "",
    logo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Вы должны войти в систему",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create vendor record
      const { error } = await (supabase as any)
        .from('vendors')
        .insert({
          owner_id: user.id,
          name: formData.name,
          description: formData.description,
          phone: formData.phone,
          address: formData.address,
          logo: formData.logo || null,
          verified: false,
        });

      if (error) throw error;

      // Show success animation
      setShowSuccess(true);
      
      setTimeout(() => {
        toast({
          title: "✅ Успешно!",
          description: "Вы успешно зарегистрировали магазин!",
        });
        setOpen(false);
        setShowSuccess(false);
        onSuccess();
      }, 1500);

    } catch (error: any) {
      console.error('Error registering vendor:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось зарегистрировать магазин",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" className="w-full">
          <Store className="mr-2 h-5 w-5" />
          Зарегистрировать магазин
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Регистрация магазина</DialogTitle>
          <DialogDescription>
            Заполните информацию о вашем магазине
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-500">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <CheckCircle2 className="h-16 w-16 text-primary animate-in zoom-in duration-300" />
            </div>
            <h3 className="text-xl font-semibold text-center">Магазин зарегистрирован!</h3>
            <p className="text-muted-foreground text-center mt-2">
              Перенаправляем в панель управления...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Название магазина *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Обувь Comfort"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Расскажите о вашем магазине..."
                rows={3}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="phone">Контактный телефон *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (___) ___-__-__"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Город, улица, дом"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="logo">Логотип (URL)</Label>
              <Input
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Регистрация..." : "Зарегистрировать"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RegisterVendorDialog;
