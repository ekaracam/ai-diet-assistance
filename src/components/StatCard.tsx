import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  Icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, unit, Icon, iconColor = '#00FF87' }: StatCardProps) {
  const accentBg = iconColor === '#00FF87'
    ? 'rgba(0,255,135,0.1)'
    : iconColor === '#60EFFF'
      ? 'rgba(96,239,255,0.1)'
      : 'rgba(255,215,0,0.1)';

  return (
    <View style={s.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <View style={[s.iconBox, { backgroundColor: accentBg }]}>
          <Icon color={iconColor} size={16} />
        </View>
        <Text style={s.label}>{title}</Text>
      </View>
      <Text style={s.value}>
        {value}
        {unit && <Text style={s.unit}> {unit}</Text>}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(13,17,23,0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
  },
  iconBox: {
    width: 28, height: 28, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  label: { color: '#8B949E', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { color: '#EDEDED', fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  unit: { color: '#8B949E', fontSize: 12, fontWeight: '400' },
});
