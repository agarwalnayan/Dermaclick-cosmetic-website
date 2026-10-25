import { useEffect, useRef } from 'react';
export function useRevealGrid() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      el.classList.add('in');
      const cards = el.querySelectorAll('.pcard');
      cards.forEach((card, i) => {
        card.style.transitionDelay = `${i * 50}ms`;
        card.style.opacity = '1';
        card.style.transform = 'none';
      });
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.classList.add('in');
        const cards = el.querySelectorAll('.pcard');
        cards.forEach((card, i) => {
          card.style.transitionDelay = `${i * 50}ms`;
        });
        io.disconnect();
      }
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
