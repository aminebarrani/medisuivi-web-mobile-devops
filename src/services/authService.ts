import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { STORAGE_KEYS } from '../config/constants';
import { AuthResponse, UserDTO, PatientDTO } from '../types';

export interface LoginParams {
  usernameOrEmail: string;
  password: string;
}

const authService = {
  async login(params: LoginParams): Promise<{ token: string; user: UserDTO; patient: PatientDTO | null }> {
    const response = await api.post<AuthResponse>('/auth/login', params);
    const { token, user } = response.data;

    // Check user role
    if (user.role && !user.role.toUpperCase().includes('PATIENT')) {
      throw new Error("Accès refusé. Cette application est exclusivement réservée aux patients.");
    }

    // Persist Token & User
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    // Try fetching patient entity linked to this user
    let patient: PatientDTO | null = null;
    try {
      patient = await this.fetchPatientProfile(user.id);
    } catch (err) {
      console.warn("Patient entity not found for user ID:", user.id, err);
    }

    return { token, user, patient };
  },

  async fetchPatientProfile(userId: number): Promise<PatientDTO | null> {
    try {
      const response = await api.get<PatientDTO>(`/patients/user/${userId}`);
      if (response.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(response.data));
        return response.data;
      }
    } catch (error) {
      // Fallback: list all patients and find by userId
      try {
        const response = await api.get<PatientDTO[]>(`/patients`);
        const patients = response.data;
        const patient = patients.find((p) => p.userId === userId) || null;
        if (patient) {
          await AsyncStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(patient));
          return patient;
        }
      } catch (e) {
        console.warn("Unable to fetch patient profile", e);
      }
    }
    return null;
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER, STORAGE_KEYS.PATIENT]);
  },

  async getStoredAuth(): Promise<{ token: string | null; user: UserDTO | null; patient: PatientDTO | null }> {
    const [[, token], [, userStr], [, patientStr]] = await AsyncStorage.multiGet([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.PATIENT,
    ]);

    const user = userStr ? (JSON.parse(userStr) as UserDTO) : null;
    const patient = patientStr ? (JSON.parse(patientStr) as PatientDTO) : null;

    return { token, user, patient };
  },
};

export default authService;
