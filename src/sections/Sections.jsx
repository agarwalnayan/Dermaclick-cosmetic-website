import { useState } from 'react';
import { products } from '../data/products';
import { faqs } from '../data/content';
import { site, waLink } from '../config/site';
import ProductCard from '../components/ProductCard';
import { WhatsAppCta, CallCta } from '../components/Cta';
import { useReveal } from '../hooks/useReveal';
import { trackFormStart, trackFormSubmit } from '../utils/analytics';
const R = ({ id, cls = 'sec', children }) => { const r = useReveal(); return <section id={id} className={cls}><div className="wrap reveal" ref={r}>{children}</div></section>; };

export const About = () => (
  <R id="about" cls="sec story-section"><div className="split">
    <div className="story-heading"><p className="eyebrow">The Dermaclick approach</p><h2>A brand built on trust and care</h2></div>
    <div className="story-copy"><p className="lead">Dermaclick brings together beauty and personal care products under one trusted name.</p></div></div></R>
);
export const Featured = () => {
  const gridRef = useReveal();
  const featuredProducts = products.filter((p) => p.featured);
  if (featuredProducts.length === 0) return null;
  return <R id="featured" cls="sec blush"><p className="eyebrow">Selected from the collection</p><h2>Featured products</h2><p className="lead">A closer look at selected favourites.</p>
    <div className="pgrid three reveal-grid" ref={gridRef}>{featuredProducts.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div></R>;
};
export const Faq = () => (
  <R id="faq"><h2>Questions, answered</h2>
    <div className="faq">{faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div></R>
);
export function FinalCta() {
  const [name, setName] = useState(''); const [msg, setMsg] = useState(''); const [started, setStarted] = useState(false);
  const submit = (e) => {
    e.preventDefault(); trackFormSubmit();
    const text = `Hello Dermaclick, I'm ${name}. ${msg}`;
    if (site.whatsapp) window.open(waLink(text), '_blank', 'noopener'); else alert('Contact details are not set yet.');
  };
  return (
    <section id="contact" className="sec dark"><div className="wrap split">
      <div><h2>Let's talk about your next favourite product</h2>
        <p className="lead">Send an enquiry and we will reply on WhatsApp.</p>
        <div className="row"><WhatsAppCta location="final_cta" variant="gold" /><CallCta location="final_cta" variant="line" /></div></div>
      <form className="contact-form" onSubmit={submit} onFocus={() => { if (!started) { setStarted(true); trackFormStart(); } }}>
        <label htmlFor="n">Your name</label><input id="n" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        <label htmlFor="m">What would you like to know?</label><textarea id="m" required rows="4" value={msg} onChange={(e) => setMsg(e.target.value)} />
        <button className="btn gold" type="submit">Send enquiry on WhatsApp</button>
      </form></div></section>
  );
}
