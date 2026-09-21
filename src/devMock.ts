// DEV ONLY — mock API layer used to render screens for the rapport de stage.
// Installs a custom axios adapter so the real components render without the backend.
// Enabled only when VITE_MOCK_API === 'true'.
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axiosInstance from './services/axiosInstance';

type Cfg = InternalAxiosRequestConfig;

const json = <T>(config: Cfg, data: T, status = 200): AxiosResponse<T> => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

// ---------------------------------------------------------------------------
// Mock dataset
// ---------------------------------------------------------------------------
const doctorUser = {
  id: 1,
  username: 'dr.benamor',
  email: 'doctor@medsuivi.tn',
  firstName: 'Sarra',
  lastName: 'Ben Amor',
  role: 'MEDECIN',
  phone: '+216 22 145 870',
  active: true,
};

const medecin = { id: 1, userId: 1, specialite: 'Cardiologue', numeroOrdre: 'DR-1-4821' };

const patientUsers = [
  { id: 2, username: 'amina.t', email: 'amina.trabelsi@mail.tn', firstName: 'Amina', lastName: 'Trabelsi', role: 'PATIENT', active: true },
  { id: 3, username: 'karim.g', email: 'karim.gharbi@mail.tn', firstName: 'Karim', lastName: 'Gharbi', role: 'PATIENT', active: true },
  { id: 4, username: 'leila.m', email: 'leila.mansouri@mail.tn', firstName: 'Leila', lastName: 'Mansouri', role: 'PATIENT', active: true },
  { id: 5, username: 'hichem.b', email: 'hichem.bouazizi@mail.tn', firstName: 'Hichem', lastName: 'Bouazizi', role: 'PATIENT', active: true },
  { id: 6, username: 'nadia.c', email: 'nadia.cherif@mail.tn', firstName: 'Nadia', lastName: 'Cherif', role: 'PATIENT', active: true },
  { id: 7, username: 'mohamed.k', email: 'mohamed.karray@mail.tn', firstName: 'Mohamed', lastName: 'Karray', role: 'PATIENT', active: true },
];

const allUsers = [doctorUser, ...patientUsers];

const patients = [
  { id: 1, userId: 2, medecinId: 1, dateNaissance: '1958-03-12', sexe: 'F', niveauRisque: 'ELEVE', dateCreation: '2026-01-08' },
  { id: 2, userId: 3, medecinId: 1, dateNaissance: '1972-07-25', sexe: 'M', niveauRisque: 'MODERE', dateCreation: '2026-01-15' },
  { id: 3, userId: 4, medecinId: 1, dateNaissance: '1965-11-03', sexe: 'F', niveauRisque: 'CRITIQUE', dateCreation: '2026-02-02' },
  { id: 4, userId: 5, medecinId: 1, dateNaissance: '1980-01-19', sexe: 'M', niveauRisque: 'FAIBLE', dateCreation: '2026-02-20' },
  { id: 5, userId: 6, medecinId: 1, dateNaissance: '1990-05-30', sexe: 'F', niveauRisque: 'MODERE', dateCreation: '2026-03-05' },
  { id: 6, userId: 7, medecinId: 1, dateNaissance: '1948-09-14', sexe: 'M', niveauRisque: 'ELEVE', dateCreation: '2026-03-18' },
];

const maladies = [
  { id: 1, nom: 'Hypertension artérielle', description: "Pression artérielle chroniquement élevée nécessitant un suivi régulier.", parametresSuivis: 'TENSION,FREQUENCE_CARDIAQUE', seuilMin: 80, seuilMax: 140 },
  { id: 2, nom: 'Diabète type 2', description: "Trouble de la régulation glycémique lié à l'insulinorésistance.", parametresSuivis: 'GLYCEMIE,POIDS', seuilMin: 0.7, seuilMax: 1.26 },
  { id: 3, nom: 'Insuffisance cardiaque', description: "Diminution de la capacité du cœur à assurer un débit suffisant.", parametresSuivis: 'FREQUENCE_CARDIAQUE,SPO2,POIDS', seuilMin: 50, seuilMax: 100 },
  { id: 4, nom: 'Asthme', description: "Maladie inflammatoire chronique des voies respiratoires.", parametresSuivis: 'SPO2,FREQUENCE_CARDIAQUE', seuilMin: 94, seuilMax: 100 },
  { id: 5, nom: 'Arythmie cardiaque', description: "Trouble du rythme cardiaque (tachycardie, bradycardie).", parametresSuivis: 'FREQUENCE_CARDIAQUE', seuilMin: 60, seuilMax: 100 },
];

