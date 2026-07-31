import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Droplet, Minus, Plus } from 'lucide-react-native';

interface WaterTrackerProps {
  waterGlasses: number;
  waterGoal?: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function WaterTracker({ waterGlasses, waterGoal = 8, onAdd, onRemove }: WaterTrackerProps) {
  const progress = Math.min((waterGlasses / waterGoal) * 100, 100);

  return (
    <View style={s.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={s.iconBox}>
            <Droplet color="#60EFFF" size={20} />
          </View>
          <View>
            <Text style={{ color: '#EDEDED', fontWeight: '600', fontSize: 15 }}>Su Tüketimi</Text>
            <Text style={{ color: '#8B949E', fontSize: 11 }}>Hedef: {waterGoal} bardak</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={onRemove} style={s.btn}>
            <Minus color="#8B949E" size={16} />
          </TouchableOpacity>
          <Text style={s.count}>{waterGlasses}</Text>
          <TouchableOpacity onPress={onAdd} style={[s.btn, { backgroundColor: 'rgba(0,255,135,0.15)' }]}>
            <Plus color="#00FF87" size={16} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(13,17,23,0.5)',
    borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20, marginBottom: 16,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(96,239,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  btn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center',
  },
  count: {
    color: '#EDEDED', fontSize: 20, fontWeight: '700',
    fontVariant: ['tabular-nums'], width: 30, textAlign: 'center',
  },
  track: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3, marginTop: 16, overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3, backgroundColor: '#60EFFF' },
});
