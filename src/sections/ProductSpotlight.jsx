import { Link } from 'react-router-dom';
import { products } from '../data/products';
import ProductVisual from '../components/ProductVisual';
import { WhatsAppCta } from '../components/Cta';
import { useReveal } from '../hooks/useReveal';
import { pickFeatured } from '../utils/catalogueViews';

function Feature({ p, lead }) {
  return (
    <article className={lead ? 'feature feature-lead' : 'feature'}>
      <Link className="frame" to={`/products/${p.slug}`} aria-label={`View ${p.name}`} tabIndex={-1}><ProductVisual p={p} eager decorative /></Link>
      <div className="feature-body">
        <p className="feature-cat">{p.category}{p.size ? ` · ${p.size}` : ''}</p>
        <h3><Link to={`/products/${p.slug}`}>{p.name}</Link></h3>
        <p className="feature-desc">{p.shortDescription || p.description}</p>
        {lead && p.tagline && <p className="feature-tagline">{p.tagline}</p>}
        <div className="feature-actions">
          <WhatsAppCta location="featured" product={p} variant="gold">Enquire</WhatsAppCta>
          <Link className="text-link" to={`/products/${p.slug}`}>View details <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </article>
  );
}

// One lead formulation and up to two supporting ones, chosen from the catalogue's own `featured` flags and
// spread across categories.
export default function ProductSpotlight() {
  const ref = useReveal();
  const [lead, ...rest] = pickFeatured(3);
  if (!lead) return null;
  return (
    <section id="featured" className="sec featured">
      <div className="wrap reveal" ref={ref}>
        <div className="section-head">
          <div><p className="eyebrow">Featured formulations</p><h2>Selected from the collection</h2></div>
          <a className="section-link" href="#collection">View all {products.length} <span aria-hidden="true">→</span></a>
        </div>
        <div className="featured-grid">
          <Feature p={lead} lead />
          {rest.length > 0 && <div className="feature-stack">{rest.map((p) => <Feature key={p.id} p={p} />)}</div>}
        </div>
      </div>
    </section>
  );
}