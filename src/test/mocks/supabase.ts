import { vi } from 'vitest'

export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        is: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(),
          })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
}

