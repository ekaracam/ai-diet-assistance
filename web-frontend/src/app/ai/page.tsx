'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { useChatStore, useDietStore } from '@/lib/stores';
import { sendChatMessage, generateWeeklyDietPlan } from '@shared/services/geminiService';
import { CHAT_SUGGESTIONS } from '@shared/types/chat';
import type { ChatMessage } from '@shared/types/chat';
import type { WeeklyDietPlan } from '@shared/types/diet';
import WeeklyDietPlanModal from '@/components/WeeklyDietPlanModal';

export default function AIChatPage() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [draftWeeklyPlan, setDraftWeeklyPlan] = useState<WeeklyDietPlan | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, error, addMessage, setLoading, setError, clearChat } = useChatStore();
  const { targetCalories, userData } = useDietStore();

  useEffect(() => setMounted(true), []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setInput('');

    // Kullanıcı mesajını ekle
    const displayContent = messageText === 'haftalik_diyet_programi'
      ? 'Haftalık Diyet Programı Oluştur'
      : messageText;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: displayContent,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    setLoading(true);

    try {
      if (messageText === 'haftalik_diyet_programi') {
        const response = await generateWeeklyDietPlan(
          targetCalories || 2000,
          userData.goal,
          { 
            age: parseInt(userData.age || '0', 10), 
            gender: userData.gender || undefined, 
            height: parseFloat(userData.height || '0'), 
            weight: parseFloat(userData.weight || '0') 
          }
        );
        
        setDraftWeeklyPlan(response);
        setModalVisible(true);
        
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Haftalık diyet programınız oluşturuldu! Ekranda açılan pencereden inceleyip onaylayabilirsiniz.',
          timestamp: new Date().toISOString(),
        };
        addMessage(assistantMsg);
        setLoading(false);
        return;
      }

      const response = await sendChatMessage(
        messages.filter(m => m.role !== 'system'),
        messageText,
        {
          targetCalories,
          goal: userData.goal,
          weight: userData.weight,
          height: userData.height,
          age: userData.age,
        }
      );

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMsg);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }

    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-96px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,135,0.1)] flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#00FF87]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#EDEDED]">AI Asistan</h1>
            <p className="text-xs text-[#8B949E]">Gemini ile beslenme tavsiyeleri</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="p-2 rounded-lg text-[#484F58] hover:text-[#FF4757] hover:bg-[rgba(255,71,87,0.1)] transition-colors cursor-pointer"
            title="Sohbeti temizle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(0,255,135,0.1)] flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-[#00FF87]" />
            </div>
            <h2 className="text-xl font-bold text-[#EDEDED] mb-2">Merhaba! 👋</h2>
            <p className="text-[#8B949E] text-sm mb-8 max-w-sm">
              Ben AI Diyetisyenin. Sana sağlıklı beslenme konusunda yardımcı olabilirim.
              Aşağıdan bir öneri seç veya serbest mesaj yaz.
            </p>

            {/* Suggestion Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              {CHAT_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.prompt)}
                  className="
                    glass-card p-4 rounded-xl text-left
                    hover:border-[rgba(0,255,135,0.3)] hover:bg-[rgba(0,255,135,0.05)]
                    transition-all duration-200 cursor-pointer
                  "
                >
                  <span className="text-sm text-[#EDEDED]">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Bubbles */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-[rgba(0,255,135,0.12)] border border-[rgba(0,255,135,0.2)] text-[#EDEDED]'
                  : 'glass-panel text-[#EDEDED]'
                }
              `}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="text-[10px] text-[#484F58] mt-2">
                {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-panel p-4 rounded-2xl flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#00FF87] animate-spin" />
              <span className="text-sm text-[#8B949E]">Düşünüyor...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-[rgba(255,71,87,0.1)] border border-[rgba(255,71,87,0.2)] rounded-xl p-3 text-sm text-[#FF4757]">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            disabled={isLoading}
            className="glass-input flex-1 !rounded-full !px-5 !py-3"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="
              w-12 h-12 rounded-full flex items-center justify-center
              bg-[rgba(0,255,135,0.15)] border border-[rgba(0,255,135,0.3)]
              text-[#00FF87] cursor-pointer
              hover:bg-[rgba(0,255,135,0.25)] hover:shadow-[0_0_20px_rgba(0,255,135,0.2)]
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-300
            "
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <WeeklyDietPlanModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        draftPlan={draftWeeklyPlan} 
      />
    </div>
  );
}
