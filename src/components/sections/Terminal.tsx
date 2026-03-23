import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { TerminalLine } from '../../types';

const TERMINAL_SEQUENCE: readonly TerminalLine[] = [
  { id: 't1', type: 'dim', text: '$ cispar monitor_system --continuous', delay: 0 },
  { id: 't2', type: 'info', text: '[CISPAR L1] System monitoring active. Scanning ports, processes, auth logs...', delay: 600 },
  { id: 't3', type: 'dim', text: '───────────────────────────────────────────────────────', delay: 1100 },
  { id: 't4', type: 'warn', text: '[ALERT] Suspicious SSH login — 192.168.1.55 → root@prod-server', delay: 1800 },
  { id: 't5', type: 'info', text: '[L1] Extracting IOCs: IP=192.168.1.55, User=root, Port=22', delay: 2500 },
  { id: 't6', type: 'info', text: '[L1] AbuseIPDB enrichment... Confidence score: 98/100 — MALICIOUS', delay: 3200 },
  { id: 't7', type: 'danger', text: '[L1] TRUE POSITIVE — T1078 (Valid Accounts) | Severity: HIGH', delay: 4000 },
  { id: 't8', type: 'info', text: '[L1] Escalating to L2 Incident Response...', delay: 4700 },
  { id: 't9', type: 'dim', text: '───────────────────────────────────────────────────────', delay: 5200 },
  { id: 't10', type: 'info', text: '[CISPAR L2] Evidence collection initiated — forensic snapshot first.', delay: 5800 },
  { id: 't11', type: 'dim', text: '[L2] Snapshot: 147 processes, 23 open connections, 8 recent file changes', delay: 6400 },
  { id: 't12', type: 'info', text: '[L2] Loading playbook: unauthorized-access.json', delay: 7100 },
  { id: 't13', type: 'warn', text: '[L2] Step 1: Blocking IP 192.168.1.55 via iptables...', delay: 7800 },
  { id: 't14', type: 'success', text: '[L2] ✓ IP blocked. DROP rule applied — 192.168.1.55', delay: 8500 },
  { id: 't15', type: 'warn', text: '[L2] Step 2: Locking account root...', delay: 9200 },
  { id: 't16', type: 'success', text: '[L2] ✓ Account locked. SSH session terminated.', delay: 9900 },
  { id: 't17', type: 'dim', text: '───────────────────────────────────────────────────────', delay: 10500 },
  { id: 't18', type: 'info', text: '[L2] Generating incident report INC-2024-0847...', delay: 11100 },
  { id: 't19', type: 'success', text: '[RESOLVED] Time: 00:00:42 | Breach contained before lateral movement.', delay: 12000 },
  { id: 't20', type: 'dim', text: '[L3] Learning from incident — updating detection rules...', delay: 12800 },
  { id: 't21', type: 'success', text: '[L3] Rule updated: Root SSH from non-allowlisted IPs → HIGH immediately.', delay: 13500 },
] as const;

const LINE_COLORS: Record<TerminalLine['type'], string> = {
  info: '#94a3b8',
  warn: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',
  command: '#8b5cf6',
  dim: '#374151',
};

const TOTAL_DURATION_MS = 14000;

/**
 * Animated terminal demo with replay button and progress bar.
 */
export function Terminal(): React.ReactElement {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.15 });
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = useCallback((): void => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  const startSequence = useCallback((): void => {
    setVisibleLines([]);
    setProgress(0);

    // Line timers
    TERMINAL_SEQUENCE.forEach((line) => {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.id]);
      }, line.delay);
      timersRef.current.push(t);
    });

    // Progress ticker (60fps-ish)
    const startTime = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / TOTAL_DURATION_MS) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(tick);
    }, 50);
    progressRef.current = tick;
  }, []);

  const handleReplay = (): void => {
    clearAll();
    setRunKey((k) => k + 1);
    setStarted(true);
  };

  useEffect(() => {
    if (isVisible && !started) {
      setStarted(true);
    }
  }, [isVisible, started]);

  useEffect(() => {
    if (!started) return;
    startSequence();
    return clearAll;
  }, [started, runKey, startSequence, clearAll]);

  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visibleLines.length]);

  const isDone = visibleLines.length >= TERMINAL_SEQUENCE.length;

  return (
    <section id="terminal" ref={ref} className="py-20 sm:py-24" aria-label="CISPAR live demo">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#06b6d4' }}>
            See It Happen
          </p>
          <h2 className="section-title mb-4">42 Seconds. Breach Contained.</h2>
          <p className="section-subtitle">
            Watch CISPAR detect an unauthorized SSH intrusion, collect forensic evidence,
            and contain it — fully autonomous.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-4xl mx-auto"
        >
          <div
            className="rounded-xl overflow-hidden border"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ background: '#13131f', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <span className="w-3 h-3 rounded-full opacity-80" style={{ background: '#ef4444' }} aria-hidden="true" />
              <span className="w-3 h-3 rounded-full opacity-80" style={{ background: '#f59e0b' }} aria-hidden="true" />
              <span className="w-3 h-3 rounded-full opacity-80" style={{ background: '#10b981' }} aria-hidden="true" />
              <span className="ml-3 text-xs font-mono text-text-secondary">
                cispar — soc-agent
              </span>

              <div className="ml-auto flex items-center gap-3">
                {isDone && (
                  <button
                    onClick={handleReplay}
                    className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full transition-all"
                    style={{
                      background: 'rgba(59,130,246,0.15)',
                      color: '#3b82f6',
                      border: '1px solid rgba(59,130,246,0.3)',
                    }}
                    aria-label="Replay terminal demo"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 .49-5.09" />
                    </svg>
                    Replay
                  </button>
                )}
                <span
                  className="text-xs px-2 py-0.5 rounded flex items-center gap-1.5"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" aria-hidden="true" />
                  LIVE
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-0.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div
                className="h-full transition-all duration-75"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                }}
              />
            </div>

            {/* Output */}
            <div
              className="p-4 sm:p-6 font-mono text-xs leading-relaxed overflow-y-auto"
              style={{
                background: '#0d0d17',
                minHeight: '280px',
                maxHeight: '360px',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
              ref={outputRef}
              aria-live="polite"
              aria-label="CISPAR terminal output"
            >
              {!started && (
                <span className="text-gray-600 italic">Waiting for viewport...</span>
              )}

              {TERMINAL_SEQUENCE.map((line) =>
                visibleLines.includes(line.id) ? (
                  <motion.div
                    key={`${line.id}-${runKey}`}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className="mb-1 break-words"
                    style={{ color: LINE_COLORS[line.type] }}
                  >
                    {line.text}
                  </motion.div>
                ) : null
              )}

              {started && !isDone && (
                <span
                  className="inline-block w-2 h-3.5 align-middle ml-0.5 animate-pulse"
                  style={{ background: '#3b82f6' }}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>

          <p className="text-center text-xs text-text-secondary mt-4 opacity-60">
            Simulated incident for demonstration. Real-world response times vary by environment.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