const mesures = [
  { id: 1, patientId: 1, typeMesure: 'TENSION', valeur: 152, unite: 'mmHg', source: 'CAPTEUR', dateMesure: '2026-09-15T08:20:00' },
  { id: 2, patientId: 1, typeMesure: 'FREQUENCE_CARDIAQUE', valeur: 98, unite: 'bpm', source: 'CAPTEUR', dateMesure: '2026-09-15T08:21:00' },
  { id: 3, patientId: 2, typeMesure: 'GLYCEMIE', valeur: 1.42, unite: 'g/L', source: 'PATIENT', dateMesure: '2026-09-16T07:05:00' },
  { id: 4, patientId: 3, typeMesure: 'SPO2', valeur: 89, unite: '%', source: 'CAPTEUR', dateMesure: '2026-09-17T22:40:00' },
  { id: 5, patientId: 3, typeMesure: 'FREQUENCE_CARDIAQUE', valeur: 118, unite: 'bpm', source: 'MEDECIN', dateMesure: '2026-09-17T22:41:00' },
  { id: 6, patientId: 4, typeMesure: 'POIDS', valeur: 78.5, unite: 'kg', source: 'PATIENT', dateMesure: '2026-09-18T06:30:00' },
  { id: 7, patientId: 5, typeMesure: 'TEMPERATURE', valeur: 37.8, unite: '°C', source: 'PATIENT', dateMesure: '2026-09-18T18:10:00' },
  { id: 8, patientId: 6, typeMesure: 'TENSION', valeur: 165, unite: 'mmHg', source: 'CAPTEUR', dateMesure: '2026-09-18T09:00:00' },
  { id: 9, patientId: 2, typeMesure: 'FREQUENCE_CARDIAQUE', valeur: 76, unite: 'bpm', source: 'CAPTEUR', dateMesure: '2026-09-19T08:00:00' },
];

const symptomes = [
  { id: 1, patientId: 3, description: 'Essoufflement important au moindre effort', gravite: 'GRAVE', dateSignalement: '2026-09-17T22:35:00' },
  { id: 2, patientId: 1, description: 'Maux de tête et vertiges matinaux', gravite: 'MODERE', dateSignalement: '2026-09-15T09:00:00' },
  { id: 3, patientId: 6, description: 'Palpitations nocturnes répétées', gravite: 'GRAVE', dateSignalement: '2026-09-18T23:15:00' },
  { id: 4, patientId: 5, description: 'Toux sèche persistante', gravite: 'FAIBLE', dateSignalement: '2026-09-18T18:20:00' },
];

