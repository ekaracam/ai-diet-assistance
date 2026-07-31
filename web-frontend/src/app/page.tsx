'use client';

import { useEffect, useState } from 'react';
import { LayoutDashboard, Flame, Target, Scale, TrendingUp, Droplet, Minus, Plus, Activity } from 'lucide-react';
import { useDietStore } from '@/lib/stores';
import { getBMICategory } from '@shared/utils/calculations';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const {
    userData, tdee, bmr, bmi, targetCalories, bodyFatPercentage,
    history
  } = useDietStore();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <DashboardSkeleton />;

  const hasData = tdee || bmi || targetCalories;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const chartData = history.map(h => {
    const d = new Date(h.date);
    return {
      date: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      weight: h.weight,
      bodyFat: h.bodyFatPercentage,
    };
  });

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,135,0.1)] flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-[#00FF87]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#EDEDED]">Özet</h1>
            <p className="text-sm text-[#8B949E]">İlerlemeni buradan takip et</p>
          </div>
        </div>
      </div>

      {/* No Data State */}
      {!hasData && (
        <div className="glass-panel-heavy p-10 rounded-2xl text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(96,239,255,0.1)] flex items-center justify-center mx-auto mb-6">
            <Activity className="w-8 h-8 text-[#60EFFF]" />
          </div>
          <h3 className="text-xl font-bold text-[#EDEDED] mb-2">Profilini Tamamla</h3>
          <p className="text-[#8B949E] text-sm mb-6">
            Metabolizma metriklerini görebilmek için Profil sekmesinden bilgilerini gir.
          </p>
        </div>
      )}

      {/* Metrics Grid */}
      {hasData && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {targetCalories && (
            <MetricCard
              icon={<Target className="w-5 h-5 text-[#00FF87]" />}
              label="Kalori Hedefi"
              value={targetCalories.toLocaleString('tr-TR')}
              unit="kcal"
              accentColor="rgba(0,255,135,0.1)"
            />
          )}
          {tdee && (
            <MetricCard
              icon={<Flame className="w-5 h-5 text-[#60EFFF]" />}
              label="TDEE"
              value={tdee.toLocaleString('tr-TR')}
              unit="kcal"
              accentColor="rgba(96,239,255,0.1)"
            />
          )}
          {bmr && (
            <MetricCard
              icon={<TrendingUp className="w-5 h-5 text-[#FFD700]" />}
              label="BMR"
              value={bmr.toLocaleString('tr-TR')}
              unit="kcal"
              accentColor="rgba(255,215,0,0.1)"
            />
          )}
          {bodyFatPercentage && (
            <MetricCard
              icon={<Scale className="w-5 h-5 text-[#FFD700]" />}
              label="Yağ Oranı"
              value={`%${bodyFatPercentage}`}
              accentColor="rgba(255,215,0,0.1)"
            />
          )}
          {bmi && bmiCategory && (
            <MetricCard
              icon={<Activity className="w-5 h-5 text-[#00FF87]" />}
              label="VKİ (BMI)"
              value={`${bmi}`}
              subtitle={bmiCategory.label}
              subtitleColor={bmiCategory.color}
              accentColor="rgba(0,255,135,0.1)"
            />
          )}
          {userData.weight && (
            <MetricCard
              icon={<Scale className="w-5 h-5 text-[#60EFFF]" />}
              label="Mevcut Kilo"
              value={userData.weight}
              unit="kg"
              accentColor="rgba(96,239,255,0.1)"
            />
          )}
        </div>
      )}

      {/* Chart */}
      <div className="glass-card p-6 rounded-2xl mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h3 className="text-sm font-semibold text-[#8B949E] uppercase tracking-wider mb-4">
          Gelişim Grafiği
        </h3>
        {chartData.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center">
            <TrendingUp className="w-8 h-8 text-[#484F58] mb-2" />
            <p className="text-[#484F58] text-sm text-center">
              Henüz yeterli veri yok.<br />Profilinden kilonu güncelleyerek takip edebilirsin.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#484F58', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <YAxis tick={{ fill: '#484F58', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(13,17,23,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#EDEDED',
                  fontSize: '13px',
                }}
              />
              <Line type="monotone" dataKey="weight" stroke="#00FF87" strokeWidth={2} dot={{ r: 4, fill: '#00FF87' }} name="Kilo (kg)" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/* ── Metric Card ── */
function MetricCard({
  icon, label, value, unit, subtitle, subtitleColor, accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  subtitle?: string;
  subtitleColor?: string;
  accentColor: string;
}) {
  return (
    <div className="glass-card p-5 rounded-2xl">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accentColor }}>
          {icon}
        </div>
        <p className="text-xs text-[#8B949E] uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold font-mono tabular-nums text-[#EDEDED]">
        {value}
        {unit && <span className="text-sm text-[#8B949E] font-sans ml-1">{unit}</span>}
      </p>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color: subtitleColor || '#8B949E' }}>{subtitle}</p>
      )}
    </div>
  );
}

/* ── Skeleton ── */
function DashboardSkeleton() {
  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12 max-w-5xl mx-auto">
      <div className="h-8 w-48 bg-[rgba(255,255,255,0.05)] rounded-lg mb-8 animate-shimmer" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-28 bg-[rgba(255,255,255,0.03)] rounded-2xl animate-shimmer" />
        ))}
      </div>
      <div className="h-64 bg-[rgba(255,255,255,0.03)] rounded-2xl animate-shimmer" />
    </div>
  );
}
