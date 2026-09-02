import { Platform } from 'react-native';

// Default host for local development:
// Android Emulator uses 10.0.2.2 to reach host machine localhost.
// iOS Simulator or Web uses localhost.
// Replace with your machine's local IP address (e.g. http://192.168.1.50:8080/api) when testing on a physical mobile device.
const DEFAULT_HOST = 'http://192.168.1.137:8222/api';

export const API_CONFIG = {
  BASE_URL: DEFAULT_HOST,
  TIMEOUT: 10000,
};

export const STORAGE_KEYS = {
  TOKEN: '@medsuivi_token',
  USER: '@medsuivi_user',
  PATIENT: '@medsuivi_patient',
  API_URL: '@medsuivi_api_url',
};

export const MEASURE_TYPES_CONFIG = [
  { type: 'TENSION', label: 'Tension Artérielle', unit: 'mmHg', icon: 'heart', defaultVal: '120/80', min: 50, max: 250 },
  { type: 'GLYCEMIE', label: 'Glycémie', unit: 'g/L', icon: 'water', defaultVal: '1.0', min: 0.2, max: 5.0 },
  { type: 'FREQUENCE_CARDIAQUE', label: 'Fréquence Cardiaque', unit: 'bpm', icon: 'pulse', defaultVal: '75', min: 30, max: 220 },
  { type: 'TEMPERATURE', label: 'Température', unit: '°C', icon: 'thermometer', defaultVal: '37.0', min: 34.0, max: 43.0 },
  { type: 'POIDS', label: 'Poids', unit: 'kg', icon: 'body', defaultVal: '70.0', min: 20, max: 300 },
  { type: 'SPO2', label: 'Saturation Oxygène (SpO2)', unit: '%', icon: 'fitness', defaultVal: '98', min: 70, max: 100 },
] as const;
