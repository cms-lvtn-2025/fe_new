'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { setupTokenRefresh, clearTokenRefresh, getValidAccessToken } from '@/lib/api/auth'

interface AuthContextType {
  isAuthenticated: boolean
  userRole: 'student' | 'teacher' | null
  loading: boolean
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const token = await getValidAccessToken()
      const role = localStorage.getItem('userRole') as 'student' | 'teacher' | null

      setIsAuthenticated(!!token)
      setUserRole(role)
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
      setUserRole(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()

    // Setup auto token refresh
    const refreshInterval = setupTokenRefresh()

    // Cleanup on unmount
    return () => {
      clearTokenRefresh(refreshInterval)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, loading, checkAuth }}>
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
