import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NiveauRisque } from '../types';

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
          bg: 'rgba(16, 185, 129, 0.12)',
          text: '#34D399',
          border: 'rgba(16, 185, 129, 0.35)',
          label: 'Risque Faible (Stable)',
          desc: 'Aucune anomalie détectée. Continuez votre suivi quotidien.',
        };
      case 'MODERE':
      case 'MOYEN':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          text: '#FBBF24',
          border: 'rgba(245, 158, 11, 0.35)',
          label: 'Risque Modéré (Vigilance)',
          desc: 'Des paramètres requièrent une attention particulière.',
        };
      case 'ELEVE':
        return {
          bg: 'rgba(249, 115, 22, 0.12)',
          text: '#FB923C',
          border: 'rgba(249, 115, 22, 0.35)',
          label: 'Risque Élevé (Vigilance)',
          desc: 'Mesures hors normes. Prévenez votre médecin si besoin.',
        };
      case 'CRITIQUE':
        return {
          bg: 'rgba(244, 63, 94, 0.15)',
          text: '#FB7185',
          border: 'rgba(244, 63, 94, 0.4)',
          label: 'Risque Critique (Urgent)',
          desc: 'Alerte médicale critique ! Contactez votre médecin d\'urgence.',
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.08)',
          text: '#94A3B8',
          border: 'rgba(255, 255, 255, 0.15)',
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
    color: '#94A3B8',
    lineHeight: 18,
  },
});

export default RiskBadge;
