import './index.css';
import './pages.css';
import './hybrid.css';
import './tech.css';
import './contact.css';
import './marketing.css';
import './brand.css';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { DomainCheck } from './components/sections/DomainCheck';
import { Hero } from './components/sections/Hero';
import { IncidentNarrative } from './components/sections/IncidentNarrative';
import { WhyCispar } from './components/sections/WhyCispar';
import { ScrollEffects } from './components/ui/ScrollEffects';
import { PricingSection } from './components/sections/PricingSection';
import { Faq } from './components/sections/Faq';
import { WhatsAppContact } from './components/layout/WhatsAppContact';
import { DownloadPage } from './pages/DownloadPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPage } from './pages/AuthPage';
import { I18nProvider } from './i18n/I18nContext';

function SiteLayout({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  return <><ScrollEffects /><Header /><main>{children}</main><Footer /></>;
}

function LandingPage(): React.ReactElement {
  return (
    <SiteLayout>
      <Hero />
      <DomainCheck />
      <IncidentNarrative />
      <WhyCispar />
      <PricingSection />
      <Faq />
      <WhatsAppContact />
    </SiteLayout>
  );
}

export function App(): React.ReactElement {
  return (
    <I18nProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/download" element={<SiteLayout><DownloadPage /></SiteLayout>} />
            <Route path="/pricing" element={<SiteLayout><PricingPage /></SiteLayout>} />
            <Route path="/contact" element={<SiteLayout><ContactPage /></SiteLayout>} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </I18nProvider>
  );
}
