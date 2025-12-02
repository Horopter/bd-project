# BD Project - Reusable Authentication & Session Tracking Library

A production-ready, implementation-agnostic React library for Google OAuth authentication and Supabase session history tracking. Designed to be easily integrated into multiple projects with full configurability.

## Features

- 🔐 **OAuth Authentication** - Google OAuth via Supabase (configurable for other providers)
- 📊 **Session History Tracking** - Automatic session tracking with IP and user agent
- 🎨 **Fully Configurable** - Customize routes, UI text, table names, and more
- 🔒 **Protected Routes** - Built-in route protection component
- 📱 **Responsive Design** - Mobile-friendly UI components
- 🧪 **Comprehensive Tests** - Full test coverage with Vitest
- 🔧 **TypeScript** - Full type safety throughout

## Installation

```bash
npm install
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [Supabase](https://app.supabase.com)
2. Go to Project Settings > API
3. Copy your Project URL and anon/public key

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Configure the Application

Before using the components, configure the application to match your needs:

```typescript
import { setConfig } from './config'

setConfig({
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
  },
  routes: {
    login: '/login',
    dashboard: '/dashboard',
    authCallback: '/auth/callback',
    home: '/',
  },
  ui: {
    appName: 'My Application',
    loginTitle: 'Welcome to My App',
    loginSubtitle: 'Please sign in to continue',
    dashboardTitle: 'My Dashboard',
  },
  auth: {
    provider: 'google', // or 'github', 'facebook', 'twitter'
  },
  sessionTracking: {
    tableName: 'session_history', // Your table name
    maxHistoryLimit: 50,
    enableIPTracking: true,
    enableUserAgentTracking: true,
  },
})
```

### 5. Set Up Database Schema

Run the SQL script in your Supabase SQL Editor:

```bash
# See supabase-setup.sql for the complete schema
```

Or run it directly in Supabase:

1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-setup.sql`
3. Execute the script

### 6. Enable OAuth Provider in Supabase

1. Go to Authentication > Providers
2. Enable your chosen provider (Google, GitHub, etc.)
3. Add OAuth credentials
4. Add redirect URL: `http://localhost:3000/auth/callback` (or your production URL)

### 7. Run the Application

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration Options

### Full Configuration Interface

```typescript
interface AppConfig {
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
```

### Example: Custom Configuration

```typescript
import { setConfig } from './config'

// Customize for your project
setConfig({
  routes: {
    login: '/signin',
    dashboard: '/app',
    authCallback: '/oauth/callback',
    home: '/',
  },
  ui: {
    appName: 'My SaaS Platform',
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Sign in to access your account',
    dashboardTitle: 'My Account',
  },
  sessionTracking: {
    tableName: 'user_sessions', // Custom table name
    maxHistoryLimit: 100,
    enableIPTracking: false, // Disable IP tracking
  },
  auth: {
    provider: 'github', // Use GitHub instead of Google
  },
})
```

## Usage in Your Project

### Basic Integration

```typescript
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import { setConfig } from './config'

// Configure before rendering
setConfig({
  // ... your configuration
})

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

### Using the Auth Hook

```typescript
import { useAuth } from './hooks/useAuth'

function MyComponent() {
  const { user, loading, signIn, signOut, sessionHistory } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <button onClick={signIn}>Sign In</button>

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
      <p>Total sessions: {sessionHistory.length}</p>
    </div>
  )
}
```

### Custom Protected Route

```typescript
import { ProtectedRoute } from './components/ProtectedRoute'

// With custom redirect
<ProtectedRoute redirectTo="/custom-login">
  <MyProtectedComponent />
</ProtectedRoute>
```

## Testing

This project includes comprehensive test coverage using Vitest and React Testing Library.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Structure

```
src/
├── components/
│   └── __tests__/
│       ├── Login.test.tsx
│       └── ProtectedRoute.test.tsx
├── contexts/
│   └── __tests__/
│       └── AuthContext.test.tsx
├── config/
│   └── __tests__/
│       └── index.test.ts
└── test/
    ├── setup.ts
    └── mocks/
        ├── supabase.ts
        └── config.ts
