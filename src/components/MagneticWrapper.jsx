import { useRef, useEffect, cloneElement } from 'react';
export default function MagneticWrapper({ children, className = '' }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleMouseMove = (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      const strength = 0.2;
      wrapper.style.transform = `translate(${x * strength * 20}px, ${y * strength * 20}px)`;
    };

    const handleMouseLeave = () => {
      wrapper.style.transform = 'translate(0, 0)';
    };

    wrapper.addEventListener('mousemove', handleMouseMove);
    wrapper.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      wrapper.removeEventListener('mousemove', handleMouseMove);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={`magnetic-wrapper ${className}`} style={{ display: 'inline-block', transition: 'transform 0.3s var(--ease-smooth)' }}>
      {children}
    </div>
  );
}
