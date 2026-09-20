import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useI18n } from '../../i18n/I18nContext';
import { DownloadButton } from './DownloadButton';

const links = [
  { key: 'nav.product', to: '/' },
  { key: 'nav.download', to: '/download' },
  { key: 'nav.pricing', to: '/pricing' },
  { key: 'nav.contact', to: '/contact' },
] as const;

export function Header(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="site-header">
      <nav className="section-container nav-shell" aria-label={t('nav.main')}>
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <img className="brand-logo" src={logo} alt="CISPAR" />
          <span>CISPAR</span>
        </Link>
        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="site-navigation"
        >
          {t(open ? 'nav.close' : 'nav.menu')}
        </button>
        <div id="site-navigation" className={`nav-content ${open ? 'nav-open' : ''}`}>
          <div className="nav-links">
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
                {t(link.key)}
              </Link>
            ))}
          </div>
          <div className="nav-actions">
            <select
              className="language-switch"
              value={locale}
              onChange={(event) => setLocale(event.target.value as typeof locale)}
              aria-label={t('nav.language')}
            >
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
            <div onClick={() => setOpen(false)}>
              <DownloadButton className="btn-primary btn-small" />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
