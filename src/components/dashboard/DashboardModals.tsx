import React from 'react';
import type { PatientDTO, NiveauRisque, Sexe } from '../../services/patientService';
import type { MaladieDTO } from '../../services/maladieService';
import type { TypeMesure, Source, Gravite } from '../../services/suiviService';
import { riskBadgeClass } from '../../utils/dashboardClasses';

export interface DashboardModalsProps {
  showAddPatientModal: boolean;
  setShowAddPatientModal: (val: boolean) => void;
  newPatientForm: {
    username: string;
    email: string;
    password: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
    sexe: Sexe;
    niveauRisque: NiveauRisque;
  };
  setNewPatientForm: React.Dispatch<React.SetStateAction<{
    username: string;
    email: string;
    password: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
    sexe: Sexe;
    niveauRisque: NiveauRisque;
  }>>;
  handleAddPatient: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;

  showAddMaladieModal: boolean;
  setShowAddMaladieModal: (val: boolean) => void;
  newMaladieForm: {
    nom: string;
    description: string;
    parametresSuivis: string;
    seuilMin: string;
    seuilMax: string;
  };
  setNewMaladieForm: React.Dispatch<React.SetStateAction<{
    nom: string;
    description: string;
    parametresSuivis: string;
    seuilMin: string;
    seuilMax: string;
  }>>;
  handleAddMaladie: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;

  showAssignMaladieModal: boolean;
  setShowAssignMaladieModal: (val: boolean) => void;
  assignMaladieForm: {
    patientId: number;
    maladieId: number;
    dateDiagnostic: string;
  };
  setAssignMaladieForm: React.Dispatch<React.SetStateAction<{
    patientId: number;
    maladieId: number;
    dateDiagnostic: string;
  }>>;
  handleAssignMaladie: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;

  showAddMesureModal: boolean;
  setShowAddMesureModal: (val: boolean) => void;
  newMesureForm: {
    patientId: number;
    typeMesure: TypeMesure;
    valeur: string;
    unite: string;
    source: Source;
  };
  setNewMesureForm: React.Dispatch<React.SetStateAction<{
    patientId: number;
    typeMesure: TypeMesure;
    valeur: string;
    unite: string;
    source: Source;
  }>>;
  handleMeasureTypeChange: (type: TypeMesure) => void;
  handleAddMesure: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;

  showAddSymptomeModal: boolean;
  setShowAddSymptomeModal: (val: boolean) => void;
  newSymptomeForm: {
    patientId: number;
    description: string;
    gravite: Gravite;
  };
  setNewSymptomeForm: React.Dispatch<React.SetStateAction<{
    patientId: number;
    description: string;
    gravite: Gravite;
  }>>;
  handleAddSymptome: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;

  selectedPatient: PatientDTO | null;
  setSelectedPatient: (p: PatientDTO | null) => void;
  predictingRisk: boolean;
  predictionResult: {
    gravite: string;
    probabilities: Record<string, number>;
    explanations?: string[];
    agent?: {
      synthese_titre?: string;
      synthese_clinique_medecin?: { conclusion?: string; drivers_statistiques?: string };
    };
  } | null;
  handlePredictRisk: (patientId: number) => Promise<void>;
  patients: PatientDTO[];
  maladies: MaladieDTO[];
}

const getPredictionBadgeClass = (gravite: string): string => {
  if (gravite === 'CRITIQUE') return 'badge-risk-critique';
  if (gravite === 'ELEVE') return 'badge-risk-eleve';
  if (gravite === 'MOYEN') return 'badge-risk-moyen';
  return 'badge-risk-faible';
};