const alertes = [
  { id: 1, patientId: 3, niveauRisque: 'CRITIQUE', source: 'MESURE', description: "Saturation en oxygène critique (SpO2 89%)", dateCreation: '2026-09-17T22:42:00', traitee: false },
  { id: 2, patientId: 6, niveauRisque: 'ELEVE', source: 'MESURE', description: 'Tension artérielle très élevée (165 mmHg)', dateCreation: '2026-09-18T09:02:00', traitee: false },
  { id: 3, patientId: 1, niveauRisque: 'ELEVE', source: 'SYMPTOME', description: 'Céphalées associées à une hypertension', dateCreation: '2026-09-15T09:05:00', traitee: false },
  { id: 4, patientId: 2, niveauRisque: 'MODERE', source: 'AUTOMATIQUE', description: 'Glycémie à jeun au-dessus du seuil', dateCreation: '2026-09-16T07:10:00', traitee: true },
  { id: 5, patientId: 5, niveauRisque: 'FAIBLE', source: 'SYMPTOME', description: 'Légère fièvre signalée par le patient', dateCreation: '2026-09-18T18:25:00', traitee: true },
];

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const parse = (config: Cfg) => {
  const raw = config.data;
  if (!raw) return {};
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockAdapter = async (config: Cfg): Promise<AxiosResponse<any>> => {
  const url = (config.url || '').split('?')[0];
  const method = (config.method || 'get').toLowerCase();
  const body = parse(config);
  const key = `${method} ${url}`;

  // ---- Auth ----
  if (key === 'post /auth/login') {
    return json(config, { token: 'mock-jwt-token', tokenType: 'Bearer', user: doctorUser });
  }
  if (key === 'post /auth/register') {
    return json(config, { ...doctorUser, ...body }, 201);
  }
  if (key === 'post /auth/forgot-password') {
    return json(config, { message: 'Un lien de réinitialisation a été envoyé à votre adresse email.' });
  }
  if (key === 'post /auth/reset-password') {
    return json(config, { message: 'Votre mot de passe a été réinitialisé avec succès.' });
  }
  if (key === 'post /auth/change-password') {
    return json(config, { message: 'Mot de passe modifié avec succès !' });
  }

  // ---- Users ----
  if (key === 'get /users') return json(config, allUsers);
  let m = url.match(/^\/users\/(\d+)$/);
  if (m && method === 'get') {
    const id = +m[1];
    return json(config, allUsers.find((u) => u.id === id) || doctorUser);
  }
  if (m && method === 'put') {
    const updated = { ...doctorUser, ...body };
    return json(config, updated);
  }

  // ---- Medecin ----
  m = url.match(/^\/medecins\/user\/(\d+)$/);
  if (m && method === 'get') return json(config, medecin);
  if (key === 'post /medecins') return json(config, medecin, 201);

  // ---- Patients ----
  if (key === 'get /patients') return json(config, patients);
  m = url.match(/^\/patients\/medecin\/(\d+)$/);
  if (m && method === 'get') return json(config, patients);
  m = url.match(/^\/patients\/user\/(\d+)$/);
  if (m && method === 'get') {
    const id = +m[1];
    const p = patients.find((x) => x.userId === id);
    if (!p) return json(config, { message: 'Not found' }, 404);
    return json(config, p);
  }
  if (key === 'post /patients') {
    return json(config, { id: patients.length + 1, ...body }, 201);
  }
  m = url.match(/^\/patients\/(\d+)\/predict-risk$/);
  if (m && method === 'post') {
    return json(config, {
      gravite: 'ELEVE',
      probabilities: { FAIBLE: 0.04, MODERE: 0.11, ELEVE: 0.58, CRITIQUE: 0.27 },
    });
  }
  m = url.match(/^\/patients\/(\d+)\/niveau-risque$/);
  if (m && method === 'patch') {
    const niveau = config.params?.niveauRisque || 'MODERE';
    const id = +m[1];
    const p = patients.find((x) => x.id === id);
    return json(config, { ...p, niveauRisque: niveau });
  }
  m = url.match(/^\/patients\/(\d+)$/);
  if (m && method === 'put') {
    const id = +m[1];
    const p = patients.find((x) => x.id === id);
    return json(config, { ...p, ...body });
  }

  // ---- Maladies ----
  if (key === 'get /maladies') return json(config, maladies);
  if (key === 'post /maladies') {
    return json(config, { id: maladies.length + 1, ...body }, 201);
  }
  m = url.match(/^\/patient-maladies\/patient\/(\d+)$/);
  if (m && method === 'get') return json(config, []);
  if (key === 'post /patient-maladies') {
    return json(config, { id: 1, ...body }, 201);
  }

  // ---- Suivi ----
  m = url.match(/^\/mesures\/medecin\/(\d+)$/);
  if (m && method === 'get') return json(config, mesures);
  if (key === 'post /mesures') {
    return json(config, { id: mesures.length + 1, dateMesure: new Date().toISOString(), ...body }, 201);
  }
  m = url.match(/^\/symptomes\/medecin\/(\d+)$/);
  if (m && method === 'get') return json(config, symptomes);
  if (key === 'post /symptomes') {
    return json(config, { id: symptomes.length + 1, dateSignalement: new Date().toISOString(), ...body }, 201);
  }
  m = url.match(/^\/alertes\/medecin\/(\d+)$/);
  if (m && method === 'get') return json(config, alertes);
  m = url.match(/^\/alertes\/(\d+)\/traiter$/);
  if (m && method === 'patch') {
    const a = alertes.find((x) => x.id === +m[1]);
    if (a) a.traitee = true;
    return json(config, { ...a, traitee: true });
  }

  // Fallback
  console.warn('[mockAdapter] Unhandled request:', key);
  return json(config, { message: 'mock: unhandled', key }, 200);
};

export function installMockApi() {
  axiosInstance.defaults.adapter = mockAdapter;
  // eslint-disable-next-line no-console
  console.info('[MedSuivi] Mock API enabled — rapport de stage screenshots mode.');
}
