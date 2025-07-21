// Simple API client without tRPC for now
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'

class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...(options.headers as Record<string, string> || {}),
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || 'Request failed')
    }

    return response.json()
  }

  // Auth endpoints
  async register(data: { name: string; email: string; password: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: { email: string; password: string; rememberMe?: boolean }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Posts endpoints
  async getPosts() {
    return this.request('/posts')
  }

  async createPost(data: { content: string }) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePost(id: string, data: { content: string }) {
    return this.request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deletePost(id: string) {
    return this.request(`/posts/${id}`, {
      method: 'DELETE',
    })
  }

  // Health check
  async health() {
    return this.request('/health')
  }
}

export const api = new ApiClient()
