import { useState } from 'react';
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

/** Single step card in the how-it-works flow. */
function StepCard({
  step,
  isActive,
  onClick,
}: {
  readonly step: WorkStep;
  readonly isActive: boolean;
  readonly onClick: () => void;
}): React.ReactElement {
  const color = TIER_COLORS[step.tier];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${
        isActive
          ? 'border-opacity-50 shadow-lg'
          : 'border-white/5 hover:border-white/10'
      }`}
      style={
        isActive
          ? { borderColor: `${color}50`, background: `${color}0a` }
          : { background: 'rgba(17,17,24,0.4)' }
      }
      aria-pressed={isActive}
    >
      <div className="flex items-center gap-3 mb-2">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: `${color}20`, color }}
        >
          {step.tier}
        </span>
        <span className="text-xs text-text-secondary font-medium">{step.subtitle}</span>
      </div>
      <h3 className="text-base font-semibold text-text-primary">{step.title}</h3>
    </button>
  );
}

/**
 * Interactive three-step how-it-works section showing L1/L2/L3 SOC tiers.
 */
export function HowItWorks(): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const activeStep = STEPS[activeIndex];
  const color = TIER_COLORS[activeStep.tier];

  return (
    <section id="how-it-works" ref={ref} className="py-24 relative" aria-label="How CISPAR works">
      <div className="section-container">
        <div
          className={`text-center mb-16 animate-on-scroll ${isVisible ? 'visible' : ''}`}
        >
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#3b82f6' }}>
            Three Tiers. One Agent.
          </p>
          <h2 className="section-title mb-4">How CISPAR Works</h2>
          <p className="section-subtitle">
            From triage to containment to proactive hunting — fully autonomous, fully documented.
          </p>
        </div>

        <div
          className={`grid lg:grid-cols-5 gap-8 animate-on-scroll animate-on-scroll-delay-1 ${
            isVisible ? 'visible' : ''
          }`}
        >
          {/* Step selector */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {STEPS.map((step, i) => (
              <StepCard
                key={step.tier}
                step={step}
                isActive={i === activeIndex}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.tier}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="card-glass p-8 h-full"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className="text-sm font-bold px-3 py-1.5 rounded-full"
                    style={{ background: `${color}20`, color }}
                  >
                    {activeStep.tier}
                  </span>
                  <span className="text-text-secondary text-sm">{activeStep.subtitle}</span>
                </div>

                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ color }}
                >
                  {activeStep.title}
                </h3>

                <p className="text-text-secondary leading-relaxed mb-6">
                  {activeStep.description}
                </p>

                <ul className="space-y-3" role="list">
                  {activeStep.actions.map((action) => (
                    <li key={action} className="flex items-start gap-3 text-sm text-text-secondary">
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
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
