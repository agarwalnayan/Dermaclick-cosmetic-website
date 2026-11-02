import Logo from '../components/Logo';
import { site, waLink } from '../config/site';
import { trackContactClick } from '../utils/analytics';
import { categories } from '../data/products';
import { categoryId } from '../utils/categoryId';
export default function Footer() {
  const s = site.socials;
  const hasContact = site.phone || site.email;
  const hasSocials = s.instagram || s.facebook;
  return (
    <footer className="foot"><div className="wrap foot-in">
      <div className="foot-brand"><Logo size={56} /><p>Skincare and haircare, formulated with purpose. Enquire on WhatsApp or by phone.</p></div>
      <div><h3>Discover</h3><p><a href="/#featured">Featured</a></p><p><a href="/#about">Our Philosophy</a></p><p><a href="/#products">Full Collection</a></p><p><a href="/#contact">Contact</a></p></div>{categories.length > 0 && <div><h3>Range</h3>{categories.map((c) => <p key={c}><a href={`/#${categoryId(c)}`}>{c}</a></p>)}</div>}
      {(hasContact || site.whatsapp) && <div><h3>Connect</h3>{site.whatsapp && <p><a href={waLink()} target="_blank" rel="noopener noreferrer" onClick={() => trackContactClick('whatsapp', 'footer')}>WhatsApp</a></p>}{site.phone && <p><a href={`tel:${site.phone}`} onClick={() => trackContactClick('phone', 'footer')}>Call {site.phone.replace(/^\+91/, '')}</a></p>}{site.email && <p><a href={`mailto:${site.email}`} onClick={() => trackContactClick('email', 'footer')}>{site.email}</a></p>}</div>}
      {hasSocials && <div><h3>Follow</h3>{s.instagram && <p><a href={s.instagram} rel="noopener">Instagram</a></p>}{s.facebook && <p><a href={s.facebook} rel="noopener">Facebook</a></p>}</div>}
    </div><div className="wrap"><p className="copy">© {new Date().getFullYear()} Dermaclick. All rights reserved.</p></div></footer>
  );
}