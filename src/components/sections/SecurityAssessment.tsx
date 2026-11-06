import { useState, FormEvent, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

type FormState = 'idle' | 'scanning' | 'completed' | 'error';
type ScanStageStatus = 'pending' | 'running' | 'completed' | 'failed';

interface AssessmentData {
  email: string;
  domain: string;
  company: string;
  phone: string;
}

interface ScanDetail {
  type: string;
  value: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  source: string;
  metadata?: Record<string, unknown>;
}

interface ScanResult {
  stage: string;
  label: string;
  found: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  details: ScanDetail[];
  duration: number;
}

interface ScanResponse {
  scanId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: ScanResult[];
  summary: {
    totalFindings: number;
    bySeverity: Record<string, number>;
    score: number;
  };
  startedAt: string;
  completedAt?: string;
}

const STAGE_ORDER = [
  'certificates',
  'dns',
  'headers',
  'subdomains',
  'breaches',
  'ip',
] as const;

const STAGE_LABELS: Record<string, string> = {
  certificates: 'Certificados SSL/TLS',
  dns: 'Registros DNS',
  headers: 'Headers de Seguridad HTTP',
  subdomains: 'Subdominios (CT Logs)',
  breaches: 'Brechas de Datos Públicas',
  ip: 'Reputación de IP',
};

const STAGE_ICONS: Record<string, React.ReactNode> = {
  certificates: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M6 12h12" />
      <path d="M12 8v8" />
    </svg>
  ),
  dns: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  ),
  headers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,14 2,6" />
    </svg>
  ),
  subdomains: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  breaches: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  ip: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  ),
};

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#f04438';
    case 'high': return '#f57328';
    case 'medium': return '#f5b800';
    case 'low': return '#0ecb81';
    default: return '#64748b';
  }
}

function getSeverityLabel(severity: string): string {
  switch (severity) {
    case 'critical': return 'Crítico';
    case 'high': return 'Alto';
    case 'medium': return 'Medio';
    case 'low': return 'Bajo';
    default: return 'Info';
  }
}

function getSeverityBg(severity: string): string {
  switch (severity) {
    case 'critical': return 'rgba(240,68,56,0.12)';
    case 'high': return 'rgba(245,115,40,0.12)';
    case 'medium': return 'rgba(245,184,0,0.12)';
    case 'low': return 'rgba(14,203,129,0.12)';
    default: return 'rgba(100,116,139,0.12)';
  }
}

// ── Custom Input Component ──
function AssessmentInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  error,
  icon: Icon,
  helperText,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  error?: string;
  icon: React.ReactNode;
  helperText?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="assessment-input-wrapper">
      <label htmlFor={id} className="assessment-input-label">
        {label} {required && <span className="required-mark" aria-hidden="true">*</span>}
      </label>
      <div className={`assessment-input-container ${focused ? 'focused' : ''} ${error ? 'has-error' : ''}`}>
        <div className="input-icon" aria-hidden="true">{Icon}</div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'off'}
          className="assessment-input"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        />
        {error && (
          <div id={`${id}-error`} className="input-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}
      </div>
      {helperText && !error && (
        <p id={`${id}-helper`} className="input-helper">{helperText}</p>
      )}
    </div>
  );
}

