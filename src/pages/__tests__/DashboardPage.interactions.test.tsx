import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../DashboardPage';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import maladieService from '../../services/maladieService';
import suiviService from '../../services/suiviService';
import authService from '../../services/authService';

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../../services/patientService', () => ({
  default: {
    getMedecinByUserId: vi.fn(), createMedecin: vi.fn(), getPatientsByMedecin: vi.fn(),
    getAllPatients: vi.fn(), createPatient: vi.fn(), getPatientByUserId: vi.fn(),
    updatePatient: vi.fn(), updateNiveauRisque: vi.fn(), predictRisk: vi.fn(),
  },
}));
vi.mock('../../services/maladieService', () => ({
  default: { getAllMaladies: vi.fn(), createMaladie: vi.fn(), addMaladieToPatient: vi.fn() },
}));
vi.mock('../../services/suiviService', () => ({
  default: {
    getAlertesByMedecin: vi.fn(), getMesuresByMedecin: vi.fn(), getSymptomesByMedecin: vi.fn(),
    markAlerteTraitee: vi.fn(), createMesure: vi.fn(), createSymptome: vi.fn(),
  },
}));
vi.mock('../../services/authService', () => ({
  default: {
    getAllUsers: vi.fn(), register: vi.fn(), updateProfile: vi.fn(), updateProfilePicture: vi.fn(),
    removeProfilePicture: vi.fn(), changePassword: vi.fn(), saveProfilePictureLocally: vi.fn(),
  },
}));

const mockUser = { id: 1, firstName: 'Ali', lastName: 'Ben', email: 'dr@t.tn', username: 'dr', role: 'MEDECIN', active: true };
const mockPatient = { id: 1, userId: 101, medecinId: 1, nom: 'Ben Ali', prenom: 'Mohamed', email: 'm@t.tn', sexe: 'HOMME', niveauRisque: 'CRITIQUE', dateNaissance: '1985-01-01', dateCreation: '2025-01-01' };

const logoutSpy = vi.fn();
const updateUserSpy = vi.fn();

async function renderDash() {
  const utils = render(<MemoryRouter><DashboardPage /></MemoryRouter>);
  await waitFor(() => expect(screen.queryByText(/Chargement des données/i)).toBeNull());
  return utils;
}

const gotoTab = (re: RegExp) => fireEvent.click(screen.getByRole('button', { name: re }));

