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
  specialite: string;
  numeroOrdre: string;
}

const mapSexe = (sexe?: string): Sexe => {
  if (sexe === 'M') return 'HOMME';
  if (sexe === 'F') return 'FEMME';
  return (sexe as Sexe) || 'HOMME';
};

const mapPatientSexeToFront = (p: any): PatientDTO => ({
  ...p,
  sexe: mapSexe(p.sexe),
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
    const validRisk =
      (data.niveauRisque as string) === 'MOYEN'
        ? 'MODERE'
        : data.niveauRisque || 'FAIBLE';
    const validSexe = data.sexe === 'FEMME' || (data.sexe as string) === 'F' ? 'F' : 'M';
    const backendData = {
      ...data,
      sexe: validSexe,
      niveauRisque: validRisk,
    };
    const res = await axiosInstance.post<PatientDTO>('/patients', backendData);
    return mapPatientSexeToFront(res.data);
  },

  async getPatientByUserId(userId: number): Promise<PatientDTO> {
    const res = await axiosInstance.get<PatientDTO>(`/patients/user/${userId}`);
    return mapPatientSexeToFront(res.data);
  },

  async updatePatient(id: number, data: Partial<PatientCreationDTO>): Promise<PatientDTO> {
    const validRisk =
      (data.niveauRisque as string) === 'MOYEN'
        ? 'MODERE'
        : data.niveauRisque || 'FAIBLE';
    const validSexe = data.sexe === 'FEMME' || (data.sexe as string) === 'F' ? 'F' : 'M';
    const backendData = {
      ...data,
      sexe: validSexe,
      niveauRisque: validRisk,
    };
    const res = await axiosInstance.put<PatientDTO>(`/patients/${id}`, backendData);
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

