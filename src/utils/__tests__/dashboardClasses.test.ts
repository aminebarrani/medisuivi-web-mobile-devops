import { describe, it, expect } from 'vitest';
import {
  tabClass,
  riskBadgeClass,
  graviteBadgeClass,
  pwdStrengthClass,
  pwdStrengthBarClass,
  sourceBadgeText,
  pwdStrengthTextColor,
  getSecureRandomInt,
} from '../dashboardClasses';

describe('dashboardClasses', () => {
  it('tabClass marks the active tab', () => {
    expect(tabClass('patients', 'patients')).toContain('dashboard-tab-active');
    expect(tabClass('patients', 'alertes')).toContain('dashboard-tab-inactive');
  });

  it('riskBadgeClass maps every risk level', () => {
    expect(riskBadgeClass('FAIBLE')).toContain('badge-risk-faible');
    expect(riskBadgeClass('MOYEN')).toContain('badge-risk-moyen');
    expect(riskBadgeClass('ELEVE')).toContain('badge-risk-eleve');
    expect(riskBadgeClass('CRITIQUE')).toContain('badge-risk-critique');
  });

  it('graviteBadgeClass maps every gravity', () => {
    expect(graviteBadgeClass('FAIBLE')).toContain('badge-gravite-faible');
    expect(graviteBadgeClass('MODERE')).toContain('badge-gravite-modere');
    expect(graviteBadgeClass('GRAVE')).toContain('badge-gravite-grave');
  });

  it('pwdStrengthClass returns classes and default', () => {
    expect(pwdStrengthClass(1)).toBe('pwd-strength-weak');
    expect(pwdStrengthClass(2)).toBe('pwd-strength-medium');
    expect(pwdStrengthClass(3)).toBe('pwd-strength-strong');
    expect(pwdStrengthClass(4)).toBe('pwd-strength-very-strong');
    expect(pwdStrengthClass(0)).toBe('');
    expect(pwdStrengthClass(9)).toBe('');
  });

  it('pwdStrengthBarClass fills up to score', () => {
    expect(pwdStrengthBarClass(3, 2)).toBe('bar-strong');
    expect(pwdStrengthBarClass(3, 4)).toBe('bar-empty');
    expect(pwdStrengthBarClass(0, 0)).toBe('');
  });

  it('sourceBadgeText labels known and unknown sources', () => {
    expect(sourceBadgeText('PATIENT')).toContain('Saisie Patient');
    expect(sourceBadgeText('MEDECIN')).toContain('Saisie Médecin');
    expect(sourceBadgeText('CAPTEUR')).toContain('CAPTEUR');
  });

  it('pwdStrengthTextColor maps scores', () => {
    expect(pwdStrengthTextColor(0)).toBe('text-rose-400');
    expect(pwdStrengthTextColor(1)).toBe('text-rose-400');
    expect(pwdStrengthTextColor(2)).toBe('text-amber-400');
    expect(pwdStrengthTextColor(3)).toBe('text-teal-400');
    expect(pwdStrengthTextColor(4)).toBe('text-emerald-400');
  });

  it('getSecureRandomInt stays within range', () => {
    for (let i = 0; i < 50; i += 1) {
      const n = getSecureRandomInt(1, 6);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
    }
  });
});
