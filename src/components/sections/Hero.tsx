import { motion } from 'framer-motion';

/** Animated background grid + orb decorations. */
function HeroBackground(): React.ReactElement {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float-1"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-float-2"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full opacity-10 blur-3xl animate-float-3"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
      />
    </div>
  );
}

/** Animated status badge shown above the hero headline. */
function StatusBadge(): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8"
      style={{
        borderColor: 'rgba(16, 185, 129, 0.3)',
        background: 'rgba(16, 185, 129, 0.08)',
        color: '#10b981',
      }}
    >
      <span
        className="w-2 h-2 rounded-full bg-safe animate-pulse-slow"
        aria-hidden="true"
      />
      Autonomous SOC — Active 24/7
    </motion.div>
  );
}

/** Scroll indicator arrow at the bottom of the hero. */
function ScrollIndicator(): React.ReactElement {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
      <span className="text-xs text-text-secondary tracking-widest uppercase">Scroll</span>
      <svg
        className="animate-scroll-bounce"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

/**
 * Full-screen hero section with headline, subheading, dual CTAs,
 * and animated background orbs.
 */
export function Hero(): React.ReactElement {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
      aria-label="Hero"
    >
      <HeroBackground />

      <div className="section-container relative z-10 py-32 flex flex-col items-center">
        <StatusBadge />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-tight mb-6"
        >
          Your Autonomous SOC.{' '}
          <span className="gradient-text">No Analysts Required.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-lg sm:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed"
        >
          CISPAR is an AI agent that detects, investigates, and contains security
          threats — automatically. L1, L2, and L3. MITRE ATT&amp;CK mapped. Running
          around the clock.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <a href="#contact" className="btn-primary text-base px-8 py-4">
            Request Early Access
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a href="#terminal" className="btn-ghost text-base px-8 py-4">
            See It in Action
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-text-secondary"
        >
          {[
            { icon: '🛡️', text: 'MITRE ATT&CK Mapped' },
            { icon: '⚡', text: '<15 min Response Time' },
            { icon: '🔒', text: 'Evidence-First Protocol' },
            { icon: '🤖', text: 'Multi-Model AI' },
          ].map(({ icon, text }) => (
            <span key={text} className="flex items-center gap-2">
              <span aria-hidden="true">{icon}</span>
              {text}
            </span>
          ))}
        </motion.div>
      </div>

      <ScrollIndicator />
    </section>
  );
}
