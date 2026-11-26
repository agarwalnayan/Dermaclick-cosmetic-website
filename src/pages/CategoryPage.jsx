import { useParams } from 'react-router-dom';
import { categories, products } from '../data/products';
import { categorySlug } from '../utils/categorySlug';
import Collection from '../sections/Collection';
import { useSeo } from '../hooks/useSeo';
import { site } from '../config/site';
import { trackCategoryView } from '../utils/analytics';
import { useEffect } from 'react';

export default function CategoryPage() {
  const { categorySlug: categorySlugParam } = useParams();

  // Find the category from the slug
  const category = categories.find(c => categorySlug(c) === categorySlugParam);

  useEffect(() => {
    if (category) {
      trackCategoryView(category);
    }
  }, [category]);

  if (!category) {
    return (
      <section className="wrap sec">
        <h1>Category not found</h1>
        <a href="/">Go home</a>
      </section>
    );
  }

  const siteOrigin = site.url || (typeof window !== 'undefined' ? window.location.origin : '');
  const categoryProducts = products.filter(p => p.category === category);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `${category} Products - Dermaclick`,
        description: `Browse ${category} products from Dermaclick, a clinical-grade skincare and haircare brand in Nepal. Formulated with active ingredients like Vitamin C, Niacinamide, Kojic Acid, Keratin, and Argan. Paraben-free, sulphate-free. Available across Nepal.`,
        url: `${siteOrigin}/category/${categorySlugParam}`,
        hasPart: categoryProducts.map(p => ({
          '@type': 'Product',
          name: p.name,
          url: `${siteOrigin}/products/${p.slug}`,
          image: p.image ? `${siteOrigin}${p.image}` : undefined,
          category: p.category,
          brand: { '@type': 'Brand', name: 'Dermaclick' }
        }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteOrigin
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: category,
            item: `${siteOrigin}/category/${categorySlugParam}`
          }
        ]
      },
      {
        '@type': 'ItemList',
        name: `${category} Products`,
        description: `${category} products for Nepali skin and hair concerns`,
        itemListElement: categoryProducts.map((p, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: p.name,
            url: `${siteOrigin}/products/${p.slug}`,
            image: p.image ? `${siteOrigin}${p.image}` : undefined
          }
        }))
      }
    ]
  };

  useSeo({
    title: `${category} Products | Dermaclick - Skincare & Haircare in Nepal`,
    description: `Explore ${category} products from Dermaclick, a clinical-grade skincare and haircare brand in Nepal. Available in Kathmandu, Pokhara, Lalitpur, and delivered across Nepal. Formulated with active ingredients like Vitamin C, Niacinamide, Kojic Acid, Keratin, and Argan. Paraben-free, sulphate-free. Enquire on WhatsApp.`,
    keywords: `${category} Nepal, ${category} Kathmandu, ${category} Pokhara, ${category} Lalitpur, best ${category} Nepal, ${category} products Nepal, Dermaclick ${category}, clinical ${category}, dermatologist recommended ${category}, paraben-free ${category}, sulphate-free ${category}, skincare Nepal, beauty products Nepal, Dermaclick Nepal, ${category} India`,
    path: `/category/${categorySlugParam}`,
    schema
  });

  return <Collection initialCategory={category} />;
}
