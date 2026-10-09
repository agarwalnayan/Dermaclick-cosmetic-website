import { useState } from 'react';
import { products, categories } from '../data/products';
import ProductCard from '../components/ProductCard';
import { useReveal } from '../hooks/useReveal';
export default function Collection() {
  const [cat, setCat] = useState('All'); const ref = useReveal(); const gridRef = useReveal();
  const list = cat === 'All' ? products : products.filter((p) => p.category?.trim() === cat);
  return (
    <section id="products" className="sec collection-section"><div className="wrap reveal" ref={ref}>
      <div className="collection-heading">
        <div><p className="eyebrow">A considered edit</p><h2>The collection</h2></div>
        <p className="lead">Explore beauty and personal care from Dermaclick.</p>
      </div>
      {products.length > 0 && <div className="collection-controls">
        <div className="chips" role="group" aria-label="Filter by category">
          {['All', ...categories].map((c) => <button key={c} className={c === cat ? 'on' : ''} aria-pressed={c === cat} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <span className="collection-count">{list.length} {list.length === 1 ? 'product' : 'products'}</span>
      </div>}
      {products.length > 0
        ? <div className="pgrid reveal-grid" ref={gridRef}>{list.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div>
        : <p className="collection-empty">For product information, <a href="#contact">get in touch</a> with the Dermaclick team.</p>}
    </div></section>
  );
}
