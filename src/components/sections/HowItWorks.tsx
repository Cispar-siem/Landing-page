import { useI18n } from '../../i18n/I18nContext';

const STEPS = [
  {
    id: 'enroll',
    number: '01',
    titleKey: 'howitworks.step1.title',
    bodyKey: 'howitworks.step1.body',
  },
  {
    id: 'ingest',
    number: '02',
    titleKey: 'howitworks.step2.title',
    bodyKey: 'howitworks.step2.body',
  },
  {
    id: 'detect',
    number: '03',
    titleKey: 'howitworks.step3.title',
    bodyKey: 'howitworks.step3.body',
  },
  {
    id: 'investigate',
    number: '04',
    titleKey: 'howitworks.step4.title',
    bodyKey: 'howitworks.step4.body',
  },
  {
    id: 'respond',
    number: '05',
    titleKey: 'howitworks.step5.title',
    bodyKey: 'howitworks.step5.body',
  },
] as const;

export function HowItWorks(): React.ReactElement {
  const { t } = useI18n();

  return (
    <section className="how-it-works section" aria-labelledby="howitworks-title">
      <div className="section-container">
        <header className="section-header" data-reveal>
          <p className="eyebrow">{t('howitworks.eyebrow')}</p>
          <h2 id="howitworks-title" className="section-title">{t('howitworks.title')}</h2>
          <p className="section-subtitle">{t('howitworks.body')}</p>
        </header>
        <ol className="steps-timeline" data-reveal>
          {STEPS.map((step) => (
            <li key={step.id} className="step-item">
              <div className="step-marker">
                <span className="step-number">{step.number}</span>
                <span className="step-line" aria-hidden="true" />
              </div>
              <div className="step-content">
                <h3>{t(step.titleKey)}</h3>
                <p>{t(step.bodyKey)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
