import { useI18n } from '../../i18n/I18nContext';
import { Link } from 'react-router-dom';

export function PricingSection(): React.ReactElement {
  const { t } = useI18n();
  return (
    <section className="pricing-section section" aria-labelledby="pricing-title">
      <div className="section-container">
        <div className="pricing-intro" data-reveal>
          <h2 id="pricing-title" className="section-title">{t('pricing.title')}</h2>
          <p className="section-subtitle">{t('pricing.body')}</p>
          <Link to="/contact" className="btn-primary">
            {t('pricing.access')}
          </Link>
          <p className="pricing-note">{t('pricing.note')}</p>
        </div>
      </div>
    </section>
  );
}
