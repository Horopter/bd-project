import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { SessionHistory as SessionHistoryType } from '../types/session'
import './SessionHistory.css'

export const SessionHistory: React.FC = () => {
  const { sessionHistory, loadingHistory } = useAuth()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateDuration = (start: string, end: string | null) => {
    if (!end) return 'Active'
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    const diffMs = endTime - startTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`
    return `${diffMins}m`
  }

  const getBrowserInfo = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown'
    
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Other'
  }

  if (loadingHistory) {
    return (
      <div className="session-history-container">
        <div className="loading-spinner">Loading session history...</div>
      </div>
    )
  }

  if (sessionHistory.length === 0) {
    return (
      <div className="session-history-container">
        <div className="empty-state">
          <p>No session history available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="session-history-container">
      <h2 className="session-history-title">Session History</h2>
      <div className="session-list">
        {sessionHistory.map((session: SessionHistoryType) => (
          <div key={session.id} className="session-item">
            <div className="session-header">
              <div className="session-status">
                <span className={`status-indicator ${session.session_end ? 'inactive' : 'active'}`}></span>
                <span className="status-text">
                  {session.session_end ? 'Ended' : 'Active'}
                </span>
              </div>
              <div className="session-duration">
                {calculateDuration(session.session_start, session.session_end)}
              </div>
            </div>
            <div className="session-details">
              <div className="session-detail-row">
                <span className="detail-label">Started:</span>
                <span className="detail-value">{formatDate(session.session_start)}</span>
              </div>
              {session.session_end && (
                <div className="session-detail-row">
                  <span className="detail-label">Ended:</span>
                  <span className="detail-value">{formatDate(session.session_end)}</span>
                </div>
              )}
              <div className="session-detail-row">
                <span className="detail-label">Browser:</span>
                <span className="detail-value">{getBrowserInfo(session.user_agent)}</span>
              </div>
              {session.ip_address && (
                <div className="session-detail-row">
                  <span className="detail-label">IP Address:</span>
                  <span className="detail-value">{session.ip_address}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

