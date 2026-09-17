import { useI18n } from '../../i18n/I18nContext';
export function TechnologyShowcase(): React.ReactElement {
  const { t } = useI18n();
  const cards = [['tech.detect','tech.detectBody'],['tech.investigate','tech.investigateBody'],['tech.respond','tech.respondBody']] as const;
  return <section className="tech-section"><div className="section-container">
    <div className="tech-heading"><p className="eyebrow">{t('tech.eyebrow')}</p><h2 className="section-title">{t('tech.title')}</h2><p className="section-subtitle">{t('tech.body')}</p></div>
    <div className="tech-grid"><div className="tech-cards">{cards.map(([title, body], index) => <article className="tech-card" key={title}><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{index === 0 ? <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></> : index === 1 ? <><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M8 10h4M10 8v4"/></> : <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>}</svg></span><h3>{t(title)}</h3><p>{t(body)}</p></article>)}</div></div>
  </div></section>;
}
