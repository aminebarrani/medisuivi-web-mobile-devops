import React from 'react';
import type { AlerteDTO } from '../../services/suiviService';
import { riskBadgeClass } from '../../utils/dashboardClasses';

export interface AlertesTabProps {
  alertes: AlerteDTO[];
  getPatientDisplayName: (patientId: number) => string;
  onMarkAlerteTraitee: (alerteId: number) => void;
}

interface AlertItemProps {
  al: AlerteDTO;
  patientName: string;
  onMarkTraitee: (id: number) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ al, patientName, onMarkTraitee }) => {
  const cardClass = al.traitee ? 'dash-alert-done' : 'dash-alert-active';
  return (
    <div className={`dash-alert-card ${cardClass}`}>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className={`badge ${riskBadgeClass(al.niveauRisque)}`}>
            {al.niveauRisque}
          </span>
          <span className="badge-source">Source: {al.source}</span>
          <span className="font-semibold text-teal-400 text-sm">{patientName}</span>
        </div>
        <p className="text-base font-semibold text-white">{al.description}</p>
        <p className="text-muted-xs">Date: {new Date(al.dateCreation).toLocaleString('fr-FR')}</p>
      </div>

      <div>
        {al.traitee ? (
          <span className="badge-treated">✓ Traitée</span>
        ) : (
          <button
            onClick={() => onMarkTraitee(al.id)}
            className="dash-btn-gradient text-xs"
          >
            Marquer comme Traitée
          </button>
        )}
      </div>
    </div>
  );
};

export const AlertesTab: React.FC<AlertesTabProps> = ({
  alertes,
  getPatientDisplayName,
  onMarkAlerteTraitee,
}) => {
  if (alertes.length === 0) {
    return (
      <div className="dash-section-sm">
        <div className="dash-toolbar-row flex-col items-start gap-1">
          <h2 className="text-lg font-bold text-white">Centre de Traitement des Alertes Médicales</h2>
          <p className="dash-panel-subtitle">Consultez l'historique complet des alertes générées et acquittez celles déjà traitées</p>
        </div>
        <div className="space-y-4">
          <p className="text-slate-400 text-sm py-6 text-center">Aucune alerte médicale pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-section-sm">
      <div className="dash-toolbar-row flex-col items-start gap-1">
        <h2 className="text-lg font-bold text-white">Centre de Traitement des Alertes Médicales</h2>
        <p className="dash-panel-subtitle">Consultez l'historique complet des alertes générées et acquittez celles déjà traitées</p>
      </div>

      <div className="space-y-4">
        {alertes.map((al) => (
          <AlertItem
            key={al.id}
            al={al}
            patientName={getPatientDisplayName(al.patientId)}
            onMarkTraitee={onMarkAlerteTraitee}
          />
        ))}
      </div>
    </div>
  );
};
