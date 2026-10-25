import { useEffect, useRef } from 'react';
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      el.classList.add('in');
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); } }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