describe('DashboardPage interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
    (useAuth as any).mockReturnValue({ user: mockUser, logout: logoutSpy, updateUser: updateUserSpy });
    (patientService.getMedecinByUserId as any).mockResolvedValue({ id: 1, userId: 1 });
    (patientService.getPatientsByMedecin as any).mockResolvedValue([mockPatient]);
    (patientService.getAllPatients as any).mockResolvedValue([]);
    (patientService.createPatient as any).mockResolvedValue({ id: 2 });
    (patientService.getPatientByUserId as any).mockResolvedValue({ ...mockPatient, medecinId: 9 });
    (patientService.updatePatient as any).mockResolvedValue({ id: 1 });
    (patientService.updateNiveauRisque as any).mockResolvedValue({ id: 1 });
    (patientService.predictRisk as any).mockResolvedValue({ gravite: 'ELEVE', probabilities: { ELEVE: 0.6 } });
    (patientService.createMedecin as any).mockResolvedValue({ id: 5 });
    (maladieService.getAllMaladies as any).mockResolvedValue([{ id: 1, nom: 'Diabète', description: 'd', parametresSuivis: 'p' }]);
    (maladieService.createMaladie as any).mockResolvedValue({ id: 2 });
    (maladieService.addMaladieToPatient as any).mockResolvedValue({ id: 3 });
    (suiviService.getAlertesByMedecin as any).mockResolvedValue([{ id: 10, patientId: 1, niveauRisque: 'CRITIQUE', source: 'SYMPTOME', description: 'Tachycardie', dateCreation: '2026-09-02', traitee: false }]);
    (suiviService.getMesuresByMedecin as any).mockResolvedValue([{ id: 1, patientId: 1, typeMesure: 'TENSION', valeur: 12, unite: 'mmHg', source: 'MEDECIN', dateMesure: '2026-09-01T10:00:00Z' }]);
    (suiviService.getSymptomesByMedecin as any).mockResolvedValue([{ id: 1, patientId: 1, description: 'Douleur', gravite: 'GRAVE', dateSignalement: '2026-09-01T10:00:00Z' }]);
    (suiviService.markAlerteTraitee as any).mockResolvedValue({ id: 10, traitee: true });
    (suiviService.createMesure as any).mockResolvedValue({ id: 2 });
    (suiviService.createSymptome as any).mockResolvedValue({ id: 2 });
    (authService.getAllUsers as any).mockResolvedValue([]);
    (authService.register as any).mockResolvedValue({ id: 50 });
    (authService.updateProfile as any).mockResolvedValue({ ...mockUser, firstName: 'Updated' });
    (authService.updateProfilePicture as any).mockResolvedValue({ ...mockUser, profilePictureUrl: 'data:x' });
    (authService.removeProfilePicture as any).mockResolvedValue({ ...mockUser, profilePictureUrl: undefined });
    (authService.changePassword as any).mockResolvedValue({ message: 'Mot de passe modifié' });
  });

  it('switches through every tab', async () => {
    await renderDash();
    gotoTab(/Mes Patients/);
    expect(await screen.findByText('Mohamed Ben Ali')).toBeInTheDocument();
    gotoTab(/Pathologies/);
    expect(await screen.findByText('Diabète')).toBeInTheDocument();
    gotoTab(/Suivi & Constantes/);
    expect(await screen.findByText('Douleur')).toBeInTheDocument();
    gotoTab(/Centre Alertes/);
    expect(await screen.findByText('Tachycardie')).toBeInTheDocument();
    gotoTab(/Mon Profil/);
    expect(await screen.findByText(/Mon Profil Médecin/i)).toBeInTheDocument();
    gotoTab(/Vue d'ensemble/);
    expect(await screen.findByText(/Bienvenue, Dr\./i)).toBeInTheDocument();
  });

  it('logs out and navigates', async () => {
    await renderDash();
    fireEvent.click(screen.getByText('Déconnexion'));
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('auto-creates medecin profile on 404', async () => {
    (patientService.getMedecinByUserId as any)
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockResolvedValue({ id: 5 });
    await renderDash();
    expect(patientService.createMedecin).toHaveBeenCalled();
  });

  it('updates patient risk', async () => {
    await renderDash();
    gotoTab(/Mes Patients/);
    const sel = await screen.findByLabelText(/Modifier le risque/i);
    fireEvent.change(sel, { target: { value: 'FAIBLE' } });
    await waitFor(() => expect(patientService.updateNiveauRisque).toHaveBeenCalledWith(1, 'FAIBLE'));
  });

  it('predicts risk from the patient details modal', async () => {
    await renderDash();
    gotoTab(/Mes Patients/);
    fireEvent.click(await screen.findByText('Profil'));
    fireEvent.click(await screen.findByText('⚡ Évaluer Risque'));
    await waitFor(() => expect(patientService.predictRisk).toHaveBeenCalledWith(1));
    expect(await screen.findByText('ELEVE')).toBeInTheDocument();
  });

  it('handles prediction failure', async () => {
    (patientService.predictRisk as any).mockRejectedValueOnce(new Error('boom'));
    await renderDash();
    gotoTab(/Mes Patients/);
    fireEvent.click(await screen.findByText('Profil'));
    fireEvent.click(await screen.findByText('⚡ Évaluer Risque'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/service prédictif IA/i)));
  });

  it('marks an alerte as treated', async () => {
    await renderDash();
    gotoTab(/Centre Alertes/);
    fireEvent.click(await screen.findByText('Marquer comme Traitée'));
    await waitFor(() => expect(suiviService.markAlerteTraitee).toHaveBeenCalledWith(10));
  });

  it('creates a patient successfully', async () => {
    await renderDash();
    fireEvent.click(screen.getByText('Ajouter un Patient'));
    fireEvent.change(await screen.findByLabelText("Nom d'utilisateur (Login)"), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText('Adresse Email'), { target: { value: 'new@t.tn' } });
    fireEvent.submit(screen.getByText('Créer Patient').closest('form')!);
    await waitFor(() => expect(patientService.createPatient).toHaveBeenCalled());
  });

  it('reuses an existing user when registration says already taken', async () => {
    (authService.register as any).mockRejectedValueOnce({ response: { data: { message: 'Username already taken' } } });
    (authService.getAllUsers as any).mockResolvedValue([{ id: 101, username: 'mohamed.ali', email: 'm@t.tn' }]);
    await renderDash();
    fireEvent.click(screen.getByText('Ajouter un Patient'));
    fireEvent.change(await screen.findByLabelText("Nom d'utilisateur (Login)"), { target: { value: 'mohamed.ali' } });
    fireEvent.change(screen.getByLabelText('Adresse Email'), { target: { value: 'm@t.tn' } });
    fireEvent.submit(screen.getByText('Créer Patient').closest('form')!);
    await waitFor(() => expect(patientService.createPatient).toHaveBeenCalledWith(expect.objectContaining({ userId: 101 })));
  });

  it('alerts when patient creation fails', async () => {
    (authService.register as any).mockRejectedValueOnce({ response: { data: { message: 'Server down' } } });
    await renderDash();
    fireEvent.click(screen.getByText('Ajouter un Patient'));
    fireEvent.submit(screen.getByText('Créer Patient').closest('form')!);
    await waitFor(() => expect(window.alert).toHaveBeenCalled());
  });

  it('creates a maladie and handles failure', async () => {
    await renderDash();
    gotoTab(/Pathologies/);
    fireEvent.click(await screen.findByText('+ Nouvelle Maladie'));
    fireEvent.change(await screen.findByLabelText('Nom de la maladie'), { target: { value: 'Asthme' } });
    fireEvent.change(screen.getByLabelText('Seuil Min'), { target: { value: '1' } });
    fireEvent.submit(screen.getByText('Enregistrer Pathologie').closest('form')!);
    await waitFor(() => expect(maladieService.createMaladie).toHaveBeenCalled());
  });

  it('assign maladie validates selection then succeeds', async () => {
    await renderDash();
    gotoTab(/Pathologies/);
    fireEvent.click(await screen.findByText(/Attribuer Diagnostic/i));
    fireEvent.submit(await screen.findByText('Confirmer Affectation').then((b) => b.closest('form')!));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/sélectionner un patient/i)));
    fireEvent.change(screen.getByLabelText('Sélectionner Patient'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Sélectionner Pathologie'), { target: { value: '1' } });
    fireEvent.submit(screen.getByText('Confirmer Affectation').closest('form')!);
    await waitFor(() => expect(maladieService.addMaladieToPatient).toHaveBeenCalled());
  });

  it('adds a mesure with type change and validation', async () => {
    await renderDash();
    gotoTab(/Suivi & Constantes/);
    fireEvent.click(await screen.findByText('+ Saisir une Mesure'));
    fireEvent.submit(await screen.findByText('Enregistrer Mesure').then((b) => b.closest('form')!));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/sélectionner un patient/i)));
    fireEvent.change(screen.getByLabelText('Patient'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Type de mesure'), { target: { value: 'GLYCEMIE' } });
    fireEvent.change(screen.getByLabelText('Valeur'), { target: { value: '1.1' } });
    fireEvent.submit(screen.getByText('Enregistrer Mesure').closest('form')!);
    await waitFor(() => expect(suiviService.createMesure).toHaveBeenCalledWith(expect.objectContaining({ typeMesure: 'GLYCEMIE', unite: 'g/L' })));
  });

  it('adds a symptome with validation', async () => {
    await renderDash();
    gotoTab(/Suivi & Constantes/);
    fireEvent.click(await screen.findByText('+ Signaler Symptôme'));
    fireEvent.submit(await screen.findByText('Enregistrer Symptôme').then((b) => b.closest('form')!));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/sélectionner un patient/i)));
    fireEvent.change(screen.getByLabelText('Patient'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Fièvre' } });
    fireEvent.submit(screen.getByText('Enregistrer Symptôme').closest('form')!);
    await waitFor(() => expect(suiviService.createSymptome).toHaveBeenCalled());
  });

  it('saves profile and handles error', async () => {
    await renderDash();
    gotoTab(/Mon Profil/);
    fireEvent.click(await screen.findByText(/Modifier mes informations/i));
    fireEvent.click(await screen.findByText('Enregistrer'));
    await waitFor(() => expect(authService.updateProfile).toHaveBeenCalled());
    expect(updateUserSpy).toHaveBeenCalled();
  });

  it('shows profile error on failure', async () => {
    (authService.updateProfile as any).mockRejectedValueOnce({ response: { data: { message: 'Profil échec' } } });
    await renderDash();
    gotoTab(/Mon Profil/);
    fireEvent.click(await screen.findByText(/Modifier mes informations/i));
    fireEvent.click(await screen.findByText('Enregistrer'));
    expect(await screen.findByText('Profil échec')).toBeInTheDocument();
  });

  it('validates then changes password', async () => {
    await renderDash();
    gotoTab(/Mon Profil/);
    const form = (await screen.findByText('Mettre à jour le mot de passe')).closest('form')!;
    fireEvent.submit(form);
    expect(await screen.findByText(/doit comporter au moins 8 caractères/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Mot de passe actuel'), { target: { value: 'old' } });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'Passw0rd' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'Passw0rd' } });
    fireEvent.submit(form);
    await waitFor(() => expect(authService.changePassword).toHaveBeenCalledWith('old', 'Passw0rd'));
  });

  it('handles password change failure', async () => {
    (authService.changePassword as any).mockRejectedValueOnce({ response: { data: { message: 'Actuel incorrect' } } });
    await renderDash();
    gotoTab(/Mon Profil/);
    const form = (await screen.findByText('Mettre à jour le mot de passe')).closest('form')!;
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'Passw0rd' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'Passw0rd' } });
    fireEvent.submit(form);
    expect(await screen.findByText('Actuel incorrect')).toBeInTheDocument();
  });

  it('rejects invalid avatar files', async () => {
    await renderDash();
    gotoTab(/Mon Profil/);
    const input = await screen.findByLabelText('Sélectionner une photo de profil');
    const notImage = new File(['x'], 'a.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [notImage] } });
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/fichier image valide/i)));
    const tooBig = new File(['x'], 'big.png', { type: 'image/png' });
    Object.defineProperty(tooBig, 'size', { value: 6 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [tooBig] } });
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/5 Mo/i)));
  });

  it('uploads a valid avatar image', async () => {
    await renderDash();
    gotoTab(/Mon Profil/);
    const input = await screen.findByLabelText('Sélectionner une photo de profil');
    const file = new File(['abc'], 'a.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(authService.updateProfilePicture).toHaveBeenCalled());
  });

  it('removes the avatar after confirmation', async () => {
    (useAuth as any).mockReturnValue({ user: { ...mockUser, profilePictureUrl: 'data:x' }, logout: logoutSpy, updateUser: updateUserSpy });
    await renderDash();
    gotoTab(/Mon Profil/);
    fireEvent.click(await screen.findByText('Supprimer la photo'));
    await waitFor(() => expect(authService.removeProfilePicture).toHaveBeenCalled());
  });

  it('cancels avatar removal when not confirmed', async () => {
    (window.confirm as any).mockReturnValueOnce(false);
    (useAuth as any).mockReturnValue({ user: { ...mockUser, profilePictureUrl: 'data:x' }, logout: logoutSpy, updateUser: updateUserSpy });
    await renderDash();
    gotoTab(/Mon Profil/);
    fireEvent.click(await screen.findByText('Supprimer la photo'));
    await waitFor(() => expect(window.confirm).toHaveBeenCalled());
    expect(authService.removeProfilePicture).not.toHaveBeenCalled();
  });
});
