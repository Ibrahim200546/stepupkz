import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

const FlickRegister = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !confirmPassword) {
      toast.error('Заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);
    
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase
        .from('flick_users')
        .select('id')
        .or(`email.eq.${email},username.eq.${username}`)
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        toast.error('Пользователь с таким email или username уже существует');
        setLoading(false);
        return;
      }

      // In production, hash password with bcrypt
      // For demo, we'll store a placeholder hash
      // TODO: Implement proper password hashing
      const passwordHash = `$2a$10$dummy${Date.now()}`; // Placeholder

      // Create user
      const { data: newUser, error: createError } = await supabase
        .from('flick_users')
        .insert({
          username,
          email,
          password_hash: passwordHash,
          is_online: true,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Store user data
      localStorage.setItem('flick_user', JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        avatar: newUser.avatar,
      }));
      localStorage.setItem('flick_token', 'demo-token');

      toast.success('Регистрация успешна!');
      navigate('/flick-chat');
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error(error.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-flick-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-flick-orange to-flick-blue p-1 animate-pulse">
            <div className="w-full h-full rounded-full bg-flick-dark flex items-center justify-center">
              <span className="font-pixel text-2xl text-flick-blue">F</span>
            </div>
          </div>
          <h1 className="font-pixel text-2xl text-white mb-2">FLICK</h1>
          <p className="text-white/50 text-sm">Pixel Messenger</p>
        </div>

        {/* Register Form */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="font-pixel text-sm text-white mb-6 text-center">РЕГИСТРАЦИЯ</h2>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block font-pixel text-[10px] mb-2 text-flick-blue">USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                disabled={loading}
                className="pixel-input w-full rounded-lg"
                autoComplete="username"
              />
            </div>

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
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block font-pixel text-[10px] mb-2 text-flick-orange">CONFIRM PASSWORD</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                disabled={loading}
                className="pixel-input w-full rounded-lg"
                autoComplete="new-password"
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
                  <UserPlus size={16} />
                  <span>СОЗДАТЬ АККАУНТ</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-white/50 text-xs mb-4 font-pixel">
              УЖЕ ЕСТЬ АККАУНТ?
            </p>
            <Link
              to="/flick-login"
              className="block text-center text-flick-blue hover:text-flick-orange transition-colors font-pixel text-xs"
            >
              ВОЙТИ →
            </Link>
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

export default FlickRegister;
