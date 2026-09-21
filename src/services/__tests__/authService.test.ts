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

  it('forgotPassword posts the email', async () => {
    (axiosInstance.post as any).mockResolvedValueOnce({ data: { message: 'ok' } });
    const res = await authService.forgotPassword('a@b.com');
    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'a@b.com' });
    expect(res.message).toBe('ok');
  });

  it('resetPassword posts token and new password', async () => {
    (axiosInstance.post as any).mockResolvedValueOnce({ data: { message: 'reset' } });
    const res = await authService.resetPassword('tok', 'newpass');
    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/reset-password', { token: 'tok', newPassword: 'newpass' });
    expect(res.message).toBe('reset');
  });

  it('changePassword posts both passwords', async () => {
    (axiosInstance.post as any).mockResolvedValueOnce({ data: { message: 'changed' } });
    const res = await authService.changePassword('old', 'new');
    expect(axiosInstance.post).toHaveBeenCalledWith('/auth/change-password', { currentPassword: 'old', newPassword: 'new' });
    expect(res.message).toBe('changed');
  });

  it('updateProfile throws when there is no session user', async () => {
    await expect(authService.updateProfile({ firstName: 'X' })).rejects.toThrow('No user in session');
  });

  it('updateProfile merges fields and persists the user', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 5, username: 'u', email: 'e', firstName: 'Old', lastName: 'L', role: 'MEDECIN', active: true }));
    (axiosInstance.put as any).mockResolvedValueOnce({ data: { id: 5, username: 'u', email: 'e', firstName: 'New', lastName: 'L', role: 'MEDECIN', active: true } });
    const res = await authService.updateProfile({ firstName: 'New' });
    expect(axiosInstance.put).toHaveBeenCalledWith('/users/5', expect.objectContaining({ firstName: 'New', id: 5 }));
    expect(res.firstName).toBe('New');
    expect(JSON.parse(localStorage.getItem('user')!).firstName).toBe('New');
  });

  it('updateProfilePicture stores base64 and removeProfilePicture clears it', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 5, username: 'u', email: 'e', firstName: 'F', lastName: 'L', role: 'MEDECIN', active: true }));
    (axiosInstance.put as any).mockResolvedValue({ data: { id: 5, profilePictureUrl: 'data:img' } });
    await authService.updateProfilePicture('data:img');
    expect(localStorage.getItem('profilePicture')).toBe('data:img');
    await authService.removeProfilePicture();
    expect(localStorage.getItem('profilePicture')).toBeNull();
  });

  it('getAllUsers and getUserById call the right endpoints', async () => {
    (axiosInstance.get as any).mockResolvedValueOnce({ data: [{ id: 1 }] });
    expect((await authService.getAllUsers()).length).toBe(1);
    expect(axiosInstance.get).toHaveBeenCalledWith('/users');

    (axiosInstance.get as any).mockResolvedValueOnce({ data: { id: 7 } });
    expect((await authService.getUserById(7)).id).toBe(7);
    expect(axiosInstance.get).toHaveBeenCalledWith('/users/7');
  });

  it('local profile picture helpers and token getters', () => {
    authService.saveProfilePictureLocally('data:local');
    expect(localStorage.getItem('profilePicture')).toBe('data:local');
    expect(authService.getLocalProfilePicture()).toBe('data:local');
    authService.removeLocalProfilePicture();
    expect(authService.getLocalProfilePicture()).toBeNull();

    localStorage.setItem('token', 'tk');
    expect(authService.getToken()).toBe('tk');
    expect(authService.isAuthenticated()).toBe(true);
    expect(authService.getUser()).toBeNull();
  });
});