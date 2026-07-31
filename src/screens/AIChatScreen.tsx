import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Bot, Send, Sparkles, Trash2 } from 'lucide-react-native';
import { useDietStore, useChatStore } from '../store/stores';
import { sendChatMessage, generateWeeklyDietPlan } from '@shared/services/geminiService';
import { CHAT_SUGGESTIONS } from '@shared/types/chat';
import type { ChatMessage } from '@shared/types/chat';
import type { WeeklyDietPlan } from '@shared/types/diet';
import WeeklyDietPlanModal from '../components/WeeklyDietPlanModal';

export default function AIChatScreen() {
  const [input, setInput] = useState('');
  const [draftWeeklyPlan, setDraftWeeklyPlan] = useState<WeeklyDietPlan | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const { messages, isLoading, error, addMessage, setLoading, setError, clearChat } = useChatStore();
  const { targetCalories, userData } = useDietStore();

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setInput('');

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
        
        // Add a system response saying it's generated
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
        { targetCalories, goal: userData.goal, weight: userData.weight, height: userData.height, age: userData.age }
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
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={s.screen}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* Header */}
      <View style={s.headerBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={s.iconBox}>
            <Bot color="#00FF87" size={20} />
          </View>
          <View>
            <Text style={s.headerTitle}>AI Asistan</Text>
            <Text style={s.headerSub}>Gemini ile beslenme tavsiyeleri</Text>
          </View>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity onPress={clearChat} style={s.clearBtn}>
            <Trash2 color="#484F58" size={18} />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={s.messageArea}
        contentContainerStyle={s.messageContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && (
          <View style={s.emptyState}>
            <View style={[s.iconBox, { width: 56, height: 56, borderRadius: 16 }]}>
              <Sparkles color="#00FF87" size={28} />
            </View>
            <Text style={s.emptyTitle}>Merhaba! 👋</Text>
            <Text style={s.emptyDesc}>
              Ben AI Diyetisyenin. Sana sağlıklı beslenme konusunda yardımcı olabilirim.
            </Text>

            <View style={s.suggestionsGrid}>
              {CHAT_SUGGESTIONS.map((s2, i) => (
                <TouchableOpacity key={i} onPress={() => handleSend(s2.prompt)} style={s.suggestionBtn}>
                  <Text style={s.suggestionText}>{s2.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {messages.map((msg) => (
          <View key={msg.id} style={[s.bubbleRow, msg.role === 'user' ? { justifyContent: 'flex-end' } : {}]}>
            <View style={[s.bubble, msg.role === 'user' ? s.userBubble : s.assistantBubble]}>
              <Text style={s.bubbleText}>{msg.content}</Text>
              <Text style={s.bubbleTime}>
                {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}

        {isLoading && (
          <View style={[s.bubbleRow]}>
            <View style={[s.bubble, s.assistantBubble, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
              <ActivityIndicator size="small" color="#00FF87" />
              <Text style={{ color: '#8B949E', fontSize: 13 }}>Düşünüyor...</Text>
            </View>
          </View>
        )}

        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={s.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Mesajınızı yazın..."
          placeholderTextColor="#484F58"
          style={s.textInput}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={() => handleSend()}
          disabled={!input.trim() || isLoading}
          style={[s.sendBtn, (!input.trim() || isLoading) && { opacity: 0.3 }]}
        >
          <Send color="#00FF87" size={20} />
        </TouchableOpacity>
      </View>

      <WeeklyDietPlanModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        draftPlan={draftWeeklyPlan} 
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05070A' },
  headerBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,255,135,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#EDEDED', fontSize: 17, fontWeight: '700' },
  headerSub: { color: '#8B949E', fontSize: 11 },
  clearBtn: { padding: 8, borderRadius: 8 },
  messageArea: { flex: 1 },
  messageContent: { padding: 16, paddingBottom: 8 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: '#EDEDED', fontSize: 20, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  emptyDesc: { color: '#8B949E', fontSize: 13, textAlign: 'center', maxWidth: 280, lineHeight: 20, marginBottom: 28 },
  suggestionsGrid: { width: '100%', gap: 10 },
  suggestionBtn: {
    backgroundColor: 'rgba(13,17,23,0.5)', borderRadius: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)', padding: 16,
  },
  suggestionText: { color: '#EDEDED', fontSize: 14 },
  bubbleRow: { flexDirection: 'row', marginBottom: 10 },
  bubble: { maxWidth: '82%', padding: 14, borderRadius: 18 },
  userBubble: {
    backgroundColor: 'rgba(0,255,135,0.12)', borderWidth: 1,
    borderColor: 'rgba(0,255,135,0.2)', borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: 'rgba(13,17,23,0.6)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: 4,
  },
  bubbleText: { color: '#EDEDED', fontSize: 14, lineHeight: 22 },
  bubbleTime: { color: '#484F58', fontSize: 10, marginTop: 6, alignSelf: 'flex-end' },
  errorBox: {
    backgroundColor: 'rgba(255,71,87,0.1)', borderWidth: 1,
    borderColor: 'rgba(255,71,87,0.2)', borderRadius: 14, padding: 12,
    alignSelf: 'center', marginVertical: 8,
  },
  errorText: { color: '#FF4757', fontSize: 13 },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#0D1117',
  },
  textInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 18, paddingVertical: 10, color: '#EDEDED', fontSize: 14,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,255,135,0.15)', borderWidth: 1, borderColor: 'rgba(0,255,135,0.3)',
  },
});
