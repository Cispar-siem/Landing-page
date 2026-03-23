import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { Feature } from '../../types';

const FEATURES: readonly Feature[] = [
  {
    id: 'triage',
    tier: 'L1',
    title: 'Automated Triage',
    description:
      'Parses every security event, enriches IOCs against VirusTotal and AbuseIPDB, and classifies threats — mapping each to a specific MITRE ATT&CK technique in real time.',
    bullets: ['IOC enrichment & reputation scoring', 'MITRE technique identification', 'FP/TP classification with confidence scoring'],
    icon: 'detect',
  },
  {
    id: 'response',
    tier: 'L2',
    title: 'Incident Response',
    description:
      'Evidence collected first. Then action. CISPAR executes CACAO-lite playbooks to block IPs, close ports, kill processes, and lock down compromised users — all documented.',
    bullets: ['Forensic snapshot before containment', '7 pre-built incident playbooks', 'Full audit trail for compliance'],
    icon: 'respond',
  },
  {
    id: 'hunting',
    tier: 'L3',
    title: 'Proactive Threat Hunting',
    description:
      'Actively searches for 50+ MITRE ATT&CK TTPs across your environment. Identifies detection gaps and applies hardening — before attackers find them.',
    bullets: ['50+ ATT&CK TTP coverage', 'Detection gap analysis', 'Automated system hardening'],
    icon: 'hunt',
  },
  {
    id: 'network',
    tier: 'L1',
    title: 'Network Intelligence',
    description:
      'Nmap-based port reconnaissance, service enumeration, and Nuclei-powered vulnerability scanning give CISPAR full visibility into your attack surface.',
    bullets: ['Port & service scanning', 'CVE detection via Nuclei', 'Firewall rule management'],
    icon: 'network',
  },
  {
    id: 'ml',
    tier: 'L2',
    title: 'ML-Validated Output',
    description:
      'Every action is validated by a Groq Compound Beta critic model before execution. If output fails validation, CISPAR backtracks and retries — never acts on bad data.',
    bullets: ['Anomaly detection on agent output', 'Automatic backtracking (up to 3 retries)', 'Zero false-action guarantee'],
    icon: 'report',
  },
  {
    id: 'learning',
    tier: 'L3',
    title: 'Continuous Learning',
    description:
      'CISPAR learns from every incident. Detection rules, playbooks, and escalation thresholds improve automatically — the more it runs, the sharper it gets.',
    bullets: ['Rule updates from resolved incidents', 'NEVER/ALWAYS rule system', 'Multi-session memory persistence'],
    icon: 'learn',
  },
] as const;

const TIER_COLORS = {
  L1: { border: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.08)', text: '#3b82f6' },
  L2: { border: 'rgba(139,92,246,0.3)', bg: 'rgba(139,92,246,0.08)', text: '#8b5cf6' },
  L3: { border: 'rgba(6,182,212,0.3)', bg: 'rgba(6,182,212,0.08)', text: '#06b6d4' },
} as const;

/** Icon SVGs by feature type. */
function FeatureIcon({ icon }: { readonly icon: Feature['icon'] }): React.ReactElement {
  const icons: Record<Feature['icon'], React.ReactElement> = {
    detect: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
    respond: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    hunt: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </svg>
    ),
    network: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <rect x="16" y="16" width="6" height="6" rx="1" />
        <rect x="2" y="16" width="6" height="6" rx="1" />
        <rect x="9" y="2" width="6" height="6" rx="1" />
        <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
        <line x1="12" y1="12" x2="12" y2="8" />
      </svg>
    ),
    report: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4m0-11v11" />
      </svg>
    ),
    learn: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        <path d="m15 5 3 3" />
      </svg>
    ),
  };
  return icons[icon];
}

/**
 * Feature grid section showcasing CISPAR's six core capabilities.
 */
export function Features(): React.ReactElement {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.05 });

  return (
    <section id="capabilities" ref={ref} className="py-24" aria-label="CISPAR capabilities">
      <div className="section-container">
        <div
          className={`text-center mb-16 animate-on-scroll ${isVisible ? 'visible' : ''}`}
        >
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#8b5cf6' }}>
            Full-Spectrum Coverage
          </p>
          <h2 className="section-title mb-4">Six Core Capabilities</h2>
          <p className="section-subtitle">
            CISPAR doesn't just monitor. It thinks, decides, and acts — with evidence
            collected before every move.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const colors = TIER_COLORS[feature.tier];
            const delay = `animate-on-scroll-delay-${Math.min((i % 3) + 1, 4) as 1 | 2 | 3 | 4}`;

            return (
              <div
                key={feature.id}
                className={`card-glass p-7 transition-all duration-300 animate-on-scroll ${delay} ${
                  isVisible ? 'visible' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    <FeatureIcon icon={feature.icon} />
                  </div>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full mt-1"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {feature.tier}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-text-primary mb-3">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-5">{feature.description}</p>

                <ul className="space-y-2" role="list">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2 text-xs text-text-secondary">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: colors.text }}
                        aria-hidden="true"
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
