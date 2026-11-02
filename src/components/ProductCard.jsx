import { Link } from 'react-router-dom';
import ProductVisual from './ProductVisual';
import { WhatsAppCta } from './Cta';
import { trackSelectItem } from '../utils/analytics';
export default function ProductCard({ p }) {
  const description = p.shortDescription || p.description;
  return (
    <article className="pcard">
      <Link className="pcard-link" to={`/products/${p.slug}`} onClick={() => trackSelectItem(p)} aria-label={`View ${p.name}`}>
        <div className="pimg"><ProductVisual p={p} /></div>
        <div className="pcard-content">
          <p className="pcard-category">{p.category}{p.size ? <span> · {p.size}</span> : null}</p>
          <h3>{p.name}</h3>
          {description && <p className="pcard-desc">{description}</p>}
          <span className="card-link">View details</span>
        </div>
      </Link>
      <WhatsAppCta location="catalogue" product={p} variant="text">Enquire</WhatsAppCta>
    </article>
  );
}