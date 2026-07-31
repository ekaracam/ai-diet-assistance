import React from 'react';
import { View, Text, ScrollView, useWindowDimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useDietStore } from '../store/stores';
import { Flame, Target, TrendingUp, Scale, Activity, Droplet, Minus, Plus, LayoutDashboard } from 'lucide-react-native';
import { getBMICategory } from '@shared/utils/calculations';
import { colors } from '@shared/theme/colors';
import { TouchableOpacity } from 'react-native';

export default function DashboardScreen() {
  const {
    userData, tdee, bmr, bmi, targetCalories, bodyFatPercentage,
    history,
  } = useDietStore();
  const { width } = useWindowDimensions();

  const hasData = !!(tdee || bmi || targetCalories);
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const chartData = history.length > 0 ? {
    labels: history.slice(-7).map(h => {
      const d = new Date(h.date);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    }),
    datasets: [{
      data: history.slice(-7).map(h => h.weight),
      color: (opacity = 1) => `rgba(0, 255, 135, ${opacity})`,
      strokeWidth: 2,
    }],
    legend: ['Kilo (kg)'],
  } : null;

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.iconBox}>
          <LayoutDashboard color="#00FF87" size={20} />
        </View>
        <View>
          <Text style={s.title}>Dashboard</Text>
          <Text style={s.subtitle}>İlerlemeni buradan takip et</Text>
        </View>
      </View>

      {/* No Data State */}
      {!hasData && (
        <View style={s.emptyCard}>
          <View style={[s.iconBox, { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(96,239,255,0.1)' }]}>
            <Activity color="#60EFFF" size={28} />
          </View>
          <Text style={[s.cardTitle, { marginTop: 16 }]}>Profilini Tamamla</Text>
          <Text style={s.cardDesc}>
            Metabolizma metriklerini görebilmek için Profil sekmesinden bilgilerini gir.
          </Text>
        </View>
      )}

      {/* Metrics */}
      {hasData && (
        <View style={s.metricsGrid}>
          {targetCalories && (
            <MetricCard icon={<Target color="#00FF87" size={18} />} label="Kalori Hedefi" value={`${targetCalories}`} unit="kcal" accent="rgba(0,255,135,0.1)" />
          )}
          {tdee && (
            <MetricCard icon={<Flame color="#60EFFF" size={18} />} label="TDEE" value={`${tdee}`} unit="kcal" accent="rgba(96,239,255,0.1)" />
          )}
          {bmr && (
            <MetricCard icon={<TrendingUp color="#FFD700" size={18} />} label="BMR" value={`${bmr}`} unit="kcal" accent="rgba(255,215,0,0.1)" />
          )}
          {bodyFatPercentage && (
            <MetricCard icon={<Scale color="#FFD700" size={18} />} label="Yağ Oranı" value={`%${bodyFatPercentage}`} accent="rgba(255,215,0,0.1)" />
          )}
          {bmi && bmiCategory && (
            <MetricCard icon={<Activity color="#00FF87" size={18} />} label="VKİ" value={`${bmi}`} subtitle={bmiCategory.label} subtitleColor={bmiCategory.color} accent="rgba(0,255,135,0.1)" />
          )}
          {userData.weight ? (
            <MetricCard icon={<Scale color="#60EFFF" size={18} />} label="Mevcut Kilo" value={userData.weight} unit="kg" accent="rgba(96,239,255,0.1)" />
          ) : null}
        </View>
      )}

      {/* Chart */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Gelişim Grafiği</Text>
        {!chartData ? (
          <View style={s.emptyChart}>
            <TrendingUp color="#484F58" size={28} />
            <Text style={s.emptyChartText}>Henüz yeterli veri yok.{'\n'}Profilinden kilonu güncelleyerek takip edebilirsin.</Text>
          </View>
        ) : (
          <LineChart
            data={chartData}
            width={width - 72}
            height={200}
            chartConfig={{
              backgroundGradientFrom: '#161B22',
              backgroundGradientTo: '#161B22',
              color: (opacity = 1) => `rgba(0, 255, 135, ${opacity})`,
              strokeWidth: 2,
              decimalPlaces: 1,
              propsForDots: { r: '4', strokeWidth: '2', stroke: '#00FF87' },
              propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.04)' },
              labelColor: (opacity = 1) => `rgba(139, 148, 158, ${opacity})`,
            }}
            bezier
            style={{ borderRadius: 12, marginTop: 8 }}
            withVerticalLines={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

function MetricCard({ icon, label, value, unit, subtitle, subtitleColor, accent }: {
  icon: React.ReactNode; label: string; value: string; unit?: string; subtitle?: string; subtitleColor?: string; accent: string;
}) {
  return (
    <View style={[s.metricCard, { borderColor: 'rgba(255,255,255,0.06)' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: accent, justifyContent: 'center', alignItems: 'center' }}>
          {icon}
        </View>
        <Text style={{ color: '#8B949E', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      </View>
      <Text style={{ color: '#EDEDED', fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
        {value}
        {unit && <Text style={{ color: '#8B949E', fontSize: 12, fontWeight: '400' }}> {unit}</Text>}
      </Text>
      {subtitle && <Text style={{ color: subtitleColor || '#8B949E', fontSize: 11, marginTop: 2 }}>{subtitle}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05070A' },
  content: { padding: 20, paddingTop: 52, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,255,135,0.1)', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#EDEDED', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#8B949E', fontSize: 13 },
  emptyCard: { backgroundColor: 'rgba(13,17,23,0.85)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 32, alignItems: 'center' },
  cardTitle: { color: '#EDEDED', fontSize: 18, fontWeight: '700' },
  cardDesc: { color: '#8B949E', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  metricCard: { backgroundColor: 'rgba(13,17,23,0.5)', borderRadius: 16, borderWidth: 1, padding: 16, width: '47%', flexGrow: 1 },
  card: { backgroundColor: 'rgba(13,17,23,0.5)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 20, marginBottom: 16 },
  sectionTitle: { color: '#8B949E', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  emptyChart: { height: 160, justifyContent: 'center', alignItems: 'center' },
  emptyChartText: { color: '#484F58', fontSize: 12, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
