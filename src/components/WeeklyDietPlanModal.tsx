import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { X, Check, Send, Utensils, ChevronDown, ChevronUp } from 'lucide-react-native';
import type { WeeklyDietPlan, DayPlan } from '@shared/types/diet';
import { useDietStore } from '../store/stores';
import { useNavigation } from '@react-navigation/native';
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
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (draftPlan) {
      setCurrentPlan(draftPlan);
      setError('');
    }
  }, [draftPlan]);

  const handleSave = () => {
    if (currentPlan) {
      setWeeklyDietPlan(currentPlan);
      onClose();
      navigation.navigate('DietPlan');
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

  const renderDay = (dayPlan: DayPlan) => {
    const isExpanded = expandedDay === dayPlan.day;
    
    return (
      <View key={dayPlan.day} style={s.dayCard}>
        <TouchableOpacity 
          style={s.dayHeader} 
          onPress={() => setExpandedDay(isExpanded ? 0 : dayPlan.day)}
          activeOpacity={0.7}
        >
          <View>
            <Text style={s.dayTitle}>{dayPlan.day}. Gün</Text>
            <Text style={s.dayCalories}>{dayPlan.totalCalories} kcal</Text>
          </View>
          {isExpanded ? <ChevronUp color="#8B949E" size={20} /> : <ChevronDown color="#8B949E" size={20} />}
        </TouchableOpacity>

        {isExpanded && (
          <View style={s.mealsContainer}>
            {dayPlan.meals.map((meal, idx) => (
              <View key={idx} style={s.mealCard}>
                <View style={s.mealHeader}>
                  <Utensils color="#00FF87" size={14} />
                  <Text style={s.mealName}>{meal.meal}</Text>
                  <Text style={s.mealCalories}>{meal.calories} kcal</Text>
                </View>
                <Text style={s.mealFood}>{meal.food}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalOverlay}>
        <View style={s.modalContent}>
          <View style={s.header}>
            <Text style={s.title}>Taslak Programı İncele</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <X color="#8B949E" size={20} />
            </TouchableOpacity>
          </View>
          
          <Text style={s.desc}>
            Aşağıdaki programı inceleyebilirsiniz. Değiştirmek istediğiniz bir şey varsa AI'a yazarak yeniden düzenlemesini isteyebilirsiniz.
          </Text>

          {error ? <Text style={s.error}>{error}</Text> : null}

          {/* Liste Alanı */}
          <ScrollView style={s.scrollArea} keyboardShouldPersistTaps="handled">
            {isModifying ? (
              <View style={s.loadingContainer}>
                <ActivityIndicator size="large" color="#00FF87" />
                <Text style={s.loadingText}>Yapay zeka planı güncelliyor...</Text>
              </View>
            ) : (
              currentPlan?.days.map(renderDay)
            )}
          </ScrollView>

          {/* AI Değişiklik Girdisi */}
          <View style={s.aiInputContainer}>
            <TextInput
              style={s.aiInput}
              placeholder="Örn: Kahvaltıları peynirsiz yap..."
              placeholderTextColor="#8B949E"
              value={modifyInput}
              onChangeText={setModifyInput}
              editable={!isModifying}
            />
            <TouchableOpacity 
              style={[s.aiSendBtn, (!modifyInput.trim() || isModifying) && { opacity: 0.5 }]} 
              onPress={handleModifyRequest}
              disabled={!modifyInput.trim() || isModifying}
            >
              <Send color="#00FF87" size={18} />
            </TouchableOpacity>
          </View>

          {/* Kaydet Butonu */}
          <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={isModifying}>
            <Check color="#05070A" size={20} />
            <Text style={s.saveBtnText}>Onayla ve Kaydet</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(5,7,10,0.8)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#0D1117', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 20,
    height: '92%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: '#EDEDED', fontSize: 18, fontWeight: '700' },
  closeBtn: { padding: 4 },
  desc: { color: '#8B949E', fontSize: 13, marginBottom: 16, lineHeight: 20 },
  error: { color: '#FF4757', fontSize: 13, marginBottom: 12 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200, gap: 12 },
  loadingText: { color: '#00FF87', fontSize: 14, fontWeight: '600' },
  
  scrollArea: { flex: 1, marginBottom: 16 },
  
  dayCard: {
    backgroundColor: 'rgba(13,17,23,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  dayTitle: { color: '#EDEDED', fontSize: 16, fontWeight: '600' },
  dayCalories: { color: '#00FF87', fontSize: 12, fontWeight: '500', marginTop: 4 },
  mealsContainer: { padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)', gap: 12 },
  mealCard: { backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  mealName: { color: '#EDEDED', fontSize: 14, fontWeight: '600', flex: 1 },
  mealCalories: { color: '#8B949E', fontSize: 12 },
  mealFood: { color: '#8B949E', fontSize: 13, lineHeight: 20, paddingLeft: 20 },

  aiInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  aiInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#EDEDED',
    fontSize: 14,
  },
  aiSendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,255,135,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,135,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveBtn: {
    backgroundColor: '#00FF87',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  saveBtnText: { color: '#05070A', fontSize: 16, fontWeight: '700' },
});
