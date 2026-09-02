import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { MesureDTO, TypeMesure } from '../types';
import { MEASURE_TYPES_CONFIG } from '../config/constants';
import Card from './Card';

const SCREEN_WIDTH = Dimensions.get('window').width;

export type TimePeriod = '7D' | '30D' | '90D' | 'ALL';

interface EvolutionChartProps {
  mesures: MesureDTO[];
  selectedType: TypeMesure;
}

const PERIOD_CONFIG: { key: TimePeriod; label: string; days: number | null }[] = [
  { key: '7D', label: '7 jours', days: 7 },
  { key: '30D', label: '30 jours', days: 30 },
  { key: '90D', label: '90 jours', days: 90 },
  { key: 'ALL', label: 'Tout', days: null },
];

export const EvolutionChart: React.FC<EvolutionChartProps> = ({
  mesures,
  selectedType,
}) => {
  const [period, setPeriod] = useState<TimePeriod>('30D');
  const [selectedPoint, setSelectedPoint] = useState<{
    value: number;
    date: string;
    index: number;
  } | null>(null);

  const typeConfig = useMemo(
    () => MEASURE_TYPES_CONFIG.find((m) => m.type === selectedType) || MEASURE_TYPES_CONFIG[0],
    [selectedType]
  );

  // 1. Filter by measurement type and period, then sort chronologically (oldest -> newest)
  const filteredData = useMemo(() => {
    const now = new Date().getTime();
    const periodObj = PERIOD_CONFIG.find((p) => p.key === period);

    const typeFiltered = mesures.filter((m) => m.typeMesure === selectedType);

    const timeFiltered = periodObj?.days
      ? typeFiltered.filter((m) => {
          const itemTime = new Date(m.dateMesure).getTime();
          const cutoff = now - periodObj.days! * 24 * 60 * 60 * 1000;
          return itemTime >= cutoff;
        })
      : typeFiltered;

    // Chronological order for graph X axis
    return [...timeFiltered].sort(
      (a, b) => new Date(a.dateMesure).getTime() - new Date(b.dateMesure).getTime()
    );
  }, [mesures, selectedType, period]);

  // 2. Compute aggregate statistics (min, max, avg, latest)
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    const values = filteredData.map((d) => d.valeur);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / values.length;
    const latest = filteredData[filteredData.length - 1];

    return {
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      avg: Number(avg.toFixed(2)),
      latest: Number(latest.valeur.toFixed(2)),
      count: filteredData.length,
    };
  }, [filteredData]);

  // 3. Prepare chart data points and formatted X-axis labels
  const chartData = useMemo(() => {
    if (filteredData.length < 2) return null;

    const maxLabels = 5;
    const step = Math.ceil(filteredData.length / maxLabels);

    const labels = filteredData.map((d, index) => {
      // Show label on first, last, or evenly spaced steps
      if (
        index === 0 ||
        index === filteredData.length - 1 ||
        index % step === 0
      ) {
        const dateObj = new Date(d.dateMesure);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
      }
      return '';
    });

    return {
      labels,
      datasets: [
        {
          data: filteredData.map((d) => d.valeur),
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  }, [filteredData]);

  return (
    <View style={styles.container}>
      {/* Time Period Selector Tabs */}
      <View style={styles.periodRow}>
        {PERIOD_CONFIG.map((p) => {
          const isActive = period === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodButton, isActive && styles.periodButtonActive]}
              onPress={() => {
                setPeriod(p.key);
                setSelectedPoint(null);
              }}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  isActive && styles.periodButtonTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Aggregate Stats Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Dernier</Text>
            <Text style={styles.statValue}>
              {stats.latest}{' '}
              <Text style={styles.statUnit}>{typeConfig.unit}</Text>
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Moyenne</Text>
            <Text style={styles.statValue}>
              {stats.avg}{' '}
              <Text style={styles.statUnit}>{typeConfig.unit}</Text>
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Min / Max</Text>
            <Text style={styles.statValue}>
              {stats.min} / {stats.max}
            </Text>
          </View>
        </View>
      )}

      {/* Chart Section */}
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <Ionicons
              name={(typeConfig.icon as any) || 'pulse'}
              size={20}
              color="#2563EB"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.chartTitle}>
              Évolution {typeConfig.label}
            </Text>
          </View>
          <Text style={styles.chartCount}>
            {filteredData.length} relevé{filteredData.length > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Selected Data Point Tooltip */}
        {selectedPoint && (
          <View style={styles.pointDetailBanner}>
            <Ionicons name="information-circle" size={18} color="#2DD4BF" />
            <Text style={styles.pointDetailText}>
              Mesure sélectionnée: <Text style={{ fontWeight: '700', color: '#2DD4BF' }}>{selectedPoint.value} {typeConfig.unit}</Text> le {selectedPoint.date}
            </Text>
          </View>
        )}

        {filteredData.length === 0 ? (
          <View style={styles.emptyChartContainer}>
            <Ionicons name="stats-chart-outline" size={40} color="#64748B" />
            <Text style={styles.emptyChartText}>
              Aucune mesure trouvée pour cette période ({PERIOD_CONFIG.find((p) => p.key === period)?.label}).
            </Text>
          </View>
        ) : filteredData.length === 1 ? (
          <View style={styles.emptyChartContainer}>
            <Ionicons name="checkmark-circle-outline" size={36} color="#34D399" />
            <Text style={styles.singlePointTitle}>
              1 mesure enregistrée : {filteredData[0].valeur} {typeConfig.unit}
            </Text>
            <Text style={styles.emptyChartText}>
              Ajoutez au moins 2 mesures pour afficher la courbe de tendance.
            </Text>
          </View>
        ) : chartData ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={chartData}
              width={Math.max(SCREEN_WIDTH - 64, filteredData.length * 44)}
              height={220}
              yAxisSuffix={` ${typeConfig.unit}`}
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#0F172A',
                backgroundGradientFrom: '#0F172A',
                backgroundGradientTo: '#091124',
                decimalPlaces: selectedType === 'GLYCEMIE' ? 2 : 0,
                color: (opacity = 1) => `rgba(45, 212, 191, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#2DD4BF',
                  fill: '#0F172A',
                },
                propsForBackgroundLines: {
                  strokeDasharray: '4',
                  stroke: 'rgba(255, 255, 255, 0.08)',
                },
              }}
              bezier
              style={styles.lineChart}
              onDataPointClick={(data) => {
                const clickedItem = filteredData[data.index];
                if (clickedItem) {
                  const d = new Date(clickedItem.dateMesure);
                  const formatted = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} à ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                  setSelectedPoint({
                    value: clickedItem.valeur,
                    date: formatted,
                    index: data.index,
                  });
                }
              }}
            />
          </ScrollView>
        ) : null}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#0D9488',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38BDF8',
  },
  statUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  chartCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#0F172A',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  chartCount: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  pointDetailBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  pointDetailText: {
    fontSize: 12,
    color: '#F8FAFC',
  },
  emptyChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  singlePointTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyChartText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
  lineChart: {
    marginVertical: 6,
    borderRadius: 12,
  },
});

export default EvolutionChart;
