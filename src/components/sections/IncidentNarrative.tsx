import { useI18n } from '../../i18n/I18nContext';

export function IncidentNarrative(): React.ReactElement {
  const { t } = useI18n();
  return (
    <section className="incident-narrative section">
      <div className="section-container">
        <p className="eyebrow">{t('incident.eyebrow')}</p>
        <h2 className="section-title">{t('incident.title')}</h2>
        <p className="section-subtitle">{t('incident.body')}</p>
        <div className="incident-grid">
          {/* Señal */}
          <article className="incident-item">
            <div className="incident-icon">
              <span>01</span>
            </div>
            <h3>{t('incident.signal')}</h3>
            <p>{t('incident.signalBody')}</p>
          </article>
          {/* Evidencia */}
          <article className="incident-item">
            <div className="incident-icon">
              <span>02</span>
            </div>
            <h3>{t('incident.evidence')}</h3>
            <p>{t('incident.evidenceBody')}</p>
          </article>
          {/* Acción */}
          <article className="incident-item">
            <div className="incident-icon">
              <span>03</span>
            </div>
            <h3>{t('incident.action')}</h3>
            <p>{t('incident.actionBody')}</p>
          </article>
        </div>
        <p className="incident-note">{t('incident.note')}</p>
      </div>
    </section>
  );
}
