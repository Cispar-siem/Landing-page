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

function explain(id: CheckId, es: boolean): Explanation {
  const copy = {
    spf: es ? ['Quién puede enviar correo', 'SPF publica qué servicios están autorizados a enviar correo por tu dominio. Encontrarlo no valida todos sus permisos.', 'Confirma con tu proveedor que solo estén autorizados los servicios que realmente usas.'] : ['Who can send email', 'SPF publishes services authorized to send email for your domain. Finding a record does not validate all its permissions.', 'Ask your provider to confirm that only services you use are authorized.'],
    dmarc: es ? ['Suplantación de tu dominio', 'DMARC publica cómo tratar mensajes que no superan la autenticación. Una política solo de monitoreo no pide rechazarlos.', 'Revisa los reportes y las fuentes legítimas antes de cambiar la política. Si consultas un subdominio, puede aplicar la política del dominio principal.'] : ['Domain impersonation', 'DMARC publishes how to handle messages that fail authentication. A monitoring-only policy does not request rejection.', 'Review reports and legitimate senders before changing the policy. A parent-domain policy may apply to subdomains.'],
    mx: es ? ['Recepción de correo', 'Los registros MX indican dónde se recibe el correo del dominio. No verifican la seguridad de un buzón ni si está comprometido.', 'Si usas correo en este dominio, confirma que el servicio publicado sea el esperado. Un dominio que no recibe correo puede tener una configuración distinta.'] : ['Email reception', 'MX records identify where a domain receives email. They do not assess mailbox security or compromise.', 'If you use email on this domain, confirm the published service is expected. Domains not receiving email may use a different configuration.'],
    caa: es ? ['Emisión de certificados', 'CAA puede limitar qué autoridades emiten certificados para tu dominio. Su ausencia no es una brecha ni invalida tus certificados.', 'Consulta si conviene definir una política y si existe una heredada antes de modificar DNS.'] : ['Certificate issuance', 'CAA can restrict which authorities issue certificates for your domain. Absence is not a breach and does not invalidate certificates.', 'Ask whether a policy would help and whether an inherited policy applies before changing DNS.'],
    dnssec: es ? ['Firma de los registros DNS', 'DNSSEC permite validar firmas de DNS. Esta consulta puntual revisa señales públicas; no certifica la configuración completa.', 'Verifica la cadena de firma con quien administra tu dominio. Un resultado no comprobable no demuestra una manipulación.'] : ['DNS record signing', 'DNSSEC allows validation of DNS signatures. This snapshot checks public signals; it does not certify the full configuration.', 'Verify the signing chain with your domain administrator. An unverifiable result does not prove tampering.'],
    certificates: es ? ['Nombres en certificados públicos', 'Los registros de transparencia pueden revelar dominios y subdominios usados en certificados históricos. No prueban que un servicio siga activo.', 'Comprueba que reconozcas los nombres publicados. Esta consulta no valida el certificado TLS actual ni detecta por sí sola una vulnerabilidad.'] : ['Names in public certificates', 'Transparency logs can reveal domains and subdomains used in historical certificates. They do not prove that a service is still active.', 'Check that you recognize the published names. This does not validate current TLS certificates or independently detect a vulnerability.'],
  };
  const [title, meaning, action] = copy[id];
  return { title, meaning, action };
}

