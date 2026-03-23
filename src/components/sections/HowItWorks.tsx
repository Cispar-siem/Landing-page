import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { WorkStep, SocTier } from '../../types';

const STEPS: readonly WorkStep[] = [
  {
    tier: 'L1',
    title: 'Automated Triage',
    subtitle: 'Detect & Classify',
    description:
      'CISPAR continuously monitors your system for anomalies — ports, processes, login attempts, and cron jobs. Every event is parsed for IOCs, enriched via VirusTotal, AbuseIPDB, and Shodan, then classified against MITRE ATT&CK techniques.',
    actions: [
      'System-wide anomaly monitoring',
      'IOC extraction & reputation enrichment',
      'MITRE ATT&CK technique mapping',
      'True/False positive classification',
      'Automatic L2 escalation on high-severity events',
    ],
  },
  {
    tier: 'L2',
    title: 'Incident Response',
    subtitle: 'Contain & Remediate',
    description:
      'When a true positive is confirmed, CISPAR collects forensic evidence first — then acts. It correlates events, reconstructs kill chains, executes CACAO-lite playbooks, and contains the threat: blocking IPs, closing ports, killing malicious processes.',
    actions: [
      'Forensic snapshot before any action',
      'Kill chain reconstruction & timeline',
      'CACAO-lite playbook execution',
      'IP blocking, port closure, process termination',
      'Structured incident report generation',
    ],
  },
  {
    tier: 'L3',
    title: 'Threat Hunting',
    subtitle: 'Hunt & Harden',
    description:
      'Proactively searches your environment for specific MITRE ATT&CK TTPs. Identifies gaps in your detection coverage, applies security hardening, and updates detection rules — learning from every incident to get sharper over time.',
    actions: [
      'Active ATT&CK TTP hunting',
      'Detection coverage gap analysis',
      'Automated system hardening',
      'Vulnerability scanning via Nuclei',
      'Continuous rule learning loop',
    ],
  },
] as const;

const TIER_COLORS: Record<SocTier, string> = {
  L1: '#3b82f6',
  L2: '#8b5cf6',
  L3: '#06b6d4',
};

const AUTO_ADVANCE_MS = 5000;

/** Mobile horizontal tab pills. */
function MobileTabs({
  activeIndex,
  onSelect,
}: {
  readonly activeIndex: number;
  readonly onSelect: (i: number) => void;
}): React.ReactElement {
  return (
    <div className="flex gap-2 mb-6 lg:hidden overflow-x-auto pb-1 scrollbar-none" role="tablist">
      {STEPS.map((step, i) => {
        const color = TIER_COLORS[step.tier];
        const isActive = i === activeIndex;
        return (
          <button
            key={step.tier}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(i)}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
            style={
              isActive
                ? { background: `${color}20`, color, border: `1px solid ${color}50` }
                : { background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: isActive ? color : 'rgba(255,255,255,0.2)' }}
              aria-hidden="true"
            />
            {step.tier} · {step.title}
          </button>
        );
      })}
    </div>
  );
}

/** Progress bar showing time until auto-advance. */
function ProgressBar({
  color,
  isRunning,
}: {
  readonly color: string;
  readonly isRunning: boolean;
}): React.ReactElement {
  return (
    <div className="h-0.5 rounded-full overflow-hidden mt-6" style={{ background: 'rgba(255,255,255,0.06)' }}>
      {isRunning && (
        <motion.div
          key={color}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: 'linear' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      )}
    </div>
  );
}

/**
 * Interactive three-tier section. Auto-advances every 5 s; pauses on hover.
 * Mobile uses horizontal pill tabs, desktop uses sidebar cards.
 */
export function HowItWorks(): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeStep = STEPS[activeIndex];
  const color = TIER_COLORS[activeStep.tier];

  const handleSelect = (i: number): void => {
    setActiveIndex(i);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), AUTO_ADVANCE_MS);
  };

  useEffect(() => {
    if (!isVisible || isPaused) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % STEPS.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVisible, isPaused]);

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-20 sm:py-24 relative"
      aria-label="How CISPAR works"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#3b82f6' }}>
            Three Tiers. One Agent.
          </p>
          <h2 className="section-title mb-4">How CISPAR Works</h2>
          <p className="section-subtitle">
            From triage to containment to proactive hunting — fully autonomous, fully documented.
          </p>
        </motion.div>

        {/* Mobile tabs */}
        <MobileTabs activeIndex={activeIndex} onSelect={handleSelect} />

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Desktop sidebar */}
          <div className="hidden lg:flex lg:col-span-2 flex-col gap-3">
            {STEPS.map((step, i) => {
              const c = TIER_COLORS[step.tier];
              const isActive = i === activeIndex;
              return (
                <motion.button
                  key={step.tier}
                  onClick={() => handleSelect(i)}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="w-full text-left p-5 rounded-xl border transition-colors duration-300"
                  style={
                    isActive
                      ? { borderColor: `${c}50`, background: `${c}0d` }
                      : { borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(17,17,24,0.4)' }
                  }
                  aria-pressed={isActive}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: `${c}20`, color: c }}
                    >
                      {step.tier}
                    </span>
                    <span className="text-xs text-text-secondary">{step.subtitle}</span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">{step.title}</p>

                  {isActive && (
                    <ProgressBar color={c} isRunning={!isPaused} />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.tier}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="card-glass p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="text-sm font-bold px-3 py-1.5 rounded-full"
                    style={{ background: `${color}20`, color }}
                  >
                    {activeStep.tier}
                  </span>
                  <span className="text-text-secondary text-sm">{activeStep.subtitle}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ color }}>
                  {activeStep.title}
                </h3>

                <p className="text-text-secondary leading-relaxed mb-6 text-sm sm:text-base">
                  {activeStep.description}
                </p>

                <ul className="space-y-2.5" role="list">
                  {activeStep.actions.map((action, i) => (
                    <motion.li
                      key={action}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.3 }}
                      className="flex items-start gap-3 text-sm text-text-secondary"
                    >
                      <svg
                        className="shrink-0 mt-0.5"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke={color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {action}
                    </motion.li>
                  ))}
                </ul>

                {/* Mobile progress indicator */}
                <div className="flex gap-2 mt-6 lg:hidden justify-center">
                  {STEPS.map((s, i) => (
                    <button
                      key={s.tier}
                      onClick={() => handleSelect(i)}
                      className="w-2 h-2 rounded-full transition-all duration-300"
                      style={{
                        background: i === activeIndex ? color : 'rgba(255,255,255,0.15)',
                        transform: i === activeIndex ? 'scale(1.4)' : 'scale(1)',
                      }}
                      aria-label={`Go to step ${i + 1}: ${s.title}`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
