'use client';

import { useState, useEffect } from 'react';
import { X, Check, Send, Utensils, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useDietStore } from '@/lib/stores';
import { useRouter } from 'next/navigation';
import type { WeeklyDietPlan, DayPlan } from '@shared/types/diet';
import { modifyWeeklyDietPlan } from '@shared/services/geminiService';

interface Props {
  visible: boolean;
  onClose: () => void;
  draftPlan: WeeklyDietPlan | null;
}

export default function WeeklyDietPlanModal({ visible, onClose, draftPlan }: Props) {
  const [currentPlan, setCurrentPlan] = useState<WeeklyDietPlan | null>(null);
  const [expandedDay, setExpandedDay] = useState<number>(1);
  const [modifyInput, setModifyInput] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [error, setError] = useState('');
  
  const { setWeeklyDietPlan } = useDietStore();
  const router = useRouter();

  useEffect(() => {
    if (draftPlan) {
      setCurrentPlan(draftPlan);
      setError('');
    }
  }, [draftPlan]);

  if (!visible) return null;

  const handleSave = () => {
    if (currentPlan) {
      setWeeklyDietPlan(currentPlan);
      onClose();
      router.push('/plan');
    }
  };

  const handleModifyRequest = async () => {
    if (!modifyInput.trim() || !currentPlan) return;
    setIsModifying(true);
    setError('');

    try {
      const updatedPlan = await modifyWeeklyDietPlan(currentPlan, modifyInput);
      setCurrentPlan(updatedPlan);
      setModifyInput('');
    } catch (err: unknown) {
      setError('Plan güncellenirken bir hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
    } finally {
      setIsModifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleModifyRequest();
    }
  };

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(5,7,10,0.8)] backdrop-blur-sm p-4">
      <div className="bg-[#0D1117] border border-[rgba(255,255,255,0.06)] rounded-2xl w-full max-w-2xl h-[90vh] flex flex-col shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)] shrink-0">
          <h2 className="text-lg font-bold text-[#EDEDED]">Taslak Programı İncele</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-[#8B949E] hover:text-[#EDEDED] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info & Error */}
        <div className="px-4 pt-4 shrink-0">
          <p className="text-sm text-[#8B949E] leading-relaxed mb-4">
            Aşağıdaki programı inceleyebilirsiniz. Değiştirmek istediğiniz bir şey varsa AI'a yazarak yeniden düzenlemesini isteyebilirsiniz.
          </p>

          {error && (
            <div className="bg-[rgba(255,71,87,0.1)] border border-[rgba(255,71,87,0.2)] rounded-xl p-3 text-sm text-[#FF4757] mb-4">
              {error}
            </div>
          )}
        </div>

        {/* Content (Scrollable List) */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isModifying ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
              <Loader2 className="w-8 h-8 text-[#00FF87] animate-spin" />
              <p className="text-[#00FF87] font-medium">Yapay zeka planı güncelliyor...</p>
            </div>
          ) : (
            currentPlan?.days.map(renderDay)
          )}
        </div>

        {/* AI Input */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.06)] shrink-0 bg-[#0D1117]">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              value={modifyInput}
              onChange={(e) => setModifyInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Örn: Kahvaltıları peynirsiz yap..."
              disabled={isModifying}
              className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-sm text-[#EDEDED] placeholder-[#8B949E] focus:outline-none focus:border-[#00FF87] transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleModifyRequest}
              disabled={!modifyInput.trim() || isModifying}
              className="w-12 h-12 flex-shrink-0 rounded-xl bg-[rgba(0,255,135,0.1)] border border-[rgba(0,255,135,0.2)] text-[#00FF87] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[rgba(0,255,135,0.2)] transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isModifying}
              className="flex items-center gap-2 bg-[#00FF87] hover:bg-[#00e67a] text-[#05070A] font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
              <span>Onayla ve Kaydet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
