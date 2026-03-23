import { useEffect, useState } from 'react';

/**
 * Returns a progressively revealed string for a typewriter effect.
 * Starts automatically when `trigger` becomes true.
 *
 * @param text - Full string to reveal
 * @param speed - Ms per character (default 40)
 * @param trigger - Start typing when this turns true
 */
export function useTypewriter(
  text: string,
  speed: number = 40,
  trigger: boolean = true
): string {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!trigger) return;
    setDisplayed('');
    let index = 0;

    const tick = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) clearInterval(tick);
    }, speed);

    return () => clearInterval(tick);
  }, [text, speed, trigger]);

  return displayed;
}
