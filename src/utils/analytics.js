import { site } from '../config/site';
const push = (o) => { (window.dataLayer = window.dataLayer || []).push(o); };
export function initAnalytics() {
  const load = (src) => { const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); };
  if (site.gtmId) { push({ 'gtm.start': Date.now(), event: 'gtm.js' }); load(`https://www.googletagmanager.com/gtm.js?id=${site.gtmId}`); }
  else if (site.ga4Id) { window.gtag = function () { window.dataLayer.push(arguments); }; window.gtag('js', new Date()); window.gtag('config', site.ga4Id); load(`https://www.googletagmanager.com/gtag/js?id=${site.ga4Id}`); }
}
export const track = (event, params = {}) => push({ event, ...params });
const pp = (p) => (p ? { product_id: p.id, product_name: p.name, product_category: p.category } : {});
export const trackProductView = (p) => track('product_view', pp(p));
export const trackWhatsApp = (location, p) => track('whatsapp_click', { location, ...pp(p) });
export const trackPhone = (location) => track('phone_click', { location });
export const trackCta = (label, location, p) => track('cta_click', { label, location, ...pp(p) });
export const trackFormStart = () => track('enquiry_form_start');
export const trackFormSubmit = (p) => track('enquiry_form_submit', pp(p));
