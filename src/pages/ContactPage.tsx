import { useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';

type RequestType = 'contact.install' | 'contact.pilot' | 'contact.quote';

export function ContactPage(): React.ReactElement {
  const { t } = useI18n();
  const [search] = useSearchParams();
  const { state } = useLocation();
  const assessment = state?.assessment;
  const value = (key: string): string => typeof assessment?.[key] === 'string' ? assessment[key].slice(0, 300) : '';
  const publicReport = typeof assessment?.report === 'string' ? assessment.report.slice(0, 16000) : '';
  const assessmentMessage = value('domain') ? t('quickScan.contact.message').replace('{domain}', value('domain')) : '';
  const platform = search.get('platform');
  const installationMessage = platform === 'windows' || platform === 'linux'
    ? t('contact.installAvailability').replace('{platform}', platform === 'windows' ? 'Windows 11' : 'Ubuntu Server LTS')
    : '';
  const [emailPrepared, setEmailPrepared] = useState(false);
  const [type, setType] = useState<RequestType>(platform ? 'contact.install' : 'contact.pilot');

  function submit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const requestType = t(type);
    const subject = encodeURIComponent(`CISPAR Security — ${requestType}: ${data.get('company') || data.get('name')}`);
    const body = encodeURIComponent(
      `${t('contact.name')}: ${data.get('name')}\n${t('contact.company')}: ${data.get('company') || '—'}\n${t('contact.email')}: ${data.get('email')}\n${t('contact.phone')}: ${data.get('phone') || '—'}\n${t('contact.type')}: ${requestType}\n${t('contact.environment')}: ${data.get('environment')}\n\n${t('contact.message')}:\n${data.get('message')}`,
    );
    window.location.href = `mailto:sales@cispar.io?subject=${subject}&body=${body}`;
    setEmailPrepared(true);
  }

  return (
    <section className="page">
      <div className="section-container contact-layout">
        <div className="page-heading">
          <p className="eyebrow">{t('contact.eyebrow')}</p>
          <h1>{t('contact.title')}</h1>
          <p>{t('contact.body')}</p>
          <div className="contact-note"><b>{t('contact.tipTitle')}</b><span>{t('contact.tip')}</span></div>
        </div>
        <form className="contact-form" onSubmit={submit}>
          <label>{t('contact.type')}<select value={type} onChange={(event) => setType(event.target.value as RequestType)}>
            <option value="contact.install">{t('contact.install')}</option>
            <option value="contact.pilot">{t('contact.pilot')}</option>
            <option value="contact.quote">{t('contact.quote')}</option>
          </select></label>
          <label>{t('contact.name')}<input name="name" defaultValue={value('name')} required autoComplete="name" /></label>
          <label>{t('contact.company')}<input name="company" defaultValue={value('company')} autoComplete="organization" /></label>
          <label>{t('contact.email')}<input name="email" type="email" defaultValue={value('email')} required autoComplete="email" /></label>
          <label>{t('contact.phoneOptional')}<input name="phone" type="tel" defaultValue={value('phone')} autoComplete="tel" maxLength={40} /></label>
          <label>{t('contact.environment')}<input name="environment" autoComplete="organization-title" /></label>
          <label>{t('contact.message')}<textarea name="message" required rows={5} defaultValue={publicReport ? `${assessmentMessage}\n\n${publicReport}` : assessmentMessage || installationMessage} placeholder={t('contact.placeholder')} /></label>
          <button className="btn-primary" type="submit">{t('contact.send')}</button>
          {emailPrepared && <div className="form-success" role="status"><p>{t('contact.sent')}</p><a href="mailto:sales@cispar.io">sales@cispar.io</a></div>}
        </form>
      </div>
    </section>
  );
}
