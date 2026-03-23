import { useEffect, useRef, useState } from 'react';

interface Options {
  /** Margin around the root element. Default: '0px' */
  readonly rootMargin?: string;
  /** Visibility threshold. Default: 0.15 */
  readonly threshold?: number;
  /** Only trigger once. Default: true */
  readonly triggerOnce?: boolean;
}

/**
 * Observes an element's intersection with the viewport.
 * Returns a ref to attach to the target element and a boolean indicating visibility.
 *
 * @param options - IntersectionObserver configuration options
 * @returns Object with `ref` to attach and `isVisible` boolean state
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: Options = {}
): { ref: React.RefObject<T>; isVisible: boolean } {
  const { rootMargin = '0px', threshold = 0.15, triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold, triggerOnce]);

  return { ref, isVisible };
}
