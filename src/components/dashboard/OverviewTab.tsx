import React from 'react';
import type { PatientDTO } from '../../services/patientService';
import type { MaladieDTO } from '../../services/maladieService';
import type { AlerteDTO } from '../../services/suiviService';
import { riskBadgeClass } from '../../utils/dashboardClasses';

export interface OverviewTabProps {
  user: { firstName?: string; lastName?: string } | null;
  patients: PatientDTO[];
  maladies: MaladieDTO[];
  alertes: AlerteDTO[];
  activeAlertsCount: number;
  onViewAllAlerts: () => void;
  getPatientDisplayName: (patientId: number) => string;
  onMarkAlerteTraitee: (alerteId: number) => void;
  onAddPatient: () => void;
  onAssignMaladie: () => void;
  onAddMesure: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  user,
  patients,
  maladies,
  alertes,
  activeAlertsCount,
  onViewAllAlerts,
  getPatientDisplayName,
  onMarkAlerteTraitee,
  onAddPatient,
  onAssignMaladie,
  onAddMesure,
}) => {
  const highRiskPatientsCount = patients.filter(
    (p) => p.niveauRisque === 'CRITIQUE' || p.niveauRisque === 'ELEVE'
  ).length;

  const recentUnresolvedAlerts = alertes.filter((a) => !a.traitee).slice(0, 3);

  return (
    <div className="dash-section">
      {/* Welcome Card */}
      <div className="dash-hero">
        <div className="dash-hero-glow" />
        <div className="relative z-10">
          <span className="dash-hero-tag">Tableau de Bord Clinique</span>
          <h1 className="dash-hero-title">
            Bienvenue, Dr. {user?.firstName} {user?.lastName} 👋
          </h1>
          <p className="dash-hero-desc">
            Gérez les paramètres de santé de vos patients, surveillez les mesures critiques et traitez les alertes en temps réel.
          </p>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="dash-grid-4">
        <div className="dash-stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="p-3 bg-teal-500/10 rounded-xl text-teal-400 text-xl">👥</span>
            <span className="text-xs font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full">Total</span>
          </div>
          <p className="dash-stat-value">{patients.length}</p>
          <p className="dash-stat-label">Patients sous suivi</p>
        </div>

        <div className="dash-stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="p-3 bg-rose-500/10 rounded-xl text-rose-400 text-xl">🚨</span>
            <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full">Urgences</span>
          </div>
          <p className="dash-stat-value">{highRiskPatientsCount}</p>
          <p className="dash-stat-label">Patients à risque élevé / critique</p>
        </div>

        <div className="dash-stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="p-3 bg-amber-500/10 rounded-xl text-amber-400 text-xl">⚠️</span>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">Actives</span>
          </div>
          <p className="dash-stat-value">{activeAlertsCount}</p>
          <p className="dash-stat-label">Alertes non traitées</p>
        </div>

        <div className="dash-stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 text-xl">🩺</span>
            <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">Catalogue</span>
          </div>
          <p className="dash-stat-value">{maladies.length}</p>
          <p className="dash-stat-label">Pathologies enregistrées</p>
        </div>
      </div>

      {/* Active Alerts Preview & Quick Actions */}
      <div className="dash-grid-3">
        <div className="dash-panel lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              Alertes Récentes Prioritaires
            </h2>
            <button
              onClick={onViewAllAlerts}
              className="text-xs text-teal-400 hover:underline font-semibold"
            >
              Voir tout →
            </button>
          </div>

          <div className="space-y-3">
            {recentUnresolvedAlerts.map((a) => (
              <div key={a.id} className="dash-list-item-row">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${riskBadgeClass(a.niveauRisque)}`}>
                      {a.niveauRisque}
                    </span>
                    <span className="badge-source">Source: {a.source}</span>
                    <span className="text-xs font-semibold text-teal-400">
                      {getPatientDisplayName(a.patientId)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">{a.description}</p>
                </div>
                <button
                  onClick={() => onMarkAlerteTraitee(a.id)}
                  className="dash-btn-accent-sm self-start sm:self-center"
                >
                  Acquitter
                </button>
              </div>
            ))}
            {recentUnresolvedAlerts.length === 0 && (
              <p className="text-slate-400 text-sm py-4 text-center">Aucune alerte active à traiter.</p>
            )}
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="dash-panel space-y-4">
          <h2 className="text-lg font-bold text-white mb-4">Actions Rapides</h2>

          <button onClick={onAddPatient} className="dash-action-primary">
            <div className="dash-action-icon bg-teal-500/20 text-teal-400">+</div>
            <div>
              <p className="dash-action-title">Ajouter un Patient</p>
              <p className="dash-action-desc">Créer un nouveau profil de suivi</p>
            </div>
          </button>

          <button onClick={onAssignMaladie} className="dash-action-secondary">
            <div className="dash-action-icon bg-cyan-500/20 text-cyan-400">🩺</div>
            <div>
              <p className="dash-action-title">Affecter une Pathologie</p>
              <p className="dash-action-desc">Lier une maladie à un patient</p>
            </div>
          </button>

          <button onClick={onAddMesure} className="dash-action-secondary">
            <div className="dash-action-icon bg-amber-500/20 text-amber-400">📈</div>
            <div>
              <p className="dash-action-title">Enregistrer une Mesure</p>
              <p className="dash-action-desc">Saisir constantes (Tension, Glycémie...)</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
