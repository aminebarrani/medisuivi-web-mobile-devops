import axiosInstance from './axiosInstance';

export interface MaladieDTO {
  id: number;
  nom: string;
  description: string;
  parametresSuivis: string; // stored as CSV or string description
  seuilMin?: number;
  seuilMax?: number;
}

export interface MaladieCreationDTO {
  nom: string;
  description: string;
  parametresSuivis: string;
  seuilMin?: number;
  seuilMax?: number;
}

export interface PatientMaladieDTO {
  id: number;
  patientId: number;
  maladieId: number;
  dateDiagnostic: string;
}

export interface PatientMaladieCreationDTO {
  patientId: number;
  maladieId: number;
  dateDiagnostic: string;
}

const maladieService = {
  async getAllMaladies(): Promise<MaladieDTO[]> {
    const res = await axiosInstance.get<MaladieDTO[]>('/maladies');
    return res.data;
  },

  async createMaladie(data: MaladieCreationDTO): Promise<MaladieDTO> {
    const res = await axiosInstance.post<MaladieDTO>('/maladies', data);
    return res.data;
  },

  async addMaladieToPatient(data: PatientMaladieCreationDTO): Promise<PatientMaladieDTO> {
    const res = await axiosInstance.post<PatientMaladieDTO>('/patient-maladies', data);
    return res.data;
  },

  async getMaladiesByPatient(patientId: number): Promise<PatientMaladieDTO[]> {
    const res = await axiosInstance.get<PatientMaladieDTO[]>(`/patient-maladies/patient/${patientId}`);
    return res.data;
  },

  async removeMaladieFromPatient(id: number): Promise<void> {
    await axiosInstance.delete(`/patient-maladies/${id}`);
  },
};

export default maladieService;
