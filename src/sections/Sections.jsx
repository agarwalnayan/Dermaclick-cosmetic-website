import { useState } from 'react';
import { faqs } from '../data/content';
import { site, waLink } from '../config/site';
import { WhatsAppCta, CallCta } from '../components/Cta';
import { useReveal } from '../hooks/useReveal';
import { trackFormStart, trackFormSubmit } from '../utils/analytics';
const R = ({ id, cls = 'sec', children }) => { const r = useReveal(); return <section id={id} className={cls}><div className="wrap reveal" ref={r}>{children}</div></section>; };

export const Faq = () => (
  <R id="faq" cls="sec faq-section">
    <p className="eyebrow">Questions</p>
    <h2>Frequently asked</h2>
    <div className="faq">{faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
  </R>
);
export function FinalCta() {
  const [name, setName] = useState(''); const [msg, setMsg] = useState(''); const [started, setStarted] = useState(false);
  const submit = (e) => {
    e.preventDefault(); trackFormSubmit();
    const text = `Hello Dermaclick, I'm ${name}. ${msg}`;
    window.open(waLink(text), '_blank', 'noopener,noreferrer');
    };
  return (
    <section id="contact" className="sec dark"><div className="wrap split">
      <div><p className="eyebrow">Enquiries</p><h2>Connect with Dermaclick</h2>
        <p className="lead">Have questions about our formulations? We're here to help on WhatsApp.</p>
        <div className="row"><WhatsAppCta location="final_cta" variant="gold" /><CallCta location="final_cta" variant="line" /></div></div>
      <form className="contact-form" onSubmit={submit} onFocus={() => { if (!started) { setStarted(true); trackFormStart(); } }}>
        <label htmlFor="n">Your name</label><input id="n" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        <label htmlFor="m">What would you like to know?</label><textarea id="m" required rows="4" value={msg} onChange={(e) => setMsg(e.target.value)} />
        <button className="btn gold" type="submit">Send enquiry on WhatsApp</button>
      </form></div></section>
  );
}
