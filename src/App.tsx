import './index.css';
import './pages.css';
import './hybrid.css';
import './tech.css';
import './contact.css';
import './marketing.css';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { Hero } from './components/sections/Hero';
import { IncidentNarrative } from './components/sections/IncidentNarrative';
import { SecurityNotes } from './components/sections/SecurityNotes';
import { InstallationSteps } from './components/sections/InstallationSteps';
import { CompatibilityRequirements } from './components/sections/CompatibilityRequirements';
import { PricingSection } from './components/sections/PricingSection';
import { Faq } from './components/sections/Faq';
import { WhatsAppContact } from './components/layout/WhatsAppContact';
import { DownloadPage } from './pages/DownloadPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPage } from './pages/AuthPage';
import { I18nProvider } from './i18n/I18nContext';

function SiteLayout({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  return <><Header /><main>{children}</main><Footer /></>;
}

function LandingPage(): React.ReactElement {
  return <SiteLayout>
    <Hero />
    <IncidentNarrative />
    <SecurityNotes />
    <InstallationSteps />
    <CompatibilityRequirements />
    <PricingSection />
    <Faq />
    <WhatsAppContact />
  </SiteLayout>;
}

export function App(): React.ReactElement {
  return <I18nProvider><AuthProvider><HashRouter><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/download" element={<SiteLayout><DownloadPage /></SiteLayout>} />
    <Route path="/pricing" element={<SiteLayout><PricingPage /></SiteLayout>} />
    <Route path="/contact" element={<SiteLayout><ContactPage /></SiteLayout>} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="*" element={<LandingPage />} />
  </Routes></HashRouter></AuthProvider></I18nProvider>;
}
