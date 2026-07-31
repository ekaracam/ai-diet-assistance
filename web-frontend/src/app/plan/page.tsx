'use client';

import { useEffect, useState } from 'react';
import { Calendar, Utensils, ChevronDown, ChevronUp, Droplet } from 'lucide-react';
import { useDietStore } from '@/lib/stores';
import Link from 'next/link';
import type { DayPlan } from '@shared/types/diet';
import { isWeeklyPlanValid, recommendedWaterLiters } from '@shared/utils/calculations';

export default function PlanPage() {
  const [mounted, setMounted] = useState(false);
  const { weeklyDietPlan, weeklyPlanStartDate, userData } = useDietStore();
  const [expandedDay, setExpandedDay] = useState<number>(1);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (!weeklyDietPlan || !isWeeklyPlanValid(weeklyPlanStartDate)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 pb-24">
        <div className="w-16 h-16 rounded-2xl bg-[rgba(0,255,135,0.1)] flex items-center justify-center mb-6">
          <Calendar className="w-8 h-8 text-[#00FF87]" />
        </div>
        <h2 className="text-xl font-bold text-[#EDEDED] mb-2 text-center">Haftalık Program Yok</h2>
        <p className="text-[#8B949E] text-sm text-center mb-8 max-w-[280px] leading-relaxed">
          Henüz AI Asistan'dan haftalık diyet programı oluşturmadınız veya süresi dolmuş.
        </p>
        <Link 
          href="/ai"
          className="bg-[#00FF87] text-[#05070A] font-semibold px-6 py-3 rounded-xl transition-transform hover:scale-105 active:scale-95"
        >
          Asistan'a Sor
        </Link>
      </div>
    );
  }

  const renderDay = (dayPlan: DayPlan) => {
    const isExpanded = expandedDay === dayPlan.day;
    return (
      <div key={dayPlan.day} className="bg-[rgba(13,17,23,0.6)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden mb-4">
        <button
          onClick={() => setExpandedDay(isExpanded ? 0 : dayPlan.day)}
          className="w-full flex items-center justify-between p-4 bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
        >
          <div>
            <h3 className="text-[#EDEDED] font-semibold text-lg">{dayPlan.day}. Gün</h3>
            <p className="text-[#00FF87] text-xs mt-1 font-medium">{dayPlan.totalCalories} kcal</p>
          </div>
          {isExpanded ? <ChevronUp className="text-[#8B949E] w-5 h-5" /> : <ChevronDown className="text-[#8B949E] w-5 h-5" />}
        </button>

        {isExpanded && (
          <div className="p-4 border-t border-[rgba(255,255,255,0.04)] space-y-4">
            {dayPlan.meals.map((meal, idx) => (
              <div key={idx} className="bg-[rgba(255,255,255,0.02)] p-3 rounded-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#00FF87]" />
                  <h4 className="text-[#EDEDED] font-semibold text-sm flex-1">{meal.meal}</h4>
                  <span className="text-[#8B949E] text-xs">{meal.calories} kcal</span>
                </div>
                <p className="text-[#8B949E] text-sm leading-relaxed pl-[22px]">{meal.food}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const recommendedWater = recommendedWaterLiters(userData?.weight);

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
        <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,135,0.1)] flex items-center justify-center">
          <Calendar className="w-5 h-5 text-[#00FF87]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#EDEDED]">Haftalık Programım</h1>
          <p className="text-sm text-[#8B949E]">
            Oluşturulma: {new Date(weeklyPlanStartDate!).toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="bg-[rgba(96,239,255,0.05)] border border-[rgba(96,239,255,0.15)] rounded-2xl p-4 flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[rgba(96,239,255,0.1)] flex items-center justify-center shrink-0">
            <Droplet className="w-5 h-5 text-[#60EFFF]" />
          </div>
          <div>
            <h3 className="text-[#60EFFF] font-semibold text-sm mb-1">Günlük Su Tüketimi</h3>
            <p className="text-[#8B949E] text-xs leading-relaxed">
              Metabolizmanı desteklemek için günde ortalama <span className="text-[#EDEDED] font-bold">{recommendedWater} Litre</span> su içmelisin.
            </p>
          </div>
        </div>

        {weeklyDietPlan.days.map(renderDay)}
      </div>
    </div>
  );
}
