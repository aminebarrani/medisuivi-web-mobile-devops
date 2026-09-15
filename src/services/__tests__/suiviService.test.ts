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
});