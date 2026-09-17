import { HashRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { Hero } from './components/sections/Hero';
import { ProductOverview } from './components/sections/ProductOverview';
import { TechnologyShowcase } from './components/sections/TechnologyShowcase';
import { I18nProvider } from './i18n/I18nContext';
import { DownloadPage } from './pages/DownloadPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPage } from './pages/AuthPage';

function SiteLayout({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  return <><Header /><main>{children}</main><Footer /><AuthModal /></>;
}

function LandingPage(): React.ReactElement {
  return <SiteLayout><Hero /><TechnologyShowcase /><ProductOverview /></SiteLayout>;
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
