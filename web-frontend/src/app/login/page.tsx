'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import { signIn } from '@shared/services/authService';
import { isFirebaseConfigured } from '@shared/services/firebaseConfig';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (!isFirebaseConfigured()) {
      setError('Firebase yapılandırılmamış. .env dosyasına Firebase config ekleyin.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Giriş başarısız';
      if (msg.includes('invalid-credential')) {
        setError('E-posta veya şifre hatalı.');
      } else if (msg.includes('too-many-requests')) {
        setError('Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-panel-heavy p-8 md:p-10 rounded-2xl w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(0,255,135,0.1)] flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-7 h-7 text-[#00FF87]" />
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-1">Giriş Yap</h1>
          <p className="text-sm text-[#8B949E]">AI Diyetisyen hesabınıza erişin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs text-[#484F58] mb-1.5 block flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              className="glass-input"
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-[#484F58] mb-1.5 block flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Şifre
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input !pr-10"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484F58] hover:text-[#8B949E] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[rgba(255,71,87,0.1)] border border-[rgba(255,71,87,0.2)] rounded-xl p-3 text-sm text-[#FF4757]">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              glass-button w-full py-3 text-center text-sm font-bold
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Giriş yapılıyor...
              </span>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        {/* Register link */}
        <div className="text-center mt-6">
          <p className="text-sm text-[#484F58]">
            Hesabınız yok mu?{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-[#00FF87] hover:text-[#60EFFF] font-semibold cursor-pointer transition-colors"
            >
              Kayıt Ol
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
