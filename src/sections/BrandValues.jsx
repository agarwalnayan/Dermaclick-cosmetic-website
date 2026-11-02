import { products, categories } from '../data/products';
import { waLink } from '../config/site';
import { trackWhatsAppClick } from '../utils/analytics';
import { CheckCircleIcon } from '../components/Icons';

// A ticked strip of facts. Every line is computed from, or limited to, what the catalogue itself states:
// counts, SPF 50 products, and paraben/sulphate-free wording that appears on the products. No testing or clinical claims.
export default function BrandValues() {
  if (!products.length) return null;
  const record = (p) => JSON.stringify(p).toLowerCase();
  const spf = products.filter((p) => /spf\s*50/i.test([p.name, p.description, p.shortDescription, p.tagline].join(' '))).length;
  const paraben = products.filter((p) => record(p).includes('paraben')).length;
  const sulphate = products.filter((p) => /sulph|sulf/.test(record(p))).length;
  const free = paraben && sulphate ? 'Paraben-free & sulphate-free options, as labelled' : paraben ? 'Paraben-free options, as labelled' : sulphate ? 'Sulphate-free options, as labelled' : null;
  const items = [
    `${products.length} ${products.length === 1 ? 'formulation' : 'formulations'} across ${categories.length} ${categories.length === 1 ? 'category' : 'categories'}`,
    spf ? 'SPF 50 PA+++ sun care' : null,
    free,
  ].filter(Boolean);
  return (
    <section className="checks" aria-label="The range at a glance">
      <ul className="wrap checks-in">
        {items.map((text) => <li key={text}><CheckCircleIcon /><span>{text}</span></li>)}
        <li>
          <a href={waLink()} target="_blank" rel="noopener" onClick={() => trackWhatsAppClick('checks_strip')}><CheckCircleIcon /><span>Enquire directly on WhatsApp</span></a>
        </li>
      </ul>
    </section>
  );
}