import { browser } from '$app/environment';

// Base API URL
const API_BASE = browser ? '/api' : 'http://localhost:3000/api';

// Auth API Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  token: string;
}

// API client for authentication
export const authApi = {
  // Check if registration is enabled
  async getRegistrationStatus(): Promise<{ enabled: boolean }> {
    const response = await fetch(`${API_BASE}/users/registration-status`);
    if (!response.ok) {
      throw new Error('Failed to check registration status');
    }
    return response.json();
  },

  // Register a new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    return response.json();
  },

  // Login
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    return response.json();
  },
};
