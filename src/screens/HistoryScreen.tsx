import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../hooks/useAuth';
import suiviService from '../services/suiviService';
import { MesureDTO, TypeMesure } from '../types';
import { MEASURE_TYPES_CONFIG } from '../config/constants';
import MeasureCard from '../components/MeasureCard';
import EvolutionChart from '../components/EvolutionChart';
import Card from '../components/Card';

type ViewMode = 'CHART' | 'LIST';

export const HistoryScreen: React.FC = () => {
  const { patient } = useAuth();
  const [mesures, setMesures] = useState<MesureDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('CHART');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedChartType, setSelectedChartType] = useState<TypeMesure>('TENSION');

  const fetchMesures = useCallback(async () => {
    if (!patient?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await suiviService.getMesuresByPatient(patient.id);
      // Sort newest first
      const sorted = data.sort(
        (a, b) => new Date(b.dateMesure).getTime() - new Date(a.dateMesure).getTime()
      );
      setMesures(sorted);
    } catch (err) {
      console.warn('Erreur chargement historique:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [patient?.id]);

  useEffect(() => {
    fetchMesures();
  }, [fetchMesures]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMesures();
  };

  const filteredMesures = selectedFilter === 'ALL'
    ? mesures
    : mesures.filter((m) => m.typeMesure === selectedFilter);

  const listFilters = [
    { type: 'ALL', label: 'Toutes' },
    ...MEASURE_TYPES_CONFIG.map((m) => ({ type: m.type, label: m.label.split(' ')[0] })),
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Historique & Évolution</Text>
        <Text style={styles.subtitle}>Suivez vos constantes médicales et visualisez vos tendances.</Text>

        {/* View Mode Toggle Switch */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[styles.modeToggleButton, viewMode === 'CHART' && styles.modeToggleButtonActive]}
            onPress={() => setViewMode('CHART')}
          >
            <Ionicons
              name="analytics"
              size={18}
              color={viewMode === 'CHART' ? '#2DD4BF' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.modeToggleText, viewMode === 'CHART' && styles.modeToggleTextActive]}>
              Courbes & Graphes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeToggleButton, viewMode === 'LIST' && styles.modeToggleButtonActive]}
            onPress={() => setViewMode('LIST')}
          >
            <Ionicons
              name="list"
              size={18}
              color={viewMode === 'LIST' ? '#2DD4BF' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.modeToggleText, viewMode === 'LIST' && styles.modeToggleTextActive]}>
              Relevés Détaillés
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : viewMode === 'CHART' ? (
        /* Chart Mode View */
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollInner}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Measurement Type Selector for Chart */}
          <Text style={styles.sectionLabel}>Sélectionnez la constante :</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartTypeScroll}
          >
            {MEASURE_TYPES_CONFIG.map((item) => {
              const isSelected = selectedChartType === item.type;
              return (
                <TouchableOpacity
                  key={item.type}
                  style={[styles.chartTypeChip, isSelected && styles.chartTypeChipSelected]}
                  onPress={() => setSelectedChartType(item.type)}
                >
                  <Ionicons
                    name={(item.icon as any) || 'pulse'}
                    size={16}
                    color={isSelected ? '#FFFFFF' : '#64748B'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.chartTypeChipText, isSelected && styles.chartTypeChipTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Interactive Chart Component with 7/30/90 Days & Stats */}
          <EvolutionChart mesures={mesures} selectedType={selectedChartType} />

          {/* Quick Recent Log for selected metric */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionSubtitle}>Derniers relevés pour cette constante</Text>
            {mesures.filter((m) => m.typeMesure === selectedChartType).length === 0 ? (
              <Card style={styles.emptyRecentCard}>
                <Text style={styles.emptyRecentText}>Aucun relevé enregistré pour le moment.</Text>
              </Card>
            ) : (
              mesures
                .filter((m) => m.typeMesure === selectedChartType)
                .slice(0, 3)
                .map((m) => <MeasureCard key={m.id} mesure={m} />)
            )}
          </View>
        </ScrollView>
      ) : (
        /* List Mode View */
        <View style={{ flex: 1 }}>
          {/* Filter Horizontal Scroll */}
          <View style={styles.filterContainer}>
            <FlatList
              horizontal
              data={listFilters}
              keyExtractor={(item) => item.type}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedFilter === item.type;
                return (
                  <TouchableOpacity
                    style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                    onPress={() => setSelectedFilter(item.type)}
                  >
                    <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.filterList}
            />
          </View>

          {filteredMesures.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Card style={styles.emptyCard}>
                <Ionicons name="document-text-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>Aucune mesure enregistrée</Text>
                <Text style={styles.emptyText}>
                  {selectedFilter === 'ALL'
                    ? 'Vous n\'avez encore enregistré aucune constante médicale.'
                    : 'Aucune mesure enregistrée pour ce filtre.'}
                </Text>
              </Card>
            </View>
          ) : (
            <FlatList
              data={filteredMesures}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <MeasureCard mesure={item} />}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#091124',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 3,
    marginBottom: 12,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  modeToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeToggleButtonActive: {
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  modeToggleTextActive: {
    color: '#2DD4BF',
    fontWeight: '700',
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: 20,
    paddingBottom: 36,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 10,
  },
  chartTypeScroll: {
    paddingBottom: 14,
    gap: 8,
  },
  chartTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  chartTypeChipSelected: {
    backgroundColor: '#0D9488',
    borderColor: '#2DD4BF',
  },
  chartTypeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  chartTypeChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  recentSection: {
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  emptyRecentCard: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  emptyRecentText: {
    fontSize: 13,
    color: '#64748B',
  },
  filterContainer: {
    marginVertical: 10,
  },
  filterList: {
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#0D9488',
    borderColor: '#2DD4BF',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  emptyContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#0F172A',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default HistoryScreen;
