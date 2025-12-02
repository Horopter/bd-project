import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { getConfig } from './config'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { AuthCallback } from './components/AuthCallback'
import { ProtectedRoute } from './components/ProtectedRoute'
import './App.css'

function App() {
  const config = getConfig()

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={config.routes.login} element={<Login />} />
          <Route path={config.routes.authCallback} element={<AuthCallback />} />
          <Route
            path={config.routes.dashboard}
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path={config.routes.home} element={<Navigate to={config.routes.dashboard} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

