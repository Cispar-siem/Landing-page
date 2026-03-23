import { useState } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

/**
 * Final CTA section with email capture form for early access requests.
 */
export function CallToAction(): React.ReactElement {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 });
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setSubmitted(true);
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
            Ready to stop threats{' '}
            <span className="gradient-text">before they start?</span>
          </h2>
          <p className="text-lg text-text-secondary mb-10 leading-relaxed">
            Get early access to CISPAR and let our AI agent handle your L1, L2, and L3
            security operations — so your team can focus on what matters.
          </p>

          {submitted ? (
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
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              noValidate
            >
              <div className="flex-1">
                <label htmlFor="cta-email" className="sr-only">
                  Work email
                </label>
                <input
                  id="cta-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              <button type="submit" className="btn-primary whitespace-nowrap px-7 py-3.5">
                Request Access
              </button>
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
