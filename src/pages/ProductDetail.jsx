import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { site } from '../config/site';
import ProductVisual from '../components/ProductVisual';
import { WhatsAppCta, CallCta } from '../components/Cta';
import ProductCard from '../components/ProductCard';
import MagneticWrapper from '../components/MagneticWrapper';
import { useSeo } from '../hooks/useSeo';
import { useRevealGrid } from '../hooks/useRevealGrid';
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

export default function ProductDetail() {
  const { slug } = useParams();
  const p = products.find((x) => x.slug === slug);
  const relatedGridRef = useRevealGrid();
  const [imageTransform, setImageTransform] = useState({ x: 0, y: 0, rotate: 0 });
  const productImgRef = useRef(null);
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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const productImg = productImgRef.current;
    if (!productImg) return;

    const handleMouseMove = (e) => {
      const rect = productImg.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setImageTransform({ x: x * 15, y: y * 15, rotate: x * 5 });
    };

    const handleMouseLeave = () => {
      setImageTransform({ x: 0, y: 0, rotate: 0 });
    };

    productImg.addEventListener('mousemove', handleMouseMove);
    productImg.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      productImg.removeEventListener('mousemove', handleMouseMove);
      productImg.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const benefits = benefitsRef.current;
    const ingredients = ingredientsRef.current;
    if (!benefits || !ingredients) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.2 });

    observer.observe(benefits);
    observer.observe(ingredients);

    return () => observer.disconnect();
  }, []);
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
        <div className="pd-img" ref={productImgRef} style={{ transform: `translate(${imageTransform.x}px, ${imageTransform.y}px) rotate(${imageTransform.rotate}deg)` }}>
          <ProductVisual p={p} eager />
          <span className="pd-image-caption">{p.category} <i /> Dermaclick</span>
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
          <p className="pd-price">Price: enquire for price</p>
          <div className="row pd-cta">
            <MagneticWrapper><WhatsAppCta location="product_page" product={p}>Enquire on WhatsApp</WhatsAppCta></MagneticWrapper>
            <MagneticWrapper><CallCta location="product_page" /></MagneticWrapper>
          </div>
          <div className="pd-detail-rule" aria-hidden="true" />
        </div>
      </section>
      {(overview || p.benefits?.length > 0 || p.ingredients?.length > 0) && (
        <section className="pd-discover">
          <div className="wrap pd-discover-inner">
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
                      <span>{benefit}</span>
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
