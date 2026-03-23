import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

/** Real, documented breach incidents with verified costs. Sources: IBM, FTC, SEC filings. */
const BREACHES = [
  {
    id: 'moveit',
    company: 'MOVEit',
    year: '2023',
    cost: '$9.9B+',
    detail: '2,700+ organizations. 93M people exposed. CL0P ransomware.',
    color: '#ef4444',
  },
  {
    id: 'equifax',
    company: 'Equifax',
    year: '2017',
    cost: '$1.38B',
    detail: '147 million records. $700M FTC settlement.',
    color: '#f97316',
  },
  {
    id: 'tmobile',
    company: 'T-Mobile',
    year: '2021',
    cost: '$500M',
    detail: '76 million customers. $350M settlement + $150M in security spend.',
    color: '#eab308',
  },
  {
    id: 'mgm',
    company: 'MGM Resorts',
    year: '2023',
    cost: '$100M+',
    detail: '37 million customers. Operations paralyzed for days.',
    color: '#ef4444',
  },
  {
    id: 'solarwinds',
    company: 'SolarWinds',
    year: '2020',
    cost: '$200B+',
    detail: '18,000+ organizations. Government agencies compromised.',
    color: '#f97316',
  },
  {
    id: 'colonial',
    company: 'Colonial Pipeline',
    year: '2021',
    cost: '$4.4M',
    detail: 'US fuel supply disrupted. Ransom paid in 75 BTC.',
    color: '#eab308',
  },
] as const;

const KEY_STATS = [
  { value: '$4.88M', label: 'average cost per breach', source: 'IBM 2024' },
  { value: '194 days', label: 'average to detect a breach', source: 'IBM 2024' },
  { value: '$1.5M+', label: 'annual cost of a real 24/7 SOC', source: 'Expel Research' },
] as const;

/** Infinitely scrolling breach ticker using CSS animation. */
function BreachTicker(): React.ReactElement {
  const doubled = [...BREACHES, ...BREACHES];

  return (
    <div className="relative overflow-hidden py-2" aria-label="Recent major cybersecurity breaches">
      <div className="flex gap-4 animate-ticker" style={{ width: 'max-content' }}>
        {doubled.map((breach, i) => (
          <div
            key={`${breach.id}-${i}`}
            className="shrink-0 flex items-start gap-3 px-5 py-4 rounded-xl border"
            style={{
              borderColor: `${breach.color}25`,
              background: `${breach.color}08`,
              width: 300,
            }}
            aria-hidden={i >= BREACHES.length}
          >
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 animate-pulse"
              style={{ background: breach.color }}
            />
            <div>
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-sm font-bold text-text-primary">{breach.company}</span>
                <span className="text-xs text-text-secondary">{breach.year}</span>
                <span className="text-sm font-extrabold ml-auto" style={{ color: breach.color }}>
                  {breach.cost}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{breach.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fade edges */}
      <div
        className="absolute inset-y-0 left-0 w-16 pointer-events-none z-10"
        style={{ background: 'linear-gradient(90deg, #060609 0%, transparent 100%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 right-0 w-16 pointer-events-none z-10"
        style={{ background: 'linear-gradient(270deg, #060609 0%, transparent 100%)' }}
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Breach cost section — real documented incidents and IBM data to establish
 * the cost of NOT having automated security. Placed early to agitate (PAS).
 */
export function BreachCosts(): React.ReactElement {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.05 });
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    el.addEventListener('mouseenter', () => el.style.animationPlayState = 'paused');
    el.addEventListener('mouseleave', () => el.style.animationPlayState = 'running');
    return () => {
      el.removeEventListener('mouseenter', () => el.style.animationPlayState = 'paused');
      el.removeEventListener('mouseleave', () => el.style.animationPlayState = 'running');
    };
  }, []);

  return (
    <section
      ref={ref}
      className="py-16 sm:py-20 relative overflow-hidden"
      aria-label="The real cost of a cybersecurity breach"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(239,68,68,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#ef4444' }}>
            The cost of doing nothing
          </p>
          <h2 className="section-title mb-4">
            Real companies.{' '}
            <span style={{ color: '#ef4444' }}>Real losses.</span>
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            These aren't hypothetical. Every number below comes from SEC filings, FTC settlements, and IBM's annual breach report.
          </p>
        </motion.div>

        {/* Key stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid sm:grid-cols-3 gap-4 mb-10"
        >
          {KEY_STATS.map((stat) => (
            <div
              key={stat.value}
              className="text-center py-6 px-4 rounded-2xl border"
              style={{
                borderColor: 'rgba(239,68,68,0.15)',
                background: 'rgba(239,68,68,0.04)',
              }}
            >
              <div className="text-3xl sm:text-4xl font-extrabold mb-1" style={{ color: '#ef4444' }}>
                {stat.value}
              </div>
              <div className="text-sm text-text-primary font-medium mb-1">{stat.label}</div>
              <div className="text-xs text-text-secondary">Source: {stat.source}</div>
            </div>
          ))}
        </motion.div>

        {/* Scrolling ticker */}
        <motion.div
          ref={tickerRef}
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <BreachTicker />
        </motion.div>

        {/* Bottom comparison */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center"
        >
          <div
            className="px-6 py-4 rounded-xl border w-full sm:w-auto"
            style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)' }}
          >
            <div className="text-xs text-text-secondary mb-1">Building a real 24/7 SOC team</div>
            <div className="text-2xl font-extrabold" style={{ color: '#ef4444' }}>$1.5M – $3M / year</div>
            <div className="text-xs text-text-secondary mt-1">10–12 analysts + tooling + infrastructure</div>
          </div>

          <div className="text-2xl font-bold text-text-secondary hidden sm:block">vs</div>
          <div className="text-xl font-bold text-text-secondary sm:hidden">vs</div>

          <div
            className="px-6 py-4 rounded-xl border w-full sm:w-auto"
            style={{ borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.06)' }}
          >
            <div className="text-xs text-text-secondary mb-1">CISPAR — fully autonomous SOC</div>
            <div className="text-2xl font-extrabold" style={{ color: '#10b981' }}>Get early access</div>
            <div className="text-xs text-text-secondary mt-1">Zero analysts. Zero code. Always on.</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
