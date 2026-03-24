import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  isLoginOpen: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: false,
  openLogin: () => undefined,
  closeLogin: () => undefined,
  isLoginOpen: false,
  signOut: async () => undefined,
});

/** Returns the current auth context value. Must be used inside AuthProvider. */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

/**
 * Provides authentication state and modal control to the entire app.
 * Supabase is optional — if env vars are missing, auth features are disabled.
 */
export function AuthProvider({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession) setIsLoginOpen(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut(): Promise<void> {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      openLogin: () => setIsLoginOpen(true),
      closeLogin: () => setIsLoginOpen(false),
      isLoginOpen,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
