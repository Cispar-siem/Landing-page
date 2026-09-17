import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { detectPlatform, loadReleaseCatalog, type Release } from '../../lib/releases';
import { useI18n } from '../../i18n/I18nContext';

const osNames = { macos: 'macOS', windows: 'Windows', linux: 'Linux' } as const;
/** Direct artifact link only when a published release matches a known CPU. */
export function DownloadButton({ className = 'btn-primary' }: { className?: string }): React.ReactElement {
  const { t } = useI18n();
  const [platform] = useState(detectPlatform);
  const [release, setRelease] = useState<Release>();
  useEffect(() => {
    let active = true;
    void loadReleaseCatalog().then((catalog) => {
      const match = catalog.find((item) => item.os === platform?.os && item.arch === platform?.arch && item.available && item.url);
      if (active) setRelease(match);
    });
    return () => { active = false; };
  }, [platform]);
  const label = platform ? `${t('download.for')} ${osNames[platform.os]}` : t('nav.downloadCta');
  const content = <><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/></svg>{label}</>;
  return release?.url ? <a className={className} href={release.url}>{content}</a> : <Link className={className} to="/download">{content}</Link>;
}
