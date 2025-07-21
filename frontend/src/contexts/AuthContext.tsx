import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { api } from '../lib/trpc'

interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if we have a token on startup
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      // Validate token by making a request
      api.health()
        .then(() => {
          // Token is valid, but we don't have user info from health endpoint
          // In a real app, you might want to decode the JWT or have a /me endpoint
          setIsLoading(false)
        })
        .catch(() => {
          // Token is invalid
          localStorage.removeItem('token')
          sessionStorage.removeItem('token')
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const response = await api.login({ email, password, rememberMe })
    const { user, token } = response as { user: User; token: string }
    
    // Store token in appropriate storage
    if (rememberMe) {
      localStorage.setItem('token', token)
      sessionStorage.removeItem('token')
    } else {
      sessionStorage.setItem('token', token)
      localStorage.removeItem('token')
    }
    
    setUser(user)
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await api.register({ name, email, password })
    const { user, token } = response as { user: User; token: string }
    
    // Store token in session storage by default for new registrations
    sessionStorage.setItem('token', token)
    localStorage.removeItem('token')
    
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
