import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from '../authService';
import axiosInstance from '../axiosInstance';

vi.mock('../axiosInstance', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('authService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should authenticate user and store token/user in localStorage', async () => {
    const mockUser = { id: 1, username: 'dr_medecin', email: 'medecin@test.com', role: 'MEDECIN', active: true, firstName: 'Ali', lastName: 'Ben Ali' };
    const mockResponse = { data: { token: 'mock-jwt-token', tokenType: 'Bearer', user: mockUser } };

    (axiosInstance.post as any).mockResolvedValueOnce(mockResponse);

    const result = await authService.login({ usernameOrEmail: 'dr_medecin', password: 'password123' });

    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', { usernameOrEmail: 'dr_medecin', password: 'password123' });
    expect(result.token).toBe('mock-jwt-token');
    expect(localStorage.getItem('token')).toBe('mock-jwt-token');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockUser);
  });

  it('should register new doctor or patient', async () => {
    const mockUser = { id: 2, username: 'patient_sami', email: 'sami@test.com', role: 'PATIENT', active: true, firstName: 'Sami', lastName: 'Gharbi' };
    (axiosInstance.post as any).mockResolvedValueOnce({ data: mockUser });

    const result = await authService.register({
      username: 'patient_sami',
      email: 'sami@test.com',
      password: 'pass',
      firstName: 'Sami',
      lastName: 'Gharbi',
      role: 'PATIENT',
      active: true,
    });

    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/register', expect.anything());
    expect(result.id).toBe(2);
  });

  it('should logout and clear localStorage token', () => {
    localStorage.setItem('token', 'sample-token');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));

    authService.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(authService.isAuthenticated()).toBe(false);
  });
});