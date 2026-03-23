import { useState } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

type FormState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Final CTA section with email capture form.
 * Submits to Web3Forms → forwards to axeliparrea@gmail.com.
 *
 * To activate: replace ACCESS_KEY with the key you receive at
 * https://web3forms.com  (enter axeliparrea@gmail.com → check inbox).
 */
const WEB3FORMS_ACCESS_KEY = 'YOUR_ACCESS_KEY_HERE';

/**
 * Final CTA section with email capture form for early access requests.
 */
export function CallToAction(): React.ReactElement {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 });
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setFormState('loading');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `CISPAR Early Access Request — ${trimmedEmail}`,
          name: name.trim() || 'Unknown',
          email: trimmedEmail,
          message: `New early access request from the CISPAR landing page.\n\nName: ${name.trim() || '—'}\nEmail: ${trimmedEmail}`,
          from_name: 'CISPAR Landing Page',
        }),
      });

      const data: { success: boolean } = await response.json();

      if (data.success) {
        setFormState('success');
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="py-32 relative overflow-hidden"
      aria-label="Request early access"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(59,130,246,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="section-container relative z-10">
        <div
          className={`max-w-2xl mx-auto text-center animate-on-scroll ${isVisible ? 'visible' : ''}`}
        >
          <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#3b82f6' }}>
            Early Access
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
            Don't be the breach{' '}
            <span className="gradient-text">that made the news.</span>
          </h2>
          <p className="text-lg text-text-secondary mb-10 leading-relaxed">
            We built CISPAR because hiring a real SOC team costs $500K/year — and most companies
            can't afford to wait 280 days to find out they were breached. Get early access and be
            the first to run it on your infrastructure.
          </p>

          {formState === 'success' ? (
            <div
              className="inline-flex items-center gap-3 px-8 py-5 rounded-xl border"
              style={{
                borderColor: 'rgba(16,185,129,0.3)',
                background: 'rgba(16,185,129,0.08)',
                color: '#10b981',
              }}
              role="status"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="font-semibold">You're on the list. We'll be in touch soon.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 max-w-md mx-auto"
              noValidate
            >
              <div>
                <label htmlFor="cta-name" className="sr-only">
                  Your name
                </label>
                <input
                  id="cta-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full px-4 py-3.5 rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label htmlFor="cta-email" className="sr-only">
                    Work email
                  </label>
                  <input
                    id="cta-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="your@company.com"
                    required
                    className="w-full px-4 py-3.5 rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: error
                        ? '1px solid rgba(239,68,68,0.5)'
                        : '1px solid rgba(255,255,255,0.1)',
                    }}
                    aria-describedby={error ? 'cta-email-error' : undefined}
                  />
                  {error && (
                    <p id="cta-email-error" className="mt-1.5 text-xs text-danger text-left">
                      {error}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={formState === 'loading'}
                  className="btn-primary whitespace-nowrap px-7 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formState === 'loading' ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Request Access'
                  )}
                </button>
              </div>

              {formState === 'error' && (
                <p className="text-xs text-danger text-center">
                  Something went wrong. Please try again or email us directly at{' '}
                  <a href="mailto:axeliparrea@gmail.com" className="underline">
                    axeliparrea@gmail.com
                  </a>
                  .
                </p>
              )}
            </form>
          )}

          <p className="mt-6 text-xs text-text-secondary">
            No spam. No credit card required. We'll reach out to schedule a personalized demo.
          </p>
        </div>
      </div>
    </section>
  );
}
