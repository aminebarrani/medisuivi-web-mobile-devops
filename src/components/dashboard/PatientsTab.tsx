import React from 'react';
import type { PatientDTO, NiveauRisque } from '../../services/patientService';
import { riskBadgeClass } from '../../utils/dashboardClasses';

export interface PatientsTabProps {
  patientSearch: string;
  setPatientSearch: (val: string) => void;
  riskFilter: string;
  setRiskFilter: (val: string) => void;
  filteredPatients: PatientDTO[];
  onAddPatient: () => void;
  onSelectPatient: (p: PatientDTO) => void;
  onUpdateRisk: (patientId: number, risk: NiveauRisque) => void;
}

export const PatientsTab: React.FC<PatientsTabProps> = ({
  patientSearch,
  setPatientSearch,
  riskFilter,
  setRiskFilter,
  filteredPatients,
  onAddPatient,
  onSelectPatient,
  onUpdateRisk,
}) => {
  const getDisplayRiskValue = (risk: NiveauRisque): string => {
    if (risk === 'MOYEN') return 'MODERE';
    return risk;
  };

  return (
    <div className="dash-section-sm">
      {/* Search & Action Bar */}
      <div className="dash-toolbar">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            id="patient-search-input"
            type="text"
            placeholder="Rechercher par nom, prénom ou ID..."
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            className="dash-search"
            aria-label="Rechercher par nom, prénom ou ID"
          />
          <select
            id="patient-risk-filter"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="dash-select"
            aria-label="Filtrer par niveau de risque"
          >
            <option value="ALL">Tous les risques</option>
            <option value="FAIBLE">FAIBLE</option>
            <option value="MOYEN">MOYEN</option>
            <option value="ELEVE">ÉLEVÉ</option>
            <option value="CRITIQUE">CRITIQUE</option>
          </select>
        </div>

        <button
          onClick={onAddPatient}
          className="dash-btn-gradient w-full sm:w-auto"
        >
          <span>+ Nouveau Patient</span>
        </button>
      </div>

      {/* Patient Table */}
      <div className="dash-table-wrap">
        <div className="dash-table-scroll">
          <table className="dash-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Date Naissance</th>
                <th>Sexe</th>
                <th>Niveau de Risque</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => {
                const displayName = p.nom ? `${p.prenom} ${p.nom}` : `Patient #${p.id}`;
                return (
                  <tr key={p.id}>
                    <td className="text-id">#{p.id}</td>
                    <td>
                      <span className="font-semibold text-white">{displayName}</span>
                      <div className="text-muted-xs">User ID: {p.userId}</div>
                    </td>
                    <td>{p.dateNaissance}</td>
                    <td>{p.sexe}</td>
                    <td>
                      <span className={`badge ${riskBadgeClass(p.niveauRisque)}`}>
                        {p.niveauRisque}
                      </span>
                    </td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => onSelectPatient(p)}
                        className="dash-btn-ghost"
                      >
                        Profil
                      </button>
                      <select
                        value={getDisplayRiskValue(p.niveauRisque)}
                        onChange={(e) => onUpdateRisk(p.id, e.target.value as NiveauRisque)}
                        className="dash-select text-xs"
                        aria-label={`Modifier le risque pour ${displayName}`}
                      >
                        <option value="FAIBLE">Niveau: FAIBLE</option>
                        <option value="MODERE">Niveau: MODÉRÉ</option>
                        <option value="ELEVE">Niveau: ÉLEVÉ</option>
                        <option value="CRITIQUE">Niveau: CRITIQUE</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
