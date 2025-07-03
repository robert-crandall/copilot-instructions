import { api } from '../api';
import { authStore } from '../stores/auth';
import { get } from 'svelte/store';

// Type definition for the hello response
export interface HelloResponse {
  message: string;
  userId: string;
  timestamp: string;
}

// Type-safe hello API using Hono client
export const helloApi = {
  // Get authenticated hello message
  async getHello(): Promise<HelloResponse> {
    const { token } = get(authStore);
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await api.api.hello.$get({
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error((result as any).error || 'Failed to fetch hello message');
    }

    return response.json();
  }
};
