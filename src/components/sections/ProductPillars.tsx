import { useI18n } from '../../i18n/I18nContext';

const PILLARS = [
  {
    id: 'agents',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M6 3v4" />
        <path d="M18 3v4" />
      </svg>
    ),
    titleKey: 'product.pillar1.title',
    bodyKey: 'product.pillar1.body',
  },
  {
    id: 'detection',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
        <path d="M12 6v6l-4 2" />
      </svg>
    ),
    titleKey: 'product.pillar2.title',
    bodyKey: 'product.pillar2.body',
  },
  {
    id: 'response',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4" />
        <path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.555 15.776 3 14.37 3 12a9 9 0 0 1 18 0z" />
      </svg>
    ),
    titleKey: 'product.pillar3.title',
    bodyKey: 'product.pillar3.body',
  },
] as const;

export function ProductPillars(): React.ReactElement {
  const { t } = useI18n();

  return (
    <section className="product-pillars section" aria-labelledby="product-title">
      <div className="section-container">
        <header className="section-header" data-reveal>
          <p className="eyebrow">{t('product.eyebrow')}</p>
          <h2 id="product-title" className="section-title">{t('product.title')}</h2>
          <p className="section-subtitle">{t('product.body')}</p>
        </header>
        <div className="pillars-grid" data-reveal>
          {PILLARS.map((pillar) => (
            <article key={pillar.id} className="pillar-card">
              <div className="pillar-icon">{pillar.icon}</div>
              <h3>{t(pillar.titleKey)}</h3>
              <p>{t(pillar.bodyKey)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
