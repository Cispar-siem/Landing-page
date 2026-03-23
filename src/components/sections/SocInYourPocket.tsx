import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const PILLARS = [
  {
    id: 'continuous-security',
    label: 'Continuous Security',
    headline: 'Always on. Always protecting.',
    body: 'CISPAR monitors every log, packet, and process around the clock. No shift handoffs. No blind spots. Security that never sleeps, so you can.',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    id: 'continuous-learning',
    label: 'Continuous Learning',
    headline: 'Gets smarter with every threat.',
    body: 'Every incident CISPAR resolves feeds back into its detection engine. Rules update automatically. Playbooks improve. The longer it runs, the sharper it becomes.',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: 'zero-expertise',
    label: 'Zero Expertise Required',
    headline: 'No code. No analysts. No headaches.',
    body: 'CISPAR is your entire security team — automated. You don\'t need to know what MITRE ATT&CK is. You don\'t need to write a single line of code. Install, connect, protect.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <path d="M9 9l2 2 4-4" />
      </svg>
    ),
  },
] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

/**
 * "Complete SOC in your pocket" value proposition section.
 * Three-pillar layout: Continuous Security, Continuous Learning, Zero Expertise.
 */
export function SocInYourPocket(): React.ReactElement {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.05 });

  return (
    <section
      id="why-cispar"
      ref={ref}
      className="py-20 sm:py-28 relative overflow-hidden"
      aria-label="Why CISPAR"
    >
      {/* Subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#10b981' }}>
            No Code. No Team. No Compromise.
          </p>
          <h2 className="section-title mb-5">
            Your complete SOC.{' '}
            <span className="gradient-text">In your pocket.</span>
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Enterprise-grade security used to require a team of analysts, years of expertise, and seven-figure budgets.
            CISPAR changes that — completely autonomous, continuously improving, zero expertise required.
          </p>
        </motion.div>

        {/* Three pillars */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={isVisible ? 'show' : 'hidden'}
          className="grid sm:grid-cols-3 gap-6"
        >
          {PILLARS.map((pillar) => (
            <motion.div
              key={pillar.id}
              variants={item}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 380, damping: 24 } }}
              className="card-glass p-8 flex flex-col gap-5"
              style={{ willChange: 'transform' }}
            >
              {/* Icon + label */}
              <div className="flex items-center gap-3">
                <div
                  className="w-13 h-13 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: pillar.bg, color: pillar.color, width: 52, height: 52 }}
                >
                  {pillar.icon}
                </div>
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: pillar.color }}
                >
                  {pillar.label}
                </span>
              </div>

              {/* Headline */}
              <h3 className="text-xl font-bold text-text-primary leading-snug">
                {pillar.headline}
              </h3>

              {/* Body */}
              <p className="text-sm text-text-secondary leading-relaxed flex-1">
                {pillar.body}
              </p>

              {/* Accent line */}
              <div
                className="h-px w-full rounded-full mt-1"
                style={{ background: `linear-gradient(90deg, ${pillar.color}40 0%, transparent 100%)` }}
                aria-hidden="true"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom proof statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 text-center"
        >
          <div
            className="inline-flex flex-wrap justify-center items-center gap-x-8 gap-y-3 px-8 py-5 rounded-2xl border"
            style={{
              borderColor: 'rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            {[
              { value: '0', detail: 'lines of code to write' },
              { value: '0', detail: 'security analysts to hire' },
              { value: '24/7', detail: 'autonomous protection' },
              { value: '∞', detail: 'learning, forever' },
            ].map(({ value, detail }) => (
              <div key={detail} className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-extrabold gradient-text">{value}</span>
                <span className="text-xs text-text-secondary whitespace-nowrap">{detail}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
