import axiosInstance from './axiosInstance';

export type Sexe = 'HOMME' | 'FEMME';
export type NiveauRisque = 'FAIBLE' | 'MODERE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';

export interface PatientDTO {
  id: number;
  userId: number;
  medecinId: number;
  dateNaissance: string;
  sexe: Sexe;
  niveauRisque: NiveauRisque;
  dateCreation: string;
  // Dynamic display fields
  nom?: string;
  prenom?: string;
  email?: string;
}

export interface PatientCreationDTO {
  userId: number;
  medecinId: number;
  dateNaissance: string;
  sexe: Sexe;
  niveauRisque?: NiveauRisque;
}

export interface MedecinDTO {
  id: number;
  userId: number;
  specialite: String;
  numeroOrdre: String;
}

const mapPatientSexeToFront = (p: any): PatientDTO => ({
  ...p,
  sexe: p.sexe === 'M' ? 'HOMME' : p.sexe === 'F' ? 'FEMME' : p.sexe
});

const patientService = {
  async getAllPatients(): Promise<PatientDTO[]> {
    const res = await axiosInstance.get<PatientDTO[]>('/patients');
    return res.data.map(mapPatientSexeToFront);
  },

  async getPatientsByMedecin(medecinId: number): Promise<PatientDTO[]> {
    const res = await axiosInstance.get<PatientDTO[]>(`/patients/medecin/${medecinId}`);
    return res.data.map(mapPatientSexeToFront);
  },

  async createPatient(data: PatientCreationDTO): Promise<PatientDTO> {
    const backendData = {
      ...data,
      sexe: data.sexe === 'HOMME' ? 'M' : 'F'
    };
    const res = await axiosInstance.post<PatientDTO>('/patients', backendData);
    return mapPatientSexeToFront(res.data);
  },

  async updateNiveauRisque(patientId: number, niveauRisque: NiveauRisque): Promise<PatientDTO> {
    const validRisk = (niveauRisque as string) === 'MOYEN' ? 'MODERE' : niveauRisque;
    const res = await axiosInstance.patch<PatientDTO>(`/patients/${patientId}/niveau-risque`, null, {
      params: { niveauRisque: validRisk },
    });
    return mapPatientSexeToFront(res.data);
  },

  async deletePatient(patientId: number): Promise<void> {
    await axiosInstance.delete(`/patients/${patientId}`);
  },

  async predictRisk(patientId: number): Promise<{ gravite: string; probabilities: Record<string, number> }> {
    const res = await axiosInstance.post<{ gravite: string; probabilities: Record<string, number> }>(`/patients/${patientId}/predict-risk`, {});
    return res.data;
  },

  async createMedecin(data: { userId: number; specialite: string; numeroOrdre: string }): Promise<MedecinDTO> {
    const res = await axiosInstance.post<MedecinDTO>('/medecins', data);
    return res.data;
  },

  async getMedecinByUserId(userId: number): Promise<MedecinDTO> {
    const res = await axiosInstance.get<MedecinDTO>(`/medecins/user/${userId}`);
    return res.data;
  },
};

export default patientService;

