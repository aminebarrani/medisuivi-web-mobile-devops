import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService, { LoginParams } from '../services/authService';
import { setUnauthenticatedCallback } from '../services/api';
import { UserDTO, PatientDTO } from '../types';

interface AuthContextType {
  user: UserDTO | null;
  patient: PatientDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: LoginParams) => Promise<void>;
  logout: () => Promise<void>;
  refreshPatient: () => Promise<PatientDTO | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [patient, setPatient] = useState<PatientDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Auth state from AsyncStorage
  const initAuth = useCallback(async () => {
    try {
      const stored = await authService.getStoredAuth();
      if (stored.token && stored.user) {
        setToken(stored.token);
        setUser(stored.user);
        setPatient(stored.patient);

        // Always query the latest patient profile from server to get updated risk level
        if (stored.user.id) {
          authService.fetchPatientProfile(stored.user.id).then((freshPatient) => {
            if (freshPatient) {
              setPatient(freshPatient);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Failed to restore auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();

    // Register 401 automatic logout callback
    setUnauthenticatedCallback(() => {
      setUser(null);
      setPatient(null);
      setToken(null);
    });
  }, [initAuth]);

  const login = useCallback(async (params: LoginParams) => {
    setIsLoading(true);
    try {
      const res = await authService.login(params);
      setToken(res.token);
      setUser(res.user);
      setPatient(res.patient);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setToken(null);
      setUser(null);
      setPatient(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshPatient = useCallback(async (): Promise<PatientDTO | null> => {
    if (user?.id) {
      const p = await authService.fetchPatientProfile(user.id);
      if (p) {
        setPatient(p);
      }
      return p;
    }
    return null;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        patient,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshPatient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
