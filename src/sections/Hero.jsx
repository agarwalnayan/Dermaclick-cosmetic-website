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
            <p className="hero-description">Dermaclick is a premium beauty and personal care brand with a carefully chosen collection.</p>
            <div className="row hero-actions"><LinkCta to="#products" location="hero" variant="gold">Explore the collection <span aria-hidden="true">↗</span></LinkCta><WhatsAppCta location="hero" variant="line">WhatsApp us</WhatsAppCta></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <img className="crest" src={logo} width="540" height="427" alt="" fetchpriority="high" />
          </div>
        </div>
      </div>
    </section>
  );
}
