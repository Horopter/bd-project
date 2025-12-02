import { describe, it, expect, beforeEach } from 'vitest'
import { getConfig, setConfig, resetConfig } from '../index'

describe('Config', () => {
  beforeEach(() => {
    resetConfig()
  })

  it('returns default configuration', () => {
    const config = getConfig()
    
    expect(config.routes.login).toBe('/login')
    expect(config.routes.dashboard).toBe('/dashboard')
    expect(config.sessionTracking.tableName).toBe('session_history')
    expect(config.auth.provider).toBe('google')
  })

  it('allows setting partial configuration', () => {
    setConfig({
      ui: {
        appName: 'Custom App',
        loginTitle: 'Custom Title',
        loginSubtitle: 'Custom Subtitle',
        dashboardTitle: 'Custom Dashboard',
      },
    })

    const config = getConfig()
    expect(config.ui.appName).toBe('Custom App')
    expect(config.ui.loginTitle).toBe('Custom Title')
    expect(config.routes.login).toBe('/login') // Should still have default
  })

  it('merges nested configuration objects', () => {
    setConfig({
      routes: {
        login: '/custom-login',
        dashboard: '/dashboard',
        authCallback: '/auth/callback',
        home: '/',
      },
    })

    const config = getConfig()
    expect(config.routes.login).toBe('/custom-login')
    expect(config.routes.dashboard).toBe('/dashboard') // Other routes unchanged
  })

  it('resets to default configuration', () => {
    setConfig({
      ui: {
        appName: 'Changed App',
        loginTitle: 'Changed',
        loginSubtitle: 'Changed',
        dashboardTitle: 'Changed',
      },
    })

    resetConfig()
    const config = getConfig()
    expect(config.ui.appName).toBe('BD Project')
  })
})

