import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import './security-hero.css';

type View = 'devices' | 'accounts' | 'domain';
const VIEWS: View[] = ['devices', 'accounts', 'domain'];

function BusinessIllustration({ view }: { view: View }): React.ReactElement {
  return <svg className={`business-illustration view-${view}`} viewBox="0 0 600 410" fill="none" aria-hidden="true">
    <g className="business-object business-device">
      <rect x="45" y="96" width="335" height="218" rx="12" fill="#fffefa" stroke="currentColor" strokeWidth="4" />
      <path d="M45 278H380M174 314V340M250 314V340M145 342H280" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M88 146H165M88 166H135" stroke="#78918a" strokeWidth="8" strokeLinecap="round" />
      <rect x="88" y="194" width="104" height="48" rx="3" fill="#e5eae3" />
      <path d="M215 207H321M215 228H284" stroke="#78918a" strokeWidth="8" strokeLinecap="round" />
    </g>
    <g className="business-object business-account">
      <rect x="335" y="160" width="184" height="213" rx="9" fill="#eeece6" stroke="currentColor" strokeWidth="4" />
      <path d="M400 160V145C400 133 409 124 421 124H432C444 124 453 133 453 145V160" stroke="currentColor" strokeWidth="4" />
      <rect x="406" y="180" width="42" height="7" rx="3.5" fill="currentColor" />
      <circle cx="427" cy="231" r="22" fill="#78918a" />
      <path d="M387 298C387 276 405 260 427 260C449 260 467 276 467 298V306H387V298Z" fill="#78918a" />
      <path d="M390 331H464" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </g>
    <g className="business-object business-domain">
      <rect x="229" y="37" width="324" height="93" rx="7" fill="#dce5dd" stroke="currentColor" strokeWidth="4" />
      <circle cx="265" cy="83" r="17" stroke="currentColor" strokeWidth="2.5" />
      <path d="M248 83H282M265 66C254 76 254 90 265 100C276 90 276 76 265 66Z" stroke="currentColor" strokeWidth="2" />
      <path d="M309 72H509M309 93H465" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    </g>
  </svg>;
}

export function Hero(): React.ReactElement {
  const { locale } = useI18n();
  const es = locale === 'es';
  const [view, setView] = useState<View>('devices');
  const labels = es ? { devices: 'Equipos', accounts: 'Cuentas', domain: 'Dominio' } : { devices: 'Devices', accounts: 'Accounts', domain: 'Domain' };
  const details = es ? {
    devices: 'Saber qué ocurre en los equipos donde trabaja tu gente.',
    accounts: 'Entender qué accesos necesitan atención y qué conviene revisar.',
    domain: 'Ver qué información de tu negocio está publicada en internet.',
  } : {
    devices: 'Understand what happens on the devices your people work with.',
    accounts: 'Understand which access activity needs attention and review.',
    domain: 'See what information about your business is public on the internet.',
  };
  function startScan(): void {
    document.getElementById('assessment')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }
  return <section className="hero hero-centinela" aria-labelledby="hero-title">
    <div className="section-container centinela-hero-layout">
      <div className="centinela-hero-copy">
        <h1 id="hero-title">{es ? 'Seguridad para' : 'Security for'}<br />{es ? 'tu empresa.' : 'your business.'}</h1>
        <p className="centinela-hero-body">{es ? 'Diseñamos CISPAR para reunir equipos, cuentas y riesgos en una visión clara. Para que sepas qué revisar primero, sin tener un equipo de seguridad propio.' : 'We are designing CISPAR to bring devices, accounts and risks into one clear view. Know what to review first, without a security team of your own.'}</p>
        <div className="centinela-hero-actions"><button type="button" className="btn-primary" onClick={startScan}>{es ? 'Revisar mi dominio' : 'Check my domain'}<span aria-hidden="true">↗</span></button><Link to="/contact">{es ? 'Hablar con CISPAR' : 'Talk to CISPAR'}<span aria-hidden="true">→</span></Link></div>
        <p className="centinela-hero-available">{es ? 'Prueba hoy el chequeo público de tu dominio.' : 'Try the public domain check today.'}</p>
      </div>
      <figure className="centinela-business" aria-label={es ? 'Ámbitos propuestos para CISPAR: equipos, cuentas y dominio' : 'Proposed CISPAR scope: devices, accounts and domain'}>
        <div className="business-picture"><BusinessIllustration view={view} /><img className="business-signature" src="/cispar-centinela.png" alt="" width="52" height="52" /></div>
        <div className="business-choices" role="group" aria-label={es ? 'Explorar visión del producto' : 'Explore the product vision'}>{VIEWS.map(item => <button key={item} type="button" aria-pressed={view === item} onClick={() => setView(item)}>{labels[item]}</button>)}</div>
        <div className="business-explanation" key={view} aria-live="polite"><p>{details[view]}</p>{view === 'domain' && <span>{es ? 'Disponible: chequeo público con Quick Scan.' : 'Available: public checks with Quick Scan.'}</span>}</div>
        <figcaption>{es ? 'Equipos y cuentas: alcance previsto de CISPAR Security.' : 'Devices and accounts: planned CISPAR Security scope.'}</figcaption>
      </figure>
    </div>
  </section>;
}
