import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertesTab } from '../AlertesTab';
import { PatientsTab } from '../PatientsTab';
import { SuiviTab } from '../SuiviTab';
import { MaladiesTab } from '../MaladiesTab';
import { OverviewTab } from '../OverviewTab';
import type { AlerteDTO, MesureDTO, SymptomeDTO } from '../../../services/suiviService';
import type { PatientDTO } from '../../../services/patientService';

const alerte = (over: Partial<AlerteDTO> = {}): AlerteDTO => ({
  id: 1, patientId: 1, niveauRisque: 'CRITIQUE', source: 'SYMPTOME',
  description: 'Crise', dateCreation: '2026-09-01T10:00:00Z', traitee: false, ...over,
});

const patient = (over: Partial<PatientDTO> = {}): PatientDTO => ({
  id: 1, userId: 10, medecinId: 5, dateNaissance: '1990-01-01',
  sexe: 'HOMME', niveauRisque: 'FAIBLE', dateCreation: '2026-01-01',
  nom: 'Ben Ali', prenom: 'Mohamed', ...over,
});

describe('AlertesTab', () => {
  it('shows empty state when no alertes', () => {
    render(<AlertesTab alertes={[]} getPatientDisplayName={() => 'P'} onMarkAlerteTraitee={() => {}} />);
    expect(screen.getByText(/Aucune alerte médicale/i)).toBeInTheDocument();
  });

  it('renders active and treated alertes and handles acknowledge', () => {
    const onMark = vi.fn();
    render(
      <AlertesTab
        alertes={[alerte({ id: 1 }), alerte({ id: 2, traitee: true })]}
        getPatientDisplayName={(id) => `Patient ${id}`}
        onMarkAlerteTraitee={onMark}
      />
    );
    expect(screen.getByText('✓ Traitée')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Marquer comme Traitée'));
    expect(onMark).toHaveBeenCalledWith(1);
  });
});

describe('PatientsTab', () => {
  it('renders table, search, filter and actions', () => {
    const setPatientSearch = vi.fn();
    const setRiskFilter = vi.fn();
    const onAddPatient = vi.fn();
    const onSelectPatient = vi.fn();
    const onUpdateRisk = vi.fn();
    render(
      <PatientsTab
        patientSearch="" setPatientSearch={setPatientSearch}
        riskFilter="ALL" setRiskFilter={setRiskFilter}
        filteredPatients={[patient({ id: 1 }), patient({ id: 2, nom: '', prenom: '', niveauRisque: 'MOYEN' })]}
        onAddPatient={onAddPatient} onSelectPatient={onSelectPatient} onUpdateRisk={onUpdateRisk}
      />
    );
    fireEvent.change(screen.getByLabelText(/Rechercher par nom/i), { target: { value: 'abc' } });
    expect(setPatientSearch).toHaveBeenCalledWith('abc');
    fireEvent.change(screen.getByLabelText(/Filtrer par niveau/i), { target: { value: 'ELEVE' } });
    expect(setRiskFilter).toHaveBeenCalledWith('ELEVE');
    fireEvent.click(screen.getByText('+ Nouveau Patient'));
    expect(onAddPatient).toHaveBeenCalled();
    const profileButtons = screen.getAllByText('Profil');
    fireEvent.click(profileButtons[0]);
    expect(onSelectPatient).toHaveBeenCalled();
    const riskSelects = screen.getAllByLabelText(/Modifier le risque/i);
    fireEvent.change(riskSelects[0], { target: { value: 'CRITIQUE' } });
    expect(onUpdateRisk).toHaveBeenCalledWith(1, 'CRITIQUE');
    expect(screen.getByText('Patient #2')).toBeInTheDocument();
  });
});

describe('SuiviTab', () => {
  it('shows empty states', () => {
    render(<SuiviTab mesures={[]} symptomes={[]} getPatientDisplayName={() => 'P'} onAddMesure={() => {}} onAddSymptome={() => {}} />);
    expect(screen.getByText(/Aucune mesure enregistrée/i)).toBeInTheDocument();
    expect(screen.getByText(/Aucun symptôme signalé/i)).toBeInTheDocument();
  });

  it('renders mesures and symptomes and triggers add buttons', () => {
    const onAddMesure = vi.fn();
    const onAddSymptome = vi.fn();
    const mesures: MesureDTO[] = [
      { id: 1, patientId: 1, typeMesure: 'TENSION', valeur: 12, unite: 'cmHg', source: 'PATIENT', dateMesure: '2026-09-01T10:00:00Z' },
      { id: 2, patientId: 1, typeMesure: 'POIDS', valeur: 70, unite: 'kg', source: 'MEDECIN', dateMesure: '2026-09-01T10:00:00Z' },
      { id: 3, patientId: 1, typeMesure: 'SPO2', valeur: 98, unite: '%', source: 'CAPTEUR', dateMesure: '2026-09-01T10:00:00Z' },
    ];
    const symptomes: SymptomeDTO[] = [
      { id: 1, patientId: 1, description: 'Douleur', gravite: 'GRAVE', dateSignalement: '2026-09-01T10:00:00Z' },
    ];
    render(
      <SuiviTab mesures={mesures} symptomes={symptomes} getPatientDisplayName={(id) => `P${id}`} onAddMesure={onAddMesure} onAddSymptome={onAddSymptome} />
    );
    fireEvent.click(screen.getByText('+ Saisir une Mesure'));
    expect(onAddMesure).toHaveBeenCalled();
    fireEvent.click(screen.getByText('+ Signaler Symptôme'));
    expect(onAddSymptome).toHaveBeenCalled();
    expect(screen.getByText('Douleur')).toBeInTheDocument();
  });
});

describe('MaladiesTab', () => {
  it('renders catalogue and add/assign buttons', () => {
    const onAddMaladie = vi.fn();
    const onAssignMaladie = vi.fn();
    render(
      <MaladiesTab
        maladies={[{ id: 1, nom: 'Diabète', description: 'desc', parametresSuivis: 'Glycémie', seuilMin: 70, seuilMax: 110 }, { id: 2, nom: 'Asthme', description: 'd2', parametresSuivis: 'SpO2' }]}
        onAddMaladie={onAddMaladie}
        onAssignMaladie={onAssignMaladie}
      />
    );
    fireEvent.click(screen.getByText('+ Nouvelle Maladie'));
    expect(onAddMaladie).toHaveBeenCalled();
    fireEvent.click(screen.getByText(/Attribuer Diagnostic/i));
    expect(onAssignMaladie).toHaveBeenCalled();
    expect(screen.getByText('Diabète')).toBeInTheDocument();
    expect(screen.getByText('Asthme')).toBeInTheDocument();
  });
});

describe('OverviewTab', () => {
  const baseProps = {
    user: { firstName: 'Ali', lastName: 'Ben' },
    patients: [patient({ id: 1, niveauRisque: 'CRITIQUE' }), patient({ id: 2, niveauRisque: 'ELEVE' }), patient({ id: 3 })],
    maladies: [{ id: 1, nom: 'Diabète', description: 'd', parametresSuivis: 'p' }],
    alertes: [alerte({ id: 1 }), alerte({ id: 2, traitee: true })],
    activeAlertsCount: 1,
    getPatientDisplayName: (id: number) => `P${id}`,
  };

  it('computes KPIs and renders alerts', () => {
    const onViewAllAlerts = vi.fn();
    const onMarkAlerteTraitee = vi.fn();
    render(
      <OverviewTab
        {...baseProps}
        onViewAllAlerts={onViewAllAlerts}
        onMarkAlerteTraitee={onMarkAlerteTraitee}
        onAddPatient={() => {}} onAssignMaladie={() => {}} onAddMesure={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Voir tout →'));
    expect(onViewAllAlerts).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Acquitter'));
    expect(onMarkAlerteTraitee).toHaveBeenCalledWith(1);
  });

  it('shows the no-active-alert message and quick actions fire', () => {
    const onAddPatient = vi.fn();
    const onAssignMaladie = vi.fn();
    const onAddMesure = vi.fn();
    render(
      <OverviewTab
        {...baseProps}
        alertes={[alerte({ id: 2, traitee: true })]}
        onViewAllAlerts={() => {}} onMarkAlerteTraitee={() => {}}
        onAddPatient={onAddPatient} onAssignMaladie={onAssignMaladie} onAddMesure={onAddMesure}
      />
    );
    expect(screen.getByText(/Aucune alerte active/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Ajouter un Patient'));
    expect(onAddPatient).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Affecter une Pathologie'));
    expect(onAssignMaladie).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Enregistrer une Mesure'));
    expect(onAddMesure).toHaveBeenCalled();
  });
});
