// Client-side API service for admin operations
const API_BASE = '/api'

class ClientApiError extends Error {
  constructor(message: string, public status: number, public body?: any) {
    super(message)
    this.name = 'ClientApiError'
  }
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('blog_auth_token')
  // Safely merge headers (options.headers may be undefined)
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const mergedHeaders = {
    ...defaultHeaders,
    ...(options.headers || {}),
  }

  const config: RequestInit = {
    ...options,
    headers: mergedHeaders,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }))
    throw new ClientApiError(error.error || 'Request failed', response.status, error)
  }

  return response.json()
}

export const clientApi = {
  // Posts
  posts: {
    getAll: async (params?: { status?: string; limit?: number; offset?: number }) => {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.offset) searchParams.append('offset', params.offset.toString())
      
      const query = searchParams.toString()
      return apiRequest(`/posts${query ? `?${query}` : ''}`)
    },

    getById: async (id: number) => {
      return apiRequest(`/posts/${id}`)
    },

    create: async (post: any) => {
      return apiRequest('/posts', {
        method: 'POST',
        body: JSON.stringify(post),
      })
    },

    update: async (id: number, updates: any) => {
      return apiRequest(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
    },

    delete: async (id: number) => {
      return apiRequest(`/posts/${id}`, {
        method: 'DELETE',
      })
    },
  },

  // Blocks
  blocks: {
    getAll: async (postId?: number) => {
      const query = postId ? `?postId=${postId}` : ''
      return apiRequest(`/blocks${query}`)
    },

    create: async (block: any) => {
      return apiRequest('/blocks', {
        method: 'POST',
        body: JSON.stringify(block),
      })
    },

    updateMany: async (blocks: any[]) => {
      return apiRequest('/blocks', {
        method: 'PUT',
        body: JSON.stringify({ blocks }),
      })
    },
  },

  // Auth
  auth: {
    login: async (email: string, password: string) => {
      return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    },

    logout: () => {
      localStorage.removeItem('blog_auth_token')
      // Also clear any old token keys
      localStorage.removeItem('admin_token')
    },

    isAuthenticated: () => {
      return !!localStorage.getItem('blog_auth_token')
    },

    getToken: () => {
      return localStorage.getItem('blog_auth_token')
    },

    setToken: (token: string) => {
      localStorage.setItem('blog_auth_token', token)
      // Clear any old token keys
      localStorage.removeItem('admin_token')
    },
  },
}

export { ClientApiError }