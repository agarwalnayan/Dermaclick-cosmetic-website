// Public client details are kept in one place; optional links stay hidden when unset.
export const site = {
  name: 'Dermaclick',
  url: '',
  whatsapp: '',
  phone: '',
  email: '',
  address: '',
  socials: { instagram: '', facebook: '' },
  ga4Id: '',
  gtmId: '',
};
export const waLink = (t = "Hello Dermaclick, I'd like to enquire.") =>
  site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t)}` : '#contact';
export const telLink = () => (site.phone ? `tel:${site.phone}` : '#contact');
