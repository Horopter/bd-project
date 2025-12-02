import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { getConfig } from '../config'
import { SessionHistory } from './SessionHistory'
import './Dashboard.css'

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const config = getConfig()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">{config.ui.dashboardTitle}</h1>
          <div className="user-info">
            {user?.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="user-avatar"
              />
            )}
            <div className="user-details">
              <span className="user-name">
                {user?.user_metadata?.full_name || user?.email || 'User'}
              </span>
              <span className="user-email">{user?.email}</span>
            </div>
            <button onClick={handleSignOut} className="sign-out-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <SessionHistory />
      </main>
    </div>
  )
}