// ── Stage Row Component ──
function StageRow({
  stageKey,
  index,
  status,
  result,
  isCurrent,
}: {
  stageKey: string;
  index: number;
  status: ScanStageStatus;
  result?: ScanResult;
  isCurrent: boolean;
}) {
  const Icon = STAGE_ICONS[stageKey];
  const label = STAGE_LABELS[stageKey];

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="stage-row"
      style={{
        background: status === 'completed'
          ? 'rgba(14,203,129,0.06)'
          : status === 'running' || isCurrent
          ? 'rgba(45,127,249,0.08)'
          : 'transparent',
        borderColor: status === 'completed'
          ? 'rgba(14,203,129,0.18)'
          : status === 'running' || isCurrent
          ? 'rgba(45,127,249,0.25)'
          : 'rgba(255,255,255,0.04)',
      }}
    >
      <div
        className="stage-indicator"
        style={{
          background: status === 'completed'
            ? 'linear-gradient(135deg, #0ecb81 0%, #0db876 100%)'
            : status === 'running' || isCurrent
            ? 'linear-gradient(135deg, #2d7ff9 0%, #1a6fe8 100%)'
            : 'rgba(255,255,255,0.04)',
          borderColor: status === 'completed'
            ? 'rgba(14,203,129,0.3)'
            : status === 'running' || isCurrent
            ? 'rgba(45,127,249,0.3)'
            : 'rgba(255,255,255,0.06)',
        }}
      >
        {status === 'completed' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : status === 'running' || isCurrent ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
              <path d="M12 6v6l4 2" />
            </svg>
          </motion.div>
        ) : (
          <span className="stage-number">{index + 1}</span>
        )}
        {Icon && status === 'pending' && <span className="stage-icon-pending">{Icon}</span>}
      </div>

      <div className="stage-content">
        <div className="stage-header">
          <span className="stage-label">{label}</span>
          {result && (
            <span
              className="stage-badge"
              style={{
                background: getSeverityBg(result.severity),
                color: getSeverityColor(result.severity),
                borderColor: getSeverityColor(result.severity) + '40',
              }}
            >
              {result.found} {getSeverityLabel(result.severity)}
            </span>
          )}
        </div>
        {result && (
          <p className="stage-meta">
            {result.duration}ms · {result.details.length} checks
          </p>
        )}
      </div>

      {status === 'running' && (
        <div className="stage-progress-bar">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="stage-progress-fill"
            style={{ background: 'linear-gradient(90deg, #2d7ff9 0%, #0ecb81 100%)' }}
          />
        </div>
      )}
    </motion.div>
  );
}

// ── Detail Card Component ──
function DetailCard({ detail }: { detail: ScanDetail }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="detail-card"
      style={{ borderLeftColor: getSeverityColor(detail.severity) }}
    >
      <div className="detail-header">
        <span className="detail-severity-dot" style={{ background: getSeverityColor(detail.severity) }} />
        <span className="detail-severity-label">{getSeverityLabel(detail.severity)}</span>
        <span className="detail-source">{detail.source}</span>
      </div>
      <p className="detail-value">{detail.value}</p>
      {detail.metadata && Object.keys(detail.metadata).length > 0 && (
        <details className="detail-meta">
          <summary>Ver metadatos</summary>
          <pre>{JSON.stringify(detail.metadata, null, 2)}</pre>
        </details>
      )}
    </motion.div>
  );
}

