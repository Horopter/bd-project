import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Login } from '../Login'
import { AuthProvider } from '../../contexts/AuthContext'
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
    auth: { provider: 'google' },
    ui: { loginTitle: 'Welcome', loginSubtitle: 'Sign in to continue' },
    sessionTracking: {
      tableName: 'session_history',
      maxHistoryLimit: 50,
      enableIPTracking: true,
      enableUserAgentTracking: true,
      ipServiceUrl: 'https://api.ipify.org?format=json',
    },
  }),
}))

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(mockSupabaseClient.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: null },
    })
    ;(mockSupabaseClient.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  it('renders login form with title and subtitle', () => {
    renderLogin()
    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    renderLogin()
    const signInButton = screen.getByRole('button', { name: /sign in with google/i })
    expect(signInButton).toBeInTheDocument()
  })

  it('calls signIn when button is clicked', async () => {
    const user = userEvent.setup()
    const signInWithOAuth = mockSupabaseClient.auth.signInWithOAuth
    ;(signInWithOAuth as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null })

    renderLogin()
    const signInButton = screen.getByRole('button', { name: /sign in with google/i })
    
    await user.click(signInButton)

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      })
    })
  })

  it('displays error message when sign in fails', async () => {
    const user = userEvent.setup()
    const signInWithOAuth = mockSupabaseClient.auth.signInWithOAuth
    ;(signInWithOAuth as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Sign in failed'))

    renderLogin()
    const signInButton = screen.getByRole('button', { name: /sign in with google/i })
    
    await user.click(signInButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to sign in/i)).toBeInTheDocument()
    })
  })

  it('disables button while loading', async () => {
    const user = userEvent.setup()
    const signInWithOAuth = mockSupabaseClient.auth.signInWithOAuth
    ;(signInWithOAuth as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    renderLogin()
    const signInButton = screen.getByRole('button', { name: /sign in with google/i })
    
    await user.click(signInButton)

    await waitFor(() => {
      expect(signInButton).toBeDisabled()
    })
  })
})

