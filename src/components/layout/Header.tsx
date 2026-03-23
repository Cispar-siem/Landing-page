import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NavLink } from '../../types';

const NAV_LINKS: readonly NavLink[] = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Live Demo', href: '#terminal' },
  { label: 'Contact', href: '#contact' },
] as const;

/** Shield SVG icon used in the CISPAR logo. */
function ShieldIcon(): React.ReactElement {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shieldGradHeader" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d="M16 2L4 7v9c0 7.18 5.14 13.9 12 15.5C22.86 29.9 28 23.18 28 16V7L16 2z"
        fill="url(#shieldGradHeader)"
      />
      <path
        d="M13 16.5l2.5 2.5 5-5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Hamburger / close toggle button for mobile nav. */
function MenuToggle({
  isOpen,
  onClick,
}: {
  readonly isOpen: boolean;
  readonly onClick: () => void;
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        {isOpen ? (
          <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </>
        ) : (
          <>
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </>
        )}
      </svg>
    </button>
  );
}

/**
 * Sticky site header with logo, navigation links, CTA button,
 * and mobile hamburger menu with animated slide-down drawer.
 */
export function Header(): React.ReactElement {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = (): void => setIsMobileOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <nav className="section-container" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a
            href="#"
            className="flex items-center gap-2.5 group"
            aria-label="CISPAR — Home"
          >
            <ShieldIcon />
            <span className="text-xl font-bold tracking-tight text-text-primary">
              CISPAR
            </span>
          </a>

          <ul className="hidden md:flex items-center gap-1" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="btn-primary text-sm hidden sm:inline-flex"
            >
              Request Early Access
            </a>
            <MenuToggle
              isOpen={isMobileOpen}
              onClick={() => setIsMobileOpen((prev) => !prev)}
            />
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-surface/95 backdrop-blur-md border-b border-white/5"
          >
            <div className="section-container py-4 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={closeMobileMenu}
                className="btn-primary mt-2 text-sm justify-center"
              >
                Request Early Access
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
