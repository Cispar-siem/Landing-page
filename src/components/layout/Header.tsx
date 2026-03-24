import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NavLink } from '../../types';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS: readonly NavLink[] = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Live Demo', href: '#terminal' },
  { label: 'Contact', href: '#contact' },
] as const;

import miPropiaImagen from '../assets/logo.png';

function ShieldIcon(): React.ReactElement {
  return (
    <img 
      src={miPropiaImagen} 
      alt="Icono de escudo" 
      width={32} 
      height={32} 
      style={{ objectFit: 'contain' }} 
    />
  );
}

function MenuToggle({ isOpen, onClick }: { readonly isOpen: boolean; readonly onClick: () => void }): React.ReactElement {
  return (
    <button onClick={onClick} aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen}
      className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        {isOpen ? (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>) : (<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>)}
      </svg>
    </button>
  );
}

/** Avatar initials button shown when user is logged in. */
function UserMenu(): React.ReactElement {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const initials = (user?.email ?? '?').slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        aria-expanded={open}
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
      >
        {initials}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-56 rounded-xl py-2 z-50"
            style={{ background: 'rgba(17,17,24,0.98)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}
          >
            <div className="px-4 py-2 border-b border-white/5">
              <p className="text-xs font-medium text-text-primary truncate">{user?.email}</p>
            </div>
            <button
              onClick={async () => { setOpen(false); await signOut(); }}
              className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Sticky site header. Shows login button for unauthenticated users
 * and a user avatar dropdown for authenticated users.
 */
export function Header(): React.ReactElement {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, openLogin } = useAuth();

  useEffect(() => {
    const handleScroll = (): void => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = (): void => setIsMobileOpen(false);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/90 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/30' : 'bg-transparent'}`}>
      <nav className="section-container" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#" className="flex items-center gap-2.5 group" aria-label="CISPAR — Home">
            <ShieldIcon />
            <span className="text-xl font-bold tracking-tight text-text-primary">CISPAR</span>
          </a>

          <ul className="hidden md:flex items-center gap-1" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            {user ? (
              <UserMenu />
            ) : (
              <>
                <button onClick={openLogin} className="btn-ghost text-sm hidden sm:inline-flex">
                  Login
                </button>
                <a href="#contact" className="btn-primary text-sm hidden sm:inline-flex">
                  Request Early Access
                </a>
              </>
            )}
            <MenuToggle isOpen={isMobileOpen} onClick={() => setIsMobileOpen((prev) => !prev)} />
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-surface/95 backdrop-blur-md border-b border-white/5"
          >
            <div className="section-container py-4 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={closeMobileMenu}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all">
                  {link.label}
                </a>
              ))}
              {!user && (
                <>
                  <button onClick={() => { closeMobileMenu(); openLogin(); }} className="btn-ghost mt-2 text-sm justify-center">
                    Login
                  </button>
                  <a href="#contact" onClick={closeMobileMenu} className="btn-primary mt-2 text-sm justify-center">
                    Request Early Access
                  </a>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
