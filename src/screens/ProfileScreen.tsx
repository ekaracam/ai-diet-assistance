import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useDietStore } from '../store/stores';
import { User, Ruler, Weight, Activity, Target, Sparkles, LogOut } from 'lucide-react-native';
import type { UserGoal } from '@shared/types/user';
import { signOut } from '@shared/services/authService';
import { getBMICategory, getBodyFatCategory } from '@shared/utils/calculations';
import { getFirebaseAuth } from '@shared/services/firebaseConfig';
import { useChatStore } from '@shared/store/useChatStore';

const ACTIVITY_LEVELS = [
  { label: 'Hareketsiz', desc: 'Masa başı iş', value: 1.2, emoji: '🪑' },
  { label: 'Az Hareketli', desc: 'Hafta 1-3 egzersiz', value: 1.375, emoji: '🚶' },
  { label: 'Orta Hareketli', desc: 'Hafta 3-5 spor', value: 1.55, emoji: '🏃' },
  { label: 'Çok Hareketli', desc: 'Hafta 6-7 ağır', value: 1.725, emoji: '🏋️' },
];

const GOALS: { value: UserGoal; label: string; desc: string; color: string }[] = [
  { value: 'lose', label: 'Kilo Ver', desc: '-500 kcal', color: '#60EFFF' },
  { value: 'maintain', label: 'Koru', desc: 'Bakım', color: '#00FF87' },
  { value: 'gain', label: 'Kilo Al', desc: '+500 kcal', color: '#FFD700' },
];

