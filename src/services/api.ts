import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

let unauthenticatedCallback: (() => void) | null = null;

export const setUnauthenticatedCallback = (cb: () => void) => {
  unauthenticatedCallback = cb;
};

// Request interceptor to attach JWT token & dynamic base URL
api.interceptors.request.use(
  async (config) => {
    // Check if user set custom API base URL
    const customUrl = await AsyncStorage.getItem(STORAGE_KEYS.API_URL);
    if (customUrl) {
      config.baseURL = customUrl;
    } else {
      config.baseURL = API_CONFIG.BASE_URL;
    }

    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER, STORAGE_KEYS.PATIENT]);
      if (unauthenticatedCallback) {
        unauthenticatedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
