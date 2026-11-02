import { WhatsAppCta } from '../components/Cta';
import { FlaskIcon, TagIcon, DropIcon, ChatIcon } from '../components/Icons';
import { useReveal } from '../hooks/useReveal';

// Every statement is limited to what the catalogue data and the FAQ already state (named ingredients, labelled
// free-from wording, concern-led positioning, help choosing). No efficacy, clinical, dermatologist or testing claims.
const features = [
  [FlaskIcon, 'Ingredient-led', 'Vitamin C, Niacinamide, Kojic Acid, Hyaluronic Acid, Keratin and Argan feature across the range, and each product page lists the key ingredients.'],
  [TagIcon, 'Clearly labelled', 'Paraben-free and sulphate-free are stated product by product, as they appear on the pack, so you can see exactly what applies to each formulation.'],
  [DropIcon, 'Concern-led', 'Brightening, hydration, oil control, sun protection and hair repair: each formulation is positioned around a defined skin or hair concern.'],
  [ChatIcon, 'Help choosing', 'Not sure where to start? Tell us what you are looking for on WhatsApp and our team will suggest options.'],
];

export default function BrandPhilosophy() {
  const ref = useReveal();
  return (
    <section id="about" className="sec why">
      <div className="wrap reveal" ref={ref}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Our approach</p>
            <h2>Built around named active ingredients</h2>
          </div>
          <div className="section-aside">
            <p>Dermaclick brings skincare and haircare together under one name. Browse by concern, read what is in each formulation, and ask us anything on WhatsApp.</p>
            <WhatsAppCta location="philosophy" variant="line">Ask about a formulation</WhatsAppCta>
          </div>
        </div>
        <ul className="why-grid">
          {features.map(([Icon, title, text]) => (
            <li key={title}><Icon className="why-icon" /><div><h3>{title}</h3><p>{text}</p></div></li>
          ))}
        </ul>
      </div>
    </section>
  );
}