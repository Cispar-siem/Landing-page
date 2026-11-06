import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';

const CASES = ['account', 'device', 'vulnerability'] as const;
type CaseId = (typeof CASES)[number];

export function IncidentNarrative(): React.ReactElement {
  const { t } = useI18n();
  const [selectedCase, setSelectedCase] = useState<CaseId>('account');

  return (
    <section id="workflow" className="incident-narrative section" aria-labelledby="incident-title">
      <div className="section-container">
        <header className="section-header" data-reveal>
          <h2 id="incident-title" className="section-title">{t('incident.title')}</h2>
          <p className="section-subtitle">{t('incident.body')}</p>
        </header>

        <div className="case-demo" data-ui data-reveal>
          <div className="case-demo-select" role="group" aria-label={t('incident.chooseCase')}>
            {CASES.map((caseId) => (
              <button
                key={caseId}
                type="button"
                className="case-demo-option"
                aria-pressed={selectedCase === caseId}
                onClick={() => setSelectedCase(caseId)}
              >
                {t(`incident.case.${caseId}.label`)}
              </button>
            ))}
          </div>

          <article className="case-demo-panel" key={selectedCase} aria-live="polite">
            <div className="case-demo-heading">
              <div>
                <p className="case-demo-kind">{t('incident.exampleLabel')}</p>
                <h3>{t(`incident.case.${selectedCase}.title`)}</h3>
              </div>
              <span className="case-demo-example">{t('incident.sample')}</span>
            </div>
            <div className="case-demo-details">
              <section className="case-demo-detail case-demo-observed">
                <h4>{t('incident.observed')}</h4>
                <p>{t(`incident.case.${selectedCase}.observed`)}</p>
              </section>
              <section className="case-demo-detail case-demo-impact">
                <h4>{t('incident.impact')}</h4>
                <p>{t(`incident.case.${selectedCase}.impact`)}</p>
              </section>
              <section className="case-demo-detail case-demo-next">
                <h4>{t('incident.nextStep')}</h4>
                <p>{t(`incident.case.${selectedCase}.next`)}</p>
              </section>
            </div>
            <p className="case-demo-caveat">{t('incident.caveat')}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