function observation(check: Check, es: boolean): string {
  const messages: Record<string, [string, string]> = {
    SPF_SINGLE_POLICY: ['Se encontró una política SPF. Aún hay que validar sus permisos.', 'One SPF policy was found. Its permissions still need validation.'],
    SPF_MULTIPLE_POLICIES: ['Se encontraron varias políticas SPF; esto puede causar errores de validación.', 'Multiple SPF policies were found; this can cause validation errors.'],
    SPF_NOT_FOUND: ['No se encontró una política SPF en esta consulta.', 'No SPF policy was found in this query.'],
    DMARC_MONITORING_POLICY: ['La política DMARC está en monitoreo: p=none.', 'DMARC is in monitoring mode: p=none.'],
    DMARC_POLICY_PUBLISHED: ['Se encontró una política DMARC de cuarentena o rechazo.', 'A DMARC quarantine or rejection policy was found.'],
    DMARC_NOT_FOUND: ['No se encontró una política DMARC en el nombre consultado. Puede aplicar una política del dominio principal.', 'No DMARC policy was found at the queried name. A parent-domain policy may apply.'],
    DMARC_MULTIPLE_POLICIES: ['Se encontraron varias políticas DMARC; confirma cuál debe estar publicada.', 'Multiple DMARC policies were found; confirm which should be published.'],
    DMARC_POLICY_UNSPECIFIED: ['La respuesta DMARC no contiene una política p reconocible.', 'The DMARC response has no recognizable p policy.'],
    DMARC_POLICY_INVALID: ['La política p de DMARC no tiene uno de los valores esperados.', 'The DMARC p policy does not have an expected value.'],
    MX_RECORDS_PUBLISHED: ['Se encontraron servidores publicados para recibir correo.', 'Published email receiving servers were found.'],
    MX_NULL_PUBLISHED: ['El dominio declara explícitamente que no recibe correo (Null MX).', 'The domain explicitly declares that it does not receive email (Null MX).'],
    MX_NOT_PUBLISHED: ['No se encontró un registro MX. Confirma si este dominio debe recibir correo.', 'No MX record was found. Confirm whether this domain should receive email.'],
    CAA_RECORDS_PUBLISHED: ['Se encontraron reglas públicas de emisión de certificados.', 'Public certificate issuance rules were found.'],
    CAA_NOT_PUBLISHED: ['No se encontró CAA en esta consulta. Es un dato informativo, no una vulnerabilidad confirmada.', 'No CAA record was found in this query. This is informational, not a confirmed vulnerability.'],
    DNSSEC_VALIDATED: ['El resolutor devolvió claves DNS con indicador de validación.', 'The resolver returned DNS keys with a validation indicator.'],
    DNSSEC_NOT_OBSERVED: ['No se observaron claves DNSSEC. Este dato no demuestra un ataque.', 'No DNSSEC keys were observed. This does not prove an attack.'],
    DNSSEC_NOT_VALIDATED: ['Se encontraron claves, pero el resolutor no indicó validación.', 'Keys were found, but the resolver did not indicate validation.'],
    CT_CERTIFICATES_FOUND: ['Se encontraron nombres en certificados históricos públicos.', 'Names were found in historical public certificates.'],
    CT_NO_CERTIFICATES_FOUND: ['La fuente no devolvió certificados para esta consulta. No indica por sí solo un riesgo.', 'The source returned no certificates for this query. This alone does not indicate risk.'],
    DNS_NAME_NOT_FOUND: ['El resolutor no encontró el nombre consultado. No hay evidencia suficiente para evaluar esta comprobación.', 'The resolver did not find the queried name. There is not enough evidence to assess this check.'],
    DNS_RESPONSE_TRUNCATED: ['La respuesta DNS está incompleta y no se pudo evaluar.', 'The DNS response is incomplete and could not be assessed.'],
    DNS_RESPONSE_ERROR: ['El resolutor respondió con un error. Esta comprobación queda sin verificar.', 'The resolver returned an error. This check remains unverified.'],
    UPSTREAM_UNAVAILABLE: ['La fuente pública no respondió dentro de los límites de la consulta.', 'The public source did not respond within the query limits.'],
  };
  return messages[check.code]?.[es ? 0 : 1] ?? (es ? 'Consulta sin una interpretación disponible; revisa la evidencia con el equipo.' : 'No interpretation is available for this query; review the evidence with the team.');
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
function businessImpact(check: Check, es: boolean): string {
  if (check.status === 'unknown') return es ? 'Esta parte de la exposición sigue sin evaluar. Hace falta comprobarla antes de tomar decisiones.' : 'This part of the exposure remains unassessed. Verify it before making decisions.';
  const kind = findingKind(check);
  if (kind === 'error') return check.id === 'spf'
    ? (es ? 'Varias políticas SPF pueden provocar errores de autenticación de correo. Esto puede afectar la entrega de mensajes legítimos y la evaluación de identidad del remitente.' : 'Multiple SPF policies can cause email authentication errors, affecting legitimate delivery and sender identity assessment.')
    : (es ? 'Una política DMARC inválida puede impedir que los receptores apliquen la protección que esperas frente a correos que suplantan tu dominio.' : 'An invalid DMARC policy can prevent receivers from applying the protection you expect against domain impersonation.');
  if (check.code === 'DMARC_MONITORING_POLICY') return es ? 'La política publica monitoreo, pero no pide cuarentena o rechazo de mensajes que fallen DMARC. Confirma si esto forma parte de una transición controlada.' : 'The policy requests monitoring but not quarantine or rejection for messages failing DMARC. Confirm whether this is part of a controlled rollout.';
  if (kind === 'risk') return es ? 'Si tu negocio usa este dominio para correo, una configuración ausente o inesperada merece revisión: puede afectar la autenticación o recepción. La consulta no confirma una suplantación.' : 'If your business uses this domain for email, missing or unexpected configuration deserves review: it may affect authentication or reception. This query does not confirm impersonation.';
  if (check.code === 'CAA_NOT_PUBLISHED') return es ? 'Sin una política CAA aplicable, no hay una restricción CAA de las autoridades que pueden emitir certificados. Confirma políticas heredadas y si conviene añadir ese control.' : 'Without an applicable CAA policy, CAA does not restrict which authorities may issue certificates. Confirm inherited policies and whether this control would help.';
  if (check.code === 'DNSSEC_NOT_OBSERVED') return es ? 'No se observó este mecanismo de firma en la consulta. Evaluar DNSSEC puede añadir validación de autenticidad de DNS; su ausencia no prueba una manipulación.' : 'This signing mechanism was not observed in the query. Evaluating DNSSEC may add DNS authenticity validation; its absence does not prove tampering.';
  if (kind === 'exposure') return es ? 'Estos nombres históricos también pueden ser consultados por terceros. Reconocerlos ayuda a detectar activos olvidados que conviene verificar antes de que queden sin mantenimiento.' : 'Third parties can look up these historical names too. Recognizing them helps identify forgotten assets that should be checked before maintenance lapses.';
  return es ? 'Este control o dato está publicado. Su presencia no evalúa por completo los permisos, usuarios, dispositivos o actividad de tu empresa.' : 'This control or record is published. Its presence does not fully assess permissions, users, devices or business activity.';
}

function stateLabel(check: Check, es: boolean): string {
  const labels: Record<FindingKind, [string, string]> = {
    error: ['Error de configuración', 'Configuration error'],
    risk: ['Riesgo por revisar', 'Risk to review'],
    hardening: ['Mejora de protección', 'Protection improvement'],
    exposure: ['Exposición pública', 'Public exposure'],
    info: ['Control observado', 'Observed control'],
    unknown: ['Sin verificar', 'Not verified'],
  };
  return labels[findingKind(check)][es ? 0 : 1];
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
  const { locale } = useI18n();
  const es = locale === 'es';
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
      setError(es ? 'Introduce tu nombre y un correo válido.' : 'Enter your name and a valid email.'); return;
    }
    const digits = contact.phone.replace(/\D/g, '');
    if (!/^[+\d\s().-]+$/.test(contact.phone) || digits.length < 7 || digits.length > 15) {
      setError(es ? 'Introduce un teléfono válido con código de país, por ejemplo +52 55 1234 5678.' : 'Enter a valid phone with country code, such as +1 202 555 0123.'); return;
    }
    if (!consent) return;
    if (domain.includes('@')) { setError(es ? 'El dominio debe ser empresa.com, no una dirección de correo. Tu correo de contacto va en su propio campo.' : 'The domain must be company.com, not an email address. Use the separate contact email field.'); return; }
    let host: string;
    try {
      const url = new URL(domain.includes('://') ? domain.trim() : `https://${domain.trim()}`);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) throw new Error();
      host = url.hostname.toLowerCase();
      if (host.length > 253 || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host)) throw new Error();
    } catch { setError(es ? 'Introduce un dominio válido, por ejemplo empresa.com.' : 'Enter a valid domain such as company.com.'); return; }
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
      setError(timedOut ? (es ? 'La consulta tardó demasiado. Vuelve a intentarlo; no se generaron resultados.' : 'The query timed out. Try again; no results were generated.') : code === 'RATE_LIMIT' ? (es ? 'Hay demasiadas consultas. Espera un momento e inténtalo de nuevo.' : 'Too many requests. Wait a moment and try again.') : code === 'DOMAIN_ERROR' ? (es ? 'El servicio no aceptó ese dominio. Revisa que sea un dominio público válido.' : 'The service did not accept this domain. Check that it is a valid public domain.') : (es ? 'No pudimos completar el Quick Scan. Inténtalo de nuevo; no mostramos resultados inventados.' : 'We could not complete the Quick Scan. Try again; no invented results are shown.'));
    } finally { window.clearTimeout(timer); if (controller.current === request) { setBusy(false); controller.current = null; } }
  }

  function reportText(current: Report): string {
    return [`CISPAR Quick Scan — ${current.domain}`, `${es ? 'Consulta' : 'Checked'}: ${current.checkedAt}`, `${es ? 'Resumen: errores de configuración' : 'Summary: configuration errors'}: ${current.checks.filter(check => findingKind(check) === 'error').length}; ${es ? 'riesgos por revisar' : 'risks to review'}: ${current.checks.filter(check => findingKind(check) === 'risk').length}; ${es ? 'mejoras de protección' : 'protection improvements'}: ${current.checks.filter(check => findingKind(check) === 'hardening').length}.`, es ? 'Evaluación pública puntual. No revisa dispositivos, cuentas internas ni filtraciones de datos personales.' : 'Public point-in-time assessment. Does not inspect devices, internal accounts or personal-data leaks.', '', ...current.checks.flatMap(check => {
      const info = explain(check.id, es);
      return [`${info.title} — ${stateLabel(check, es)}`, observation(check, es), info.meaning, `${es ? 'Posible impacto' : 'Potential impact'}: ${businessImpact(check, es)}`, `${es ? 'Siguiente paso' : 'Next step'}: ${info.action}`, `${es ? 'Evidencia' : 'Evidence'}: ${check.evidence.join(' | ') || (es ? 'Sin evidencia disponible' : 'No evidence available')}`, `${es ? 'Código de comprobación' : 'Check code'}: ${check.code}`, ''];
    }), 'Fuentes / Sources: https://cloudflare-dns.com/dns-query · https://crt.sh/'].join('\n');
  }

  function download(): void {
    if (!report) return;
    const url = URL.createObjectURL(new Blob([reportText(report)], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `cispar-quick-scan-${report.domain}.txt`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const reviewCount = report?.checks.filter(check => check.status === 'review').length ?? 0;
  const errorCount = report?.checks.filter(check => findingKind(check) === 'error').length ?? 0;
  const riskCount = report?.checks.filter(check => findingKind(check) === 'risk').length ?? 0;
  const hardeningCount = report?.checks.filter(check => findingKind(check) === 'hardening').length ?? 0;
  const unknownCount = report?.checks.filter(check => check.status === 'unknown').length ?? 0;

  return <section id="assessment" className="domain-check section" aria-labelledby="domain-check-title">
    <div className="section-container">
      <header className="quick-scan-intro">
        <div><h2 id="domain-check-title" className="section-title">{es ? 'Tu Quick Scan.' : 'Your Quick Scan.'}</h2><p className="section-subtitle">{es ? 'Descubre señales públicas de exposición de tu dominio y qué conviene revisar primero.' : 'Discover public exposure signals for your domain and what to review first.'}</p></div>
        <p>{es ? 'Revisamos configuración de correo, registros DNS y nombres publicados en certificados. Cada resultado incluye evidencia, posible impacto y un siguiente paso.' : 'We check email configuration, DNS records and names published in certificates. Each result includes evidence, potential impact and a next step.'}</p>
      </header>
      <div className="quick-scan-scope"><p>{es ? 'Alcance: fuentes públicas del dominio. No accedemos a tus equipos o buzones ni comprobamos filtraciones de tu correo, nombre o teléfono.' : 'Scope: public domain sources. We do not access devices or mailboxes or check leaks of your email, name or phone.'}</p></div>
      <div className="domain-check-tool" data-ui>
        {!report && !busy && <form className="quick-scan-form" onSubmit={run} aria-describedby="quick-scan-disclosure">
          <div className="quick-scan-fields">
            <label>{es ? 'Nombre completo' : 'Full name'}<input name="name" value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} autoComplete="name" maxLength={100} required /></label>
            <label>{es ? 'Correo de contacto' : 'Contact email'}<input name="email" type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} autoComplete="email" maxLength={254} required /></label>
            <label>{es ? 'Teléfono con código de país' : 'Phone with country code'}<input name="phone" type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} autoComplete="tel" maxLength={40} placeholder={es ? '+52 55 1234 5678' : '+1 202 555 0123'} required /></label>
            <label>{es ? 'Empresa (opcional)' : 'Company (optional)'}<input name="company" value={contact.company} onChange={e => setContact({ ...contact, company: e.target.value })} autoComplete="organization" maxLength={150} /></label>
            <label className="quick-scan-domain" htmlFor="public-domain">{es ? 'Dominio que quieres revisar' : 'Domain to review'}<input id="public-domain" name="domain" value={domain} onChange={e => { setDomain(e.target.value); setError(''); }} placeholder="empresa.com" required autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={300} aria-describedby="quick-scan-domain-help" /></label>
          </div>
          <p id="quick-scan-domain-help">{es ? 'Ejemplo: empresa.com. Es diferente de tu correo de contacto; no escribas una dirección de email aquí.' : 'Example: company.com. This is separate from your contact email; do not enter an email address here.'}</p>
          <label className="quick-scan-consent"><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} /><span>{es ? 'Tengo autorización para consultar este dominio y entiendo el alcance público del chequeo.' : 'I am authorized to check this domain and understand the public scope of the check.'}</span></label>
          <p id="quick-scan-disclosure">{es ? 'Solo enviamos el dominio a nuestro servicio y a Cloudflare DNS / crt.sh. Tus datos de contacto se mantienen en esta sesión del navegador para preparar una consulta que tú puedes revisar y enviar a CISPAR.' : 'Only the domain is sent to our service and Cloudflare DNS / crt.sh. Your contact details stay in this browser session to prepare an inquiry you can review and send to CISPAR.'} <a href="https://developers.cloudflare.com/1.1.1.1/privacy/public-dns-resolver/" target="_blank" rel="noreferrer">{es ? 'Privacidad de Cloudflare' : 'Cloudflare privacy'}</a></p>
          {error && <p className="quick-scan-error" role="alert">{error}</p>}
          <button className="btn-primary" type="submit">{es ? 'Iniciar Quick Scan' : 'Start Quick Scan'}</button>
        </form>}
        {busy && <div className="quick-scan-progress" aria-live="polite" aria-busy="true"><span className="quick-scan-spinner" aria-hidden="true" /><h3>{es ? 'Consultando fuentes públicas…' : 'Querying public sources…'}</h3><p>{es ? 'Buscando configuración de correo, DNS y certificados. Las fuentes pueden tardar o no responder; lo indicaremos en el resultado.' : 'Looking up email configuration, DNS and certificates. Sources may be slow or unavailable; results will reflect this.'}</p><button type="button" className="btn-secondary" onClick={reset}>{es ? 'Cancelar consulta' : 'Cancel query'}</button></div>}
        {report && <div className="quick-scan-report">
          <header className="quick-scan-report-heading"><div><h3 ref={resultRef} tabIndex={-1}>{report.domain}</h3><p>{es ? 'Consultado' : 'Checked'}: {new Date(report.checkedAt).toLocaleString(locale)}</p></div><button className="btn-secondary" type="button" onClick={download}>{es ? 'Descargar resultados' : 'Download results'}</button></header>
          <div className="quick-scan-summary" aria-live="polite"><p><strong>{report.checks.length}</strong> {es ? 'comprobaciones' : 'checks'}</p><p><strong>{errorCount}</strong> {es ? 'errores de configuración' : 'configuration errors'}</p><p><strong>{riskCount}</strong> {es ? 'riesgos por revisar' : 'risks to review'}</p><p><strong>{hardeningCount}</strong> {es ? 'mejoras de protección' : 'protection improvements'}</p><p><strong>{unknownCount}</strong> {es ? 'sin verificar' : 'not verified'}</p></div>
          <p>{unknownCount === IDS.length ? (es ? 'No pudimos verificar ninguna de las comprobaciones. Esto no es un diagnóstico de seguridad. Vuelve a intentarlo o confirma los datos con el equipo.' : 'None of the checks could be verified. This is not a security diagnosis. Try again or confirm the data with the team.') : reviewCount ? (es ? 'Empieza por las observaciones marcadas para revisar. Son señales de configuración, no pruebas de un ataque.' : 'Start with observations marked for review. These are configuration signals, not proof of an attack.') : (es ? (hardeningCount ? 'Hay controles de protección que conviene evaluar. Son oportunidades de mejora, no vulnerabilidades confirmadas.' : 'No se detectaron errores en estas comprobaciones. El Quick Scan no evalúa todas las vulnerabilidades de tu empresa; revisa también lo que quedó sin verificar.') : (hardeningCount ? 'There are protection controls worth evaluating. These are improvements, not confirmed vulnerabilities.' : 'These checks detected no errors. Quick Scan does not assess every vulnerability in your business; review what remains unverified too.'))}</p>
          <div className="quick-scan-filters" role="group" aria-label={es ? 'Filtrar resultados' : 'Filter results'}>{(['all', 'review', 'hardening', 'unknown'] as const).map(item => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item === 'all' ? (es ? 'Todos' : 'All') : item === 'review' ? (es ? 'Para revisar' : 'To review') : item === 'hardening' ? (es ? 'Mejoras' : 'Improvements') : (es ? 'Sin verificar' : 'Not verified')}</button>)}</div>
          <div className="quick-scan-results">{report.checks.filter(check => filter === 'all' || (filter === 'hardening' ? findingKind(check) === 'hardening' : check.status === filter)).map(check => {
            const info = explain(check.id, es);
            return <article className={`quick-scan-result status-${check.status} finding-${findingKind(check)}`} key={check.id}>
              <header><h4>{info.title}</h4><span>{stateLabel(check, es)}</span></header>
              <p className="quick-scan-observation"><strong>{es ? 'Qué vimos: ' : 'What we saw: '}</strong>{observation(check, es)}</p>
              <p>{check.status === 'unknown' ? (es ? 'La fuente no permitió completar esta comprobación. No inferimos que exista un problema ni que el dominio esté protegido.' : 'The source did not allow this check to complete. We infer neither a problem nor protection.') : info.meaning}</p>
              {check.status === 'review' && <p className="quick-scan-observation">{es ? 'Esta consulta encontró una configuración que conviene confirmar. Revisa la evidencia y el alcance antes de cambiarla.' : 'This query found a configuration worth confirming. Review the evidence and scope before changing it.'}</p>}
              <p className="quick-scan-impact"><strong>{es ? 'Cómo podría afectarte: ' : 'How this could affect you: '}</strong>{businessImpact(check, es)}</p>
              <p><strong>{es ? 'Siguiente paso: ' : 'Next step: '}</strong>{check.status === 'unknown' ? (es ? 'Repite la consulta o confirma el dato con quien administra el dominio.' : 'Retry or confirm the information with your domain administrator.') : info.action}</p>
              <details><summary>{es ? 'Ver evidencia y fuente' : 'View evidence and source'}</summary><p>{check.id === 'certificates' ? 'Certificate Transparency · crt.sh' : 'Cloudflare DNS over HTTPS'}</p>{check.evidence.length ? check.evidence.map((entry, index) => <code key={index}>{entry}</code>) : <p>{es ? 'Sin registros de evidencia en esta respuesta.' : 'No evidence records in this response.'}</p>}<small>{es ? 'Código de comprobación' : 'Check code'}: {check.code}</small></details>
            </article>;
          })}{report.checks.filter(check => filter === 'all' || (filter === 'hardening' ? findingKind(check) === 'hardening' : check.status === filter)).length === 0 && <p>{es ? 'No hay resultados en este filtro.' : 'No results for this filter.'}</p>}</div>
          <div className="quick-scan-next"><div><h4>{es ? 'No lo dejes sin revisar.' : 'Follow up on your exposure.'}</h4><p>{es ? 'El Quick Scan es una fotografía pública de tu dominio. La revisión de equipos, usuarios y actividad interna requiere otras fuentes autorizadas. Comparte el resultado con CISPAR para conversar sobre tu empresa.' : 'Quick Scan is a public snapshot of your domain. Reviewing devices, users and internal activity requires other authorized sources. Share results with CISPAR to discuss your business.'}</p></div><div className="quick-scan-actions"><button type="button" className="btn-primary" onClick={() => navigate('/contact', { state: { assessment: { ...contact, domain: report.domain, report: [`CISPAR Quick Scan — ${report.domain}`, report.checkedAt, ...report.checks.map(check => `${explain(check.id, es).title}: ${stateLabel(check, es)}. ${observation(check, es)}`), es ? 'Puedo adjuntar el informe completo descargado desde la web.' : 'I can attach the full report downloaded from the website.'].join('\n') } } })}>{es ? 'Revisar estos riesgos con CISPAR' : 'Review these risks with CISPAR'}</button><button className="btn-secondary" type="button" onClick={reset}>{es ? 'Hacer otra revisión' : 'Run another check'}</button></div></div>
        </div>}
      </div>
    </div>
  </section>;
}
