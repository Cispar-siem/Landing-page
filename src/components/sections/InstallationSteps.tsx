import { useI18n } from '../../i18n/I18nContext';

export function InstallationSteps(): React.ReactElement {
  const { t } = useI18n();
  return (
    <section className="installation-steps section">
      <div className="section-container">
        <h2 className="section-title">{t('installation.title')}</h2>
        <p className="section-subtitle">{t('installation.body')}</p>
        <ol className="steps-list">
          <li>{t('installation.step1')}</li>
          <li>{t('installation.step2')}</li>
          <li>{t('installation.step3')}</li>
        </ol>
        <p className="installation-note">{t('installation.note')}</p>
      </div>
    </section>
  );
}
