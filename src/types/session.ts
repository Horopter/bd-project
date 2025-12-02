export interface SessionHistory {
  id: string
  user_id: string
  session_start: string
  session_end: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

