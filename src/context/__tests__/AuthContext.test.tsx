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

  it('should register a new user', async () => {
    (authService.getUser as any).mockReturnValueOnce(null);
    (authService.register as any).mockResolvedValueOnce({ id: 2 });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.register({
        username: 'u', email: 'e', password: 'p', firstName: 'F', lastName: 'L', role: 'PATIENT', active: true,
      });
    });

    expect(authService.register).toHaveBeenCalled();
  });

  it('updateUser merges data and persists; no-op when user is null', () => {
    (authService.getUser as any).mockReturnValueOnce(null);
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.updateUser({ firstName: 'Ignored' });
    });
    expect(result.current.user).toBeNull();

    const mockUser = { id: 1, username: 'u', email: 'e', role: 'MEDECIN', active: true, firstName: 'F', lastName: 'L' };
    (authService.getUser as any).mockReturnValueOnce(mockUser);
    const { result: r2 } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    act(() => {
      r2.current.updateUser({ firstName: 'New' });
    });
    expect(r2.current.user?.firstName).toBe('New');
    expect(JSON.parse(localStorage.getItem('user')!).firstName).toBe('New');
  });

  it('useAuth throws outside provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within AuthProvider');
  });
});