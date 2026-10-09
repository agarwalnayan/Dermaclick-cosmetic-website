import { useEffect } from 'react'; import { useParams, Link } from 'react-router-dom';
import { products } from '../data/products'; import { site } from '../config/site';
import ProductVisual from '../components/ProductVisual'; import { WhatsAppCta, CallCta } from '../components/Cta';
import { useSeo } from '../hooks/useSeo'; import { trackProductView } from '../utils/analytics';
const siteOrigin = site.url || (typeof window !== 'undefined' ? window.location.origin : '');
export default function ProductDetail() {
  const { slug } = useParams(); const p = products.find((x) => x.slug === slug);
  useEffect(() => { window.scrollTo(0, 0); p && trackProductView(p); }, [p]);
  useSeo({ title: p ? (p.seoTitle || `${p.name} | Dermaclick`) : 'Product not found | Dermaclick', description: p ? (p.seoDescription || `${p.name} from Dermaclick. ${p.description}`) : 'This product could not be found.', path: `/products/${slug}`,
    schema: p && { '@context': 'https://schema.org', '@type': 'Product', name: p.name, category: p.category, brand: { '@type': 'Brand', name: 'Dermaclick' }, description: p.description, keywords: p.seoKeywords?.length ? p.seoKeywords : undefined, url: `${siteOrigin}/products/${p.slug}` } });
  if (!p) return <section className="wrap sec"><h1>Product not found</h1><Link to="/#products">Back to the collection</Link></section>;
  return (
    <article className="product-page">
      <section className="wrap sec pd">
        <div className="pd-img"><ProductVisual p={p} eager /><span className="pd-image-caption">{p.category} <i /> Dermaclick</span></div>
        <div className="pd-info">
          <Link to="/#products" className="pd-back">← All products</Link>
          <p className="pd-category">{p.category}</p>
          <h1>{p.name}</h1>
          {p.tagline && <p className="pd-tagline"><em>{p.tagline}</em></p>}
          <p className="lead pd-description">{p.description}</p>
          {(p.size || p.suitableFor?.length > 0) && <dl className="pd-meta">
            {p.size && <div><dt>Size</dt><dd>{p.size}</dd></div>}
            {p.suitableFor?.length > 0 && <div><dt>Suitable for</dt><dd>{p.suitableFor.join(', ')}</dd></div>}
          </dl>}
          <p className="pd-price">Price: enquire for price</p>
          <div className="row pd-cta"><WhatsAppCta location="product_page" product={p}>Enquire on WhatsApp</WhatsAppCta><CallCta location="product_page" /></div>
          <div className="pd-detail-rule" aria-hidden="true" />
        </div>
      </section>
      {(p.benefits?.length > 0 || p.ingredients?.length > 0) && <section className="pd-discover">
        <div className="wrap pd-discover-inner">
          {p.benefits?.length > 0 && <section className="pd-block pd-benefits" aria-labelledby="product-benefits">
            <div className="pd-section-heading"><p className="eyebrow">At a glance</p><h2 id="product-benefits">Benefits</h2></div>
            <ol className="pd-benefit-list">{p.benefits.map((benefit, i) => <li key={`${benefit}-${i}`}><span className="pd-benefit-number">{String(i + 1).padStart(2, '0')}</span><span>{benefit}</span></li>)}</ol>
          </section>}
          {p.ingredients?.length > 0 && <section className="pd-block pd-ingredients" aria-labelledby="product-ingredients">
            <div className="pd-section-heading"><p className="eyebrow">What's in it</p><h2 id="product-ingredients">Ingredients</h2></div>
            <div className="pd-ingredient-grid">{p.ingredients.map((ingredient, i) => <details className="ingredient-card" key={`${ingredient.name}-${i}`}>
              <summary><span className="ingredient-number">{String(i + 1).padStart(2, '0')}</span><strong>{ingredient.name}</strong><span className="ingredient-toggle" aria-hidden="true" /></summary>
              {ingredient.description && <p>{ingredient.description}</p>}
            </details>)}</div>
          </section>}
        </div>
      </section>}
    </article>
  );
}
