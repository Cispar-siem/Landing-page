import { useI18n } from '../../i18n/I18nContext';
import './risk-evidence.css';

const SOURCE = 'https://www.verizon.com/business/resources/reports/dbir/';

export function WhyCispar(): React.ReactElement {
  const { t } = useI18n();
  return <section className="risk-evidence section" aria-labelledby="risk-evidence-title">
    <div className="section-container">
      <div className="risk-evidence-intro" data-reveal>
        <h2 id="risk-evidence-title" className="section-title">{t('risk.title')}</h2>
        <p>{t('risk.body')}</p>
      </div>
      <dl className="risk-evidence-figures" data-reveal>
        <div><dt>48%</dt><dd>{t('risk.stat1')}<p>{t('risk.stat1.body')}</p></dd></div>
        <div><dt>31%</dt><dd>{t('risk.stat2')}<p>{t('risk.stat2.body')}</p></dd></div>
      </dl>
      <p className="risk-evidence-source"><a href={SOURCE} target="_blank" rel="noreferrer">{t('risk.source')}</a><br />{t('risk.disclaimer')}</p>
      <button className="btn-primary" type="button" onClick={() => document.getElementById('assessment')?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})}>{t('risk.cta')}</button>
    </div>
  </section>;
}
