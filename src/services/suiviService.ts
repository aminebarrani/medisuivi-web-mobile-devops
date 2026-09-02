import api from './api';
import { MesureDTO, MesureCreationDTO, AlerteDTO, AlerteCreationDTO } from '../types';

const suiviService = {
  // Fetch only the patient's own measurements
  async getMesuresByPatient(patientId: number): Promise<MesureDTO[]> {
    const res = await api.get<MesureDTO[]>(`/mesures/patient/${patientId}`);
    return res.data;
  },

  // Create a new measurement with source strictly set to PATIENT
  async createMesure(data: Omit<MesureCreationDTO, 'source'>): Promise<MesureDTO> {
    const payload: MesureCreationDTO = {
      ...data,
      source: 'PATIENT',
    };
    const res = await api.post<MesureDTO>('/mesures', payload);
    return res.data;
  },

  // Fetch alert history for the patient
  async getAlertesByPatient(patientId: number): Promise<AlerteDTO[]> {
    const res = await api.get<AlerteDTO[]>(`/alertes/patient/${patientId}`);
    return res.data;
  },

  // Create and push an alert to the doctor
  async createAlerte(data: AlerteCreationDTO): Promise<AlerteDTO> {
    const res = await api.post<AlerteDTO>('/alertes', data);
    return res.data;
  },
};

export default suiviService;
