import { useEffect, useRef } from 'react';

// Progressive-enhancement reveal.
// Content is visible by default. CSS only hides it under `html.reveal-ready`, which an inline script in
// index.html sets (and only when the visitor has not asked for reduced motion). This module then adds the
// "shown" class. If anything goes wrong the element is shown rather than left hidden:
//   - no IntersectionObserver / reduced motion / constructor throws  -> shown immediately
//   - the observer never reports back (it always sends an initial callback when working) -> shown
//   - a scroll/resize/hashchange geometry check catches anything the observer missed
//   - no scroll/touch/key input within IDLE_REVEAL_MS of load (a screenshot tool, link preview, crawler or
//     someone reading the hero) -> everything is shown, so scroll animation can never withhold content
//   - printing shows everything
const OBSERVER_SILENCE_MS = 2000;
const IDLE_REVEAL_MS = 3000;

const pending = new Set();
let idleArmed = false;
const revealAll = () => [...pending].forEach((finish) => finish());
function armIdleFailsafe() {
  if (idleArmed || typeof window === 'undefined') return;
  idleArmed = true;
  const events = ['scroll', 'wheel', 'touchstart', 'keydown'];
  let timer;
  const stop = () => { clearTimeout(timer); events.forEach((e) => window.removeEventListener(e, stop)); };
  const start = () => { timer = setTimeout(() => { stop(); revealAll(); }, IDLE_REVEAL_MS); };
  events.forEach((e) => window.addEventListener(e, stop, { passive: true, once: true }));
  window.addEventListener('beforeprint', revealAll);
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
}

export function revealOnce(el, shownClass = 'in', { threshold = 0.05, rootMargin = '0px 0px -50px 0px' } = {}) {
  if (!el) return () => {};
  const show = () => el.classList.add(shownClass);
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (typeof window === 'undefined' || reduced || !('IntersectionObserver' in window)) { show(); return () => {}; }

  let done = false;
  let heardFromObserver = false;
  let io;
  let timer;
  let raf = 0;
  const cleanup = () => {
    pending.delete(finish);
    io?.disconnect();
    clearTimeout(timer);
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    window.removeEventListener('hashchange', schedule);
  };
  const finish = () => { if (done) return; done = true; show(); cleanup(); };
  const geometryCheck = () => {
    raf = 0;
    if (done) return;
    const r = el.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) finish();
  };
  function schedule() { if (!raf && !done) raf = requestAnimationFrame(geometryCheck); }

  try {
    io = new IntersectionObserver((entries) => {
      heardFromObserver = true;
      if (entries.some((e) => e.isIntersecting)) finish();
    }, { threshold, rootMargin });
    io.observe(el);
  } catch { finish(); return () => {}; }

  pending.add(finish);
  armIdleFailsafe();
  timer = setTimeout(() => { if (!heardFromObserver) finish(); }, OBSERVER_SILENCE_MS);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  schedule();
  return () => { done = true; cleanup(); };
}

export function useReveal() {
  const ref = useRef(null);
  useEffect(() => revealOnce(ref.current, 'in'), []);
  return ref;
}