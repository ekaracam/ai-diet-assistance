'use client';

import { useEffect, useState } from 'react';
import { User, Ruler, Weight, Activity, Target, Sparkles, LogOut, Loader2 } from 'lucide-react';
import { useDietStore, useChatStore } from '@/lib/stores';
import type { UserGoal } from '@shared/types/user';
import { getBMICategory, getBodyFatCategory } from '@shared/utils/calculations';
import { signOut } from '@shared/services/authService';
import { getFirebaseAuth } from '@shared/services/firebaseConfig';

const ACTIVITY_LEVELS = [
  { label: 'Hareketsiz', desc: 'Masa başı iş', value: 1.2, emoji: '🪑' },
  { label: 'Az Hareketli', desc: 'Hafif egzersiz, haftada 1-3', value: 1.375, emoji: '🚶' },
  { label: 'Orta Hareketli', desc: 'Düzenli spor, haftada 3-5', value: 1.55, emoji: '🏃' },
  { label: 'Çok Hareketli', desc: 'Ağır egzersiz, haftada 6-7', value: 1.725, emoji: '🏋️' },
];

const GOALS: { value: UserGoal; label: string; desc: string; color: string }[] = [
  { value: 'lose', label: 'Kilo Ver', desc: '-500 kcal/gün', color: '#60EFFF' },
  { value: 'maintain', label: 'Koru', desc: 'Bakım kalorisi', color: '#00FF87' },
  { value: 'gain', label: 'Kilo Al', desc: '+500 kcal/gün', color: '#FFD700' },
];

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'physical'>('personal');
  const {
    userData, setUserData, bmr, tdee, bodyFatPercentage, bmi, targetCalories, saveDailyWeight, resetStore, _isLoadingFromFirestore, _isLoaded
  } = useDietStore();
  const { clearChat } = useChatStore();

  const handleLogout = async () => {
    try {
      await signOut();
      resetStore();
      clearChat();
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  // Firestore'dan veri yüklenirken loading göster
  if (_isLoadingFromFirestore) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#00FF87] animate-spin" />
        <p className="text-sm text-[#8B949E]">Profil bilgileri yükleniyor...</p>
      </div>
    );
  }

  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  // İlk defa giriş yapan kullanıcıyı tespit et (temel bilgiler boş mu?)
  const isNewUser = _isLoaded && !userData.height && !userData.weight && !userData.age;

  const handleDateChange = (v: string) => {
    if (v.length < (userData.birthDate || '').length) {
      setUserData({ birthDate: v });
      return;
    }

    let cleaned = v.replace(/\D/g, '');
    if (cleaned.length > 8) cleaned = cleaned.substring(0, 8);
    
    let formatted = cleaned;
    if (cleaned.length >= 3) {
      formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    }
    if (cleaned.length >= 5) {
      formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4)}`;
    }
    
    let updates: any = { birthDate: formatted };
    
    if (formatted.length === 10) {
      const parts = formatted.split('/');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      
      const birthDateObj = new Date(year, month, day);
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const m = today.getMonth() - birthDateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      
      if (!isNaN(age) && age > 0 && age <= 120) {
        updates.age = age.toString();
      }
    }
    
    setUserData(updates);
  };

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,135,0.1)] flex items-center justify-center">
            <User className="w-5 h-5 text-[#00FF87]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#EDEDED]">Profil & Hedef</h1>
            <p className="text-sm text-[#8B949E]">Kişiselleştirilmiş diyet için bilgilerini gir</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl bg-[rgba(255,71,87,0.1)] border border-[rgba(255,71,87,0.2)] flex items-center justify-center transition-colors hover:bg-[rgba(255,71,87,0.2)] cursor-pointer"
          title="Çıkış Yap"
        >
          <LogOut className="w-5 h-5 text-[#FF4757]" />
        </button>
      </div>

      {/* Hoş geldin mesajı — ilk defa giren kullanıcılar için */}
      {isNewUser && (
        <div className="glass-panel p-5 rounded-2xl mb-6 animate-fade-in-up border border-[rgba(0,255,135,0.15)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(96,239,255,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-[#60EFFF]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#EDEDED] mb-1">
                Hoş geldin{userData.name ? `, ${userData.name}` : ''}! 🎉
              </p>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                Sana özel diyet planı oluşturabilmemiz için kişisel bilgilerini doldurman gerekiyor. 
                Boy, kilo, vücut ölçüleri ve aktivite seviyeni girdiğinde metabolizma hızın ve kalori hedefin otomatik hesaplanacak.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex bg-[rgba(255,255,255,0.03)] rounded-xl p-1 mb-6">
        <button 
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'personal' ? 'bg-[#161B22] text-[#EDEDED]' : 'text-[#8B949E] hover:text-[#EDEDED]'}`}
        >
          Kişisel Bilgiler
        </button>
        <button 
          onClick={() => setActiveTab('physical')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'physical' ? 'bg-[#161B22] text-[#EDEDED]' : 'text-[#8B949E] hover:text-[#EDEDED]'}`}
        >
          Fiziksel Bilgiler
        </button>
      </div>

      <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {activeTab === 'personal' ? (
          <>
            {/* Gender */}
            <fieldset>
          <legend className="text-sm font-semibold text-[#8B949E] uppercase tracking-wider mb-3 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Cinsiyet
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {(['male', 'female'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setUserData({ gender: g })}
                className={`
                  p-3 rounded-xl text-sm font-semibold text-center cursor-pointer
                  transition-all duration-200
                  ${userData.gender === g
                    ? 'bg-[rgba(0,255,135,0.15)] border border-[rgba(0,255,135,0.4)] text-[#00FF87]'
                    : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[#8B949E] hover:border-[rgba(255,255,255,0.12)]'
                  }
                `}
              >
                {g === 'male' ? 'Erkek' : 'Kadın'}
              </button>
            ))}
          </div>
          </fieldset>

          {/* Identity Info */}
          <fieldset>
            <legend className="text-sm font-semibold text-[#8B949E] uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Temel Kimlik Bilgileri
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InputField label="İsim Soyisim" value={userData.name || ''} onChange={(v) => setUserData({ name: v })} placeholder="Adınız" />
              <InputField label="E-Posta" value={userData.email || ''} onChange={(v) => setUserData({ email: v })} placeholder="mail@ornek.com" />
              <InputField label="Doğum Tarihi" value={userData.birthDate || ''} onChange={handleDateChange} placeholder="GG/AA/YYYY" />
              <InputField label="Yaş" value={userData.age} onChange={(v) => setUserData({ age: v })} placeholder="25" max={120} />
            </div>
          </fieldset>
        </>
        ) : (
        <>
          {/* Basic Info */}
          <fieldset>
          <legend className="text-sm font-semibold text-[#8B949E] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Ruler className="w-3.5 h-3.5" /> Temel Bilgiler
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Boy (cm)" value={userData.height} onChange={(v) => setUserData({ height: v })} placeholder="175" max={300} allowDecimal />
            <InputField
              label="Kilo (kg)"
              value={userData.weight}
              onChange={(v) => setUserData({ weight: v })}
              placeholder="70"
              allowDecimal
              onBlur={() => { if (userData.weight) saveDailyWeight(); }}
            />
          </div>
        </fieldset>

        {/* Body Measurements */}
        <fieldset>
          <legend className="text-sm font-semibold text-[#8B949E] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Weight className="w-3.5 h-3.5" /> Vücut Ölçüleri
            <span className="text-[10px] text-[#484F58] font-normal">(Yağ oranı için)</span>
          </legend>
          <div className={`grid gap-3 ${userData.gender === 'female' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <InputField label="Boyun (cm)" value={userData.neck} onChange={(v) => setUserData({ neck: v })} placeholder="38" allowDecimal />
            <InputField label="Bel (cm)" value={userData.waist} onChange={(v) => setUserData({ waist: v })} placeholder="82" allowDecimal />
            {userData.gender === 'female' && (
              <InputField label="Kalça (cm)" value={userData.hip} onChange={(v) => setUserData({ hip: v })} placeholder="96" allowDecimal />
            )}
          </div>
        </fieldset>

        {/* Activity Level */}
        <fieldset>
          <legend className="text-sm font-semibold text-[#8B949E] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Günlük Aktivite
          </legend>
          <div className="space-y-2">
            {ACTIVITY_LEVELS.map((act) => (
              <button
                key={act.value}
                onClick={() => setUserData({ activityLevel: act.value })}
                className={`
                  w-full p-3 rounded-xl text-left cursor-pointer
                  transition-all duration-200 flex items-center gap-3
                  ${userData.activityLevel === act.value
                    ? 'bg-[rgba(0,255,135,0.1)] border border-[rgba(0,255,135,0.3)]'
                    : 'bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]'
                  }
                `}
              >
                <span className="text-lg">{act.emoji}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${userData.activityLevel === act.value ? 'text-[#00FF87]' : 'text-[#EDEDED]'}`}>
                    {act.label}
                  </p>
                  <p className="text-xs text-[#484F58]">{act.desc}</p>
                </div>
                {userData.activityLevel === act.value && (
                  <span className="w-2 h-2 rounded-full bg-[#00FF87]" />
                )}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Goal */}
        <fieldset>
          <legend className="text-sm font-semibold text-[#8B949E] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Target className="w-3.5 h-3.5" /> Hedefiniz
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => setUserData({ goal: g.value })}
                className={`
                  p-3 rounded-xl text-center cursor-pointer transition-all duration-200
                  ${userData.goal === g.value
                    ? 'border'
                    : 'bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]'
                  }
                `}
                style={userData.goal === g.value ? {
                  backgroundColor: `${g.color}15`,
                  borderColor: `${g.color}50`,
                } : undefined}
              >
                <p className="text-sm font-semibold" style={{ color: userData.goal === g.value ? g.color : '#EDEDED' }}>
                  {g.label}
                </p>
                <p className="text-[10px] text-[#484F58] mt-0.5">{g.desc}</p>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Results */}
        {(tdee || bmi) && (
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#00FF87]" />
              <p className="text-xs text-[#8B949E] uppercase tracking-wider font-semibold">Hesaplanan Metrikler</p>
            </div>

            {targetCalories && (
              <div className="text-center py-2">
                <p className="text-xs text-[#8B949E] mb-1">Günlük Kalori Hedefi</p>
                <p className="text-3xl font-bold font-mono tabular-nums gradient-text">
                  {targetCalories}
                  <span className="text-sm text-[#8B949E] ml-1">kcal</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {bmr !== null && <MetricChip label="BMR" value={`${bmr}`} unit="kcal" />}
              {tdee !== null && <MetricChip label="TDEE" value={`${tdee}`} unit="kcal" />}
              {bmi !== null && <MetricChip label="VKİ" value={`${bmi}`} />}
              {bodyFatPercentage !== null && <MetricChip label="Yağ Oranı" value={`%${bodyFatPercentage}`} />}
            </div>

            {bodyFatPercentage !== null && userData.gender && (
              <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                {(() => {
                  const cat = getBodyFatCategory(bodyFatPercentage, userData.gender);
                  return (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#8B949E] mb-1">Vücut Yağ Kategorisi</p>
                        <p className="text-base font-bold" style={{ color: cat.color }}>{cat.label}</p>
                      </div>
                      <div
                        className="px-3 py-1 rounded-lg border"
                        style={{ backgroundColor: `${cat.color}20`, borderColor: `${cat.color}40` }}
                      >
                        <p className="text-xs font-semibold" style={{ color: cat.color }}>{cat.desc}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}

function InputField({
  label, value, onChange, placeholder, max, allowDecimal = false, onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  max?: number;
  allowDecimal?: boolean;
  onBlur?: () => void;
}) {
  const isStringField = label === 'İsim Soyisim' || label === 'E-Posta' || label === 'Doğum Tarihi';
  return (
    <div>
      <label className="text-xs text-[#484F58] mb-1.5 block">{label}</label>
      <input
        type={isStringField ? 'text' : 'text'}
        inputMode={isStringField ? 'text' : 'decimal'}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          if (isStringField) {
            onChange(e.target.value);
            return;
          }
          const pattern = allowDecimal ? /[^0-9.,]/g : /[^0-9]/g;
          const validated = e.target.value.replace(pattern, '');
          if (max && validated !== '' && parseFloat(validated) > max) return;
          onChange(validated);
        }}
        onBlur={onBlur}
        className="glass-input"
      />
    </div>
  );
}

/* ── MetricChip ── */
function MetricChip({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3 text-center">
      <p className="text-[10px] text-[#484F58] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-bold font-mono tabular-nums text-[#EDEDED]">
        {value}
        {unit && <span className="text-[10px] text-[#484F58] ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}
