import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { TrustBadge } from '../../types';

const BADGES: readonly TrustBadge[] = [
  { id: 'mitre', label: 'MITRE ATT&CK' },
  { id: 'nist', label: 'NIST CSF' },
  { id: 'soc2', label: 'SOC 2 Ready' },
  { id: 'iso', label: 'ISO 27001' },
  { id: 'cacao', label: 'CACAO Playbooks' },
  { id: 'zerotrust', label: 'Zero Trust' },
] as const;

/**
 * Thin trust bar showing compliance frameworks and key operational metrics.
 */
export function TrustSignals(): React.ReactElement {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section
      ref={ref}
      className="border-y border-white/5 py-10"
      style={{ background: 'rgba(17,17,24,0.6)' }}
      aria-label="Trust signals"
    >
      <div className="section-container">
        <p
          className={`text-center text-xs font-semibold tracking-widest uppercase text-text-secondary mb-8 animate-on-scroll ${
            isVisible ? 'visible' : ''
          }`}
        >
          Built on industry-standard frameworks
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {BADGES.map((badge, i) => (
            <span
              key={badge.id}
              className={`px-4 py-2 rounded-full border text-xs font-semibold text-text-secondary animate-on-scroll animate-on-scroll-delay-${Math.min(i + 1, 4) as 1 | 2 | 3 | 4} ${
                isVisible ? 'visible' : ''
              }`}
              style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
            >
              {badge.label}
            </span>
          ))}
        </div>

        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-6 animate-on-scroll animate-on-scroll-delay-2 ${
            isVisible ? 'visible' : ''
          }`}
        >
          {[
            { value: '500+', label: 'Organizations Protected' },
            { value: '<15 min', label: 'Avg. Response Time' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '0', label: 'Successful Breaches on Active Clients' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-extrabold gradient-text mb-1">{value}</div>
              <div className="text-xs text-text-secondary">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
