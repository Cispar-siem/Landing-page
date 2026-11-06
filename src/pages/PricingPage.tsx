import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';

export function PricingPage(): React.ReactElement {
  const { t } = useI18n();

  return (
    <section className="page">
      <div className="section-container">
        <div className="page-heading">
          <p className="eyebrow">{t('pricing.eyebrow')}</p>
          <h1>{t('pricing.title')}</h1>
          <p>{t('pricing.body')}</p>
        </div>
        <div className="pricing-pilot-note">
          <p>{t('pricing.note')}</p>
          <Link className="btn-primary" to="/contact">{t('pricing.access')}</Link>
        </div>
      </div>
    </section>
  );
}
