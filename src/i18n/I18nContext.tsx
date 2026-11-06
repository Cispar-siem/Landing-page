import { createContext, useContext, useEffect, useState } from 'react';
import { landingEs, landingEn, type LandingKey } from './landing';

export type Locale = 'es' | 'en';
type I18nValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: string) => string; };

const I18nContext = createContext<I18nValue>({ locale: 'es', setLocale: () => undefined, t: (key) => key });

export function I18nProvider({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  const [locale, setLocaleState] = useState<Locale>(() => localStorage.getItem('cispar-locale') === 'en' ? 'en' : 'es');
  const setLocale = (next: Locale): void => { localStorage.setItem('cispar-locale', next); setLocaleState(next); };
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const landing = locale === 'es' ? landingEs : landingEn;
  return <I18nContext.Provider value={{ locale, setLocale, t: (key) => landing[key as LandingKey] ?? key }}>{children}</I18nContext.Provider>;
}
export function useI18n(): I18nValue { return useContext(I18nContext); }