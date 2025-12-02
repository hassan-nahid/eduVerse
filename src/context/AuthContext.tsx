/**
 * Authentication Context
 * Manages global authentication state and user data
 */

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, AuthUser } from '@/services/auth.service'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: AuthUser) => void
  logout: () => Promise<void>
  updateUser: (user: Partial<AuthUser>) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getMe()
        setUser(response.data)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userData: AuthUser) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear user state even if API call fails
      setUser(null)
    }
  }

  const updateUser = (userData: Partial<AuthUser>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const refreshUser = async () => {
    try {
      const response = await authService.getMe()
      setUser(response.data)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    refreshUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
