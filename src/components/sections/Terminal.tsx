import { useState, useEffect, useRef } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { TerminalLine } from '../../types';

const TERMINAL_SEQUENCE: readonly TerminalLine[] = [
  { id: 't1', type: 'dim', text: '$ cispar monitor_system --continuous', delay: 0 },
  { id: 't2', type: 'info', text: '[CISPAR L1] System monitoring active. Scanning ports, processes, auth logs...', delay: 600 },
  { id: 't3', type: 'dim', text: '───────────────────────────────────────────────', delay: 1100 },
  { id: 't4', type: 'warn', text: '[ALERT] Suspicious SSH login detected — 192.168.1.55 → root@prod-server', delay: 1800 },
  { id: 't5', type: 'info', text: '[L1] Parsing event. Extracting IOCs: IP=192.168.1.55, User=root', delay: 2500 },
  { id: 't6', type: 'info', text: '[L1] Enriching IOC via AbuseIPDB... Confidence score: 98/100 — MALICIOUS', delay: 3200 },
  { id: 't7', type: 'danger', text: '[L1] Classification: TRUE POSITIVE — T1078 (Valid Accounts) | Severity: HIGH', delay: 4000 },
  { id: 't8', type: 'info', text: '[L1] Escalating to L2 Incident Response...', delay: 4700 },
  { id: 't9', type: 'dim', text: '───────────────────────────────────────────────', delay: 5200 },
  { id: 't10', type: 'info', text: '[CISPAR L2] Evidence collection initiated...', delay: 5800 },
  { id: 't11', type: 'dim', text: '[L2] Snapshot: 147 processes, 23 open connections, 8 recent file changes', delay: 6400 },
  { id: 't12', type: 'info', text: '[L2] Loading playbook: unauthorized-access.json', delay: 7100 },
  { id: 't13', type: 'warn', text: '[L2] Executing Step 1: Block IP 192.168.1.55 via iptables...', delay: 7800 },
  { id: 't14', type: 'success', text: '[L2] ✓ IP blocked. Rule applied: DROP from 192.168.1.55', delay: 8500 },
  { id: 't15', type: 'warn', text: '[L2] Executing Step 2: Lock user account root...', delay: 9200 },
  { id: 't16', type: 'success', text: '[L2] ✓ Account locked. SSH session terminated.', delay: 9900 },
  { id: 't17', type: 'dim', text: '───────────────────────────────────────────────', delay: 10500 },
  { id: 't18', type: 'info', text: '[L2] Generating incident report...', delay: 11100 },
  { id: 't19', type: 'success', text: '[INCIDENT RESOLVED] Total time: 00:00:42 | Breach contained before lateral movement.', delay: 12000 },
  { id: 't20', type: 'dim', text: '[L3] Updating detection rules from incident INC-2024-0847...', delay: 12800 },
  { id: 't21', type: 'success', text: '[L3] Rule updated: Flag root SSH from non-allowlisted IPs as HIGH immediately.', delay: 13500 },
] as const;

const LINE_COLORS: Record<TerminalLine['type'], string> = {
  info: '#94a3b8',
  warn: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',
  command: '#8b5cf6',
  dim: '#4b5563',
};

/**
 * Animated fake terminal demonstrating CISPAR detecting and containing a threat.
 */
export function Terminal(): React.ReactElement {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 });
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && !started) {
      setStarted(true);
    }
  }, [isVisible, started]);

  useEffect(() => {
    if (!started) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    TERMINAL_SEQUENCE.forEach((line) => {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.id]);
      }, line.delay);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [started]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLines]);

  return (
    <section id="terminal" ref={ref} className="py-24" aria-label="CISPAR live demo">
      <div className="section-container">
        <div
          className={`text-center mb-12 animate-on-scroll ${isVisible ? 'visible' : ''}`}
        >
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#06b6d4' }}>
            See It Happen
          </p>
          <h2 className="section-title mb-4">42 Seconds. Breach Contained.</h2>
          <p className="section-subtitle">
            Watch CISPAR detect an unauthorized SSH intrusion, collect forensic evidence,
            and contain it — fully autonomous.
          </p>
        </div>

        <div
          className={`max-w-4xl mx-auto animate-on-scroll animate-on-scroll-delay-1 ${
            isVisible ? 'visible' : ''
          }`}
        >
          {/* Terminal window */}
          <div
            className="rounded-xl overflow-hidden border"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ background: '#1a1a2e', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <span className="w-3 h-3 rounded-full bg-danger opacity-80" aria-hidden="true" />
              <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" aria-hidden="true" />
              <span className="w-3 h-3 rounded-full bg-safe opacity-80" aria-hidden="true" />
              <span
                className="ml-3 text-xs font-mono text-text-secondary"
              >
                cispar — soc-agent
              </span>
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}
              >
                ● LIVE
              </span>
            </div>

            {/* Output */}
            <div
              className="p-6 font-mono text-xs leading-relaxed overflow-y-auto"
              style={{
                background: '#0d0d17',
                minHeight: '380px',
                maxHeight: '420px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
              aria-live="polite"
              aria-label="CISPAR terminal output"
            >
              {TERMINAL_SEQUENCE.map((line) =>
                visibleLines.includes(line.id) ? (
                  <div
                    key={line.id}
                    className="mb-1"
                    style={{ color: LINE_COLORS[line.type] }}
                  >
                    {line.text}
                  </div>
                ) : null
              )}

              {started && visibleLines.length < TERMINAL_SEQUENCE.length && (
                <span
                  className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-0.5"
                  aria-hidden="true"
                />
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <p className="text-center text-xs text-text-secondary mt-4">
            Simulated incident for demonstration purposes. Real-world response times vary by environment.
          </p>
        </div>
      </div>
    </section>
  );
}
