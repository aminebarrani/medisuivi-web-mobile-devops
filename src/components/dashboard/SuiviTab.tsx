import React from 'react';
import type { MesureDTO, SymptomeDTO } from '../../services/suiviService';
import { graviteBadgeClass, sourceBadgeText } from '../../utils/dashboardClasses';

export interface SuiviTabProps {
  mesures: MesureDTO[];
  symptomes: SymptomeDTO[];
  getPatientDisplayName: (patientId: number) => string;
  onAddMesure: () => void;
  onAddSymptome: () => void;
}

const getSourceStyleClass = (source: string): string => {
  if (source === 'PATIENT') return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
  if (source === 'MEDECIN') return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
  return 'bg-slate-700 text-slate-300';
};

export const SuiviTab: React.FC<SuiviTabProps> = ({
  mesures,
  symptomes,
  getPatientDisplayName,
  onAddMesure,
  onAddSymptome,
}) => (
  <div className="dash-section">
    {/* Action Toolbar */}
    <div className="dash-toolbar-row">
      <h2 className="text-lg font-bold text-white">Relevés de Santé & Symptômes</h2>
      <div className="flex gap-3">
        <button onClick={onAddMesure} className="dash-btn-teal">
          + Saisir une Mesure
        </button>
        <button onClick={onAddSymptome} className="dash-btn-amber">
          + Signaler Symptôme
        </button>
      </div>
    </div>

    <div className="dash-grid-2">
      {/* Mesures Table */}
      <div className="dash-panel">
        <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
          <span>📈 Historique des Mesures</span>
        </h3>
        <div className="space-y-3">
          {mesures.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">
              Aucune mesure enregistrée pour vos patients.
            </p>
          ) : (
            mesures.map((ms) => (
              <div key={ms.id} className="dash-list-item flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-type">{ms.typeMesure}</span>
                    <span className="font-semibold text-teal-400 text-sm">
                      {getPatientDisplayName(ms.patientId)}
                    </span>
                  </div>
                  <p className="text-value-lg">
                    {ms.valeur} <span className="text-value-unit">{ms.unite}</span>
                  </p>
                </div>
                <div className="text-right text-muted-xs space-y-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${getSourceStyleClass(ms.source)}`}>
                    {sourceBadgeText(ms.source)}
                  </span>
                  <p>{new Date(ms.dateMesure).toLocaleString('fr-FR')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Symptomes Table */}
      <div className="dash-panel">
        <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
          <span>🩺 Symptômes Constatés</span>
        </h3>
        <div className="space-y-3">
          {symptomes.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">Aucun symptôme signalé.</p>
          ) : (
            symptomes.map((sy) => (
              <div key={sy.id} className="dash-list-item flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${graviteBadgeClass(sy.gravite)}`}>
                      Gravité: {sy.gravite}
                    </span>
                    <span className="font-semibold text-teal-400 text-sm">
                      {getPatientDisplayName(sy.patientId)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 mt-2">{sy.description}</p>
                </div>
                <div className="text-right text-muted-xs">
                  <p>{new Date(sy.dateSignalement).toLocaleString('fr-FR')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
);
