import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTypewriter } from '../../hooks/useTypewriter';

const ROTATING_WORDS = ['Detects.', 'Investigates.', 'Contains.', 'Learns.'] as const;

/** Live threat counter that increments every few seconds. */
function ThreatCounter(): React.ReactElement {
  const [count, setCount] = useState(() => 1_284_329 + Math.floor(Math.random() * 500));

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border mt-8"
      style={{
        borderColor: 'rgba(239,68,68,0.2)',
        background: 'rgba(239,68,68,0.05)',
      }}
    >
      <span
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ background: '#ef4444' }}
        aria-hidden="true"
      />
      <span className="text-xs text-text-secondary">Threats neutralized today</span>
      <span
        className="font-mono font-bold text-sm tabular-nums"
        style={{ color: '#ef4444' }}
        aria-live="polite"
        aria-label={`${count.toLocaleString()} threats neutralized today`}
      >
        {count.toLocaleString()}
      </span>
    </motion.div>
  );
}

/** Rotating word animation in the hero headline. */
function RotatingWord(): React.ReactElement {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      key={index}
      className="gradient-text inline-block"
      style={{
        animation: 'fadeInUp 0.4s ease-out forwards',
      }}
    >
      {ROTATING_WORDS[index]}
    </span>
  );
}

/**
 * Lightweight background: static grid + GPU-accelerated orbs (no heavy blur on mobile).
 */
function HeroBackground(): React.ReactElement {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-grid opacity-50" />
      {/* Orbs use smaller blur on mobile via inline style + translate3d for GPU */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 rounded-full animate-float-1"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)',
          filter: 'blur(40px)',
          opacity: 0.3,
          transform: 'translate3d(0,0,0)',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-48 h-48 sm:w-80 sm:h-80 rounded-full animate-float-2"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
          filter: 'blur(40px)',
          opacity: 0.2,
          transform: 'translate3d(0,0,0)',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute bottom-1/3 right-1/3 w-40 h-40 sm:w-64 sm:h-64 rounded-full animate-float-3"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.35) 0%, transparent 70%)',
          filter: 'blur(40px)',
          opacity: 0.15,
          transform: 'translate3d(0,0,0)',
          willChange: 'transform',
        }}
      />
    </div>
  );
}

/**
 * Full-screen hero section with rotating headline, typewriter subtext,
 * live threat counter, and dual CTAs.
 */
export function Hero(): React.ReactElement {
  const subtext = useTypewriter(
    'The average breach goes undetected for 280 days. Your team gets one shot to catch it. CISPAR watches 24/7 — detects, investigates, and contains automatically. Zero code. Zero expertise.',
    22,
    true
  );

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
      aria-label="Hero"
    >
      <HeroBackground />

      <div className="section-container relative z-10 pt-28 pb-20 flex flex-col items-center">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8"
          style={{
            borderColor: 'rgba(16, 185, 129, 0.3)',
            background: 'rgba(16, 185, 129, 0.08)',
            color: '#10b981',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-safe animate-pulse-slow" aria-hidden="true" />
          Attackers work 24/7. Now so does your defense.
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-4"
        >
          Your Autonomous SOC.{' '}
          <br className="hidden sm:block" />
          <RotatingWord />
        </motion.h1>

        {/* Typewriter subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-base sm:text-lg text-text-secondary max-w-xl sm:max-w-2xl mb-10 leading-relaxed min-h-[72px] sm:min-h-[56px]"
          aria-label="The average breach goes undetected for 280 days. Your team gets one shot to catch it. CISPAR watches 24/7 — detects, investigates, and contains automatically. Zero code. Zero expertise."
        >
          {subtext}
          <span className="inline-block w-0.5 h-4 bg-blue-400 align-middle ml-0.5 animate-pulse" aria-hidden="true" />
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-sm sm:max-w-none"
        >
          <a href="#contact" className="btn-primary text-base px-8 py-4">
            Request Early Access
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a href="#terminal" className="btn-ghost text-base px-8 py-4">
            See It in Action
          </a>
        </motion.div>

        {/* Live threat counter */}
        <ThreatCounter />

        {/* Trust chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.4 }}
          className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-text-secondary mt-8"
        >
          {[
            'Zero Code Required',
            'No Expertise Needed',
            '<15 min Response',
            'Learns Automatically',
          ].map((text) => (
            <span
              key={text}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="w-1 h-1 rounded-full bg-blue-400" aria-hidden="true" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-30 select-none">
        <span className="text-xs text-text-secondary tracking-widest uppercase">Scroll</span>
        <svg className="animate-scroll-bounce" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  );
}
