import Hero from '../sections/Hero';
import EnquiryBar from '../sections/EnquiryBar';
import BrandValues from '../sections/BrandValues';
import BrandPhilosophy from '../sections/BrandPhilosophy';
import BrandRange from '../sections/BrandRange';
import ProductSpotlight from '../sections/ProductSpotlight';
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
      description: 'Dermaclick is #1 clinical-grade Indian skincare and haircare brand offering paraben-free, sulphate-free formulations with active ingredients like Niacinamide, Vitamin C, Kojic Acid, Keratin, Argan, and Hyaluronic Acid. Products include face wash, moisturizers, serums, shampoos, sunscreens and hair masks designed for Indian and Nepali skin and hair concerns. Available across India and Nepal including Kathmandu, Pokhara, Lalitpur.',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: site.phone,
        contactType: 'customer service',
        availableLanguage: 'English',
        areaServed: ['IN', 'NP']
      },
      areaServed: [
        {
          '@type': 'Country',
          name: 'India'
        },
        {
          '@type': 'Country',
          name: 'Nepal'
        }
      ],
      sameAs: [],
      address: { '@type': 'PostalAddress', addressCountry: 'IN' }
    },
    {
      '@type': 'WebSite',
      name: 'Dermaclick',
      url: siteOrigin,
      description: '#1 clinical-grade skincare and haircare formulations with Niacinamide, Vitamin C, Keratin, Argan and more. Paraben-free, sulphate-free formulas designed for Indian and Nepali skin and hair concerns. Available in Kathmandu, Pokhara, Lalitpur, and across Nepal.',
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
      description: '#1 clinical-grade skincare and haircare brand offering paraben-free and sulphate-free products formulated with active ingredients like Niacinamide, Vitamin C, Kojic Acid, Keratin, and Argan. Available across India and Nepal including Kathmandu, Pokhara, Lalitpur.',
      telephone: site.phone,
      url: siteOrigin,
      address: { '@type': 'PostalAddress', addressCountry: 'IN' },
      areaServed: [
        {
          '@type': 'Country',
          name: 'India'
        },
        {
          '@type': 'Country',
          name: 'Nepal'
        },
        {
          '@type': 'AdministrativeArea',
          name: 'Bagmati Province',
          addressCountry: {
            '@type': 'Country',
            name: 'Nepal'
          }
        },
        {
          '@type': 'AdministrativeArea',
          name: 'Gandaki Province',
          addressCountry: {
            '@type': 'Country',
            name: 'Nepal'
          }
        }
      ],
      priceRange: '₹₹'
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    },
    {
      '@type': 'HowTo',
      name: 'How to Build a Skincare Routine for Indian and Nepali Skin',
      description: 'Step-by-step guide to building an effective skincare routine for Indian and Nepali skin types using Dermaclick clinical-grade formulations.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Cleanse',
          text: 'Start with a gentle face wash to remove dirt and impurities. Dermaclick Face Wash with Kojic Acid brightens while cleansing.',
          image: `${siteOrigin}/products/dermaclick-face-wash-7195924c.webp`
        },
        {
          '@type': 'HowToStep',
          name: 'Tone',
          text: 'Apply a toner to balance skin pH and prepare for serums. Dermaclick Rice Toner hydrates and nourishes.',
          image: `${siteOrigin}/products/dermaclick-rice-toner-f690787a.webp`
        },
        {
          '@type': 'HowToStep',
          name: 'Serum',
          text: 'Apply targeted serum for specific concerns. Use Vitamin C Serum for brightening or Kojic Acid Serum for pigmentation.',
          image: `${siteOrigin}/products/dermaclick-vitamin-c-serum-7647c73d.webp`
        },
        {
          '@type': 'HowToStep',
          name: 'Moisturize',
          text: 'Lock in hydration with a lightweight moisturizer suitable for Indian and Nepali climate.',
          image: `${siteOrigin}/products/dermaclick-moisturizer-1853e4e2.webp`
        },
        {
          '@type': 'HowToStep',
          name: 'Protect',
          text: 'Finish with sunscreen for broad-spectrum UV protection essential for Indian and Nepali sun exposure.',
          image: `${siteOrigin}/products/dermaclick-sunscreen-cream-b1daefb6.webp`
        }
      ]
    }
  ]
};

export default function Home() {
  useSeo({
    title: 'Dermaclick | #1 Clinical-Grade Skincare & Haircare Brand in India & Nepal',
    description: 'Dermaclick: #1 clinical-grade skincare and haircare brand in India and Nepal. Best skincare for Indian and Nepali skin. Available in Kathmandu, Pokhara, Lalitpur, and across Nepal. Formulated with Vitamin C, Niacinamide, Kojic Acid, Keratin, and Argan. Paraben-free, sulphate-free. Order online across India and Nepal. Free shipping available.',
    keywords: 'Dermaclick, best skincare India, best skincare Nepal, #1 skincare brand India, top skincare Nepal, skincare Kathmandu, skincare Pokhara, skincare Lalitpur, haircare India, haircare Nepal, Niacinamide, Vitamin C, Keratin, Argan, face wash India, moisturizer India, serum India, shampoo India, sunscreen India, hair mask India, Indian beauty brand, Nepali beauty brand, clinical skincare, paraben-free, sulphate-free, dermatologist recommended India, dermatologist recommended Nepal, skincare for Indian skin, skincare for Nepali skin, Kojic Acid, Alpha Arbutin, Hyaluronic Acid, Zinc PCA, Vitamin E, Rice Water, online skincare India, online skincare Nepal, buy skincare online India, buy skincare online Nepal, clinical-grade skincare, active ingredients skincare, Nepal skincare brand, best skincare in Nepal, skincare products Nepal, online shopping Nepal',
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
      <Faq />
      <FinalCta />
    </>
  );
}
