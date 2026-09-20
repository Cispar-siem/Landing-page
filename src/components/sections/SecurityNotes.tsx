import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';

const notes = [
  ['securityNotes.one.title', 'securityNotes.one.body'],
  ['securityNotes.two.title', 'securityNotes.two.body'],
  ['securityNotes.three.title', 'securityNotes.three.body'],
] as const;

export function SecurityNotes(): React.ReactElement {
  const { t } = useI18n();

  return (
    <section className="security-notes section">
      <div className="section-container">
        <div className="security-notes-heading">
          <div>
            <p className="eyebrow">{t('securityNotes.eyebrow')}</p>
            <h2 className="section-title">{t('securityNotes.title')}</h2>
          </div>
          <p className="section-subtitle">{t('securityNotes.body')}</p>
        </div>
        <div className="security-notes-grid">
          {notes.map(([title, body], index) => (
            <article className="security-note-card" key={title}>
              <span className="security-note-index">0{index + 1}</span>
              <h3>{t(title)}</h3>
              <p>{t(body)}</p>
            </article>
          ))}
        </div>
        <div className="security-notes-footer">
          <p>{t('securityNotes.footer')}</p>
          <Link to="/contact" className="text-button">{t('securityNotes.cta')}</Link>
        </div>
      </div>
    </section>
  );
}
