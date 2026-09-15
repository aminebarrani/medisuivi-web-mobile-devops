import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import authService from '../../services/authService';

vi.mock('../../services/authService', () => ({
  default: {
    getUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  },
}));

describe('AuthContext Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null user when no session in localStorage', () => {
    (authService.getUser as any).mockReturnValueOnce(null);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle successful login and update user state', async () => {
    const mockUser = { id: 1, username: 'dr_sami', email: 'dr@test.com', role: 'MEDECIN', active: true, firstName: 'Sami', lastName: 'Gharbi' };
    (authService.getUser as any).mockReturnValueOnce(null);
    (authService.login as any).mockResolvedValueOnce({ token: 'jwt-123', user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login({ usernameOrEmail: 'dr_sami', password: 'password' });
    });

    expect(authService.login).toHaveBeenCalledWith({ usernameOrEmail: 'dr_sami', password: 'password' });
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should logout user and reset authentication state', () => {
    const mockUser = { id: 1, username: 'dr_sami', email: 'dr@test.com', role: 'MEDECIN', active: true, firstName: 'Sami', lastName: 'Gharbi' };
    (authService.getUser as any).mockReturnValueOnce(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});