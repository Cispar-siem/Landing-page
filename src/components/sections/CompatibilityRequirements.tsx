import { useI18n } from '../../i18n/I18nContext';
import { releaseCatalog } from '../../lib/releases';

export function CompatibilityRequirements(): React.ReactElement {
  const { t } = useI18n();

  // Group by OS to avoid duplicate entries (e.g., macOS arm64 and x64)
  const osRequirementMap = new Map<string, string>();
  releaseCatalog.forEach(release => {
    if (!osRequirementMap.has(release.os)) {
      osRequirementMap.set(release.os, release.requirements);
    }
  });

  return (
    <section className="compatibility-requirements section">
      <div className="section-container">
        <h2 className="section-title">{t('compatibility.title')}</h2>
        <p className="section-subtitle">{t('compatibility.body')}</p>
        <div className="requirements-grid">
          {Array.from(osRequirementMap.entries()).map(([os, req]) => {
            const osLabel = { macos: 'macOS', windows: 'Windows', linux: 'Linux' }[os];
            return (
              <article key={os} className="requirement-item">
                <h3>{osLabel}</h3>
                <p>{req}</p>
              </article>
            );
          })}
        </div>
        <p className="compatibility-note">{t('compatibility.note')}</p>
      </div>
    </section>
  );
}
