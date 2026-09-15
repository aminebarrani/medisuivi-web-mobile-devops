import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../DashboardPage';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import suiviService from '../../services/suiviService';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../services/patientService', () => ({
  default: {
    getMedecinByUserId: vi.fn(),
    getPatientsByMedecin: vi.fn(),
    getAllPatients: vi.fn(),
  },
}));

vi.mock('../../services/suiviService', () => ({
  default: {
    getAlertesByMedecin: vi.fn(),
    getMesuresByMedecin: vi.fn(),
    getSymptomesByMedecin: vi.fn(),
    markAlerteTraitee: vi.fn(),
  },
}));

vi.mock('../../services/maladieService', () => ({
  default: {
    getAllMaladies: vi.fn().mockResolvedValue([]),
  },
}));

describe('DashboardPage Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: { id: 1, firstName: 'Dr', lastName: 'Gharbi', email: 'dr@test.tn' },
    });
    (patientService.getMedecinByUserId as any).mockResolvedValue({ id: 1, userId: 1, specialite: 'Cardiologue', numeroOrdre: '123' });
    (patientService.getPatientsByMedecin as any).mockResolvedValue([
      { id: 1, userId: 101, medecinId: 1, nom: 'Ben Ali', prenom: 'Mohamed', email: 'mohamed@test.tn', sexe: 'HOMME', niveauRisque: 'CRITIQUE', dateNaissance: '1985-01-01', dateCreation: '2025-01-01' }
    ]);
    (suiviService.getAlertesByMedecin as any).mockResolvedValue([
      { id: 10, patientId: 1, niveauRisque: 'CRITIQUE', source: 'SYMPTOME', description: 'Tachycardie élevée', dateCreation: '2026-09-02', traitee: false }
    ]);
    (suiviService.getMesuresByMedecin as any).mockResolvedValue([]);
    (suiviService.getSymptomesByMedecin as any).mockResolvedValue([]);
  });

  it('should render doctor dashboard with patients and active alerts', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Mohamed Ben Ali/i)).toBeInTheDocument();
      expect(screen.getByText(/Tachycardie élevée/i)).toBeInTheDocument();
    });
  });

  it('should keep an empty patient list for a new doctor and never show other doctors patients', async () => {
    (patientService.getMedecinByUserId as any).mockResolvedValue({
      id: 99,
      userId: 1,
      specialite: 'Cardiologue',
      numeroOrdre: 'DR-99',
    });
    (patientService.getPatientsByMedecin as any).mockResolvedValue([]);
    (patientService.getAllPatients as any).mockResolvedValue([
      {
        id: 5,
        userId: 130,
        medecinId: 1,
        nom: 'Other',
        prenom: 'Patient',
        sexe: 'HOMME',
        niveauRisque: 'FAIBLE',
        dateNaissance: '1990-05-15',
        dateCreation: '2025-01-01',
      },
    ]);
    (suiviService.getAlertesByMedecin as any).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Mes Patients \(0\)/i)).toBeInTheDocument();
    });
    expect(patientService.getAllPatients).not.toHaveBeenCalled();
    expect(screen.queryByText(/Patient #5/i)).not.toBeInTheDocument();
  });
});