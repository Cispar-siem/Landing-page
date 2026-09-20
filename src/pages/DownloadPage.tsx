import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { detectPlatform, loadReleaseCatalog, releaseCatalog, type Release, type OperatingSystem } from '../lib/releases';
import { useI18n } from '../i18n/I18nContext';

const osLabels = { macos: 'macOS', windows: 'Windows', linux: 'Linux' } as const;
export function DownloadPage(): React.ReactElement {
  const { t } = useI18n();
  const [platform] = useState(detectPlatform);
  const [selected, setSelected] = useState<OperatingSystem | 'all'>(platform?.os ?? 'all');
  const [releases, setReleases] = useState<readonly Release[]>(releaseCatalog);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const catalog = await loadReleaseCatalog();
      setReleases(catalog);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  if (loading) {
    return (
      <section className="page"><div className="section-container">
        <div className="page-heading"><p className="eyebrow">{t('download.eyebrow')}</p><h1>{t('download.title')}</h1><p>{t('download.loading')}</p></div>
      </div></section>
    );
  }

  if (loadError) {
    return (
      <section className="page"><div className="section-container">
        <div className="page-heading"><p className="eyebrow">{t('download.eyebrow')}</p><h1>{t('download.title')}</h1><p>{t('download.error')}</p>
          <button className="btn-secondary" onClick={fetchCatalog}>{t('download.retry')}</button>
        </div>
      </div></section>
    );
  }

  return (
    <section className="page"><div className="section-container">
      <div className="page-heading"><p className="eyebrow">{t('download.eyebrow')}</p><h1>{t('download.title')}</h1><p>{t(platform ? 'download.detected' : 'download.body')}{platform && ` ${osLabels[platform.os]}.`}</p><p>{t('download.archHelp')}</p></div>
      <div className="platform-tabs" role="group" aria-label={t('download.platform')}>
        {(['all','macos','windows','linux'] as const).map((os) => <button key={os} type="button" aria-pressed={selected === os} className={selected === os ? 'btn-primary' : 'btn-secondary'} onClick={() => setSelected(os)}>{os === 'all' ? t('download.all') : osLabels[os]}</button>)}
      </div>
      <div className="download-grid">{releases.filter((release) => selected === 'all' || release.os === selected).map((release) => {
        const recommended = platform?.os === release.os && platform.arch === release.arch;
        const available = release.available && Boolean(release.url);
        return <article className={`release-card ${recommended ? 'recommended' : ''}`} key={release.id}>
          {recommended && <p className="recommendation">{t('download.recommended')}</p>}
          <p className="release-os">{osLabels[release.os]}</p><h2>{release.label.replace(`${osLabels[release.os]} · `, '')}</h2>
          <p>{release.requirements}</p>
          <div className="release-meta"><span>{release.version ?? t('download.pending')}</span><span>{release.sha256 ? 'SHA-256' : t('download.checksum')}</span></div>
          {available ? <a className="btn-primary" href={release.url}>{t('download.install')}</a> : <button className="btn-disabled" disabled>{t('download.button')}</button>}
          {release.sha256 && <code className="checksum">{release.sha256}</code>}
        </article>;
      })}</div>
      <div className="download-help"><div><p className="eyebrow">{t('download.after')}</p><h2>{t('download.afterTitle')}</h2><ol><li>{t('download.step1')}</li><li>{t('download.step2')}</li><li>{t('download.step3')}</li></ol></div><div className="help-actions"><p>{t('download.help')}</p><Link className="btn-secondary" to="/contact">{t('download.contact')}</Link></div></div>
    </div></section>
  );
}
