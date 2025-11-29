import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

const FlickLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Заполните все поля');
      return;
    }

    setLoading(true);
    
    try {
      // Find user by email
      const { data: users, error: findError } = await supabase
        .from('flick_users')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (findError) throw findError;

      if (!users || users.length === 0) {
        toast.error('Пользователь не найден');
        setLoading(false);
        return;
      }

      const user = users[0];

      // In production, you would verify password hash here
      // For now, we'll just check if password matches (INSECURE - only for demo!)
      // TODO: Implement proper password hashing with bcrypt
      
      // For demo purposes with test data, we'll allow login
      // In real app: const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      // Store user data
      localStorage.setItem('flick_user', JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      }));
      localStorage.setItem('flick_token', 'demo-token'); // In production, generate real JWT

      // Update online status
      await supabase
        .from('flick_users')
        .update({ is_online: true })
        .eq('id', user.id);

      toast.success('Вход выполнен!');
      navigate('/flick-chat');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  // Quick login with test user
  const handleQuickLogin = async (testEmail: string) => {
    setEmail(testEmail);
    setPassword('test123');
    
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-flick-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-flick-orange to-flick-blue p-1 animate-pulse">
            <div className="w-full h-full rounded-full bg-flick-dark flex items-center justify-center">
              <span className="font-pixel text-2xl text-flick-orange">F</span>
            </div>
          </div>
          <h1 className="font-pixel text-2xl text-white mb-2">FLICK</h1>
          <p className="text-white/50 text-sm">Pixel Messenger</p>
        </div>

        {/* Login Form */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="font-pixel text-sm text-white mb-6 text-center">ВХОД</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-pixel text-[10px] mb-2 text-flick-blue">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
                className="pixel-input w-full rounded-lg"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block font-pixel text-[10px] mb-2 text-flick-orange">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                disabled={loading}
                className="pixel-input w-full rounded-lg"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pixel-btn w-full rounded-lg py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  <span>ВОЙТИ</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-white/50 text-xs mb-4 font-pixel">
              НЕТ АККАУНТА?
            </p>
            <Link
              to="/flick-register"
              className="block text-center text-flick-blue hover:text-flick-orange transition-colors font-pixel text-xs"
            >
              РЕГИСТРАЦИЯ →
            </Link>
          </div>

          {/* Quick Test Login */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-white/50 text-[10px] mb-3 font-pixel">
              БЫСТРЫЙ ВХОД (DEMO):
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleQuickLogin('alice@test.com')}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 px-3 py-2 rounded text-[10px] font-pixel transition-colors"
              >
                Alice
              </button>
              <button
                onClick={() => handleQuickLogin('bob@test.com')}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 px-3 py-2 rounded text-[10px] font-pixel transition-colors"
              >
                Bob
              </button>
              <button
                onClick={() => handleQuickLogin('charlie@test.com')}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 px-3 py-2 rounded text-[10px] font-pixel transition-colors"
              >
                Charlie
              </button>
            </div>
          </div>
        </div>

        {/* Back to main site */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-white/50 hover:text-white transition-colors text-xs"
          >
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FlickLogin;
