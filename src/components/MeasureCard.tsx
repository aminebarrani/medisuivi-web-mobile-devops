import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MesureDTO } from '../types';
import { MEASURE_TYPES_CONFIG } from '../config/constants';
import { colors } from '../theme';

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
        return { label: 'Saisie patient', bg: colors.accentSoft, text: colors.accent };
      case 'MEDECIN':
        return { label: 'Médecin', bg: '#EEE8F6', text: '#6B5B95' };
      case 'CAPTEUR':
        return { label: 'Capteur', bg: '#E7F1F4', text: '#4F8F9A' };
      default:
        return { label: source, bg: colors.surface, text: colors.muted };
    }
  };

  const sourceInfo = getSourceBadge(mesure.source);

  return (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <View style={styles.iconCircle}>
          <Ionicons name={config.icon as any} size={22} color={colors.accent} />
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
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#463A28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
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
    backgroundColor: colors.accentSoft,
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
    color: colors.ink,
  },
  date: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default MeasureCard;
