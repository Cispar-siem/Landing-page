import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { DownloadButton } from '../layout/DownloadButton';

export function Hero(): React.ReactElement {
  const { t } = useI18n();
  return <section className="hero" aria-labelledby="hero-title">
    <div className="section-container hero-layout">
      <div className="hero-copy">
        <p className="eyebrow">{t('hero.eyebrow')}</p>
        <h1 id="hero-title">{t('hero.title')}</h1>
        <p className="hero-lede">{t('hero.body')}</p>
        <div className="hero-actions">
          <DownloadButton />
          <Link to="/contact" className="btn-secondary">{t('hero.sales')}</Link>
        </div>
        <p className="hero-note">{t('hero.note')}</p>
      </div>
      <div className="product-frame" role="img" aria-label={t('preview.caption')}>
        <div className="frame-top"><span>CISPAR / {t('preview.operation')}</span><span className="status-dot">{t('hero.system')}</span></div>
        <div className="frame-body">
          <aside><span className="active">{t('preview.summary')}</span><span>{t('preview.incidents')}</span><span>{t('hero.sources')}</span><span>{t('preview.actions')}</span></aside>
          <section>
            <p className="muted-label">{t('hero.posture')}</p>
            <strong>{t('hero.monitoring')}</strong>
            <div className="signal-grid">
              <div><span>{t('hero.sources')}</span><b>{t('hero.connected')}</b></div>
              <div><span>{t('hero.events')}</span><b>{t('hero.realtime')}</b></div>
              <div><span>{t('hero.response')}</span><b>{t('hero.playbook')}</b></div>
            </div>
            <div className="incident-preview">
              <span className="incident-label">{t('preview.review')}</span>
              <h3>{t('preview.incidentTitle')}</h3>
              <p>{t('preview.incidentBody')}</p>
            </div>
            <div className="event-row"><span className="event-dot" /><span>{t('hero.event')}</span><time>{t('hero.now')}</time></div>
          </section>
        </div>
        <div className="preview-caption">{t('preview.caption')}</div>
      </div>
    </div>
  </section>;
}
