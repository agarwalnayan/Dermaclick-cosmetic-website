import { useRef, useEffect, useState } from 'react';
import logo from '../assets/logo/logo.webp';
import { WhatsAppCta, LinkCta } from '../components/Cta';
export default function Hero() {
  const heroRef = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const hero = heroRef.current;
    if (!hero) return;

    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setTransform({ x: x * 20, y: y * 20 });
    };

    const handleMouseLeave = () => {
      setTransform({ x: 0, y: 0 });
    };

    hero.addEventListener('mousemove', handleMouseMove);
    hero.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section id="home" className="hero" ref={heroRef}>
      <div className="hero-frame">
        <div className="wrap hero-in">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">Beauty <span /> Personal care</p>
            <h1><span>Beauty with a</span>{' '}<em>crown on it.</em></h1>
            <p className="hero-description">Dermaclick is a premium Indian skincare and haircare brand offering products formulated with Niacinamide, Vitamin C, Keratin, Argan, Hyaluronic Acid and more. Discover face wash, moisturizers, serums, shampoos, sunscreens and hair masks designed for all skin types.</p>
            <div className="row hero-actions"><LinkCta to="#products" location="hero" variant="gold">Explore the collection <span aria-hidden="true">↗</span></LinkCta><WhatsAppCta location="hero" variant="line">WhatsApp us</WhatsAppCta></div>
          </div>
          <div className="hero-art" aria-hidden="true" style={{ transform: `translate(${transform.x}px, ${transform.y}px)` }}>
            <img className="crest" src={logo} width="540" height="427" alt="Dermaclick Logo - Premium Skincare and Haircare Brand" fetchpriority="high" />
          </div>
        </div>
      </div>
      <div className="hero-particles" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
