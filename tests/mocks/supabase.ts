// Mock Supabase client for testing
// This replaces the real @supabase/supabase-js module during tests

type MockSession = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    created_at: string;
  };
  expires_in: number;
  token_type: string;
};

type AuthStateCallback = (event: string, session: MockSession | null) => void;

let currentSession: MockSession | null = null;
const authStateCallbacks: AuthStateCallback[] = [];

const createMockSession = (email: string = 'test@cispar.io'): MockSession => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  user: {
    id: 'user-123',
    email,
    created_at: new Date().toISOString(),
  },
  expires_in: 3600,
  token_type: 'bearer',
});

const triggerAuthStateChange = (event: string, session: MockSession | null) => {
  authStateCallbacks.forEach(cb => cb(event, session));
};

const mockClient = {
  auth: {
    getSession: async () => ({
      data: { session: currentSession },
      error: null,
    }),
    signInWithPassword: async ({ email }: { email: string; password: string }) => {
      currentSession = createMockSession(email);
      triggerAuthStateChange('SIGNED_IN', currentSession);
      return { data: { session: currentSession, user: currentSession.user }, error: null };
    },
    signInWithOAuth: async ({ provider, options }: { provider: string; options: { redirectTo: string } }) => {
      // Simulate OAuth by redirecting
      if (options.redirectTo) {
        window.location.href = options.redirectTo;
      }
      return { data: { provider }, error: null };
    },
    signOut: async () => {
      currentSession = null;
      triggerAuthStateChange('SIGNED_OUT', null);
      return { error: null };
    },
    onAuthStateChange: (callback: AuthStateCallback) => {
      authStateCallbacks.push(callback);
      // Fire INITIAL_SESSION if there's a current session
      if (currentSession) {
        callback('INITIAL_SESSION', currentSession);
      }
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const idx = authStateCallbacks.indexOf(callback);
              if (idx >= 0) authStateCallbacks.splice(idx, 1);
            }),
          },
        },
      };
    },
  },
};

export const createClient = () => mockClient;

// Helper to reset state between tests
export const __resetMockSupabase = () => {
  currentSession = null;
  authStateCallbacks.length = 0;
};

// Helper to set pre-existing session
export const __setMockSession = (session: MockSession | null) => {
  currentSession = session;
  if (session) {
    triggerAuthStateChange('INITIAL_SESSION', session);
  }
};

// Export default for compatibility
export default { createClient, __resetMockSupabase, __setMockSession };