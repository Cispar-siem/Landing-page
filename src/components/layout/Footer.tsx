/** Shield SVG for footer logo. */
function ShieldIcon(): React.ReactElement {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shieldGradFooter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d="M16 2L4 7v9c0 7.18 5.14 13.9 12 15.5C22.86 29.9 28 23.18 28 16V7L16 2z"
        fill="url(#shieldGradFooter)"
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

const LINKS = {
  Product: [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Live Demo', href: '#terminal' },
    { label: 'Request Access', href: '#contact' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#contact' },
  ],
  Resources: [
    { label: 'MITRE ATT&CK', href: 'https://attack.mitre.org', external: true },
    { label: 'NIST CSF', href: 'https://www.nist.gov/cyberframework', external: true },
    { label: 'Documentation', href: '#' },
    { label: 'Security Blog', href: '#' },
  ],
} as const;

/**
 * Site footer with logo, link columns, and copyright.
 */
export function Footer(): React.ReactElement {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t pt-16 pb-8"
      style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(6,6,9,0.8)' }}
      aria-label="Site footer"
    >
      <div className="section-container">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="#" className="flex items-center gap-2.5 mb-4" aria-label="CISPAR — Home">
              <ShieldIcon />
              <span className="text-lg font-bold text-text-primary">CISPAR</span>
            </a>
            <p className="text-sm text-text-secondary leading-relaxed">
              Autonomous SOC AI agent. Detects, investigates, and contains threats — L1, L2, and L3. 24/7.
            </p>
          </div>

          {/* Link columns */}
          {(Object.entries(LINKS) as [keyof typeof LINKS, (typeof LINKS)[keyof typeof LINKS]][]).map(
            ([section, items]) => (
              <div key={section}>
                <h3 className="text-xs font-semibold tracking-widest uppercase text-text-secondary mb-4">
                  {section}
                </h3>
                <ul className="space-y-3" role="list">
                  {items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                        {...('external' in item && item.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>

        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t text-xs text-text-secondary"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <p>© {currentYear} CISPAR. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse-slow"
              aria-hidden="true"
            />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
