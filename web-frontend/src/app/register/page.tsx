'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, UserPlus, Loader2, Eye, EyeOff, User } from 'lucide-react';
import { signUp } from '@shared/services/authService';
import { isFirebaseConfigured } from '@shared/services/firebaseConfig';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !name.trim()) return;

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (!isFirebaseConfigured()) {
      setError('Firebase yapılandırılmamış. .env dosyasına Firebase config ekleyin.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUp(email, password, name);
      router.push('/profile');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kayıt başarısız';
      if (msg.includes('email-already-in-use')) {
        setError('Bu e-posta adresi zaten kullanılıyor.');
      } else if (msg.includes('weak-password')) {
        setError('Şifre çok zayıf. Daha güçlü bir şifre deneyin.');
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
          <div className="w-14 h-14 rounded-2xl bg-[rgba(96,239,255,0.1)] flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 text-[#60EFFF]" />
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-1">Kayıt Ol</h1>
          <p className="text-sm text-[#8B949E]">AI Diyetisyen ile sağlıklı yaşama başla</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-[#484F58] mb-1.5 block flex items-center gap-1.5">
              <User className="w-3 h-3" /> Ad Soyad
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ali Yılmaz"
              className="glass-input"
              autoComplete="name"
              required
            />
          </div>

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
                placeholder="En az 6 karakter"
                className="glass-input !pr-10"
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div>
            <label className="text-xs text-[#484F58] mb-1.5 block flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Şifre Tekrar
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Şifrenizi tekrar girin"
              className="glass-input"
              autoComplete="new-password"
              required
            />
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
                <Loader2 className="w-4 h-4 animate-spin" /> Kayıt yapılıyor...
              </span>
            ) : (
              'Kayıt Ol'
            )}
          </button>
        </form>

        {/* Login link */}
        <div className="text-center mt-6">
          <p className="text-sm text-[#484F58]">
            Zaten hesabınız var mı?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-[#00FF87] hover:text-[#60EFFF] font-semibold cursor-pointer transition-colors"
            >
              Giriş Yap
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
