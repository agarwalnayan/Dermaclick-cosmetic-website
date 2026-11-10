import Hero from '../sections/Hero';
import EnquiryBar from '../sections/EnquiryBar';
import BrandValues from '../sections/BrandValues';
import BrandPhilosophy from '../sections/BrandPhilosophy';
import BrandRange from '../sections/BrandRange';
import ProductSpotlight from '../sections/ProductSpotlight';
import Collection from '../sections/Collection';
import { Faq, FinalCta } from '../sections/Sections';
import { useSeo } from '../hooks/useSeo';
import { site } from '../config/site';
import { faqs } from '../data/content';

const siteOrigin = site.url || (typeof window !== 'undefined' ? window.location.origin : '');

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Dermaclick',
      url: siteOrigin,
      logo: `${siteOrigin}/favicon.png`,
      description: 'Dermaclick is a clinical-grade Indian skincare and haircare brand offering paraben-free, sulphate-free formulations with active ingredients like Niacinamide, Vitamin C, Kojic Acid, Keratin, Argan, and Hyaluronic Acid. Products include face wash, moisturizers, serums, shampoos, sunscreens and hair masks designed for real skin and hair concerns.',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: site.phone,
        contactType: 'customer service',
        availableLanguage: 'English',
        areaServed: 'IN'
      },
      sameAs: [],
      address: { '@type': 'PostalAddress', addressCountry: 'IN' }
    },
    {
      '@type': 'WebSite',
      name: 'Dermaclick',
      url: siteOrigin,
      description: 'Clinical-grade skincare and haircare formulations with Niacinamide, Vitamin C, Keratin, Argan and more. Paraben-free, sulphate-free formulas designed for real skin and hair concerns.',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteOrigin}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      },
      publisher: { '@type': 'Organization', name: 'Dermaclick' }
    },
    {
      '@type': 'LocalBusiness',
      name: 'Dermaclick',
      description: 'Clinical-grade skincare and haircare brand offering paraben-free and sulphate-free products formulated with active ingredients like Niacinamide, Vitamin C, Kojic Acid, Keratin, and Argan.',
      telephone: site.phone,
      url: siteOrigin,
      address: { '@type': 'PostalAddress', addressCountry: 'IN' }
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    }
  ]
};

export default function Home() {
  useSeo({
    title: 'Dermaclick | Clinical-Grade Skincare & Haircare Formulations',
    description: 'Dermaclick: Clinical-grade skincare and haircare formulated with active ingredients like Vitamin C, Niacinamide, Kojic Acid, Keratin, and Argan. Paraben-free, sulphate-free products designed for real skin and hair concerns.',
    keywords: 'Dermaclick, skincare, haircare, Niacinamide, Vitamin C, Keratin, Argan, face wash, moisturizer, serum, shampoo, sunscreen, hair mask, Indian beauty brand, clinical skincare, paraben-free, sulphate-free, Kojic Acid, Alpha Arbutin, Hyaluronic Acid, Zinc PCA, Vitamin E, Rice Water',
    path: '/',
    schema
  });

  return (
    <>
      <Hero />
      <EnquiryBar />
      <BrandValues />
      <BrandRange />
      <ProductSpotlight />
      <BrandPhilosophy />
      <Collection />
      <Faq />
      <FinalCta />
    </>
  );
}
