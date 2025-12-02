export const mockConfig = {
  supabase: {
    url: 'https://test.supabase.co',
    anonKey: 'test-anon-key',
  },
  routes: {
    login: '/login',
    dashboard: '/dashboard',
    authCallback: '/auth/callback',
    home: '/',
  },
  sessionTracking: {
    tableName: 'session_history',
    ipServiceUrl: 'https://api.ipify.org?format=json',
    maxHistoryLimit: 50,
    enableIPTracking: true,
    enableUserAgentTracking: true,
  },
  ui: {
    appName: 'Test App',
    loginTitle: 'Welcome',
    loginSubtitle: 'Sign in to continue',
    dashboardTitle: 'Dashboard',
  },
  auth: {
    provider: 'google' as const,
  },
}

