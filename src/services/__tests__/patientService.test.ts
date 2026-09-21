import { describe, it, expect, vi, beforeEach } from 'vitest';
import patientService from '../patientService';
import axiosInstance from '../axiosInstance';

vi.mock('../axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
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
      niveauRisque: 'FAIBLE',
    });
    expect(result.sexe).toBe('HOMME');
  });

  it('getAllPatients maps sexe', async () => {
    (axiosInstance.get as any).mockResolvedValueOnce({ data: [{ id: 1, sexe: 'F' }] });
    const res = await patientService.getAllPatients();
    expect(axiosInstance.get).toHaveBeenCalledWith('/patients');
    expect(res[0].sexe).toBe('FEMME');
  });

  it('getPatientByUserId maps sexe with fallback HOMME', async () => {
    (axiosInstance.get as any).mockResolvedValueOnce({ data: { id: 3, sexe: 'X' } });
    const res = await patientService.getPatientByUserId(50);
    expect(axiosInstance.get).toHaveBeenCalledWith('/patients/user/50');
    expect(res.sexe).toBe('X');
  });

  it('createPatient normalizes MOYEN to MODERE and FEMME/F', async () => {
    (axiosInstance.post as any).mockResolvedValueOnce({ data: { id: 11, sexe: 'F' } });
    await patientService.createPatient({ userId: 1, medecinId: 1, dateNaissance: '2000-01-01', sexe: 'FEMME', niveauRisque: 'MOYEN' });
    expect(axiosInstance.post).toHaveBeenCalledWith('/patients', expect.objectContaining({ sexe: 'F', niveauRisque: 'MODERE' }));
  });

  it('updatePatient normalizes risk and sexe', async () => {
    (axiosInstance.put as any).mockResolvedValueOnce({ data: { id: 4, sexe: 'M' } });
    const res = await patientService.updatePatient(4, { sexe: 'HOMME', niveauRisque: 'MOYEN' });
    expect(axiosInstance.put).toHaveBeenCalledWith('/patients/4', expect.objectContaining({ sexe: 'M', niveauRisque: 'MODERE' }));
    expect(res.sexe).toBe('HOMME');
  });

  it('updateNiveauRisque patches with params and maps MOYEN', async () => {
    (axiosInstance.patch as any).mockResolvedValueOnce({ data: { id: 6, sexe: 'M' } });
    await patientService.updateNiveauRisque(6, 'MOYEN');
    expect(axiosInstance.patch).toHaveBeenCalledWith('/patients/6/niveau-risque', null, { params: { niveauRisque: 'MODERE' } });
  });

  it('deletePatient calls delete', async () => {
    (axiosInstance.delete as any).mockResolvedValueOnce({});
    await patientService.deletePatient(8);
    expect(axiosInstance.delete).toHaveBeenCalledWith('/patients/8');
  });

  it('predictRisk posts and returns payload', async () => {
    (axiosInstance.post as any).mockResolvedValueOnce({ data: { gravite: 'ELEVE', probabilities: { ELEVE: 0.6 } } });
    const res = await patientService.predictRisk(2);
    expect(axiosInstance.post).toHaveBeenCalledWith('/patients/2/predict-risk', {});
    expect(res.gravite).toBe('ELEVE');
  });

  it('createMedecin and getMedecinByUserId hit medecin endpoints', async () => {
    (axiosInstance.post as any).mockResolvedValueOnce({ data: { id: 1, userId: 9 } });
    await patientService.createMedecin({ userId: 9, specialite: 'cardio', numeroOrdre: '123' });
    expect(axiosInstance.post).toHaveBeenCalledWith('/medecins', { userId: 9, specialite: 'cardio', numeroOrdre: '123' });

    (axiosInstance.get as any).mockResolvedValueOnce({ data: { id: 1, userId: 9 } });
    expect((await patientService.getMedecinByUserId(9)).userId).toBe(9);
    expect(axiosInstance.get).toHaveBeenCalledWith('/medecins/user/9');
  });
});