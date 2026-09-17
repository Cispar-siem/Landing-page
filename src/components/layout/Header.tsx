import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../assets/logo.png';

const links = [{ label: 'Producto', to: '/' }, { label: 'Descargas', to: '/download' }, { label: 'Pricing', to: '/pricing' }, { label: 'Contacto', to: '/contact' }];
function Mark(): React.ReactElement { return <img className="brand-logo" src={logo} alt="" aria-hidden="true" />; }
export function Header(): React.ReactElement {
  const [open, setOpen] = useState(false); const { user, openLogin, signOut } = useAuth();
  return <header className="site-header"><nav className="section-container nav-shell" aria-label="Navegación principal"><Link to="/" className="brand" onClick={() => setOpen(false)}><Mark /><span>CISPAR</span></Link><button className="nav-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Abrir menú">{open ? 'Cerrar' : 'Menú'}</button><div className={`nav-content ${open ? 'nav-open' : ''}`}><div className="nav-links">{links.map((link) => <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>{link.label}</Link>)}</div><div className="nav-actions">{user ? <button className="text-button" onClick={() => void signOut()}>Cerrar sesión</button> : <button className="text-button" onClick={openLogin}>Iniciar sesión</button>}<Link className="btn-primary btn-small" to="/download" onClick={() => setOpen(false)}>Descargar</Link></div></div></nav></header>;
}