export const DashboardModals: React.FC<DashboardModalsProps> = ({
  showAddPatientModal,
  setShowAddPatientModal,
  newPatientForm,
  setNewPatientForm,
  handleAddPatient,
  showAddMaladieModal,
  setShowAddMaladieModal,
  newMaladieForm,
  setNewMaladieForm,
  handleAddMaladie,
  showAssignMaladieModal,
  setShowAssignMaladieModal,
  assignMaladieForm,
  setAssignMaladieForm,
  handleAssignMaladie,
  showAddMesureModal,
  setShowAddMesureModal,
  newMesureForm,
  setNewMesureForm,
  handleMeasureTypeChange,
  handleAddMesure,
  showAddSymptomeModal,
  setShowAddSymptomeModal,
  newSymptomeForm,
  setNewSymptomeForm,
  handleAddSymptome,
  selectedPatient,
  setSelectedPatient,
  predictingRisk,
  predictionResult,
  handlePredictRisk,
  patients,
  maladies,
}) => (
  <>
    {/* MODAL 1: Add Patient */}
    {showAddPatientModal && (
      <div className="modal-overlay">
        <div className="modal-box">
          <h3 className="text-xl font-bold text-white">Nouveau Patient</h3>
          <form onSubmit={handleAddPatient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-patient-prenom" className="dash-label">Prénom</label>
                <input
                  id="add-patient-prenom"
                  type="text"
                  placeholder="ex: Mohamed"
                  value={newPatientForm.prenom}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, prenom: e.target.value })}
                  className="dash-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="add-patient-nom" className="dash-label">Nom</label>
                <input
                  id="add-patient-nom"
                  type="text"
                  placeholder="ex: Ben Ali"
                  value={newPatientForm.nom}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, nom: e.target.value })}
                  className="dash-input"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-patient-username" className="dash-label">Nom d'utilisateur (Login)</label>
                <input
                  id="add-patient-username"
                  type="text"
                  placeholder="ex: mohamed.ali"
                  value={newPatientForm.username}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, username: e.target.value })}
                  className="dash-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="add-patient-dateNaissance" className="dash-label">Date de Naissance</label>
                <input
                  id="add-patient-dateNaissance"
                  type="date"
                  value={newPatientForm.dateNaissance}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, dateNaissance: e.target.value })}
                  className="dash-input"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-patient-email" className="dash-label">Adresse Email</label>
                <input
                  id="add-patient-email"
                  type="email"
                  placeholder="ex: patient@email.com"
                  value={newPatientForm.email}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                  className="dash-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="add-patient-password" className="dash-label">Mot de passe temporaire</label>
                <input
                  id="add-patient-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPatientForm.password}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, password: e.target.value })}
                  className="dash-input"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-patient-sexe" className="dash-label">Sexe</label>
                <select
                  id="add-patient-sexe"
                  value={newPatientForm.sexe}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, sexe: e.target.value as Sexe })}
                  className="dash-select"
                >
                  <option value="HOMME">HOMME</option>
                  <option value="FEMME">FEMME</option>
                </select>
              </div>
              <div>
                <label htmlFor="add-patient-risk" className="dash-label">Risque Initial</label>
                <select
                  id="add-patient-risk"
                  value={newPatientForm.niveauRisque}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, niveauRisque: e.target.value as NiveauRisque })}
                  className="dash-select"
                >
                  <option value="FAIBLE">FAIBLE</option>
                  <option value="MODERE">MODÉRÉ</option>
                  <option value="ELEVE">ÉLEVÉ</option>
                  <option value="CRITIQUE">CRITIQUE</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddPatientModal(false)}
                className="dash-btn-ghost"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="dash-btn-gradient"
              >
                Créer Patient
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* MODAL 2: Add Maladie */}
    {showAddMaladieModal && (
      <div className="modal-overlay">
        <div className="modal-box">
          <h3 className="text-xl font-bold text-white">Créer une Pathologie Clinique</h3>
          <form onSubmit={handleAddMaladie} className="space-y-4">
            <div>
              <label htmlFor="add-maladie-nom" className="dash-label">Nom de la maladie</label>
              <input
                id="add-maladie-nom"
                type="text"
                placeholder="ex: Hypertension Artérielle"
                value={newMaladieForm.nom}
                onChange={(e) => setNewMaladieForm({ ...newMaladieForm, nom: e.target.value })}
                className="dash-input"
                required
              />
            </div>
            <div>
              <label htmlFor="add-maladie-desc" className="dash-label">Description</label>
              <textarea
                id="add-maladie-desc"
                placeholder="Description clinique du protocole..."
                value={newMaladieForm.description}
                onChange={(e) => setNewMaladieForm({ ...newMaladieForm, description: e.target.value })}
                className="dash-input"
                rows={2}
                required
              />
            </div>
            <div>
              <label htmlFor="add-maladie-params" className="dash-label">Paramètres Suivis</label>
              <input
                id="add-maladie-params"
                type="text"
                placeholder="Tension Systolique, Tension Diastolique..."
                value={newMaladieForm.parametresSuivis}
                onChange={(e) => setNewMaladieForm({ ...newMaladieForm, parametresSuivis: e.target.value })}
                className="dash-input"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-maladie-seuilMin" className="dash-label">Seuil Min</label>
                <input
                  id="add-maladie-seuilMin"
                  type="number"
                  placeholder="90"
                  value={newMaladieForm.seuilMin}
                  onChange={(e) => setNewMaladieForm({ ...newMaladieForm, seuilMin: e.target.value })}
                  className="dash-input"
                />
              </div>
              <div>
                <label htmlFor="add-maladie-seuilMax" className="dash-label">Seuil Max</label>
                <input
                  id="add-maladie-seuilMax"
                  type="number"
                  placeholder="140"
                  value={newMaladieForm.seuilMax}
                  onChange={(e) => setNewMaladieForm({ ...newMaladieForm, seuilMax: e.target.value })}
                  className="dash-input"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddMaladieModal(false)}
                className="dash-btn-ghost"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="dash-btn-secondary"
              >
                Enregistrer Pathologie
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* MODAL 3: Assign Maladie */}
    {showAssignMaladieModal && (
      <div className="modal-overlay">
        <div className="modal-box">
          <h3 className="text-xl font-bold text-white">Affecter Diagnostic au Patient</h3>
          <form onSubmit={handleAssignMaladie} className="space-y-4">
            <div>
              <label htmlFor="assign-maladie-patient" className="dash-label">Sélectionner Patient</label>
              <select
                id="assign-maladie-patient"
                value={assignMaladieForm.patientId}
                onChange={(e) => setAssignMaladieForm({ ...assignMaladieForm, patientId: Number(e.target.value) })}
                className="dash-select"
                required
              >
                <option value={0} disabled>Choisir un patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} - {p.nom ? `${p.prenom} ${p.nom}` : `Patient #${p.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="assign-maladie-select" className="dash-label">Sélectionner Pathologie</label>
              <select
                id="assign-maladie-select"
                value={assignMaladieForm.maladieId}
                onChange={(e) => setAssignMaladieForm({ ...assignMaladieForm, maladieId: Number(e.target.value) })}
                className="dash-select"
                required
              >
                <option value={0} disabled>Choisir une maladie...</option>
                {maladies.map((m) => (
                  <option key={m.id} value={m.id}>
                    #{m.id} - {m.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="assign-maladie-date" className="dash-label">Date Diagnostic</label>
              <input
                id="assign-maladie-date"
                type="date"
                value={assignMaladieForm.dateDiagnostic}
                onChange={(e) => setAssignMaladieForm({ ...assignMaladieForm, dateDiagnostic: e.target.value })}
                className="dash-input"
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAssignMaladieModal(false)}
                className="dash-btn-ghost"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="dash-btn-gradient"
              >
                Confirmer Affectation
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* MODAL 4: Add Mesure */}
    {showAddMesureModal && (
      <div className="modal-overlay">
        <div className="modal-box">
          <h3 className="text-xl font-bold text-white">Saisir une Constante Médicale</h3>
          <form onSubmit={handleAddMesure} className="space-y-4">
            <div>
              <label htmlFor="add-mesure-patient" className="dash-label">Patient</label>
              <select
                id="add-mesure-patient"
                value={newMesureForm.patientId}
                onChange={(e) => setNewMesureForm({ ...newMesureForm, patientId: Number(e.target.value) })}
                className="dash-select"
                required
              >
                <option value={0} disabled>Choisir un patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} - {p.nom ? `${p.prenom} ${p.nom}` : `Patient #${p.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-mesure-type" className="dash-label">Type de mesure</label>
                <select
                  id="add-mesure-type"
                  value={newMesureForm.typeMesure}
                  onChange={(e) => handleMeasureTypeChange(e.target.value as TypeMesure)}
                  className="dash-select"
                >
                  <option value="FREQUENCE_CARDIAQUE">Fréquence Cardiaque</option>
                  <option value="GLYCEMIE">Glycémie</option>
                  <option value="TENSION">Tension Artérielle</option>
                  <option value="TEMPERATURE">Température</option>
                  <option value="POIDS">Poids</option>
                  <option value="SPO2">SpO2</option>
                </select>
              </div>
              <div>
                <label htmlFor="add-mesure-source" className="dash-label">Source</label>
                <select
                  id="add-mesure-source"
                  value={newMesureForm.source}
                  onChange={(e) => setNewMesureForm({ ...newMesureForm, source: e.target.value as Source })}
                  className="dash-select"
                >
                  <option value="MEDECIN">Médecin (Cabinet)</option>
                  <option value="PATIENT">Patient (Auto-mesure)</option>
                  <option value="CAPTEUR">Capteur / Connecté</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="add-mesure-valeur" className="dash-label">Valeur</label>
                <input
                  id="add-mesure-valeur"
                  type="number"
                  step="0.1"
                  placeholder="ex: 120"
                  value={newMesureForm.valeur}
                  onChange={(e) => setNewMesureForm({ ...newMesureForm, valeur: e.target.value })}
                  className="dash-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="add-mesure-unite" className="dash-label">Unité</label>
                <input
                  id="add-mesure-unite"
                  type="text"
                  value={newMesureForm.unite}
                  onChange={(e) => setNewMesureForm({ ...newMesureForm, unite: e.target.value })}
                  className="dash-input"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddMesureModal(false)}
                className="dash-btn-ghost"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="dash-btn-teal"
              >
                Enregistrer Mesure
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* MODAL 5: Add Symptome */}
    {showAddSymptomeModal && (
      <div className="modal-overlay">
        <div className="modal-box">
          <h3 className="text-xl font-bold text-white">Signaler un Nouveau Symptôme</h3>
          <form onSubmit={handleAddSymptome} className="space-y-4">
            <div>
              <label htmlFor="add-symptome-patient" className="dash-label">Patient</label>
              <select
                id="add-symptome-patient"
                value={newSymptomeForm.patientId}
                onChange={(e) => setNewSymptomeForm({ ...newSymptomeForm, patientId: Number(e.target.value) })}
                className="dash-select"
                required
              >
                <option value={0} disabled>Choisir un patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} - {p.nom ? `${p.prenom} ${p.nom}` : `Patient #${p.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="add-symptome-desc" className="dash-label">Description</label>
              <textarea
                id="add-symptome-desc"
                placeholder="Précisez le symptôme constaté (ex: Douleurs thoraciques intenses au repos)..."
                value={newSymptomeForm.description}
                onChange={(e) => setNewSymptomeForm({ ...newSymptomeForm, description: e.target.value })}
                className="dash-input"
                rows={3}
                required
              />
            </div>
            <div>
              <label htmlFor="add-symptome-gravite" className="dash-label">Gravité</label>
              <select
                id="add-symptome-gravite"
                value={newSymptomeForm.gravite}
                onChange={(e) => setNewSymptomeForm({ ...newSymptomeForm, gravite: e.target.value as Gravite })}
                className="dash-select"
              >
                <option value="FAIBLE">FAIBLE (Gêne mineure)</option>
                <option value="MODERE">MODÉRÉ (Impact quotidien)</option>
                <option value="GRAVE">GRAVE (Alerte clinique urgente)</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddSymptomeModal(false)}
                className="dash-btn-ghost"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="dash-btn-amber"
              >
                Enregistrer Symptôme
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* MODAL 6: Patient Details & AI Risk Predictor */}
    {selectedPatient && (
      <div className="modal-overlay">
        <div className="modal-box">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">
                {selectedPatient.nom ? `${selectedPatient.prenom} ${selectedPatient.nom}` : `Patient #${selectedPatient.id}`}
              </h3>
              <p className="text-sm text-teal-400">Dossier de suivi clinique n°{selectedPatient.id}</p>
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="text-slate-400 hover:text-white text-lg p-2"
              aria-label="Fermer le dossier"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="dash-meta-panel">
              <span className="text-xs text-slate-400 block">Nom & Prénom</span>
              <span className="font-semibold text-white">{selectedPatient.prenom || 'N/A'} {selectedPatient.nom || ''}</span>
            </div>
            <div className="dash-meta-panel">
              <span className="text-xs text-slate-400 block">User ID</span>
              <span className="font-semibold text-white">#{selectedPatient.userId}</span>
            </div>
            <div className="dash-meta-panel">
              <span className="text-xs text-slate-400 block">Date de Naissance</span>
              <span className="font-semibold text-white">{selectedPatient.dateNaissance}</span>
            </div>
            <div className="dash-meta-panel">
              <span className="text-xs text-slate-400 block">Sexe</span>
              <span className="font-semibold text-white">{selectedPatient.sexe}</span>
            </div>
          </div>

          <div className="dash-meta-panel mb-6">
            <span className="text-xs text-slate-400 block">Niveau de Risque Actuel</span>
            <span className={`badge ${riskBadgeClass(selectedPatient.niveauRisque)} mt-1`}>
              {selectedPatient.niveauRisque}
            </span>
          </div>

          {/* AI Clinical Risk Engine */}
          <div className="dash-ai-panel">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <h4 className="text-md font-bold text-white">Moteur Prédictif IA — Risque Clinique</h4>
                  <p className="text-xs text-slate-400">Calcul basé sur les mesures des 14j et les symptômes</p>
                </div>
              </div>
              <button
                onClick={() => handlePredictRisk(selectedPatient.id)}
                disabled={predictingRisk}
                className="dash-btn-cyan text-xs"
              >
                {predictingRisk ? 'Analyse IA en cours...' : '⚡ Évaluer Risque'}
              </button>
            </div>

            {predictionResult && (
              <div className="dash-ai-result">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">Diagnostic IA Suggéré:</span>
                  <span className={`badge ${getPredictionBadgeClass(predictionResult.gravite)}`}>
                    {predictionResult.gravite}
                  </span>
                </div>
                {predictionResult.probabilities && (
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    {Object.entries(predictionResult.probabilities).map(([key, val]) => (
                      <div key={key} className="bg-slate-900/60 p-2 rounded border border-white/5">
                        <span className="text-slate-400 font-mono">{key} :</span>
                        <span className="font-bold text-teal-400 ml-1">{(val * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {predictionResult.explanations && predictionResult.explanations.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                      Facteurs SHAP dominants
                    </span>
                    <ul className="mt-2 space-y-1.5">
                      {predictionResult.explanations.map((exp, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="text-amber-400 mt-0.5">▲</span>
                          <span>{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {predictionResult.agent?.synthese_clinique_medecin?.conclusion && (
                  <div className="mt-4 bg-slate-900/60 p-3 rounded border border-white/5">
                    <span className="text-xs font-semibold text-teal-300 uppercase tracking-wide">
                      Synthèse clinique (IA)
                    </span>
                    <p className="mt-1.5 text-xs text-slate-200 leading-relaxed">
                      {predictionResult.agent.synthese_clinique_medecin.conclusion}
                    </p>
                    {predictionResult.agent.synthese_clinique_medecin.drivers_statistiques && (
                      <p className="mt-1.5 text-[11px] text-slate-400 italic">
                        {predictionResult.agent.synthese_clinique_medecin.drivers_statistiques}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => setSelectedPatient(null)}
              className="dash-btn-ghost"
            >
              Fermer le dossier
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
