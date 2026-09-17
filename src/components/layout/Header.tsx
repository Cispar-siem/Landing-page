import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [{ label: 'Producto', to: '/#product' }, { label: 'Descargas', to: '/download' }, { label: 'Pricing', to: '/pricing' }, { label: 'Contacto', to: '/contact' }];
function Mark(): React.ReactElement { return <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2 4 5.5v5.8c0 5.1 3.4 9.8 8 10.7 4.6-.9 8-5.6 8-10.7V5.5L12 2Z" stroke="currentColor" strokeWidth="1.8"/><path d="m8.5 12 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span>; }
export function Header(): React.ReactElement {
  const [open, setOpen] = useState(false); const { user, openLogin, signOut } = useAuth();
  return <header className="site-header"><nav className="section-container nav-shell" aria-label="Navegación principal"><Link to="/" className="brand" onClick={() => setOpen(false)}><Mark /><span>CISPAR</span></Link><button className="nav-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Abrir menú">{open ? 'Cerrar' : 'Menú'}</button><div className={`nav-content ${open ? 'nav-open' : ''}`}><div className="nav-links">{links.map((link) => <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>{link.label}</Link>)}</div><div className="nav-actions">{user ? <button className="text-button" onClick={() => void signOut()}>Cerrar sesión</button> : <button className="text-button" onClick={openLogin}>Iniciar sesión</button>}<Link className="btn-primary btn-small" to="/download" onClick={() => setOpen(false)}>Descargar</Link></div></div></nav></header>;
}
