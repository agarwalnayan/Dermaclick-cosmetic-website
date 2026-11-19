// Public client details are kept in one place; optional links stay hidden when unset.
export const site = {
  name: 'Dermaclick',
  url: 'https://www.dermaclick.co.in',
  whatsapp: '918653562768',
  phone: '+918653562768',
  email: '',
  address: '',
  socials: { instagram: '', facebook: '' },
  ga4Id: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID) || '',
  gtmId: '',
  adsConversionId: '', // Google Ads Conversion ID (e.g., AW-123456789)
  adsConversionLabel: '', // Google Ads Conversion Label (e.g., AbcDefGhIjKlMnOpQrStUv)
};
export const waLink = (t = "Hello Dermaclick, I'd like to enquire.") =>
  site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t)}` : '#contact';
export const telLink = () => (site.phone ? `tel:${site.phone}` : '#contact');
