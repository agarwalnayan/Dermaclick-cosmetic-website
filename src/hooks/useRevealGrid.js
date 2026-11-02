import { useEffect, useRef } from 'react';
import { revealOnce } from './useReveal';

// Same fail-safe reveal for a grid of .pcard items. Stagger is a CSS variable (--i) capped in CSS, so it
// only affects the entrance and never delays hover.
export function useRevealGrid() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.querySelectorAll('.pcard').forEach((card, i) => card.style.setProperty('--i', i));
    return revealOnce(el, 'in');
  }, []);
  return ref;
}