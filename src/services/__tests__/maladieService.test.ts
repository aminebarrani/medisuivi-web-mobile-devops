import { describe, it, expect, vi, beforeEach } from 'vitest';
import maladieService from '../maladieService';
import axiosInstance from '../axiosInstance';

vi.mock('../axiosInstance', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

describe('maladieService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getAllMaladies', async () => {
    (axiosInstance.get as any).mockResolvedValueOnce({ data: [{ id: 1 }] });
    expect((await maladieService.getAllMaladies()).length).toBe(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/maladies');
  });

  it('createMaladie', async () => {
    (axiosInstance.post as any).mockResolvedValueOnce({ data: { id: 2 } });
    const dto = { nom: 'n', description: 'd', parametresSuivis: 'p' };
    expect((await maladieService.createMaladie(dto)).id).toBe(2);
    expect(axiosInstance.post).toHaveBeenCalledWith('/maladies', dto);
  });

  it('addMaladieToPatient', async () => {
    (axiosInstance.post as any).mockResolvedValueOnce({ data: { id: 3 } });
    const dto = { patientId: 1, maladieId: 2, dateDiagnostic: '2026-01-01' };
    expect((await maladieService.addMaladieToPatient(dto)).id).toBe(3);
    expect(axiosInstance.post).toHaveBeenCalledWith('/patient-maladies', dto);
  });

  it('getMaladiesByPatient', async () => {
    (axiosInstance.get as any).mockResolvedValueOnce({ data: [{ id: 4 }] });
    expect((await maladieService.getMaladiesByPatient(1))[0].id).toBe(4);
    expect(axiosInstance.get).toHaveBeenCalledWith('/patient-maladies/patient/1');
  });

  it('removeMaladieFromPatient', async () => {
    (axiosInstance.delete as any).mockResolvedValueOnce({});
    await maladieService.removeMaladieFromPatient(9);
    expect(axiosInstance.delete).toHaveBeenCalledWith('/patient-maladies/9');
  });
});
