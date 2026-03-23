import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { TrustSignals } from './components/sections/TrustSignals';
import { HowItWorks } from './components/sections/HowItWorks';
import { Features } from './components/sections/Features';
import { Terminal } from './components/sections/Terminal';
import { Stats } from './components/sections/Stats';
import { SocInYourPocket } from './components/sections/SocInYourPocket';
import { CallToAction } from './components/sections/CallToAction';

/**
 * Root application component. Composes all landing page sections
 * in order: header → hero → trust signals → how it works → features
 * → terminal demo → stats → CTA → footer.
 */
export function App(): React.ReactElement {
  return (
    <>
      <Header />
      <main>
        <Hero />
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