export default function ProfileScreen() {
  const {
    userData, setUserData, bmr, tdee, bodyFatPercentage, bmi, targetCalories, saveDailyWeight, resetStore
  } = useDietStore();
  
  const { clearChat } = useChatStore();

  const [activeTab, setActiveTab] = useState<'personal' | 'physical'>('personal');

  // Load email/name from auth if missing
  // Removed to avoid overwriting data on mount before firestore load finishes.

  const handleLogout = async () => {
    try {
      await signOut();
      resetStore();
      clearChat();
    } catch (e) {
      console.error('Logout error', e);
    }
  };

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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.screen}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={[s.header, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={s.iconBox}>
              <User color="#00FF87" size={20} />
            </View>
            <View>
              <Text style={s.title}>Profil & Hedef</Text>
              <Text style={s.subtitle}>Kişiselleştirilmiş diyet için bilgilerini gir</Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
            <LogOut color="#FF4757" size={20} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={s.tabContainer}>
          <TouchableOpacity 
            style={[s.tabBtn, activeTab === 'personal' && s.activeTabBtn]} 
            onPress={() => setActiveTab('personal')}
          >
            <Text style={[s.tabText, activeTab === 'personal' && s.activeTabText]}>Kişisel Bilgiler</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[s.tabBtn, activeTab === 'physical' && s.activeTabBtn]} 
            onPress={() => setActiveTab('physical')}
          >
            <Text style={[s.tabText, activeTab === 'physical' && s.activeTabText]}>Fiziksel Bilgiler</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'personal' ? (
          <View style={{ flex: 1, gap: 20 }}>
            {/* Gender */}
            <View style={s.section}>
          <Text style={s.sectionLabel}>Cinsiyet</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['male', 'female'] as const).map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setUserData({ gender: g })}
                style={[
                  s.genderBtn,
                  userData.gender === g && {
                    backgroundColor: 'rgba(0,255,135,0.15)',
                    borderColor: 'rgba(0,255,135,0.4)',
                  },
                ]}
              >
                <Text style={[
                  s.genderText,
                  userData.gender === g && { color: '#00FF87' },
                ]}>
                  {g === 'male' ? 'Erkek' : 'Kadın'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
            
        <View style={s.section}>
          <Text style={s.sectionLabel}>Temel Kimlik Bilgileri</Text>
              <View style={{ gap: 10 }}>
                <FormInput label="İsim Soyisim" value={userData.name || ''} placeholder="Adınız" onChange={(v) => setUserData({ name: v })} />
                <FormInput label="E-Posta" value={userData.email || ''} placeholder="mail@ornek.com" onChange={(v) => setUserData({ email: v })} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <FormInput label="Doğum Tarihi" value={userData.birthDate || ''} placeholder="GG/AA/YYYY" onChange={handleDateChange} />
                  <FormInput label="Yaş" value={userData.age} placeholder="25" onChange={(v) => setUserData({ age: v.replace(/[^0-9]/g, '') })} />
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ flex: 1, gap: 20 }}>
            {/* Basic Info */}
            <View style={s.section}>
          <Text style={s.sectionLabel}>Temel Bilgiler</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <FormInput label="Yaş" value={userData.age} placeholder="25" onChange={(v) => setUserData({ age: v.replace(/[^0-9]/g, '') })} />
            <FormInput label="Boy (cm)" value={userData.height} placeholder="175" onChange={(v) => setUserData({ height: v.replace(/[^0-9.,]/g, '') })} />
            <FormInput
              label="Kilo (kg)" value={userData.weight} placeholder="70"
              onChange={(v) => setUserData({ weight: v.replace(/[^0-9.,]/g, '') })}
              onBlur={() => { if (userData.weight) saveDailyWeight(); }}
            />
          </View>
        </View>

        {/* Body Measurements */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Vücut Ölçüleri <Text style={{ fontSize: 9, color: '#484F58' }}>(Yağ oranı için)</Text></Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <FormInput label="Boyun (cm)" value={userData.neck} placeholder="38" onChange={(v) => setUserData({ neck: v.replace(/[^0-9.,]/g, '') })} />
            <FormInput label="Bel (cm)" value={userData.waist} placeholder="82" onChange={(v) => setUserData({ waist: v.replace(/[^0-9.,]/g, '') })} />
            {userData.gender === 'female' && (
              <FormInput label="Kalça (cm)" value={userData.hip} placeholder="96" onChange={(v) => setUserData({ hip: v.replace(/[^0-9.,]/g, '') })} />
            )}
          </View>
        </View>

        {/* Activity Level */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Günlük Aktivite</Text>
          {ACTIVITY_LEVELS.map((act) => (
            <TouchableOpacity
              key={act.value}
              onPress={() => setUserData({ activityLevel: act.value })}
              style={[
                s.activityItem,
                userData.activityLevel === act.value && {
                  backgroundColor: 'rgba(0,255,135,0.1)',
                  borderColor: 'rgba(0,255,135,0.3)',
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>{act.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.activityLabel, userData.activityLevel === act.value && { color: '#00FF87' }]}>
                  {act.label}
                </Text>
                <Text style={{ color: '#484F58', fontSize: 11 }}>{act.desc}</Text>
              </View>
              {userData.activityLevel === act.value && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#00FF87' }} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Goal */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Hedefiniz</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.value}
                onPress={() => setUserData({ goal: g.value })}
                style={[
                  s.goalBtn,
                  userData.goal === g.value && {
                    backgroundColor: `${g.color}15`,
                    borderColor: `${g.color}50`,
                  },
                ]}
              >
                <Text style={[s.goalLabel, userData.goal === g.value && { color: g.color }]}>{g.label}</Text>
                <Text style={{ color: '#484F58', fontSize: 9, marginTop: 2 }}>{g.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Results */}
        {(tdee || bmi) && (
          <View style={s.resultsCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Sparkles color="#00FF87" size={14} />
              <Text style={{ color: '#8B949E', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' }}>
                Hesaplanan Metrikler
              </Text>
            </View>

            {targetCalories && (
              <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                <Text style={{ color: '#8B949E', fontSize: 11, marginBottom: 4 }}>Günlük Kalori Hedefi</Text>
                <Text style={{ color: '#00FF87', fontSize: 32, fontWeight: '800', fontVariant: ['tabular-nums'] }}>
                  {targetCalories}
                  <Text style={{ color: '#8B949E', fontSize: 13, fontWeight: '400' }}> kcal</Text>
                </Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              {bmr !== null && <MetricChip label="BMR" value={`${bmr}`} unit="kcal" />}
              {tdee !== null && <MetricChip label="TDEE" value={`${tdee}`} unit="kcal" />}
              {bmi !== null && <MetricChip label="VKİ" value={`${bmi}`} />}
              {bodyFatPercentage !== null && <MetricChip label="Yağ" value={`%${bodyFatPercentage}`} />}
            </View>

            {bodyFatPercentage !== null && userData.gender && (
              <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
                {(() => {
                  const cat = getBodyFatCategory(bodyFatPercentage, userData.gender);
                  return (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View>
                        <Text style={{ color: '#8B949E', fontSize: 11, marginBottom: 4 }}>Vücut Yağ Kategorisi</Text>
                        <Text style={{ color: cat.color, fontSize: 16, fontWeight: '700' }}>{cat.label}</Text>
                      </View>
                      <View style={{ backgroundColor: `${cat.color}20`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: `${cat.color}40` }}>
                        <Text style={{ color: cat.color, fontSize: 12, fontWeight: '600' }}>{cat.desc}</Text>
                      </View>
                    </View>
                  );
                })()}
              </View>
            )}
          </View>
        )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FormInput({ label, value, placeholder, onChange, onBlur }: {
  label: string; value: string; placeholder: string; onChange: (v: string) => void; onBlur?: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: '#484F58', fontSize: 10, marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#484F58"
        keyboardType={label === 'İsim Soyisim' || label === 'E-Posta' || label === 'Doğum Tarihi' ? 'default' : 'numeric'}
        style={s.input}
      />
    </View>
  );
}

function MetricChip({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={s.chip}>
      <Text style={{ color: '#484F58', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</Text>
      <Text style={{ color: '#EDEDED', fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
        {value}
        {unit && <Text style={{ color: '#484F58', fontSize: 9 }}> {unit}</Text>}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05070A' },
  content: { padding: 20, paddingTop: 52, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,255,135,0.1)', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#EDEDED', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#8B949E', fontSize: 13 },
  logoutBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,71,87,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,71,87,0.2)' },
  section: { marginBottom: 20 },
  sectionLabel: { color: '#8B949E', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  genderBtn: {
    flex: 1, padding: 14, borderRadius: 14, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  genderText: { color: '#8B949E', fontWeight: '600', fontSize: 14 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12, paddingVertical: 10, color: '#EDEDED', fontSize: 14,
  },
  activityItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14, marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  activityLabel: { color: '#EDEDED', fontSize: 14, fontWeight: '600' },
  goalBtn: {
    flex: 1, padding: 14, borderRadius: 14, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  goalLabel: { color: '#EDEDED', fontSize: 14, fontWeight: '600' },
  resultsCard: {
    backgroundColor: 'rgba(13,17,23,0.6)', borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)', padding: 20, marginTop: 4,
  },
  chip: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12,
    padding: 10, alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: '#161B22',
  },
  tabText: {
    color: '#8B949E',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#EDEDED',
  },
});
