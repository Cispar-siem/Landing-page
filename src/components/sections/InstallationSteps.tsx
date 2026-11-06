import { useI18n } from '../../i18n/I18nContext';

const INSTALL_STEPS = [
  { id: 'step1', key: 'installation.step1' },
  { id: 'step2', key: 'installation.step2' },
  { id: 'step3', key: 'installation.step3' },
] as const;

export function InstallationSteps(): React.ReactElement {
  const { t } = useI18n();

  return (
    <section className="installation-steps section" aria-labelledby="install-title">
      <div className="section-container">
        <header className="section-header" data-reveal>
          <h2 id="install-title" className="section-title">{t('installation.title')}</h2>
          <p className="section-subtitle">{t('installation.body')}</p>
        </header>
        <ol className="install-steps" data-reveal>
          {INSTALL_STEPS.map((step) => (
            <li key={step.id} className="install-step">
              <span className="install-step-number" aria-hidden="true" />
              <p>{t(step.key)}</p>
            </li>
          ))}
        </ol>
        <p className="installation-note">{t('installation.note')}</p>
      </div>
    </section>
  );
}
