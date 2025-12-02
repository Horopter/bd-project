import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
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
    routes: { login: '/login', dashboard: '/dashboard' },
    sessionTracking: { tableName: 'session_history', maxHistoryLimit: 50, enableIPTracking: true, enableUserAgentTracking: true, ipServiceUrl: 'https://api.ipify.org?format=json' },
    auth: { provider: 'google' },
  }),
}))

const TestComponent = () => <div>Protected Content</div>

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when user is authenticated', async () => {
    (mockSupabaseClient.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        session: {
          user: { id: '123', email: 'test@example.com' },
        },
      },
    })
    ;(mockSupabaseClient.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    )

    await screen.findByText('Protected Content')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    (mockSupabaseClient.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: null },
    })
    ;(mockSupabaseClient.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    )

    // Should redirect to login, so protected content should not be visible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows loading state while checking authentication', () => {
    (mockSupabaseClient.auth.getSession as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )
    ;(mockSupabaseClient.auth.onAuthStateChange as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})