export function SecurityAssessment(): React.ReactElement {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.12, triggerOnce: true });
  const [formState, setFormState] = useState<FormState>('idle');
  const [data, setData] = useState<AssessmentData>({ email: '', domain: '', company: '', phone: '' });
  const [error, setError] = useState('');
  const [scanResponse, setScanResponse] = useState<ScanResponse | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageStatuses, setStageStatuses] = useState<Record<string, ScanStageStatus>>({});
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanStartTime = useRef<number>(0);

  const validateEmail = useCallback((email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), []);
  const validateDomain = useCallback((domain: string) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain), []);

  const cleanupEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const startScan = async (scanId: string): Promise<void> => {
    try {
      const eventSource = new EventSource(`${API_BASE}/scan/${scanId}/stream`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const scan = JSON.parse(event.data) as ScanResponse;
          setScanResponse(scan);
          updateStageStatuses(scan);
          if (scan.status === 'failed') {
            setError('El análisis no pudo completarse. Inténtalo de nuevo en unos minutos.');
            setFormState('error');
            cleanupEventSource();
          } else if (scan.status === 'completed') {
            cleanupEventSource();
          }
        } catch {
          // Ignore parse errors for malformed SSE data
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;
        startPolling(scanId);
      };
    } catch {
      startPolling(scanId);
    }
  };

  const startPolling = (scanId: string): void => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/scan/${scanId}`);
        if (response.ok) {
          const scan = await response.json() as ScanResponse;
          setScanResponse(scan);
          updateStageStatuses(scan);
          if (scan.status === 'failed') {
            setError('El análisis no pudo completarse. Inténtalo de nuevo en unos minutos.');
            setFormState('error');
            cleanupEventSource();
          } else if (scan.status === 'completed') {
            cleanupEventSource();
          }
        }
      } catch {
          // Ignore poll errors, will retry on next interval
        }
    }, 600);
  };

  const updateStageStatuses = useCallback((scan: ScanResponse): void => {
    const statuses: Record<string, ScanStageStatus> = {};
    for (const stage of STAGE_ORDER) {
      const result = scan.results.find(r => r.stage === stage);
      if (result) {
        statuses[stage] = 'completed';
      } else if (scan.status === 'running') {
        const completedStages = scan.results.map(r => r.stage);
        const nextStage = STAGE_ORDER.find(s => !completedStages.includes(s));
        if (nextStage === stage) statuses[stage] = 'running';
        else if (!completedStages.includes(stage)) statuses[stage] = 'pending';
      }
    }
    setStageStatuses(statuses);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!data.email || !validateEmail(data.email)) {
      setError('Introduce un correo válido de empresa');
      return;
    }

    if (!data.domain || !validateDomain(data.domain)) {
      setError('Introduce un dominio válido (ej: empresa.com)');
      return;
    }

    setFormState('scanning');
    setScanResponse(null);
    setCurrentStageIndex(0);
    setStageStatuses({});
    setExpandedStage(null);
    scanStartTime.current = Date.now();

    try {
      const response = await fetch(`${API_BASE}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          domain: data.domain,
          company: data.company,
          phone: data.phone,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error iniciando escaneo');
      }

      const { scanId } = await response.json();
      await startScan(scanId);

    } catch (err) {
      setFormState('error');
      setError(err instanceof Error ? err.message : 'Error de conexión. Verifica que el backend esté corriendo en puerto 3000.');
    }
  };

  const handleChange = (field: keyof AssessmentData, value: string): void => {
    setData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleRestart = useCallback((): void => {
    cleanupEventSource();
    setFormState('idle');
    setData({ email: '', domain: '', company: '', phone: '' });
    setError('');
    setScanResponse(null);
    setCurrentStageIndex(0);
    setStageStatuses({});
    setExpandedStage(null);
  }, [cleanupEventSource]);

  useEffect(() => cleanupEventSource, [cleanupEventSource]);

  useEffect(() => {
    if (scanResponse && scanResponse.status === 'running') {
      setCurrentStageIndex(Math.min(scanResponse.results.length, STAGE_ORDER.length - 1));
    }
  }, [scanResponse]);

  const elapsedTime = scanStartTime.current
    ? Math.floor((Date.now() - scanStartTime.current) / 1000)
    : 0;

  return (
    <section
      ref={ref}
      id="assessment"
      className="security-assessment section relative overflow-hidden"
      aria-label="Evaluación de superficie de ataque en tiempo real"
    >
      {/* Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(45,127,249,0.06) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 50% 35% at 85% 15%, rgba(14,203,129,0.04) 0%, transparent 50%)',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          opacity: 0.012,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), ' +
            'linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="section-container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="assessment-header"
          data-reveal
        >
          <div className="assessment-badge">
            <span className="badge-dot" aria-hidden="true" />
            <span>Escaneo en vivo · APIs públicas · Sin agentes</span>
          </div>

          <h2 className="assessment-title">
            Descubre tu exposición real
            <br />
            <span className="gradient-text">antes que los atacantes.</span>
          </h2>
          <p className="assessment-subtitle">
            Analizamos tu superficie de ataque con fuentes públicas en vivo: certificados (crt.sh), DNS (Cloudflare DoH),
            headers HTTP, subdominios, brechas conocidas y reputación de IP. Resultados en <strong>segundos</strong>.
          </p>
        </motion.div>

        {/* Main Card */}
        <div className="assessment-main" data-reveal>
          <AnimatePresence mode="wait">
            {/* ── IDLE: Input Form ── */}
            {formState === 'idle' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.99 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="assessment-card"
              >
                <form onSubmit={handleSubmit} className="assessment-form" noValidate>
                  <div className="form-fields">
                    <AssessmentInput
                      id="assess-email"
                      label="Correo de trabajo"
                      type="email"
                      value={data.email}
                      onChange={(v) => handleChange('email', v)}
                      placeholder="tu@empresa.com"
                      required
                      error={error && !data.email ? error : undefined}
                      icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      }
                    />

                    <AssessmentInput
                      id="assess-domain"
                      label="Dominio a escanear"
                      type="text"
                      value={data.domain}
                      onChange={(v) => handleChange('domain', v)}
                      placeholder="empresa.com"
                      required
                      error={error && !data.domain ? error : undefined}
                      icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          <path d="M2 12h20" />
                        </svg>
                      }
                      helperText="Ejecutamos 6 escaneos en paralelo: certificados, DNS, headers, subdominios, brechas, IP."
                    />

                    <div className="form-row">
                      <AssessmentInput
                        id="assess-company"
                        label="Empresa (opcional)"
                        type="text"
                        value={data.company}
                        onChange={(v) => handleChange('company', v)}
                        placeholder="Nombre de empresa"
                        icon={
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
                            <path d="M6 12h12" />
                            <path d="M10 8h8" />
                            <path d="M10 16h8" />
                          </svg>
                        }
                      />
                      <AssessmentInput
                        id="assess-phone"
                        label="Teléfono (opcional)"
                        type="tel"
                        value={data.phone}
                        onChange={(v) => handleChange('phone', v)}
                        placeholder="+34 600 000 000"
                        icon={
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        }
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="form-error-banner"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      {error}
                    </motion.div>
                  )}

                  <div className="form-trust">
                    <span className="trust-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ecb81" strokeWidth="2" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <polyline points="9 12 11 14 15 10" />
                      </svg>
                      <span>crt.sh · Cloudflare DoH · HIBP</span>
                    </span>
                    <span className="trust-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ecb81" strokeWidth="2" aria-hidden="true">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8" />
                        <path d="M12 17v4" />
                      </svg>
                      <span>Sin instalar agentes</span>
                    </span>
                    <span className="trust-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ecb81" strokeWidth="2" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                      <span>Resultados en segundos</span>
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="assessment-submit"
                    style={{ background: 'linear-gradient(135deg, #2d7ff9 0%, #1a6fe8 100%)' }}
                  >
                    <span className="submit-content">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" strokeLinecap="round" />
                      </svg>
                      Iniciar escaneo gratuito
                    </span>
                  </button>

                  <p className="form-disclaimer">
                    Al enviar, aceptas nuestra <a href="/privacy" className="underline hover:text-primary">Política de Privacidad</a>.
                    Solo usamos tu correo para enviarte el informe. No spam.
                  </p>
                </form>
              </motion.div>
            )}

            {/* ── SCANNING: Live Progress ── */}
            {formState === 'scanning' && !scanResponse && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="assessment-card connecting-card"
                role="status"
                aria-live="polite"
              >
                <span className="thinking-icon" aria-hidden="true"><span /></span>
                <div><h3>Preparando el análisis</h3><p>Conectando con CISPAR y validando la solicitud…</p></div>
              </motion.div>
            )}
            {formState === 'scanning' && scanResponse && scanResponse.status !== 'completed' && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.99 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="assessment-card"
              >
                {/* Live Header */}
                <div className="scanning-header">
                  <div className="scanning-timer" aria-live="polite">
                    <span className="timer-label">Tiempo transcurrido</span>
                    <span className="timer-value">
                      {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="scanning-progress-ring">
                    <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
                      <defs>
                        <linearGradient id="scan-ring-gradient" x1="0" y1="0" x2="96" y2="96">
                          <stop offset="0%" stopColor="#78918a" />
                          <stop offset="100%" stopColor="#c99588" />
                        </linearGradient>
                      </defs>
                      <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(45,127,249,0.08)" strokeWidth="6" />
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        fill="none"
                        stroke="url(#scan-ring-gradient)"
                        strokeWidth="6"
                        strokeDasharray="264"
                        strokeDashoffset={264 * (1 - Math.min(scanResponse.results.length / STAGE_ORDER.length, 1))}
                        strokeLinecap="round"
                        transform="rotate(-90 48 48)"
                        style={{ filter: 'drop-shadow(0 0 10px rgba(45,127,249,0.4))' }}
                      >
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0 48 48"
                          to="360 48 48"
                          dur="2.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </svg>
                    <div className="progress-center">
                      <span className="progress-percent">
                        {Math.round((scanResponse.results.length / STAGE_ORDER.length) * 100)}%
                      </span>
                      <span className="progress-stages">{scanResponse.results.length} / {STAGE_ORDER.length}</span>
                    </div>
                  </div>

                  <h3 className="scanning-current">
                    {STAGE_LABELS[STAGE_ORDER[currentStageIndex]] || 'Iniciando...'}
                  </h3>
                  <p className="scanning-target">Escaneando <code>{data.domain}</code> con fuentes públicas en vivo</p>
                </div>

                {/* Stage List */}
                <div className="stage-list" role="list" aria-label="Etapas del escaneo en vivo">
                  {STAGE_ORDER.map((stageKey, index) => {
                    const status = stageStatuses[stageKey] || 'pending';
                    const result = scanResponse.results.find(r => r.stage === stageKey);
                    const isCurrent = index === currentStageIndex && scanResponse.status === 'running';

                    return (
                      <StageRow
                        key={stageKey}
                        stageKey={stageKey}
                        index={index}
                        status={status}
                        result={result}
                        isCurrent={isCurrent}
                      />
                    );
                  })}
                </div>

                {/* Live Findings Preview */}
                {scanResponse.results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="live-findings"
                  >
                    <div className="findings-header">
                      <span className="findings-title">Hallazgos en vivo</span>
                      <span className="findings-count">{scanResponse.results.flatMap(r => r.details).length} total</span>
                    </div>
                    <div className="findings-list">
                      {scanResponse.results.flatMap(r => r.details).slice(0, 4).map((detail, i) => (
                        <DetailCard key={`${detail.type}-${i}`} detail={detail} />
                      ))}
                    </div>
                    {scanResponse.results.flatMap(r => r.details).length > 4 && (
                      <p className="findings-more">
                        +{scanResponse.results.flatMap(r => r.details).length - 4} hallazgos más...
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── COMPLETED: Results ── */}
            {(formState === 'scanning' || formState === 'completed') && scanResponse?.status === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.99 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="assessment-card"
                onAnimationComplete={() => setFormState('completed')}
              >
                {/* Score Card */}
                <div className="results-score-card"
                  style={{
                    background: 'linear-gradient(135deg, rgba(45,127,249,0.12) 0%, rgba(14,203,129,0.12) 100%)',
                    borderColor: 'rgba(45,127,249,0.2)',
                  }}
                >
                  <div className="score-main">
                    <div className="score-info">
                      <p className="score-label">Puntuación de postura</p>
                      <div className="score-value-row">
                        <span className="score-value">{scanResponse.summary.score}</span>
                        <span className="score-max">/100</span>
                      </div>
                    </div>
                    <div className="score-breakdown">
                      {(['critical', 'high', 'medium', 'low', 'info'] as const).map(sev => {
                        const count = scanResponse.summary.bySeverity[sev] || 0;
                        if (count === 0) return null;
                        return (
                          <span
                            key={sev}
                            className="score-sev"
                            style={{
                              background: getSeverityBg(sev),
                              color: getSeverityColor(sev),
                              borderColor: getSeverityColor(sev) + '40',
                            }}
                          >
                            {count} {getSeverityLabel(sev)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="score-meta">
                    <span>{scanResponse.summary.totalFindings} hallazgos totales</span>
                    <span>·</span>
                    <span>Escaneo completado en {Math.max(0, scanResponse.completedAt
                      ? Math.round((new Date(scanResponse.completedAt).getTime() - new Date(scanResponse.startedAt).getTime()) / 1000)
                      : Math.round(scanResponse.results.reduce((total, result) => total + result.duration, 0) / 1000))}s</span>
                    <span>·</span>
                    <span>Informe enviado a <strong>{data.email}</strong></span>
                  </div>
                </div>

                {/* Detailed Results by Stage */}
                <div className="results-stages">
                  <h3 className="results-section-title">Detalle por categoría</h3>
                  {STAGE_ORDER.map((stageKey, index) => {
                    const result = scanResponse.results.find(r => r.stage === stageKey);
                    if (!result) return null;

                    const Icon = STAGE_ICONS[stageKey];
                    const label = STAGE_LABELS[stageKey];
                    const isExpanded = expandedStage === stageKey;

                    return (
                      <motion.div
                        key={stageKey}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="result-stage"
                      >
                        <button
                          onClick={() => setExpandedStage(isExpanded ? null : stageKey)}
                          className="stage-toggle"
                          aria-expanded={isExpanded}
                        >
                          <div className="stage-toggle-header">
                            <div className="stage-toggle-icon" style={{ color: getSeverityColor(result.severity) }}>
                              {Icon}
                            </div>
                            <div className="stage-toggle-info">
                              <span className="stage-toggle-label">{label}</span>
                              <span className="stage-toggle-meta">{result.details.length} checks · {result.duration}ms</span>
                            </div>
                            <span
                              className="stage-toggle-severity"
                              style={{
                                background: getSeverityBg(result.severity),
                                color: getSeverityColor(result.severity),
                                borderColor: getSeverityColor(result.severity) + '40',
                              }}
                            >
                              {result.found} {getSeverityLabel(result.severity)}
                            </span>
                            <svg
                              className={`stage-toggle-chevron ${isExpanded ? 'open' : ''}`}
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              aria-hidden="true"
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>

                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="stage-details"
                            >
                              <div className="details-grid">
                                {result.details.map((detail, i) => (
                                  <DetailCard key={`${detail.type}-${i}`} detail={detail} />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="results-actions">
                  <button
                    onClick={handleRestart}
                    className="action-btn secondary"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M21 12a9 9 0 1 1-9 9 9.75 9.75 0 0 1 6.74-2.74L21 16" />
                    </svg>
                    Nueva evaluación
                  </button>
                  <a
                    href="/contact"
                    className="action-btn primary"
                    style={{ background: 'linear-gradient(135deg, #2d7ff9 0%, #1a6fe8 100%)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Solicitar demo técnica
                  </a>
                </div>
              </motion.div>
            )}

            {/* ── ERROR ── */}
            {formState === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.99 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="assessment-card error-state"
              >
                <div className="error-icon" style={{ background: 'rgba(240,68,56,0.12)', color: '#f04438' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <h3 className="error-title">No se pudo completar el escaneo</h3>
                <p className="error-message">{error}</p>
                <div className="error-actions">
                  <button
                    onClick={handleRestart}
                    className="action-btn primary"
                    style={{ background: 'linear-gradient(135deg, #2d7ff9 0%, #1a6fe8 100%)' }}
                  >
                    Reintentar
                  </button>
                  <a
                    href="mailto:security@cispar.io"
                    className="action-btn secondary"
                  >
                    Contactar soporte
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
