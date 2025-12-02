export interface AppConfig {
  supabase: {
    url: string
    anonKey: string
  }
  routes: {
    login: string
    dashboard: string
    authCallback: string
    home: string
  }
  sessionTracking: {
    tableName: string
    ipServiceUrl: string
    maxHistoryLimit: number
    enableIPTracking: boolean
    enableUserAgentTracking: boolean
  }
  ui: {
    appName: string
    loginTitle: string
    loginSubtitle: string
    dashboardTitle: string
  }
  auth: {
    provider: 'google' | 'github' | 'facebook' | 'twitter'
    redirectTo?: string
  }
}

const defaultConfig: AppConfig = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
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
    appName: 'BD Project',
    loginTitle: 'Welcome',
    loginSubtitle: 'Sign in to continue',
    dashboardTitle: 'Dashboard',
  },
  auth: {
    provider: 'google',
  },
}

let appConfig: AppConfig = { ...defaultConfig }

export const getConfig = (): AppConfig => appConfig

export const setConfig = (config: Partial<AppConfig>): void => {
  appConfig = {
    ...appConfig,
    ...config,
    supabase: { ...appConfig.supabase, ...config.supabase },
    routes: { ...appConfig.routes, ...config.routes },
    sessionTracking: { ...appConfig.sessionTracking, ...config.sessionTracking },
    ui: { ...appConfig.ui, ...config.ui },
    auth: { ...appConfig.auth, ...config.auth },
  }
}

export const resetConfig = (): void => {
  appConfig = { ...defaultConfig }
}

