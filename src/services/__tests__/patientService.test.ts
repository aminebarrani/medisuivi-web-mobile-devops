import { describe, it, expect, vi, beforeEach } from 'vitest';
import patientService from '../patientService';
import axiosInstance from '../axiosInstance';

vi.mock('../axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('patientService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch patients by medecinId and map backend gender M/F to HOMME/FEMME', async () => {
    const backendData = [
      { id: 1, userId: 101, medecinId: 5, dateNaissance: '1990-01-01', sexe: 'M', niveauRisque: 'FAIBLE', dateCreation: '2025-01-01' },
      { id: 2, userId: 102, medecinId: 5, dateNaissance: '1995-05-05', sexe: 'F', niveauRisque: 'CRITIQUE', dateCreation: '2025-02-01' },
    ];
    (axiosInstance.get as any).mockResolvedValueOnce({ data: backendData });

    const patients = await patientService.getPatientsByMedecin(5);

    expect(axiosInstance.get).toHaveBeenCalledWith('/patients/medecin/5');
    expect(patients.length).toBe(2);
    expect(patients[0].sexe).toBe('HOMME');
    expect(patients[1].sexe).toBe('FEMME');
  });

  it('should create patient profile with gender conversion', async () => {
    const createdPatient = { id: 10, userId: 200, medecinId: 1, dateNaissance: '2000-02-02', sexe: 'M', niveauRisque: 'FAIBLE' };
    (axiosInstance.post as any).mockResolvedValueOnce({ data: createdPatient });

    const result = await patientService.createPatient({
      userId: 200,
      medecinId: 1,
      dateNaissance: '2000-02-02',
      sexe: 'HOMME',
    });

    expect(axiosInstance.post).toHaveBeenCalledWith('/patients', {
      userId: 200,
      medecinId: 1,
      dateNaissance: '2000-02-02',
      sexe: 'M',
    });
    expect(result.sexe).toBe('HOMME');
  });
});