import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getConfig } from '../config'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo }) => {
  const { user, loading } = useAuth()
  const config = getConfig()
  const loginRoute = redirectTo || config.routes.login

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={loginRoute} replace />
  }

  return <>{children}</>
}

