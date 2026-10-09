import { Link } from 'react-router-dom';
import ProductVisual from './ProductVisual';
import { trackProductView } from '../utils/analytics';
export default function ProductCard({ p, index = 0 }) {
  const description = p.shortDescription || p.description;
  return (
    <article className="pcard" style={{ '--card-index': index }}>
      <Link to={`/products/${p.slug}`} onClick={() => trackProductView(p)} aria-label={`View ${p.name}`}>
        <div className="pimg"><ProductVisual p={p} /></div>
        <div className="pcard-content">
          <p className="pcard-category">{p.category}</p>
          <h3>{p.name}</h3>
          {description && <p className="pcard-desc">{description}</p>}
          <span className="card-link">Discover product</span>
        </div>
      </Link>
    </article>
  );
}
