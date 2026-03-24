import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const LICENSE_SERVER_URL =
  (import.meta.env.VITE_LICENSE_SERVER_URL as string | undefined) ??
  'https://cispar-license-server.fly.dev';

function getDeviceCode(): string | null {
  const hash = window.location.hash;
  const queryStart = hash.indexOf('?');
  if (queryStart === -1) return null;
  return new URLSearchParams(hash.slice(queryStart)).get('code');
}

function GoogleIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.358 12.08 17.64 10.84 17.64 9.2z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function Spinner(): React.ReactElement {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.416" strokeDashoffset="10" opacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

type AuthStep = 'login' | 'approving' | 'success' | 'error';

/**
 * Login modal with email/password and Google Sign-In.
 * Handles device authorization flow when a CLI code is present in the URL.
 * Rendered at the app root level — controlled by AuthContext.
 */
export function AuthModal(): React.ReactElement {
  const { isLoginOpen, closeLogin } = useAuth();
  const [step, setStep] = useState<AuthStep>('login');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const deviceCode = getDeviceCode();

  async function approveDevice(accessToken: string): Promise<void> {
    if (!deviceCode) { setStep('success'); return; }
    setStep('approving');
    try {
      const res = await fetch(`${LICENSE_SERVER_URL}/device/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceCode, supabaseToken: accessToken }),
      });
      if (res.ok) {
        setStep('success');
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "No active plan. Contact sales@cispar.io");
        setStep('error');
      }
    } catch {
      setError('Could not connect to license server. Try again.');
      setStep('error');
    }
  }

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) await approveDevice(session.access_token);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleEmailLogin(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setEmailLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setEmailLoading(false);
    if (authError) { setError(authError.message); setStep('error'); }
  }

  async function handleGoogleLogin(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    });
  }

  function reset(): void { setStep('login'); setError(''); }

  return (
    <AnimatePresence>
      {isLoginOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={closeLogin}
            aria-hidden="true"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className="w-full max-w-md pointer-events-auto"
              style={{
                background: 'rgba(17, 17, 24, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '2rem',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="shieldModal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <path d="M16 2L4 7v9c0 7.18 5.14 13.9 12 15.5C22.86 29.9 28 23.18 28 16V7L16 2z" fill="url(#shieldModal)" />
                    <path d="M13 16.5l2.5 2.5 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h2 id="auth-modal-title" className="text-lg font-bold gradient-text">CISPAR SOC</h2>
                </div>
                <button
                  onClick={closeLogin}
                  aria-label="Close"
                  className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {deviceCode && step === 'login' && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 w-fit"
                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  CLI Authorization
                </div>
              )}

              {step === 'approving' && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="text-accent-blue"><Spinner /></div>
                  <p className="text-sm text-text-secondary">Authorizing terminal...</p>
                </div>
              )}

              {step === 'success' && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">{deviceCode ? 'Terminal authorized!' : 'Signed in!'}</p>
                    {deviceCode && <p className="text-xs text-text-secondary mt-1">You can close this window.</p>}
                  </div>
                </div>
              )}

              {step === 'error' && (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M6 18L18 6M6 6l12 12" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{error}</p>
                  <button onClick={reset} className="btn-ghost text-sm w-full justify-center">Try again</button>
                </div>
              )}

              {step === 'login' && (
                <div className="flex flex-col gap-3">
                  <form onSubmit={handleEmailLogin} className="flex flex-col gap-3" noValidate>
                    <input
                      type="email" autoComplete="email" required
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      aria-label="Email"
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    />
                    <input
                      type="password" autoComplete="current-password" required
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      aria-label="Password"
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    />
                    <button type="submit" disabled={emailLoading} className="btn-primary w-full justify-center" style={{ opacity: emailLoading ? 0.7 : 1 }}>
                      {emailLoading ? <><Spinner /> Signing in...</> : 'Sign In'}
                    </button>
                  </form>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <span className="text-xs text-text-secondary">or</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  </div>

                  <button
                    type="button" onClick={handleGoogleLogin} disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.97)', color: '#1f1f1f', border: '1px solid rgba(255,255,255,0.15)', opacity: googleLoading ? 0.7 : 1 }}
                  >
                    {googleLoading ? <Spinner /> : <GoogleIcon />}
                    Continue with Google
                  </button>

                  <p className="text-center text-xs text-text-secondary mt-1">
                    No account?{' '}
                    <a href="mailto:sales@cispar.io" style={{ color: '#60a5fa' }} className="underline hover:text-text-primary transition-colors">
                      Contact sales@cispar.io
                    </a>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
