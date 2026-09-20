import { useI18n } from '../../i18n/I18nContext';
import { Link } from 'react-router-dom';

export function PricingSection(): React.ReactElement {
  const { t } = useI18n();
  return (
    <section className="pricing-section section">
      <div className="section-container">
        <div className="pricing-intro">
          <p className="eyebrow">{t('pricing.eyebrow')}</p>
          <h2 className="section-title">{t('pricing.title')}</h2>
          <p className="section-subtitle">{t('pricing.body')}</p>
          <Link to="/contact" className="btn-primary">
            {t('pricing.access')}
          </Link>
        </div>
        <div className="pricing-preview-grid" aria-label={t('pricing.eyebrow')}>
          <article className="pricing-preview-card">
            <p className="pricing-card-label">{t('pricing.starter')}</p>
            <h3>{t('pricing.starterBody')}</h3>
            <p>{t('pricing.quote')}</p>
            <span>{t('pricing.access')}</span>
          </article>
          <article className="pricing-preview-card pricing-preview-card-featured">
            <p className="pricing-card-label">{t('pricing.enterprise')}</p>
            <h3>{t('pricing.enterpriseBody')}</h3>
            <p>{t('pricing.quote')}</p>
            <span>{t('pricing.sales')}</span>
          </article>
        </div>
      </div>
    </section>
  );
}
