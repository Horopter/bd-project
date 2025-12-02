import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../AuthContext'
import { useAuth } from '../../hooks/useAuth'
import { mockSupabaseClient } from '../../test/mocks/supabase'

vi.mock('../../lib/supabase', async () => {
  const { mockSupabaseClient } = await import('../../test/mocks/supabase')
  return {
    getSupabaseClient: () => mockSupabaseClient,
    supabase: mockSupabaseClient,
  }
})

vi.mock('../../config', () => ({
  getConfig: () => ({
    routes: { authCallback: '/auth/callback' },
    sessionTracking: { tableName: 'session_history', maxHistoryLimit: 50, enableIPTracking: true, enableUserAgentTracking: true, ipServiceUrl: 'https://api.ipify.org?format=json' },
    auth: { provider: 'google' },
  }),
}))

const TestComponent = () => {
  const { user, loading, signIn, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>
  
  return (
    <div>
      <div>User: {user.email}</div>
      <button onClick={signIn}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ ip: '127.0.0.1' }),
      } as Response)
    ) as typeof fetch
  })

  it('provides loading state initially', () => {
    (mockSupabaseClient.auth.getSession as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )
    ;(mockSupabaseClient.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('provides user when authenticated', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    ;(mockSupabaseClient.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
        },
      },
    })
    ;(mockSupabaseClient.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
    ;(mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ error: null })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument()
    })
  })

  it('calls signInWithOAuth when signIn is called', async () => {
    (mockSupabaseClient.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: null },
    })
    ;(mockSupabaseClient.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
    ;(mockSupabaseClient.auth.signInWithOAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
      error: null,
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      const signInButton = screen.getByText('Sign In')
      signInButton.click()
    })

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalled()
    })
  })
})

