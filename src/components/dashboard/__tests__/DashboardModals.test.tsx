import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardModals } from '../DashboardModals';
import type { PatientDTO } from '../../../services/patientService';

const patients: PatientDTO[] = [
  { id: 1, userId: 10, medecinId: 5, dateNaissance: '1990-01-01', sexe: 'HOMME', niveauRisque: 'FAIBLE', dateCreation: '2026-01-01', nom: 'Ali', prenom: 'Mohamed' },
  { id: 2, userId: 11, medecinId: 5, dateNaissance: '1992-02-02', sexe: 'FEMME', niveauRisque: 'ELEVE', dateCreation: '2026-01-02' },
];
const maladies = [{ id: 1, nom: 'Diabète', description: 'd', parametresSuivis: 'p' }];

const noop = () => {};
const setState = () => noop as any;

function baseProps(over: Partial<React.ComponentProps<typeof DashboardModals>> = {}) {
  return {
    showAddPatientModal: false, setShowAddPatientModal: vi.fn(),
    newPatientForm: { username: '', email: '', password: '', nom: '', prenom: '', dateNaissance: '', sexe: 'HOMME' as const, niveauRisque: 'FAIBLE' as const },
    setNewPatientForm: vi.fn(),
    handleAddPatient: vi.fn(),
    showAddMaladieModal: false, setShowAddMaladieModal: vi.fn(),
    newMaladieForm: { nom: '', description: '', parametresSuivis: '', seuilMin: '', seuilMax: '' },
    setNewMaladieForm: vi.fn(),
    handleAddMaladie: vi.fn(),
    showAssignMaladieModal: false, setShowAssignMaladieModal: vi.fn(),
    assignMaladieForm: { patientId: 0, maladieId: 0, dateDiagnostic: '' },
    setAssignMaladieForm: vi.fn(),
    handleAssignMaladie: vi.fn(),
    showAddMesureModal: false, setShowAddMesureModal: vi.fn(),
    newMesureForm: { patientId: 0, typeMesure: 'TENSION' as const, valeur: '', unite: '', source: 'MEDECIN' as const },
    setNewMesureForm: vi.fn(),
    handleMeasureTypeChange: vi.fn(),
    handleAddMesure: vi.fn(),
    showAddSymptomeModal: false, setShowAddSymptomeModal: vi.fn(),
    newSymptomeForm: { patientId: 0, description: '', gravite: 'FAIBLE' as const },
    setNewSymptomeForm: vi.fn(),
    handleAddSymptome: vi.fn(),
    selectedPatient: null as PatientDTO | null, setSelectedPatient: vi.fn(),
    predictingRisk: false,
    predictionResult: null as { gravite: string; probabilities: Record<string, number> } | null,
    handlePredictRisk: vi.fn(),
    patients, maladies,
    ...over,
  } as any;
}

