import type { NiveauRisque } from '../services/patientService';
import type { Gravite } from '../services/suiviService';

export type TabType = 'overview' | 'patients' | 'maladies' | 'suivi' | 'alertes' | 'profile';

export const tabClass = (activeTab: TabType, tab: TabType) =>
  `dashboard-tab ${activeTab === tab ? 'dashboard-tab-active' : 'dashboard-tab-inactive'}`;

export const riskBadgeClass = (risk: NiveauRisque) => {
  switch (risk) {
    case 'FAIBLE':
      return 'badge badge-risk-faible';
    case 'MOYEN':
      return 'badge badge-risk-moyen';
    case 'ELEVE':
      return 'badge badge-risk-eleve';
    case 'CRITIQUE':
      return 'badge badge-risk-critique';
  }
};

export const graviteBadgeClass = (g: Gravite) => {
  switch (g) {
    case 'FAIBLE':
      return 'badge badge-gravite-faible';
    case 'MODERE':
      return 'badge badge-gravite-modere';
    case 'GRAVE':
      return 'badge badge-gravite-grave';
  }
};

export const pwdStrengthClass = (score: number) => {
  switch (score) {
    case 1:
      return 'pwd-strength-weak';
    case 2:
      return 'pwd-strength-medium';
    case 3:
      return 'pwd-strength-strong';
    case 4:
      return 'pwd-strength-very-strong';
    default:
      return '';
  }
};

export const pwdStrengthBarClass = (score: number, index: number) =>
  index <= score
    ? ['', 'bar-weak', 'bar-medium', 'bar-strong', 'bar-very-strong'][score] ?? ''
    : 'bar-empty';

export const sourceBadgeText = (source: string): string => {
  if (source === 'PATIENT') return '📱 Saisie Patient';
  if (source === 'MEDECIN') return '🩺 Saisie Médecin';
  return `📡 ${source}`;
};

export const pwdStrengthTextColor = (score: number): string => {
  if (score <= 1) return 'text-rose-400';
  if (score === 2) return 'text-amber-400';
  if (score === 3) return 'text-teal-400';
  return 'text-emerald-400';
};

export const getSecureRandomInt = (min: number, max: number): number => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return min + (array[0] % (max - min + 1));
};
