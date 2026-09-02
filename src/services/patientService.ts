import api from './api';
import { PatientDTO, NiveauRisque, DoctorDetails } from '../types';

const patientService = {
  async getPatientById(patientId: number): Promise<PatientDTO> {
    const res = await api.get<PatientDTO>(`/patients/${patientId}`);
    return res.data;
  },

  async getPatientByUserId(userId: number): Promise<PatientDTO> {
    const res = await api.get<PatientDTO>(`/patients/user/${userId}`);
    return res.data;
  },

  async getDoctorDetails(medecinId: number): Promise<DoctorDetails> {
    try {
      const medRes = await api.get<{ id: number; userId: number; specialite: string; numeroOrdre: string }>(`/medecins/${medecinId}`);
      const medecin = medRes.data;
      if (medecin.userId) {
        try {
          const userRes = await api.get<{ id: number; firstName: string; lastName: string; email: string; phone?: string }>(`/users/${medecin.userId}`);
          const user = userRes.data;
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          return {
            id: medecinId,
            name: fullName ? `Dr. ${fullName}` : `Dr. #${medecinId}`,
            specialite: medecin.specialite || 'Médecine Générale',
            numeroOrdre: medecin.numeroOrdre,
            email: user.email,
            phone: user.phone,
          };
        } catch {
          return {
            id: medecinId,
            name: `Dr. #${medecinId}`,
            specialite: medecin.specialite || 'Médecine Générale',
            numeroOrdre: medecin.numeroOrdre,
          };
        }
      }
      return {
        id: medecinId,
        name: `Dr. #${medecinId}`,
        specialite: medecin.specialite || 'Médecine Générale',
      };
    } catch {
      return {
        id: medecinId,
        name: `Dr. #${medecinId}`,
        specialite: 'Médecin Référent',
      };
    }
  },

  async predictRisk(patientId: number): Promise<{ gravite: string; niveauRisque?: NiveauRisque; probabilities?: Record<string, number> }> {
    const res = await api.post<{ gravite: string; niveauRisque?: NiveauRisque; probabilities?: Record<string, number> }>(
      `/patients/${patientId}/predict-risk`,
      {}
    );
    return res.data;
  },
};

export default patientService;