describe('DashboardModals', () => {
  it('renders nothing when all modals closed', () => {
    const { container } = render(<DashboardModals {...baseProps()} />);
    expect(container.querySelector('.modal-overlay')).toBeNull();
  });

  it('add patient modal: fields, cancel and submit', () => {
    const props = baseProps({ showAddPatientModal: true });
    render(<DashboardModals {...props} />);
    fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'X' } });
    expect(props.setNewPatientForm).toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Sexe'), { target: { value: 'FEMME' } });
    fireEvent.change(screen.getByLabelText('Risque Initial'), { target: { value: 'ELEVE' } });
    fireEvent.click(screen.getByText('Annuler'));
    expect(props.setShowAddPatientModal).toHaveBeenCalledWith(false);
    fireEvent.submit(screen.getByText('Créer Patient').closest('form')!);
    expect(props.handleAddPatient).toHaveBeenCalled();
  });

  it('add maladie modal: fields, cancel and submit', () => {
    const props = baseProps({ showAddMaladieModal: true });
    render(<DashboardModals {...props} />);
    fireEvent.change(screen.getByLabelText('Nom de la maladie'), { target: { value: 'Asthme' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'd' } });
    fireEvent.change(screen.getByLabelText('Seuil Min'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Seuil Max'), { target: { value: '9' } });
    expect(props.setNewMaladieForm).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Annuler'));
    expect(props.setShowAddMaladieModal).toHaveBeenCalledWith(false);
    fireEvent.submit(screen.getByText('Enregistrer Pathologie').closest('form')!);
    expect(props.handleAddMaladie).toHaveBeenCalled();
  });

  it('assign maladie modal: selects, cancel and submit', () => {
    const props = baseProps({ showAssignMaladieModal: true });
    render(<DashboardModals {...props} />);
    fireEvent.change(screen.getByLabelText('Sélectionner Patient'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Sélectionner Pathologie'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Date Diagnostic'), { target: { value: '2026-01-01' } });
    expect(props.setAssignMaladieForm).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Annuler'));
    expect(props.setShowAssignMaladieModal).toHaveBeenCalledWith(false);
    fireEvent.submit(screen.getByText('Confirmer Affectation').closest('form')!);
    expect(props.handleAssignMaladie).toHaveBeenCalled();
  });

  it('add mesure modal: selects, type change, cancel and submit', () => {
    const props = baseProps({ showAddMesureModal: true });
    render(<DashboardModals {...props} />);
    fireEvent.change(screen.getByLabelText('Patient'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Type de mesure'), { target: { value: 'GLYCEMIE' } });
    expect(props.handleMeasureTypeChange).toHaveBeenCalledWith('GLYCEMIE');
    fireEvent.change(screen.getByLabelText('Source'), { target: { value: 'PATIENT' } });
    fireEvent.change(screen.getByLabelText('Valeur'), { target: { value: '1.2' } });
    fireEvent.change(screen.getByLabelText('Unité'), { target: { value: 'g/L' } });
    expect(props.setNewMesureForm).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Annuler'));
    expect(props.setShowAddMesureModal).toHaveBeenCalledWith(false);
    fireEvent.submit(screen.getByText('Enregistrer Mesure').closest('form')!);
    expect(props.handleAddMesure).toHaveBeenCalled();
  });

  it('add symptome modal: fields, cancel and submit', () => {
    const props = baseProps({ showAddSymptomeModal: true });
    render(<DashboardModals {...props} />);
    fireEvent.change(screen.getByLabelText('Patient'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'douleur' } });
    fireEvent.change(screen.getByLabelText('Gravité'), { target: { value: 'GRAVE' } });
    expect(props.setNewSymptomeForm).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Annuler'));
    expect(props.setShowAddSymptomeModal).toHaveBeenCalledWith(false);
    fireEvent.submit(screen.getByText('Enregistrer Symptôme').closest('form')!);
    expect(props.handleAddSymptome).toHaveBeenCalled();
  });

  it('patient details modal without prediction result', () => {
    const props = baseProps({ selectedPatient: patients[0] });
    render(<DashboardModals {...props} />);
    expect(screen.getByText(/Dossier de suivi clinique/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('⚡ Évaluer Risque'));
    expect(props.handlePredictRisk).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByText('Fermer le dossier'));
    expect(props.setSelectedPatient).toHaveBeenCalledWith(null);
  });

  it('patient details modal with prediction result and predicting state', () => {
    const props = baseProps({
      selectedPatient: patients[1],
      predictingRisk: true,
      predictionResult: { gravite: 'CRITIQUE', probabilities: { FAIBLE: 0.1, MODERE: 0.2, CRITIQUE: 0.7 } },
    });
    render(<DashboardModals {...props} />);
    expect(screen.getByText('Patient #2')).toBeInTheDocument();
    expect(screen.getByText('Analyse IA en cours...')).toBeInTheDocument();
    expect(screen.getByText('Diagnostic IA Suggéré:')).toBeInTheDocument();
    expect(screen.getByText('70.0%')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Fermer le dossier'));
    expect(props.setSelectedPatient).toHaveBeenCalledWith(null);
  });
});
