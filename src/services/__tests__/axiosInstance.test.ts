import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '../axiosInstance';

describe('axiosInstance interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    // jsdom navigation is not implemented; stub href assignment
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('attaches the Authorization header when a token exists', async () => {
    localStorage.setItem('token', 'jwt-abc');
    let seenAuth: string | undefined;
    axiosInstance.defaults.adapter = async (config) => {
      seenAuth = config.headers?.Authorization as string | undefined;
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config } as any;
    };

    await axiosInstance.get('/ping');
    expect(seenAuth).toBe('Bearer jwt-abc');
  });

  it('passes through successful responses', async () => {
    axiosInstance.defaults.adapter = async (config) =>
      ({ data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config } as any);

    const res = await axiosInstance.get('/ok');
    expect(res.data).toEqual({ ok: true });
  });

  it('clears session and redirects on 401', async () => {
    localStorage.setItem('token', 'jwt-abc');
    localStorage.setItem('user', '{"id":1}');
    axiosInstance.defaults.adapter = async (config) => {
      const error: any = new Error('Unauthorized');
      error.config = config;
      error.response = { status: 401, data: {}, headers: {}, config, statusText: 'Unauthorized' };
      error.isAxiosError = true;
      throw error;
    };

    await expect(axiosInstance.get('/protected')).rejects.toBeTruthy();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('rejects non-401 errors without clearing session', async () => {
    localStorage.setItem('token', 'jwt-abc');
    axiosInstance.defaults.adapter = async (config) => {
      const error: any = new Error('Server Error');
      error.config = config;
      error.response = { status: 500, data: {}, headers: {}, config, statusText: 'Error' };
      error.isAxiosError = true;
      throw error;
    };

    await expect(axiosInstance.get('/boom')).rejects.toBeTruthy();
    expect(localStorage.getItem('token')).toBe('jwt-abc');
  });
});
