import { useState, useEffect, useRef } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { Stat } from '../../types';

const STATS: readonly Stat[] = [
  {
    id: 'ttps',
    numericEnd: 50,
    prefix: '',
    suffix: '+',
    label: 'MITRE ATT&CK TTPs',
    sublabel: 'Active threat hunting coverage',
  },
  {
    id: 'response',
    numericEnd: 15,
    prefix: '<',
    suffix: ' min',
    label: 'Detection to Containment',
    sublabel: 'Lab-validated response time',
  },
  {
    id: 'playbooks',
    numericEnd: 7,
    prefix: '',
    suffix: '',
    label: 'Incident Playbooks',
    sublabel: 'Pre-built, ready to execute',
  },
  {
    id: 'code',
    numericEnd: 0,
    prefix: '',
    suffix: '',
    label: 'Lines of Code to Write',
    sublabel: 'Zero setup. Zero expertise.',
  },
] as const;

/** Animated counter that counts up from 0 to the target value. */
function AnimatedCounter({
  target,
  prefix,
  suffix,
  isVisible,
}: {
  readonly target: number;
  readonly prefix: string;
  readonly suffix: string;
  readonly isVisible: boolean;
}): React.ReactElement {
  const [count, setCount] = useState(0);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!isVisible || animatedRef.current || target === 0) return;
    animatedRef.current = true;

    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setCount(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, target]);

  return (
    <span className="text-5xl sm:text-6xl font-extrabold gradient-text tabular-nums">
      {prefix}{target === 0 ? '0' : count}{suffix}
    </span>
  );
}

/**
 * Stats section with animated count-up numbers on scroll entry.
 */
export function Stats(): React.ReactElement {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section
      ref={ref}
      className="py-24 relative overflow-hidden"
      aria-label="Key metrics"
      style={{ background: 'rgba(17,17,24,0.5)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="section-container relative z-10">
        <div
          className={`text-center mb-16 animate-on-scroll ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="section-title mb-4">Where Cybersecurity Meets AI.</h2>
          <p className="section-subtitle">
            We took the best of two worlds and built one autonomous agent. These are the specs — tested, not invented.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div
              key={stat.id}
              className={`text-center animate-on-scroll animate-on-scroll-delay-${Math.min(i + 1, 4) as 1 | 2 | 3 | 4} ${
                isVisible ? 'visible' : ''
              }`}
            >
              <div className="mb-3">
                <AnimatedCounter
                  target={stat.numericEnd}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  isVisible={isVisible}
                />
              </div>
              <div className="text-base font-semibold text-text-primary mb-1">{stat.label}</div>
              <div className="text-sm text-text-secondary">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
