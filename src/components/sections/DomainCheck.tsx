import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import './domain-check.css';

const IDS = ['spf', 'dmarc', 'mx', 'caa', 'dnssec', 'certificates'] as const;
type CheckId = typeof IDS[number];
type Check = { id: CheckId; status: 'observed' | 'review' | 'unknown'; code: string; evidence: string[] };
type Report = { domain: string; checkedAt: string; checks: Check[] };
type Contact = { name: string; email: string; phone: string; company: string };
type Explanation = { title: string; meaning: string; action: string };

type Translate = (key: string) => string;

function explain(id: CheckId, t: Translate): Explanation {
  return {
    title: t(`quickScan.check.${id}.title`),
    meaning: t(`quickScan.check.${id}.meaning`),
    action: t(`quickScan.check.${id}.action`),
  };
}

function observation(check: Check, t: Translate): string {
  const key = `quickScan.observation.${check.code}`;
  const copy = t(key);
  return copy === key ? t('quickScan.observation.fallback') : copy;
}

type FindingKind = 'error' | 'risk' | 'hardening' | 'exposure' | 'info' | 'unknown';
function findingKind(check: Check): FindingKind {
  if (check.status === 'unknown') return 'unknown';
  if (['SPF_MULTIPLE_POLICIES', 'DMARC_MULTIPLE_POLICIES', 'DMARC_POLICY_INVALID', 'DMARC_POLICY_UNSPECIFIED'].includes(check.code)) return 'error';
  if (['CAA_NOT_PUBLISHED', 'DNSSEC_NOT_OBSERVED'].includes(check.code)) return 'hardening';
  if (check.status === 'review') return 'risk';
  if (check.code === 'CT_CERTIFICATES_FOUND') return 'exposure';
  return 'info';
}
function businessImpact(check: Check, t: Translate): string {
  if (check.status === 'unknown') return t('quickScan.impact.unknown');
  const kind = findingKind(check);
  if (kind === 'error') return t(check.id === 'spf' ? 'quickScan.impact.spfError' : 'quickScan.impact.dmarcError');
  if (check.code === 'DMARC_MONITORING_POLICY') return t('quickScan.impact.dmarcMonitoring');
  if (kind === 'risk') return t('quickScan.impact.risk');
  if (check.code === 'CAA_NOT_PUBLISHED') return t('quickScan.impact.caa');
  if (check.code === 'DNSSEC_NOT_OBSERVED') return t('quickScan.impact.dnssec');
  if (kind === 'exposure') return t('quickScan.impact.exposure');
  return t('quickScan.impact.info');
}

function stateLabel(check: Check, t: Translate): string {
  return t(`quickScan.status.${findingKind(check)}`);
}

function parseReport(value: unknown): Report {
  if (!value || typeof value !== 'object') throw new Error('INVALID_RESPONSE');
  const r = value as Report;
  if (typeof r.domain !== 'string' || !r.domain || typeof r.checkedAt !== 'string' || !Number.isFinite(Date.parse(r.checkedAt)) || !Array.isArray(r.checks) || r.checks.length !== IDS.length) throw new Error('INVALID_RESPONSE');
  const seen = new Set<string>();
  for (const check of r.checks) {
    if (!check || !IDS.includes(check.id) || seen.has(check.id) || !['observed', 'review', 'unknown'].includes(check.status) || typeof check.code !== 'string' || check.code.length > 100 || !Array.isArray(check.evidence) || check.evidence.length > 5 || check.evidence.some(item => typeof item !== 'string' || item.length > 500)) throw new Error('INVALID_RESPONSE');
    seen.add(check.id);
  }
  return r;
}

