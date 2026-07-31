import axiosInstance from './axiosInstance';
import type { NiveauRisque } from './patientService';

export type TypeMesure = 'TENSION' | 'GLYCEMIE' | 'FREQUENCE_CARDIAQUE' | 'TEMPERATURE' | 'POIDS' | 'SPO2';
export type Source = 'PATIENT' | 'MEDECIN' | 'CAPTEUR';
export type Gravite = 'FAIBLE' | 'MODERE' | 'GRAVE';
export type SourceAlerte = 'MESURE' | 'SYMPTOME' | 'AUTOMATIQUE';

export interface MesureDTO {
  id: number;
  patientId: number;
  typeMesure: TypeMesure;
  valeur: number;
  unite: string;
  source: Source;
  dateMesure: string;
}

export interface MesureCreationDTO {
  patientId: number;
  typeMesure: TypeMesure;
  valeur: number;
  unite: string;
  source: Source;
}

export interface SymptomeDTO {
  id: number;
  patientId: number;
  description: string;
  gravite: Gravite;
  dateSignalement: string;
}

export interface SymptomeCreationDTO {
  patientId: number;
  description: string;
  gravite: Gravite;
}

export interface AlerteDTO {
  id: number;
  patientId: number;
  niveauRisque: NiveauRisque;
  source: SourceAlerte;
  description: string;
  dateCreation: string;
  traitee: boolean;
}

export interface AlerteCreationDTO {
  patientId: number;
  niveauRisque: NiveauRisque;
  source: SourceAlerte;
  description: string;
}

const suiviService = {
  // Mesures
  async getMesuresByMedecin(medecinId: number): Promise<MesureDTO[]> {
    const res = await axiosInstance.get<MesureDTO[]>(`/mesures/medecin/${medecinId}`);
    return res.data;
  },
  async getMesuresByPatient(patientId: number): Promise<MesureDTO[]> {
    const res = await axiosInstance.get<MesureDTO[]>(`/mesures/patient/${patientId}`);
    return res.data;
  },
  async createMesure(data: MesureCreationDTO): Promise<MesureDTO> {
    const res = await axiosInstance.post<MesureDTO>('/mesures', data);
    return res.data;
  },

  // Symptomes
  async getSymptomesByMedecin(medecinId: number): Promise<SymptomeDTO[]> {
    const res = await axiosInstance.get<SymptomeDTO[]>(`/symptomes/medecin/${medecinId}`);
    return res.data;
  },
  async getSymptomesByPatient(patientId: number): Promise<SymptomeDTO[]> {
    const res = await axiosInstance.get<SymptomeDTO[]>(`/symptomes/patient/${patientId}`);
    return res.data;
  },
  async createSymptome(data: SymptomeCreationDTO): Promise<SymptomeDTO> {
    const res = await axiosInstance.post<SymptomeDTO>('/symptomes', data);
    return res.data;
  },

  // Alertes
  async getAlertesByMedecin(medecinId: number): Promise<AlerteDTO[]> {
    const res = await axiosInstance.get<AlerteDTO[]>(`/alertes/medecin/${medecinId}`);
    return res.data;
  },
  async getAlertesByPatient(patientId: number): Promise<AlerteDTO[]> {
    const res = await axiosInstance.get<AlerteDTO[]>(`/alertes/patient/${patientId}`);
    return res.data;
  },
  async createAlerte(data: AlerteCreationDTO): Promise<AlerteDTO> {
    const res = await axiosInstance.post<AlerteDTO>('/alertes', data);
    return res.data;
  },
  async markAlerteTraitee(alerteId: number): Promise<AlerteDTO> {
    const res = await axiosInstance.patch<AlerteDTO>(`/alertes/${alerteId}/traiter`);
    return res.data;
  },
};

export default suiviService;
