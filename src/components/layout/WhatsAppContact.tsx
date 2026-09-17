import { useI18n } from '../../i18n/I18nContext';

/** Floating WhatsApp entry point. Set VITE_WHATSAPP_NUMBER to activate it. */
export function WhatsAppContact(): React.ReactElement | null {
  const { t } = useI18n();
  const number = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)?.replace(/\D/g, '');
  if (!number) return null;
  const message = encodeURIComponent(t('contact.whatsappMessage'));
  return <a className="whatsapp-float" href={`https://wa.me/${number}?text=${message}`} target="_blank" rel="noopener noreferrer" aria-label={t('contact.whatsapp')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.5 4.1 1.6 5.9L.2 24l6.5-1.7a11.8 11.8 0 0 0 5.5 1.4h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.3-6.1-3.6-8.4ZM12.1 21.7c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.9 1 1-3.8-.2-.4a9.7 9.7 0 0 1-1.5-5.1c0-5.4 4.4-9.8 9.9-9.8 2.6 0 5.1 1 7 2.9a9.8 9.8 0 0 1 2.9 7c0 5.4-4.4 9.8-9.8 9.8Zm5.4-7.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.7.1-.2 0-.5-.1-.7l-.9-2c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.6.1-.9.5-.3.3-1.2 1.1-1.2 2.8 0 1.6 1.2 3.2 1.3 3.4.2.2 2.3 3.5 5.5 4.9 2 .9 2.8 1 3.8.8.6-.1 1.8-.7 2.1-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.5Z" fill="currentColor"/></svg><span>{t('contact.whatsapp')}</span></a>;
}
