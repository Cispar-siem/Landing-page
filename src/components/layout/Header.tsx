import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../assets/logo.png';
import { useI18n } from '../../i18n/I18nContext';

const links = [{ key: 'nav.product', to: '/' }, { key: 'nav.download', to: '/download' }, { key: 'nav.pricing', to: '/pricing' }, { key: 'nav.contact', to: '/contact' }];
function Mark(): React.ReactElement { return <img className="brand-logo" src={logo} alt="" aria-hidden="true" />; }
export function Header(): React.ReactElement {
  const [open, setOpen] = useState(false); const { user, openLogin, signOut } = useAuth(); const { locale, setLocale, t } = useI18n();
  return <header className="site-header"><nav className="section-container nav-shell" aria-label="Navegación principal"><Link to="/" className="brand" onClick={() => setOpen(false)}><Mark /><span>CISPAR</span></Link><button className="nav-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Abrir menú">{open ? 'Cerrar' : 'Menú'}</button><div className={`nav-content ${open ? 'nav-open' : ''}`}><div className="nav-links">{links.map((link) => <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>{t(link.key)}</Link>)}</div><div className="nav-actions"><select className="language-switch" value={locale} onChange={(event) => setLocale(event.target.value as typeof locale)} aria-label={t('nav.language')}><option value="es">ES</option><option value="en">EN</option></select>{user ? <button className="text-button" onClick={() => void signOut()}>{t('nav.logout')}</button> : <button className="text-button" onClick={openLogin}>{t('nav.login')}</button>}<Link className="btn-primary btn-small" to="/download" onClick={() => setOpen(false)}>{t('nav.downloadCta')}</Link></div></div></nav></header>;
}
