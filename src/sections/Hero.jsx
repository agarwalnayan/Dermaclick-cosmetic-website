import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { products, categories } from '../data/products';
import { WhatsAppCta, LinkCta } from '../components/Cta';
import AmbientImage from '../components/AmbientImage';
import { humanList, pickFeatured } from '../utils/catalogueViews';

const PREFERRED = ['DC-19', 'DC-22', 'DC-17'];
const INTERVAL_MS = 6500;

// Up to three featured photographs: preferred ids first (one per category in your catalogue), then any featured products.
function heroSlides() {
  const picked = PREFERRED.map((id) => products.find((p) => p.id === id && p.image)).filter(Boolean);
  for (const p of pickFeatured(6)) if (picked.length < 3 && p.image && !picked.includes(p)) picked.push(p);
  return picked.length ? picked : products.slice(0, 1);
}

export default function Hero() {
  const slides = useMemo(heroSlides, []);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Slide 1 is what renders first (and without JavaScript). Rotation never runs for reduced-motion visitors or while hovered/focused.
  useEffect(() => {
    if (slides.length < 2 || paused) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const range = products.length ? `${products.length} formulations across ${humanList(categories.map((c) => c.toLowerCase()))}, ` : '';

  return (
    <section id="home" className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="wrap hero-in">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">Skincare &amp; haircare</p>
          <h1>Skincare and haircare, <em>formulated with purpose.</em></h1>
          <p className="hero-description">{range}built around active ingredients such as Vitamin C, Niacinamide, Kojic Acid and Hyaluronic Acid. Browse the range and enquire directly on WhatsApp.</p>
          <div className="hero-actions">
            <WhatsAppCta location="hero" variant="gold">Enquire on WhatsApp</WhatsAppCta>
            <LinkCta to="#range" location="hero" variant="line">Explore the range</LinkCta>
          </div>
          {slides.length > 1 && (
            <div className="hero-dots" role="group" aria-label="Featured products">
              {slides.map((p, i) => (
                <button key={p.id} type="button" className={i === index ? 'on' : ''} aria-label={`Show ${p.name}`} aria-current={i === index ? 'true' : undefined} onClick={() => setIndex(i)} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="hero-stage">
        {slides.map((p, i) => (
          <figure key={p.id} className={i === index ? 'hero-slide on' : 'hero-slide'} aria-hidden={i === index ? undefined : 'true'}>
            <AmbientImage p={p} eager={i === 0} />
            <figcaption>
              <span className="hero-cap-label">Featured</span>
              <strong>{p.name}</strong>
              <Link to={`/products/${p.slug}`} tabIndex={i === index ? 0 : -1}>View product <span aria-hidden="true">→</span></Link>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}