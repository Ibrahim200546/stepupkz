import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock } from "lucide-react";
import { toast } from "sonner";

interface AdminPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 16-значный пароль админ панели
// Храните этот пароль в безопасном месте!
const ADMIN_PANEL_PASSWORD = "StepUp2025Admin!"; // Измените на свой!

export const AdminPasswordDialog = ({ open, onOpenChange }: AdminPasswordDialogProps) => {
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);

    // Проверка пароля
    if (password === ADMIN_PANEL_PASSWORD) {
      // Сохранить в sessionStorage для этой сессии
      sessionStorage.setItem('admin_verified', 'true');
      sessionStorage.setItem('admin_verified_at', Date.now().toString());
      
      toast.success('Доступ разрешен! Перенаправление...');
      
      setTimeout(() => {
        navigate('/admin');
        onOpenChange(false);
        setPassword("");
        setAttempts(0);
        setLoading(false);
      }, 500);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        toast.error('Слишком много неудачных попыток. Доступ заблокирован на 5 минут.');
        // Блокировка на 5 минут
        sessionStorage.setItem('admin_blocked_until', (Date.now() + 5 * 60 * 1000).toString());
        onOpenChange(false);
        setPassword("");
        setAttempts(0);
      } else {
        toast.error(`Неверный пароль. Осталось попыток: ${3 - newAttempts}`);
      }
      
      setLoading(false);
    }
  };

  const isBlocked = () => {
    const blockedUntil = sessionStorage.getItem('admin_blocked_until');
    if (blockedUntil) {
      const blockedTime = parseInt(blockedUntil);
      if (Date.now() < blockedTime) {
        const minutesLeft = Math.ceil((blockedTime - Date.now()) / 60000);
        return minutesLeft;
      } else {
        sessionStorage.removeItem('admin_blocked_until');
      }
    }
    return 0;
  };

  const blockedMinutes = isBlocked();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <DialogTitle>Доступ к Админ Панели</DialogTitle>
          </div>
          <DialogDescription>
            Введите пароль админ панели для подтверждения доступа
          </DialogDescription>
        </DialogHeader>

        {blockedMinutes > 0 ? (
          <div className="py-8 text-center">
            <Lock className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-medium">
              Доступ временно заблокирован
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Попробуйте снова через {blockedMinutes} мин.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password">Пароль</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Введите пароль..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoFocus
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Попыток осталось: {3 - attempts}/3
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Безопасность:</span> Пароль защищает админ панель
                  дополнительным слоем безопасности. Не передавайте его третьим лицам.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  setPassword("");
                  setAttempts(0);
                }}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={loading || !password.trim()}>
                {loading ? "Проверка..." : "Войти"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
