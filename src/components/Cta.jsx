import { waLink, telLink, site } from '../config/site';
import { trackWhatsApp, trackPhone, trackCta } from '../utils/analytics';
export function WhatsAppCta({ location, product, children = 'WhatsApp us', variant = 'solid', msg }) {
  const text = msg || (product ? `Hello Dermaclick, I'd like to enquire about ${product.name} (${product.id}).` : undefined);
  return <a className={`btn ${variant}`} href={waLink(text)} target={site.whatsapp ? '_blank' : undefined} rel="noopener" onClick={() => trackWhatsApp(location, product)}>{children}</a>;
}
export function CallCta({ location, children = 'Call now', variant = 'ghost' }) {
  return <a className={`btn ${variant}`} href={telLink()} onClick={() => trackPhone(location)}>{children}</a>;
}
export function LinkCta({ to, location, label, variant = 'ghost', children, product }) {
  return <a className={`btn ${variant}`} href={to} onClick={() => trackCta(label || String(children), location, product)}>{children}</a>;
}
