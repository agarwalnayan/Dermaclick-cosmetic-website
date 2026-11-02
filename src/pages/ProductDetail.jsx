import { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { site } from '../config/site';
import ProductVisual from '../components/ProductVisual';
import { WhatsAppCta, CallCta } from '../components/Cta';
import ProductCard from '../components/ProductCard';
import { useSeo } from '../hooks/useSeo';
import { useRevealGrid } from '../hooks/useRevealGrid';
import { revealOnce } from '../hooks/useReveal';
import { trackProductView } from '../utils/analytics';

const siteOrigin = site.url || (typeof window !== 'undefined' ? window.location.origin : '');

function BackToProducts() {
  const navigate = useNavigate();
  const goBack = (event) => {
    event.preventDefault();
    const idx = window.history.state?.idx;
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1);
      return;
    }
    navigate('/#products');
  };
  return (
    <Link to="/#products" className="pd-back" onClick={goBack}>
      ← Back to all products
    </Link>
  );
}

// Benefit strings are written as "Title — explanation". Same words, split so the title leads and the explanation is quieter.
function BenefitText({ text }) {
  const [title, ...rest] = String(text).split(' — ');
  if (!rest.length) return <span className="pd-benefit-text"><strong>{text}</strong></span>;
  return <span className="pd-benefit-text"><strong>{title}</strong><span>{rest.join(' — ')}</span></span>;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const p = products.find((x) => x.slug === slug);
  const relatedGridRef = useRevealGrid();
  const benefitsRef = useRef(null);
  const ingredientsRef = useRef(null);
  const relatedProducts = p ? [
    ...products.filter((product) => product.id !== p.id && product.category?.trim() === p.category?.trim()),
    ...products.filter((product) => product.id !== p.id && product.category?.trim() !== p.category?.trim()),
  ].slice(0, 3) : [];
  const introduction = p?.shortDescription || p?.description || '';
  const overview = p?.description && p.description !== introduction ? p.description : '';
  useEffect(() => { window.scrollTo(0, 0); p && trackProductView(p); }, [p]);

  useEffect(() => {
    // Each block reveals independently, so a product with benefits but no ingredients (or vice versa) never hides content.
    const stops = [benefitsRef.current, ingredientsRef.current].map((el) => revealOnce(el, 'in-view', { threshold: 0.2 }));
    return () => stops.forEach((stop) => stop());
  }, [p?.id]);
  useSeo({
    title: p ? (p.seoTitle || `${p.name} | Dermaclick`) : 'Product not found | Dermaclick',
    description: p ? (p.seoDescription || `${p.name} from Dermaclick. ${p.description}`) : 'This product could not be found.',
    keywords: p?.seoKeywords?.length ? p.seoKeywords.join(', ') : undefined,
    path: `/products/${slug}`,
    schema: p && {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      category: p.category,
      brand: { '@type': 'Brand', name: 'Dermaclick', url: siteOrigin },
      description: p.description,
      keywords: p.seoKeywords?.length ? p.seoKeywords : undefined,
      url: `${siteOrigin}/products/${p.slug}`,
      image: p.image ? `${siteOrigin}${p.image}` : undefined,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: `${siteOrigin}/products/${p.slug}`,
        seller: { '@type': 'Organization', name: 'Dermaclick' }
      },
      additionalProperty: [
        ...(p.size ? [{ '@type': 'PropertyValue', name: 'Size', value: p.size }] : []),
        ...(p.suitableFor?.length ? [{ '@type': 'PropertyValue', name: 'Suitable For', value: p.suitableFor.join(', ') }] : [])
      ]
    },
  });
  if (!p) {
    return (
      <section className="wrap sec">
        <h1>Product not found</h1>
        <Link to="/#products">Back to all products</Link>
      </section>
    );
  }
  return (
    <article className="product-page">
      <section className="wrap sec pd">
        <BackToProducts />
        <div className="pd-img">
          <ProductVisual p={p} eager />
        </div>
        <div className="pd-info">
          <p className="pd-category">{p.category}</p>
          <h1>{p.name}</h1>
          {p.tagline && <p className="pd-tagline"><em>{p.tagline}</em></p>}
          {introduction && <p className="lead pd-description">{introduction}</p>}
          {(p.size || p.suitableFor?.length > 0) && (
            <dl className="pd-meta">
              {p.size && <div><dt>Size</dt><dd>{p.size}</dd></div>}
              {p.suitableFor?.length > 0 && <div><dt>Suitable for</dt><dd>{p.suitableFor.join(', ')}</dd></div>}
            </dl>
          )}
          <div className="row pd-cta">
            <WhatsAppCta location="product_page" product={p} variant="gold">Enquire on WhatsApp</WhatsAppCta>
            <CallCta location="product_page" variant="line">Call us</CallCta>
          </div>
          <p className="pd-note">Questions about this formulation? Message us and we will guide you.</p>
          <div className="pd-detail-rule" aria-hidden="true" />
        </div>
      </section>
      {(overview || p.benefits?.length > 0 || p.ingredients?.length > 0) && (
        <section className="pd-discover">
          <div className={`wrap pd-discover-inner${overview ? ' has-overview' : ''}`}>
            {overview && (
              <section className="pd-block pd-overview" aria-labelledby="product-overview">
                <div className="pd-section-heading"><p className="eyebrow">The details</p><h2 id="product-overview">Overview</h2></div>
                <p className="pd-overview-copy">{overview}</p>
              </section>
            )}
            {p.benefits?.length > 0 && (
              <section className="pd-block pd-benefits" aria-labelledby="product-benefits" ref={benefitsRef}>
                <div className="pd-section-heading"><p className="eyebrow">At a glance</p><h2 id="product-benefits">Benefits</h2></div>
                <ol className="pd-benefit-list">
                  {p.benefits.map((benefit, i) => (
                    <li key={`${benefit}-${i}`}>
                      <span className="pd-benefit-number">{String(i + 1).padStart(2, '0')}</span>
                      <BenefitText text={benefit} />
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {p.ingredients?.length > 0 && (
              <section className="pd-block pd-ingredients" aria-labelledby="product-ingredients" ref={ingredientsRef}>
                <div className="pd-section-heading"><p className="eyebrow">What's in it</p><h2 id="product-ingredients">Ingredients</h2></div>
                <div className="pd-ingredient-grid">
                  {p.ingredients.map((ingredient, i) => (
                    <details className="ingredient-card" key={`${ingredient.name}-${i}`}>
                      <summary>
                        <span className="ingredient-number">{String(i + 1).padStart(2, '0')}</span>
                        <strong>{ingredient.name}</strong>
                        <span className="ingredient-toggle" aria-hidden="true" />
                      </summary>
                      {ingredient.description && <p>{ingredient.description}</p>}
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      )}
      {relatedProducts.length > 0 && (
        <section className="sec related-section">
          <div className="wrap">
            <div className="related-heading">
              <div><p className="eyebrow">Continue exploring</p><h2>More from Dermaclick</h2></div>
              <Link to="/#products" className="related-all">View the collection <span aria-hidden="true">→</span></Link>
            </div>
            <div className="pgrid three reveal-grid" ref={relatedGridRef}>
              {relatedProducts.map((product) => <ProductCard key={product.id} p={product} />)}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}