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
import { WhatsAppCta } from '../components/Cta';

const siteOrigin = site.url || (typeof window !== 'undefined' ? window.location.origin : '');

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Dermaclick',
      url: siteOrigin,
      logo: `${siteOrigin}/favicon.png`,
      description: 'Dermaclick is #1 clinical-grade skincare and haircare brand offering paraben-free, sulphate-free formulations with active ingredients like Niacinamide, Vitamin C, Kojic Acid, Keratin, Argan, and Hyaluronic Acid. Products include face wash, moisturizers, serums, shampoos, sunscreens and hair masks designed for Nepali and Indian skin and hair concerns. Available across Nepal and India including Kathmandu, Pokhara, Lalitpur.',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: site.phone,
        contactType: 'customer service',
        availableLanguage: 'English',
        areaServed: ['NP', 'IN']
      },
      areaServed: [
        {
          '@type': 'Country',
          name: 'Nepal'
        },
        {
          '@type': 'Country',
          name: 'India'
        }
      ],
      sameAs: [],
      address: { '@type': 'PostalAddress', addressCountry: 'NP' }
    },
    {
      '@type': 'WebSite',
      name: 'Dermaclick',
      url: siteOrigin,
      description: '#1 clinical-grade skincare and haircare formulations with Niacinamide, Vitamin C, Keratin, Argan and more. Paraben-free, sulphate-free formulas designed for Nepali and Indian skin and hair concerns. Available in Kathmandu, Pokhara, Lalitpur, and across Nepal.',
      publisher: { '@type': 'Organization', name: 'Dermaclick' }
    },
    {
      '@type': 'LocalBusiness',
      name: 'Dermaclick',
      description: '#1 clinical-grade skincare and haircare brand offering paraben-free and sulphate-free products formulated with active ingredients like Niacinamide, Vitamin C, Kojic Acid, Keratin, and Argan. Available across Nepal and India including Kathmandu, Pokhara, Lalitpur.',
      telephone: site.phone,
      url: siteOrigin,
      address: { '@type': 'PostalAddress', addressCountry: 'NP' },
      areaServed: [
        {
          '@type': 'Country',
          name: 'Nepal'
        },
        {
          '@type': 'Country',
          name: 'India'
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
      ]
    },
    {
      '@type': 'LocalBusiness',
      name: 'Dermaclick India',
      description: '#1 clinical-grade skincare and haircare brand offering paraben-free and sulphate-free products formulated with active ingredients like Niacinamide, Vitamin C, Kojic Acid, Keratin, and Argan. Available across India.',
      telephone: site.phone,
      url: siteOrigin,
      address: { '@type': 'PostalAddress', addressCountry: 'IN' },
      areaServed: {
        '@type': 'Country',
        name: 'India'
      }
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
      name: 'How to Build a Skincare Routine for Nepali Skin',
      description: 'Step-by-step guide to building an effective skincare routine for Nepali skin types using Dermaclick clinical-grade formulations, available across Nepal.',
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
          text: 'Lock in hydration with a lightweight moisturizer suitable for the Nepali climate.',
          image: `${siteOrigin}/products/dermaclick-moisturizer-1853e4e2.webp`
        },
        {
          '@type': 'HowToStep',
          name: 'Protect',
          text: 'Finish with sunscreen for broad-spectrum UV protection, essential for sun exposure in Nepal.',
          image: `${siteOrigin}/products/dermaclick-sunscreen-cream-b1daefb6.webp`
        }
      ]
    }
  ]
};

export default function Home() {
  useSeo({
    title: 'Dermaclick | Clinical-Grade Skincare & Haircare Brand in Nepal',
    description: 'Dermaclick: clinical-grade skincare and haircare brand in Nepal. Best skincare for Nepali skin. Available in Kathmandu, Pokhara, Lalitpur, and delivered across Nepal. Formulated with Vitamin C, Niacinamide, Kojic Acid, Keratin, and Argan. Paraben-free, sulphate-free. Enquire on WhatsApp.',
    keywords: 'Dermaclick, Dermaclick Nepal, best skincare Nepal, skincare Kathmandu, skincare Pokhara, skincare Lalitpur, haircare Nepal, Niacinamide, Vitamin C, Keratin, Argan, face wash Nepal, moisturizer Nepal, serum Nepal, shampoo Nepal, sunscreen Nepal, hair mask Nepal, Nepali beauty brand, clinical skincare, paraben-free, sulphate-free, skincare for Nepali skin, Kojic Acid, Hyaluronic Acid, skincare products Nepal, Dermaclick skincare products',
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
      <section className="wrap sec nepal-section">
        <div className="nepal-content">
          <h2>Dermaclick Nepal</h2>
          <p className="lead">#1 Clinical-Grade Skincare & Haircare Brand in Nepal</p>
          <p>Available in Kathmandu, Pokhara, Lalitpur, and across Nepal</p>
          <div className="nepal-features">
            <div className="nepal-feature">
              <h3>✓ Available Nationwide</h3>
              <p>We deliver across Nepal including Kathmandu, Pokhara, Lalitpur, Biratnagar, and all major cities.</p>
            </div>
            <div className="nepal-feature">
              <h3>✓ Clinical-Grade Formulations</h3>
              <p>Formulated with active ingredients like Vitamin C, Niacinamide, Kojic Acid, Keratin, and Argan for Nepali skin.</p>
            </div>
            <div className="nepal-feature">
              <h3>✓ Paraben-Free & Sulphate-Free</h3>
              <p>Safe, gentle formulations without harmful chemicals. Perfect for sensitive Nepali skin.</p>
            </div>
            <div className="nepal-feature">
              <h3>✓ Suitable for Nepali Climate</h3>
              <p>Designed for tropical weather and sun exposure common in Nepal. Provides UV protection and hydration.</p>
            </div>
          </div>
          <div className="nepal-cta">
            <WhatsAppCta location="nepal" variant="gold">Order on WhatsApp</WhatsAppCta>
          </div>
        </div>
      </section>
      <Faq />
      <FinalCta />
    </>
  );
}
