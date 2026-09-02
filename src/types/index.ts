export type Sexe = 'HOMME' | 'FEMME' | 'M' | 'F';
export type NiveauRisque = 'FAIBLE' | 'MODERE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';
export type TypeMesure = 'TENSION' | 'GLYCEMIE' | 'FREQUENCE_CARDIAQUE' | 'TEMPERATURE' | 'POIDS' | 'SPO2';
export type Source = 'PATIENT' | 'MEDECIN' | 'CAPTEUR';
export type Gravite = 'FAIBLE' | 'MODERE' | 'GRAVE';
export type SourceAlerte = 'MESURE' | 'SYMPTOME' | 'AUTOMATIQUE';

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  active: boolean;
  profilePictureUrl?: string;
}

export interface PatientDTO {
  id: number;
  userId: number;
  medecinId: number;
  dateNaissance: string;
  sexe: Sexe;
  niveauRisque: NiveauRisque;
  dateCreation: string;
  nom?: string;
  prenom?: string;
  email?: string;
}

export interface DoctorDetails {
  id: number;
  name: string;
  specialite: string;
  numeroOrdre?: string;
  email?: string;
  phone?: string;
}

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
  source: 'PATIENT';
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

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserDTO;
}
