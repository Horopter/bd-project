import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getConfig } from '../config'

let supabaseInstance: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const config = getConfig()
  const { url, anonKey } = config.supabase

  if (!url || !anonKey) {
    console.warn('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  }

  supabaseInstance = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseInstance
}

export const resetSupabaseClient = (): void => {
  supabaseInstance = null
}

// Export default instance for backward compatibility
export const supabase = getSupabaseClient()
