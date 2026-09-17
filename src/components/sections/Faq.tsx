import { useI18n } from '../../i18n/I18nContext';

const questions = ['faq.one', 'faq.two', 'faq.three', 'faq.four'] as const;
export function Faq(): React.ReactElement { const { t } = useI18n(); return <section className="faq-section"><div className="section-container faq-layout"><div><p className="eyebrow">FAQ</p><h2 className="section-title">{t('faq.title')}</h2><p className="section-subtitle">{t('faq.body')}</p></div><div className="faq-list">{questions.map((key, index) => <details key={key} open={index === 0}><summary>{t(`${key}.question`)}<span>+</span></summary><p>{t(`${key}.answer`)}</p></details>)}</div></div></section>; }
