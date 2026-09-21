import { describe, it, expect, vi, beforeEach } from 'vitest';
import suiviService from '../suiviService';
import axiosInstance from '../axiosInstance';

vi.mock('../axiosInstance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('suiviService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch patient alertes for doctor', async () => {
    const mockAlertes = [
      { id: 100, patientId: 1, niveauRisque: 'CRITIQUE', source: 'SYMPTOME', description: 'Crise hypertensive', dateCreation: '2026-09-02', traitee: false },
    ];
    (axiosInstance.get as any).mockResolvedValueOnce({ data: mockAlertes });

    const alertes = await suiviService.getAlertesByMedecin(1);

    expect(axiosInstance.get).toHaveBeenCalledWith('/alertes/medecin/1');
    expect(alertes.length).toBe(1);
    expect(alertes[0].description).toBe('Crise hypertensive');
  });

  it('should mark alerte as traitee', async () => {
    const updatedAlerte = { id: 100, traitee: true };
    (axiosInstance.patch as any).mockResolvedValueOnce({ data: updatedAlerte });

    const result = await suiviService.markAlerteTraitee(100);

    expect(axiosInstance.patch).toHaveBeenCalledWith('/alertes/100/traiter');
    expect(result.traitee).toBe(true);
  });

  it('covers mesure endpoints', async () => {
    (axiosInstance.get as any).mockResolvedValueOnce({ data: [{ id: 1 }] });
    expect((await suiviService.getMesuresByMedecin(3)).length).toBe(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/mesures/medecin/3');

    (axiosInstance.get as any).mockResolvedValueOnce({ data: [{ id: 2 }] });
    expect((await suiviService.getMesuresByPatient(9))[0].id).toBe(2);
    expect(axiosInstance.get).toHaveBeenCalledWith('/mesures/patient/9');

    (axiosInstance.post as any).mockResolvedValueOnce({ data: { id: 3 } });
    const mesure = { patientId: 9, typeMesure: 'TENSION' as const, valeur: 12, unite: 'cmHg', source: 'MEDECIN' as const };
    expect((await suiviService.createMesure(mesure)).id).toBe(3);
    expect(axiosInstance.post).toHaveBeenCalledWith('/mesures', mesure);
  });

  it('covers symptome endpoints', async () => {
    (axiosInstance.get as any).mockResolvedValueOnce({ data: [{ id: 1 }] });
    expect((await suiviService.getSymptomesByMedecin(3)).length).toBe(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/symptomes/medecin/3');

    (axiosInstance.get as any).mockResolvedValueOnce({ data: [{ id: 2 }] });
    expect((await suiviService.getSymptomesByPatient(9))[0].id).toBe(2);
    expect(axiosInstance.get).toHaveBeenCalledWith('/symptomes/patient/9');

    (axiosInstance.post as any).mockResolvedValueOnce({ data: { id: 4 } });
    const symptome = { patientId: 9, description: 'douleur', gravite: 'GRAVE' as const };
    expect((await suiviService.createSymptome(symptome)).id).toBe(4);
    expect(axiosInstance.post).toHaveBeenCalledWith('/symptomes', symptome);
  });

  it('covers remaining alerte endpoints', async () => {
    (axiosInstance.get as any).mockResolvedValueOnce({ data: [{ id: 5 }] });
    expect((await suiviService.getAlertesByPatient(9))[0].id).toBe(5);
    expect(axiosInstance.get).toHaveBeenCalledWith('/alertes/patient/9');

    (axiosInstance.post as any).mockResolvedValueOnce({ data: { id: 6 } });
    const alerte = { patientId: 9, niveauRisque: 'ELEVE' as const, source: 'MESURE' as const, description: 'd' };
    expect((await suiviService.createAlerte(alerte)).id).toBe(6);
    expect(axiosInstance.post).toHaveBeenCalledWith('/alertes', alerte);
  });
});