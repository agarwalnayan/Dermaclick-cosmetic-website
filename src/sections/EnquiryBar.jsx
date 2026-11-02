import { useState } from 'react';
import { products, categories } from '../data/products';
import { waLink } from '../config/site';
import { trackWhatsAppClick } from '../utils/analytics';

// "Ask about a product": pick a formulation, then message us on WhatsApp with the product named.
// It only builds a WhatsApp link (same message format as the product buttons); nothing is stored or sold here.
export default function EnquiryBar() {
  const [id, setId] = useState('');
  if (!products.length) return null;
  const chosen = products.find((p) => p.id === id);
  const text = chosen ? `Hello Dermaclick, I'd like to enquire about ${chosen.name} (${chosen.id}).` : undefined;
  return (
    <section className="enquiry-bar" aria-labelledby="enquiry-bar-title">
      <div className="wrap enquiry-in">
        <div className="enquiry-copy">
          <h2 id="enquiry-bar-title">Ask about a product</h2>
          <p>Choose a formulation and message us on WhatsApp.</p>
        </div>
        <div className="enquiry-field">
          <label htmlFor="enquiry-product">Product</label>
          <select id="enquiry-product" value={id} onChange={(e) => setId(e.target.value)}>
            <option value="">All products</option>
            {categories.map((cat) => (
              <optgroup key={cat} label={cat}>
                {products.filter((p) => p.category?.trim() === cat).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <a className="btn light" href={waLink(text)} target="_blank" rel="noopener" onClick={() => trackWhatsAppClick('enquiry_bar', chosen)}>Enquire on WhatsApp</a>
      </div>
    </section>
  );
}