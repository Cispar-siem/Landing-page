/**
 * Shared type definitions for the CISPAR landing page.
 */

/** Navigation link item */
export interface NavLink {
  readonly label: string;
  readonly href: string;
}

/** SOC tier label */
export type SocTier = 'L1' | 'L2' | 'L3';

/** Feature card data */
export interface Feature {
  readonly id: string;
  readonly tier: SocTier;
  readonly title: string;
  readonly description: string;
  readonly bullets: readonly string[];
  readonly icon: 'detect' | 'respond' | 'hunt' | 'network' | 'report' | 'learn' | 'redteam';
}

/** How it works step */
export interface WorkStep {
  readonly tier: SocTier;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly actions: readonly string[];
}

/** Stat counter item */
export interface Stat {
  readonly id: string;
  readonly numericEnd: number;
  readonly prefix: string;
  readonly suffix: string;
  readonly label: string;
  readonly sublabel: string;
}

/** Testimonial card */
export interface Testimonial {
  readonly id: string;
  readonly quote: string;
  readonly name: string;
  readonly role: string;
  readonly company: string;
}

/** Trust badge */
export interface TrustBadge {
  readonly id: string;
  readonly label: string;
}

/** Terminal log line */
export interface TerminalLine {
  readonly id: string;
  readonly type: 'info' | 'warn' | 'danger' | 'success' | 'command' | 'dim';
  readonly text: string;
  readonly delay: number;
}
