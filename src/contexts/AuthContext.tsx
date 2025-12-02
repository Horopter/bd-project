import React, { createContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '../lib/supabase'
import { SessionHistory } from '../types/session'
import { getConfig } from '../config'

export interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  sessionHistory: SessionHistory[]
  loadingHistory: boolean
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const config = getConfig()
  const supabase = getSupabaseClient()

  // Track session start
  const trackSessionStart = async (userId: string) => {
    try {
      let ipAddress: string | null = null
      let userAgent: string | null = null

      if (config.sessionTracking.enableIPTracking) {
        try {
          const response = await fetch(config.sessionTracking.ipServiceUrl)
          const ipData = await response.json()
          ipAddress = ipData.ip || null
        } catch (error) {
          console.error('Error fetching IP address:', error)
        }
      }

      if (config.sessionTracking.enableUserAgentTracking) {
        userAgent = navigator.userAgent || null
      }

      const { error } = await supabase
        .from(config.sessionTracking.tableName)
        .insert({
          user_id: userId,
          session_start: new Date().toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent
        })
        .select()
        .single()

      if (error) {
        console.error('Error tracking session start:', error)
      }
    } catch (error) {
      console.error('Error tracking session start:', error)
    }
  }

  // Track session end
  const trackSessionEnd = async (userId: string) => {
    try {
      const { data: activeSessions } = await supabase
        .from(config.sessionTracking.tableName)
        .select('id')
        .eq('user_id', userId)
        .is('session_end', null)
        .order('session_start', { ascending: false })
        .limit(1)

      if (activeSessions && activeSessions.length > 0) {
        await supabase
          .from(config.sessionTracking.tableName)
          .update({ session_end: new Date().toISOString() })
          .eq('id', activeSessions[0].id)
      }
    } catch (error) {
      console.error('Error tracking session end:', error)
    }
  }

  // Fetch session history
  const fetchSessionHistory = async (userId: string) => {
    setLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from(config.sessionTracking.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('session_start', { ascending: false })
        .limit(config.sessionTracking.maxHistoryLimit)

      if (error) {
        console.error('Error fetching session history:', error)
      } else {
        setSessionHistory(data || [])
      }
    } catch (error) {
      console.error('Error fetching session history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    let currentUserId: string | null = null

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      currentUserId = session?.user?.id ?? null

      if (session?.user) {
        trackSessionStart(session.user.id)
        fetchSessionHistory(session.user.id)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const previousUserId = currentUserId
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      currentUserId = session?.user?.id ?? null

      if (session?.user) {
        trackSessionStart(session.user.id)
        fetchSessionHistory(session.user.id)
      } else {
        // Track session end when user signs out
        if (previousUserId) {
          await trackSessionEnd(previousUserId)
        }
        setSessionHistory([])
      }
    })

    // Track session end on page unload
    const handleBeforeUnload = () => {
      if (currentUserId) {
        trackSessionEnd(currentUserId)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Track session end on component unmount
      if (currentUserId) {
        trackSessionEnd(currentUserId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signIn = async () => {
    try {
      const redirectTo = config.auth.redirectTo || `${window.location.origin}${config.routes.authCallback}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: config.auth.provider,
        options: {
          redirectTo
        }
      })
      if (error) throw error
    } catch (error) {
      console.error(`Error signing in with ${config.auth.provider}:`, error)
      throw error
    }
  }

  const signOut = async () => {
    if (user) {
      await trackSessionEnd(user.id)
    }
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    sessionHistory,
    loadingHistory
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

