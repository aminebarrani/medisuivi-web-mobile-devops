import axiosInstance from './axiosInstance';

export type Sexe = 'HOMME' | 'FEMME';
export type NiveauRisque = 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';

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

const patientService = {
  async getAllPatients(): Promise<PatientDTO[]> {
    const res = await axiosInstance.get<PatientDTO[]>('/patients');
    return res.data;
  },

  async getPatientsByMedecin(medecinId: number): Promise<PatientDTO[]> {
    const res = await axiosInstance.get<PatientDTO[]>(`/patients/medecin/${medecinId}`);
    return res.data;
  },

  async createPatient(data: PatientCreationDTO): Promise<PatientDTO> {
    const res = await axiosInstance.post<PatientDTO>('/patients', data);
    return res.data;
  },

  async updateNiveauRisque(patientId: number, niveauRisque: NiveauRisque): Promise<PatientDTO> {
    const res = await axiosInstance.patch<PatientDTO>(`/patients/${patientId}/niveau-risque`, null, {
      params: { niveauRisque },
    });
    return res.data;
  },

  async deletePatient(patientId: number): Promise<void> {
    await axiosInstance.delete(`/patients/${patientId}`);
  },

  async getMedecinByUserId(userId: number): Promise<MedecinDTO> {
    const res = await axiosInstance.get<MedecinDTO>(`/medecins/user/${userId}`);
    return res.data;
  },
};

export default patientService;
