import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSupabaseClient } from '../lib/supabase'
import { getConfig } from '../config'
import './AuthCallback.css'

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const config = getConfig()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          navigate(config.routes.login)
          return
        }

        if (data.session) {
          navigate(config.routes.dashboard)
        } else {
          navigate(config.routes.login)
        }
      } catch (error) {
        console.error('Error handling auth callback:', error)
        navigate(config.routes.login)
      }
    }

    handleAuthCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-spinner"></div>
      <p>Completing sign in...</p>
    </div>
  )
}

