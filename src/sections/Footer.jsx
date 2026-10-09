import Logo from '../components/Logo';
import { site } from '../config/site';
export default function Footer() {
  const s = site.socials;
  const hasContact = site.phone || site.email;
  const hasSocials = s.instagram || s.facebook;
  return (
    <footer className="foot"><div className="wrap foot-in">
      <Logo size={56} />
      <div><h3>Explore</h3><p><a href="/#about">About Dermaclick</a></p><p><a href="/#products">The collection</a></p><p><a href="/#contact">Contact</a></p></div>
      {hasContact && <div><h3>Contact</h3>{site.phone && <p><a href={`tel:${site.phone}`}>{site.phone}</a></p>}{site.email && <p><a href={`mailto:${site.email}`}>{site.email}</a></p>}</div>}
      {hasSocials && <div><h3>Follow</h3>{s.instagram && <p><a href={s.instagram} rel="noopener">Instagram</a></p>}{s.facebook && <p><a href={s.facebook} rel="noopener">Facebook</a></p>}</div>}
    </div><p className="wrap copy">© {new Date().getFullYear()} Dermaclick. All rights reserved.</p></footer>
  );
}
