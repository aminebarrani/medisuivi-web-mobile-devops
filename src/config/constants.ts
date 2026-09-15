import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_PORT = 8222;
const API_PATH = '/api';
const FALLBACK_LAN_IP = '10.131.57.73';
const STALE_API_HOSTS = ['192.168.1.137'];

function extractIpv4(value?: string | null): string | null {
  if (!value) return null;
  const match = String(value).match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
  return match?.[1] ?? null;
}

function getExpoDevHost(): string | null {
  const extras = Constants.manifest2?.extra as { expoGo?: { debuggerHost?: string } } | undefined;
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.linkingUri,
    extras?.expoGo?.debuggerHost,
    Constants.expoGoConfig?.debuggerHost,
  ];

  for (const candidate of candidates) {
    const ip = extractIpv4(candidate);
    if (ip) return ip;
  }
  return null;
}

export function getDefaultApiBaseUrl(): string {
  const expoHost = getExpoDevHost();
  if (expoHost && expoHost !== '127.0.0.1') {
    return `http://${expoHost}:${API_PORT}${API_PATH}`;
  }

  if (Constants.isDevice) {
    return `http://${FALLBACK_LAN_IP}:${API_PORT}${API_PATH}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}${API_PATH}`;
  }

  return `http://localhost:${API_PORT}${API_PATH}`;
}

export function isStaleApiUrl(url?: string | null): boolean {
  if (!url) return false;
  return STALE_API_HOSTS.some((host) => url.includes(host));
}

export const API_CONFIG = {
  BASE_URL: getDefaultApiBaseUrl(),
  TIMEOUT: 15000,
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
