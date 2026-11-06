import { type ReactElement } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'inverse' | 'mono';
}

const sizeMap = { sm: 28, md: 36, lg: 44, xl: 56 } as const;

export function Logo({ className = '', size = 'md' }: LogoProps): ReactElement {
  const dimension = sizeMap[size];
  return (
    <img className={`cispar-mark ${className}`} src="/cispar-centinela.png" width={dimension} height={dimension} alt="" aria-hidden="true" />
  );
}

export function LogoWithWordmark({ className = '', size = 'md', variant = 'default' }: LogoProps): ReactElement {
  return <span className={`cispar-wordmark ${className}`}><Logo size={size} variant={variant} /><span>CISPAR</span></span>;
}
