import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NiveauRisque } from '../types';
import { colors } from '../theme';

interface RiskBadgeProps {
  niveauRisque?: NiveauRisque | string;
  showExplanation?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ niveauRisque = 'FAIBLE', showExplanation = false }) => {
  const normalized = (niveauRisque || 'FAIBLE').toUpperCase() as NiveauRisque;

  const getConfig = () => {
    switch (normalized) {
      case 'FAIBLE':
        return {
          bg: colors.successSoft,
          text: colors.success,
          border: '#C5DFD0',
          label: 'Risque faible',
          desc: 'Aucune anomalie détectée. Continuez votre suivi quotidien.',
        };
      case 'MODERE':
      case 'MOYEN':
        return {
          bg: colors.warningSoft,
          text: colors.warning,
          border: '#EAD8B4',
          label: 'Risque modéré',
          desc: 'Des paramètres requièrent une attention particulière.',
        };
      case 'ELEVE':
        return {
          bg: '#F6EBE3',
          text: '#B56A3A',
          border: '#E8D0C0',
          label: 'Risque élevé',
          desc: 'Mesures hors normes. Prévenez votre médecin si besoin.',
        };
      case 'CRITIQUE':
        return {
          bg: colors.dangerSoft,
          text: colors.danger,
          border: '#E8C6C6',
          label: 'Risque critique',
          desc: "Alerte médicale critique. Contactez votre médecin d'urgence.",
        };
      default:
        return {
          bg: colors.surface,
          text: colors.muted,
          border: colors.border,
          label: normalized,
          desc: 'Suivi de santé habituel.',
        };
    }
  };

  const config = getConfig();

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
        <View style={[styles.dot, { backgroundColor: config.text }]} />
        <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
      </View>
      {showExplanation && <Text style={styles.descText}>{config.desc}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  descText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
});

export default RiskBadge;