export function DomainCheck(): React.ReactElement {
  const { locale, t } = useI18n();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact>({ name: '', email: '', phone: '', company: '' });
  const [domain, setDomain] = useState('');
  const [consent, setConsent] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'review' | 'hardening' | 'unknown'>('all');
  const controller = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!report || !resultRef.current) return;
    resultRef.current.focus({ preventScroll: true });
    resultRef.current.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [report]);

  function reset(): void {
    controller.current?.abort(); controller.current = null;
    setBusy(false); setReport(null); setError(''); setFilter('all');
  }

  async function run(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');
    if (!contact.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      setError(t('quickScan.error.contact')); return;
    }
    const digits = contact.phone.replace(/\D/g, '');
    if (!/^[+\d\s().-]+$/.test(contact.phone) || digits.length < 7 || digits.length > 15) {
      setError(t('quickScan.error.phone')); return;
    }
    if (!consent) return;
    if (domain.includes('@')) { setError(t('quickScan.error.emailAsDomain')); return; }
    let host: string;
    try {
      const url = new URL(domain.includes('://') ? domain.trim() : `https://${domain.trim()}`);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) throw new Error();
      host = url.hostname.toLowerCase();
      if (host.length > 253 || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host)) throw new Error();
    } catch { setError(t('quickScan.error.domain')); return; }
    const request = new AbortController(); controller.current = request;
    setBusy(true); setReport(null);
    let timedOut = false;
    const timer = window.setTimeout(() => { timedOut = true; request.abort(); }, 25000);
    try {
      const response = await fetch('/api/quick-scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain: host }), signal: request.signal });
      if (!response.ok) throw new Error(response.status === 429 ? 'RATE_LIMIT' : response.status === 400 ? 'DOMAIN_ERROR' : 'SERVICE_ERROR');
      const result = parseReport(await response.json());
      if (result.domain !== host) throw new Error('INVALID_RESPONSE');
      if (controller.current === request) { setReport(result); setFilter('all'); }
    } catch (failure) {
      if (controller.current !== request) return;
      const code = failure instanceof Error ? failure.message : '';
      setError(timedOut ? t('quickScan.error.timeout') : code === 'RATE_LIMIT' ? t('quickScan.error.rateLimit') : code === 'DOMAIN_ERROR' ? t('quickScan.error.domainRejected') : t('quickScan.error.failed'));
    } finally { window.clearTimeout(timer); if (controller.current === request) { setBusy(false); controller.current = null; } }
  }

  function reportText(current: Report): string {
    return [t('quickScan.report.title').replace('{domain}', current.domain), `${t('quickScan.report.checked')}: ${current.checkedAt}`, `${t('quickScan.count.errors')}: ${current.checks.filter(check => findingKind(check) === 'error').length}; ${t('quickScan.count.risks')}: ${current.checks.filter(check => findingKind(check) === 'risk').length}; ${t('quickScan.count.improvements')}: ${current.checks.filter(check => findingKind(check) === 'hardening').length}; ${t('quickScan.count.exposures')}: ${current.checks.filter(check => findingKind(check) === 'exposure').length}; ${t('quickScan.count.unknown')}: ${current.checks.filter(check => check.status === 'unknown').length}.`, t('quickScan.report.scope'), '', ...current.checks.flatMap(check => {
      const info = explain(check.id, t);
      return [`${info.title} — ${stateLabel(check, t)}`, observation(check, t), info.meaning, `${t('quickScan.report.impact')}: ${businessImpact(check, t)}`, `${t('quickScan.report.nextStep')}: ${info.action}`, `${t('quickScan.report.evidence')}: ${check.evidence.join(' | ') || t('quickScan.report.noEvidence')}`, `${t('quickScan.report.code')}: ${check.code}`, ''];
    }), t('quickScan.report.sources')].join('\n');
  }

  function download(): void {
    if (!report) return;
    const url = URL.createObjectURL(new Blob([reportText(report)], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `cispar-quick-scan-${report.domain}.txt`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const errorCount = report?.checks.filter(check => findingKind(check) === 'error').length ?? 0;
  const riskCount = report?.checks.filter(check => findingKind(check) === 'risk').length ?? 0;
  const hardeningCount = report?.checks.filter(check => findingKind(check) === 'hardening').length ?? 0;
  const unknownCount = report?.checks.filter(check => check.status === 'unknown').length ?? 0;
  const exposureCount = report?.checks.filter(check => findingKind(check) === 'exposure').length ?? 0;
  const actionableCount = errorCount + riskCount + hardeningCount + exposureCount;
  const nextStepState = unknownCount === IDS.length ? 'unknown' : actionableCount > 0 ? 'findings' : unknownCount > 0 ? 'partial' : 'clear';

  return <section id="assessment" className="domain-check section" aria-labelledby="domain-check-title">
    <div className="section-container">
      <header className="quick-scan-intro">
        <div><h2 id="domain-check-title" className="section-title">{t('quickScan.title')}</h2><p className="section-subtitle">{t('quickScan.subtitle')}</p></div>
        <p>{t('quickScan.intro')}</p>
      </header>
      <div className="quick-scan-scope"><p>{t('quickScan.scope')}</p></div>
      <div className="domain-check-tool" data-ui>
        {!report && !busy && <form className="quick-scan-form" onSubmit={run} aria-describedby="quick-scan-disclosure">
          <div className="quick-scan-fields">
            <label>{t('quickScan.field.name')}<input name="name" value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} autoComplete="name" maxLength={100} required /></label>
            <label>{t('quickScan.field.email')}<input name="email" type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} autoComplete="email" maxLength={254} required /></label>
            <label>{t('quickScan.field.phone')}<input name="phone" type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} autoComplete="tel" maxLength={40} placeholder={t('quickScan.field.phonePlaceholder')} required /></label>
            <label>{t('quickScan.field.company')}<input name="company" value={contact.company} onChange={e => setContact({ ...contact, company: e.target.value })} autoComplete="organization" maxLength={150} /></label>
            <label className="quick-scan-domain" htmlFor="public-domain">{t('quickScan.field.domain')}<input id="public-domain" name="domain" value={domain} onChange={e => { setDomain(e.target.value); setError(''); }} placeholder={t('quickScan.field.domainPlaceholder')} required autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={300} aria-describedby="quick-scan-domain-help" /></label>
          </div>
          <p id="quick-scan-domain-help">{t('quickScan.domainHelp')}</p>
          <label className="quick-scan-consent"><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} /><span>{t('quickScan.consent')}</span></label>
          <p id="quick-scan-disclosure">{t('quickScan.disclosure')} <a href="https://developers.cloudflare.com/1.1.1.1/privacy/public-dns-resolver/" target="_blank" rel="noreferrer">{t('quickScan.providerPrivacy')}</a></p>
          {error && <p className="quick-scan-error" role="alert">{error}</p>}
          <button className="btn-primary" type="submit">{t('quickScan.start')}</button>
        </form>}
        {busy && <div className="quick-scan-progress" aria-live="polite" aria-busy="true"><span className="quick-scan-spinner" aria-hidden="true" /><h3>{t('quickScan.busy.title')}</h3><p>{t('quickScan.busy.body')}</p><button type="button" className="btn-secondary" onClick={reset}>{t('quickScan.busy.cancel')}</button></div>}
        {report && <div className="quick-scan-report">
          <header className="quick-scan-report-heading"><div><h3 ref={resultRef} tabIndex={-1}>{report.domain}</h3><p>{t('quickScan.checkedAt')}: {new Date(report.checkedAt).toLocaleString(locale)}</p></div><button className="btn-secondary" type="button" onClick={download}>{t('quickScan.download')}</button></header>
          <div className="quick-scan-summary" aria-live="polite"><p><strong>{report.checks.length}</strong> {t('quickScan.count.checks')}</p><p><strong>{errorCount}</strong> {t('quickScan.count.errors')}</p><p><strong>{riskCount}</strong> {t('quickScan.count.risks')}</p><p><strong>{hardeningCount}</strong> {t('quickScan.count.improvements')}</p><p><strong>{unknownCount}</strong> {t('quickScan.count.unknown')}</p></div>
          <p>{unknownCount === IDS.length ? t('quickScan.summary.unknownAll') : actionableCount > 0 ? t(unknownCount > 0 ? 'quickScan.summary.findingsPartial' : 'quickScan.summary.findings').replace('{count}', String(actionableCount)) : unknownCount > 0 ? t('quickScan.summary.partial') : t('quickScan.summary.clear')}</p>
          <div className="quick-scan-filters" role="group" aria-label={t('quickScan.filters.aria')}>{(['all', 'review', 'hardening', 'unknown'] as const).map(item => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{t(`quickScan.filters.${item}`)}</button>)}</div>
          <div className="quick-scan-results">{report.checks.filter(check => filter === 'all' || (filter === 'hardening' ? findingKind(check) === 'hardening' : check.status === filter)).map(check => {
            const info = explain(check.id, t);
            return <article className={`quick-scan-result status-${check.status} finding-${findingKind(check)}`} key={check.id}>
              <header><h4>{info.title}</h4><span>{stateLabel(check, t)}</span></header>
              <p className="quick-scan-observation"><strong>{t('quickScan.label.observed')}: </strong>{observation(check, t)}</p>
              <p>{check.status === 'unknown' ? t('quickScan.result.unknown') : info.meaning}</p>
              {check.status === 'review' && <p className="quick-scan-observation">{t('quickScan.result.review')}</p>}
              <p className="quick-scan-impact"><strong>{t('quickScan.label.impact')}: </strong>{businessImpact(check, t)}</p>
              <p><strong>{t('quickScan.label.nextStep')}: </strong>{check.status === 'unknown' ? t('quickScan.result.unknownNext') : info.action}</p>
              <details><summary>{t('quickScan.evidence.toggle')}</summary><p>{t(check.id === 'certificates' ? 'quickScan.evidence.ctSource' : 'quickScan.evidence.dnsSource')}</p>{check.evidence.length ? check.evidence.map((entry, index) => <code key={index}>{entry}</code>) : <p>{t('quickScan.evidence.none')}</p>}<small>{t('quickScan.evidence.code')}: {check.code}</small></details>
            </article>;
          })}{report.checks.filter(check => filter === 'all' || (filter === 'hardening' ? findingKind(check) === 'hardening' : check.status === filter)).length === 0 && <p>{t('quickScan.filters.empty')}</p>}</div>
          <div className="quick-scan-next"><div><h4>{t(`quickScan.next.${nextStepState}.title`)}</h4><p>{nextStepState === 'findings' ? t(unknownCount > 0 ? 'quickScan.next.findingsPartial.body' : 'quickScan.next.findings.body').replace('{count}', String(actionableCount)) : t(`quickScan.next.${nextStepState}.body`)}</p></div><div className="quick-scan-actions"><button type="button" className="btn-primary" onClick={() => nextStepState === 'unknown' || nextStepState === 'partial' ? reset() : navigate('/contact', { state: { assessment: { ...contact, domain: report.domain, report: reportText(report) } } })}>{t(`quickScan.next.${nextStepState}.cta`)}</button><button className="btn-secondary" type="button" onClick={nextStepState === 'unknown' || nextStepState === 'partial' ? () => navigate('/contact') : reset}>{t(nextStepState === 'unknown' || nextStepState === 'partial' ? 'quickScan.next.contact' : 'quickScan.next.retry')}</button></div></div>
        </div>}
      </div>
    </div>
  </section>;

}
