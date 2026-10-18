import Hero from '../sections/Hero'; import Collection from '../sections/Collection';
import { About, Featured, CategoryDiscovery, Faq, FinalCta } from '../sections/Sections';
import { useSeo } from '../hooks/useSeo'; import { site } from '../config/site'; import { faqs } from '../data/content';
const siteOrigin = site.url || (typeof window !== 'undefined' ? window.location.origin : '');
const schema = { '@context': 'https://schema.org', '@graph': [
  { '@type': 'Organization', name: 'Dermaclick', url: siteOrigin, logo: `${siteOrigin}/favicon.png` },
  { '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] };
export default function Home() {
  useSeo({ title: 'Dermaclick | Premium Beauty & Personal Care', description: 'Discover Dermaclick, a premium beauty and personal care brand. Explore the collection and enquire on WhatsApp.', path: '/', schema });
  return <><Hero /><About /><Collection /><Featured /><CategoryDiscovery /><Faq /><FinalCta /></>;
}
