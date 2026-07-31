import axiosInstance from './axiosInstance';

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'MEDECIN';
  active: boolean;
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  active: boolean;
  profilePictureUrl?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserDTO;
}

const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  async register(data: RegisterRequest): Promise<UserDTO> {
    const response = await axiosInstance.post<UserDTO>('/auth/register', data);
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  async updateProfile(data: Partial<Pick<UserDTO, 'firstName' | 'lastName' | 'phone'>>): Promise<UserDTO> {
    const currentUser = this.getUser();
    if (!currentUser) throw new Error('No user in session');

    // Build full UserDTO payload — the backend PUT /users/{id} requires all fields
    const payload = {
      id: currentUser.id,
      username: currentUser.username,
      email: currentUser.email,
      firstName: data.firstName ?? currentUser.firstName,
      lastName: data.lastName ?? currentUser.lastName,
      phone: data.phone ?? currentUser.phone,
      role: currentUser.role,
      active: currentUser.active,
    };

    const response = await axiosInstance.put<UserDTO>(`/users/${currentUser.id}`, payload);
    const updated = response.data;
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },


  // Profile picture is stored as base64 in localStorage (client-side fallback)
  // Replace with a real API call (e.g., multipart/form-data POST) if the backend supports it
  saveProfilePictureLocally(base64DataUrl: string): void {
    localStorage.setItem('profilePicture', base64DataUrl);
  },

  getLocalProfilePicture(): string | null {
    return localStorage.getItem('profilePicture');
  },

  removeLocalProfilePicture(): void {
    localStorage.removeItem('profilePicture');
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Keep profile picture across sessions — remove only if desired
    // localStorage.removeItem('profilePicture');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): UserDTO | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};

export default authService;
