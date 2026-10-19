import logo from '../assets/logo/logo.webp';
import { WhatsAppCta, LinkCta } from '../components/Cta';
export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-frame">
        <div className="wrap hero-in">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">Beauty <span /> Personal care</p>
            <h1><span>Beauty with a</span>{' '}<em>crown on it.</em></h1>
            <p className="hero-description">Dermaclick is a premium Indian skincare and haircare brand offering products formulated with Niacinamide, Vitamin C, Keratin, Argan, Hyaluronic Acid and more. Discover face wash, moisturizers, serums, shampoos, sunscreens and hair masks designed for all skin types.</p>
            <div className="row hero-actions"><LinkCta to="#products" location="hero" variant="gold">Explore the collection <span aria-hidden="true">↗</span></LinkCta><WhatsAppCta location="hero" variant="line">WhatsApp us</WhatsAppCta></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <img className="crest" src={logo} width="540" height="427" alt="Dermaclick Logo - Premium Skincare and Haircare Brand" fetchpriority="high" />
          </div>
        </div>
      </div>
    </section>
  );
}
