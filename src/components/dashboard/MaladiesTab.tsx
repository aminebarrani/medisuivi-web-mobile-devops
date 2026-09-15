import React from 'react';
import type { MaladieDTO } from '../../services/maladieService';

export interface MaladiesTabProps {
  maladies: MaladieDTO[];
  onAddMaladie: () => void;
  onAssignMaladie: () => void;
}

export const MaladiesTab: React.FC<MaladiesTabProps> = ({
  maladies,
  onAddMaladie,
  onAssignMaladie,
}) => (
  <div className="dash-section-sm">
    <div className="dash-toolbar-row">
      <div>
        <h2 className="text-lg font-bold text-white">Catalogue des Pathologies</h2>
        <p className="dash-panel-subtitle">Définition des critères de suivi et seuils d'alerte</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onAddMaladie}
          className="dash-btn-secondary"
        >
          + Nouvelle Maladie
        </button>
        <button
          onClick={onAssignMaladie}
          className="dash-btn-gradient"
        >
          🩺 Attribuer Diagnostic
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {maladies.map((m) => (
        <div key={m.id} className="dash-maladie-card">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="dash-maladie-id">{m.id}</span>
              <span className="text-muted-xs text-id">ID: #{m.id}</span>
            </div>
            <h3 className="dash-maladie-name">{m.nom}</h3>
            <p className="dash-maladie-desc">{m.description}</p>
          </div>

          <div className="dash-maladie-meta">
            <div className="dash-meta-row">
              <span className="dash-meta-label">Paramètres suivis:</span>
              <span className="dash-meta-value">{m.parametresSuivis}</span>
            </div>
            <div className="dash-meta-row">
              <span className="dash-meta-label">Seuil de tolérance:</span>
              <span className="dash-meta-value-mono">
                {m.seuilMin ?? 'N/A'} - {m.seuilMax ?? 'N/A'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