```

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Login.tsx        # Login page component
│   ├── Dashboard.tsx   # Dashboard component
│   ├── SessionHistory.tsx  # Session history display
│   ├── AuthCallback.tsx    # OAuth callback handler
│   ├── ProtectedRoute.tsx  # Route protection
│   └── __tests__/      # Component tests
├── contexts/
│   ├── AuthContext.tsx     # Authentication context
│   └── __tests__/      # Context tests
├── hooks/
│   └── useAuth.ts      # Authentication hook
├── lib/
│   └── supabase.ts     # Supabase client (configurable)
├── config/
│   ├── index.ts        # Configuration system
│   └── __tests__/     # Config tests
├── types/
│   └── session.ts      # TypeScript types
├── test/
│   ├── setup.ts        # Test setup
│   └── mocks/          # Test mocks
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## Making It Implementation-Agnostic

This library is designed to work across multiple projects:

### 1. **Configurable Routes**
   - All routes are configurable via `setConfig()`
   - No hardcoded paths

### 2. **Configurable Table Names**
   - Session tracking table name is configurable
   - Works with any Supabase table structure

### 3. **Configurable UI Text**
   - All user-facing text is configurable
   - Easy to rebrand for different projects

### 4. **Configurable Auth Provider**
   - Supports multiple OAuth providers
   - Easy to switch between providers

### 5. **Modular Components**
   - Components can be used independently
   - Easy to customize styling

### 6. **Type-Safe Configuration**
   - Full TypeScript support
   - Configuration is type-checked

## Advanced Usage

### Custom Session Tracking

```typescript
import { setConfig } from './config'

// Use a custom table name
setConfig({
  sessionTracking: {
    tableName: 'custom_sessions',
    maxHistoryLimit: 200,
    enableIPTracking: true,
    enableUserAgentTracking: true,
    ipServiceUrl: 'https://your-ip-service.com/api',
  },
})
```

### Multiple Projects, One Codebase

```typescript
// project-a-config.ts
export const projectAConfig = {
  ui: { appName: 'Project A' },
  routes: { dashboard: '/project-a/dashboard' },
}

// project-b-config.ts
export const projectBConfig = {
  ui: { appName: 'Project B' },
  routes: { dashboard: '/project-b/dashboard' },
}

// In each project's entry point
import { setConfig } from './config'
import { projectAConfig } from './project-a-config'

setConfig(projectAConfig)
```

## API Reference

### `setConfig(config: Partial<AppConfig>)`

Updates the application configuration. Merges with existing config.

### `getConfig(): AppConfig`

Returns the current configuration.

### `resetConfig(): void`

Resets configuration to defaults.

### `useAuth(): AuthContextType`

React hook for accessing authentication state and methods.

**Returns:**
- `user: User | null` - Current user
- `session: Session | null` - Current session
- `loading: boolean` - Loading state
- `signIn: () => Promise<void>` - Sign in function
- `signOut: () => Promise<void>` - Sign out function
- `sessionHistory: SessionHistory[]` - User's session history
- `loadingHistory: boolean` - Session history loading state

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Troubleshooting

### OAuth Redirect Errors
- Ensure redirect URL in Supabase matches exactly (including protocol and port)
- Check that `authCallback` route in config matches your Supabase redirect URL

### Session History Not Showing
- Verify database table exists and RLS policies are set up
- Check that `tableName` in config matches your actual table name
- Ensure user has proper permissions

### Configuration Not Working
- Make sure to call `setConfig()` before rendering components
- Check that configuration object structure matches `AppConfig` interface

### Environment Variables
- Variables must start with `VITE_` to be accessible in the browser
- Restart dev server after changing `.env` file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass: `npm test`
6. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
