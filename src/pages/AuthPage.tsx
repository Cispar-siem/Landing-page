import { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';

const LICENSE_SERVER_URL =
  (import.meta.env.VITE_LICENSE_SERVER_URL as string | undefined) ??
  'https://cispar-license-server.fly.dev';

/**
 * Extracts the `code` query parameter from the hash-based URL used by HashRouter.
 * Example: `https://.../#/auth?code=XXXX` → `"XXXX"`
 * @returns The device code string, or null if not present.
 */
function getDeviceCode(): string | null {
  const hash = window.location.hash;
  const queryStart = hash.indexOf('?');
  if (queryStart === -1) return null;
  const params = new URLSearchParams(hash.slice(queryStart));
  return params.get('code');
}

/** Represents the current step of the authorization flow. */
type AuthStep = 'login' | 'approving' | 'success' | 'error';

/** Google "G" logo inline SVG, color version. */
function GoogleIcon(): React.ReactElement {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

/** Shield icon matching the CISPAR brand mark. */
function ShieldBrandIcon(): React.ReactElement {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shieldGradAuth" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d="M16 2L4 7v9c0 7.18 5.14 13.9 12 15.5C22.86 29.9 28 23.18 28 16V7L16 2z"
        fill="url(#shieldGradAuth)"
      />
      <path
        d="M13 16.5l2.5 2.5 5-5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Animated spinner for loading states. */
function Spinner(): React.ReactElement {
  return (
    <svg
      className="animate-spin"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="10"
        opacity="0.3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Approving step view shown while the device authorization POST is in flight.
 */
function ApprovingView(): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div className="text-accent-blue">
        <Spinner />
      </div>
      <div>
        <p className="text-lg font-semibold text-text-primary">Authorizing terminal...</p>
        <p className="text-sm text-text-secondary mt-1">Linking your CLI session to this account.</p>
      </div>
    </div>
  );
}

/**
 * Success step view shown after the device has been successfully authorized.
 */
function SuccessView(): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 13l4 4L19 7"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <p className="text-xl font-bold text-text-primary">Terminal authorized!</p>
        <p className="text-sm text-text-secondary mt-2">You can close this window.</p>
        <p className="text-xs text-text-secondary mt-1 opacity-60">CISPAR SOC is now starting...</p>
      </div>
    </div>
  );
}

/**
 * Error step view rendered when authorization or authentication fails.
 * @param message - Human-readable error description.
 * @param onRetry - Callback to reset back to the login step.
 */
function ErrorView({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry: () => void;
}): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 18L18 6M6 6l12 12"
            stroke="#ef4444"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="w-full">
        <p className="text-lg font-bold text-text-primary">Authorization failed</p>
        <p className="text-sm text-text-secondary mt-2 leading-relaxed">{message}</p>
      </div>
      <button onClick={onRetry} className="btn-ghost text-sm w-full justify-center">
        Try again
      </button>
    </div>
  );
}

/**
 * Auth page component handling both email/password and Google OAuth flows.
 *
 * Supports two modes:
 * - **CLI authorization**: URL contains `?code=XXXX` — after login, approves
 *   the device code against the license server.
 * - **Standalone login**: No code present — authenticates the user only.
 *
 * Must be rendered under HashRouter at the `/auth` route.
 */
export function AuthPage(): React.ReactElement {
  const [step, setStep] = useState<AuthStep>('login');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const deviceCode = getDeviceCode();

  async function approveDevice(accessToken: string): Promise<void> {
    if (!deviceCode) {
      setStep('success');
      return;
    }
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
        setErrorMessage(
          data.error ?? "Your account doesn't have an active plan. Contact sales@cispar.io",
        );
        setStep('error');
      }
    } catch {
      setErrorMessage('Could not connect to the server. Please try again.');
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
    setIsEmailLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsEmailLoading(false);
    if (error) { setErrorMessage(error.message); setStep('error'); }
  }

  async function handleGoogleLogin(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    setIsGoogleLoading(true);
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-grid pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div
        className="relative z-10 w-full max-w-md"
        style={{
          background: 'rgba(17, 17, 24, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '2.5rem',
        }}
      >
        <div className="flex flex-col items-center gap-3 mb-8">
          <ShieldBrandIcon />
          <div className="text-center">
            <h1 className="text-2xl font-bold gradient-text">CISPAR SOC</h1>
            <p className="text-sm text-text-secondary mt-1">Autonomous Security Operations</p>
          </div>
          {deviceCode !== null && step === 'login' && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              CLI Authorization
            </div>
          )}
        </div>

        {step === 'approving' && <ApprovingView />}
        {step === 'success' && <SuccessView />}
        {step === 'error' && (
          <ErrorView
            message={errorMessage}
            onRetry={() => {
              setStep('login');
              setErrorMessage('');
            }}
          />
        )}

        {step === 'login' && (
          <div className="flex flex-col gap-4">
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-3" noValidate>
              <div>
                <label htmlFor="auth-email" className="block text-xs font-medium text-text-secondary mb-1.5">
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none transition-colors"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                />
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-xs font-medium text-text-secondary mb-1.5">
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none transition-colors"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isEmailLoading}
                className="btn-primary w-full justify-center mt-1"
                style={{ opacity: isEmailLoading ? 0.7 : 1 }}
              >
                {isEmailLoading ? (
                  <>
                    <Spinner />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-xs text-text-secondary">or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.97)',
                color: '#1f1f1f',
                border: '1px solid rgba(255,255,255,0.15)',
                opacity: isGoogleLoading ? 0.7 : 1,
              }}
            >
              {isGoogleLoading ? <Spinner /> : <GoogleIcon />}
              Continue with Google
            </button>

            <p className="text-center text-xs text-text-secondary mt-2">
              Don&apos;t have access?{' '}
              <a
                href="mailto:sales@cispar.io"
                className="underline hover:text-text-primary transition-colors"
                style={{ color: '#60a5fa' }}
              >
                Contact sales@cispar.io
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
