import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { products, categories } from '../data/products';
import ProductCard from '../components/ProductCard';
import { useReveal } from '../hooks/useReveal';
import { useRevealGrid } from '../hooks/useRevealGrid';
const categoryId = (category) => `category-${category.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
export default function Collection() {
  const [cat, setCat] = useState('All'); const ref = useReveal(); const gridRef = useRevealGrid();
  const { hash } = useLocation();
  useEffect(() => {
    const selected = categories.find((category) => `#${categoryId(category)}` === hash);
    if (selected) setCat(selected);
  }, [hash]);
  const list = cat === 'All' ? products : products.filter((p) => p.category?.trim() === cat);
  return (
    <section id="products" className="sec collection-section"><div className="wrap reveal" ref={ref}>
      <div className="collection-heading">
        <div><p className="eyebrow">A considered edit</p><h2>The collection</h2></div>
        <p className="lead">Explore beauty and personal care from Dermaclick.</p>
      </div>
      {products.length > 0 && <div className="collection-controls">
        <div className="chips" role="group" aria-label="Filter by category">
          {['All', ...categories].map((c) => <button id={c === 'All' ? undefined : categoryId(c)} key={c} className={c === cat ? 'on' : ''} aria-pressed={c === cat} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <span className="collection-count" aria-live="polite">{list.length} {list.length === 1 ? 'product' : 'products'}</span>
      </div>}
      {products.length > 0
        ? <div className="pgrid reveal-grid" ref={gridRef}>{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        : <p className="collection-empty">For product information, <a href="#contact">get in touch</a> with the Dermaclick team.</p>}
    </div></section>
  );
}
