import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Calendar, Utensils, ChevronDown, ChevronUp, Droplet } from 'lucide-react-native';
import { useDietStore } from '../store/stores';
import { useNavigation } from '@react-navigation/native';
import type { DayPlan } from '@shared/types/diet';
import { isWeeklyPlanValid, recommendedWaterLiters } from '@shared/utils/calculations';

export default function DietPlanScreen() {
  const { weeklyDietPlan, weeklyPlanStartDate, userData } = useDietStore();
  const navigation = useNavigation<any>();
  const [expandedDay, setExpandedDay] = useState<number>(1);

  if (!weeklyDietPlan || !isWeeklyPlanValid(weeklyPlanStartDate)) {
    return (
      <View style={s.emptyScreen}>
        <View style={s.iconBox}>
          <Calendar color="#00FF87" size={32} />
        </View>
        <Text style={s.emptyTitle}>Haftalık Program Yok</Text>
        <Text style={s.emptyDesc}>Henüz AI Asistan'dan haftalık diyet programı oluşturmadınız veya süresi dolmuş.</Text>
        <TouchableOpacity 
          style={s.actionBtn}
          onPress={() => navigation.navigate('AIChat')}
        >
          <Text style={s.actionBtnText}>Asistan'a Sor</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderDay = (dayPlan: DayPlan) => {
    const isExpanded = expandedDay === dayPlan.day;
    return (
      <View key={dayPlan.day} style={s.dayCard}>
        <TouchableOpacity 
          style={s.dayHeader} 
          onPress={() => setExpandedDay(isExpanded ? 0 : dayPlan.day)}
        >
          <View>
            <Text style={s.dayTitle}>{dayPlan.day}. Gün</Text>
            <Text style={s.daySub}>{dayPlan.totalCalories} kcal</Text>
          </View>
          {isExpanded ? <ChevronUp color="#8B949E" size={20} /> : <ChevronDown color="#8B949E" size={20} />}
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={s.dayContent}>
            {dayPlan.meals.map((meal, idx) => (
              <View key={idx} style={s.mealRow}>
                <View style={s.mealHeader}>
                  <Utensils color="#00FF87" size={14} />
                  <Text style={s.mealTitle}>{meal.meal}</Text>
                  <Text style={s.mealCals}>{meal.calories} kcal</Text>
                </View>
                <Text style={s.mealFood}>{meal.food}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const recommendedWater = recommendedWaterLiters(userData?.weight);

  return (
    <View style={s.screen}>
      <View style={s.headerBar}>
        <View style={s.headerIconBox}>
          <Calendar color="#00FF87" size={20} />
        </View>
        <View>
          <Text style={s.headerTitle}>Haftalık Programım</Text>
          <Text style={s.headerSub}>
            Oluşturulma: {new Date(weeklyPlanStartDate!).toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </View>

      <ScrollView style={s.scrollArea} contentContainerStyle={s.content}>
        <View style={s.waterInfoCard}>
          <View style={s.waterIconBox}>
            <Droplet color="#60EFFF" size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.waterTitle}>Günlük Su Tüketimi</Text>
            <Text style={s.waterDesc}>Metabolizmanı desteklemek için günde ortalama <Text style={{ color: '#EDEDED', fontWeight: 'bold' }}>{recommendedWater} Litre</Text> su içmelisin.</Text>
          </View>
        </View>

        {weeklyDietPlan.days.map(renderDay)}
        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05070A' },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,255,135,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#EDEDED', fontSize: 17, fontWeight: '700' },
  headerSub: { color: '#8B949E', fontSize: 11 },
  scrollArea: { flex: 1 },
  content: { padding: 16 },
  
  dayCard: {
    backgroundColor: '#0D1117',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  dayTitle: { color: '#EDEDED', fontSize: 16, fontWeight: '600' },
  daySub: { color: '#00FF87', fontSize: 12, marginTop: 4 },
  dayContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    gap: 16,
  },
  mealRow: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
    borderRadius: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  mealTitle: { color: '#EDEDED', fontSize: 14, fontWeight: '600', flex: 1 },
  mealCals: { color: '#8B949E', fontSize: 12 },
  mealFood: { color: '#8B949E', fontSize: 13, lineHeight: 20, paddingLeft: 22 },

  emptyScreen: {
    flex: 1,
    backgroundColor: '#05070A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconBox: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: 'rgba(0,255,135,0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { color: '#EDEDED', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyDesc: { color: '#8B949E', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24, paddingHorizontal: 20 },
  actionBtn: {
    backgroundColor: '#00FF87',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionBtnText: { color: '#05070A', fontSize: 15, fontWeight: '600' },
  waterInfoCard: {
    backgroundColor: 'rgba(96,239,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(96,239,255,0.15)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  waterIconBox: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(96,239,255,0.1)',
    justifyContent: 'center', alignItems: 'center'
  },
  waterTitle: { color: '#60EFFF', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  waterDesc: { color: '#8B949E', fontSize: 13, lineHeight: 18 },
});
