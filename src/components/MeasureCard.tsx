import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MesureDTO } from '../types';
import { MEASURE_TYPES_CONFIG } from '../config/constants';

interface MeasureCardProps {
  mesure: MesureDTO;
}

export const MeasureCard: React.FC<MeasureCardProps> = ({ mesure }) => {
  const config = MEASURE_TYPES_CONFIG.find((m) => m.type === mesure.typeMesure) || {
    label: mesure.typeMesure,
    unit: mesure.unite || '',
    icon: 'pulse' as const,
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'PATIENT':
        return { label: 'Saisie Patient', bg: 'rgba(20, 184, 166, 0.15)', text: '#2DD4BF' };
      case 'MEDECIN':
        return { label: 'Médecin', bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC' };
      case 'CAPTEUR':
        return { label: 'Capteur IoT', bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8' };
      default:
        return { label: source, bg: 'rgba(255, 255, 255, 0.08)', text: '#94A3B8' };
    }
  };

  const sourceInfo = getSourceBadge(mesure.source);

  return (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <View style={styles.iconCircle}>
          <Ionicons name={config.icon as any} size={22} color="#2DD4BF" />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>{config.label}</Text>
          <Text style={styles.date}>{formatDate(mesure.dateMesure)}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.valueText}>
          {mesure.valeur} <Text style={styles.unitText}>{mesure.unite || config.unit}</Text>
        </Text>
        <View style={[styles.sourceBadge, { backgroundColor: sourceInfo.bg }]}>
          <Text style={[styles.sourceText, { color: sourceInfo.text }]}>{sourceInfo.label}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  date: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38BDF8',
  },
  unitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default MeasureCard;
