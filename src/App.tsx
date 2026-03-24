import { HashRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { TrustSignals } from './components/sections/TrustSignals';
import { HowItWorks } from './components/sections/HowItWorks';
import { Features } from './components/sections/Features';
import { Terminal } from './components/sections/Terminal';
import { Stats } from './components/sections/Stats';
import { BreachCosts } from './components/sections/BreachCosts';
import { SocInYourPocket } from './components/sections/SocInYourPocket';
import { CallToAction } from './components/sections/CallToAction';
import { AuthPage } from './pages/AuthPage';

/**
 * Full landing page layout composed of all marketing sections.
 */
function LandingLayout(): React.ReactElement {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <BreachCosts />
        <TrustSignals />
        <SocInYourPocket />
        <HowItWorks />
        <Features />
        <Terminal />
        <Stats />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}

/**
 * Root application component. Uses HashRouter for GitHub Pages compatibility.
 * Routes: `/` → landing page, `/auth` → device authorization / login.
 */
export function App(): React.ReactElement {
  return (
    <HashRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<LandingLayout />} />
      </Routes>
    </HashRouter>
  );
}
