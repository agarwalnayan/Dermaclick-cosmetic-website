import { useParams } from 'react-router-dom';
import { categories, products } from '../data/products';
import { categoryId } from '../utils/categoryId';
import Collection from '../sections/Collection';
import { useSeo } from '../hooks/useSeo';
import { site } from '../config/site';
import { trackCategoryView } from '../utils/analytics';
import { useEffect } from 'react';

export default function CategoryPage() {
  const { categorySlug } = useParams();

  // Find the category from the slug
  const category = categories.find(c => categoryId(c) === categorySlug);

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
        description: `Browse ${category} products from Dermaclick, India's leading clinical-grade skincare and haircare brand. Formulated with active ingredients like Vitamin C, Niacinamide, Kojic Acid, Keratin, and Argan. Paraben-free, sulphate-free. Available across India and Nepal.`,
        url: `${siteOrigin}/category/${categorySlug}`,
        hasPart: categoryProducts.map(p => ({
          '@type': 'Product',
          name: p.name,
          url: `${siteOrigin}/products/${p.slug}`,
          image: p.image ? `${siteOrigin}${p.image}` : undefined,
          category: p.category,
          brand: { '@type': 'Brand', name: 'Dermaclick' }
        })),
        audience: {
          '@type': 'Audience',
          audienceType: 'Indian and Nepali consumers',
          geographicArea: ['IN', 'NP']
        }
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
            item: `${siteOrigin}/category/${categorySlug}`
          }
        ]
      },
      {
        '@type': 'ItemList',
        name: `${category} Products`,
        description: `Best ${category} products for Indian and Nepali skin and hair concerns`,
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
    title: `${category} Products | Dermaclick - Best Skincare & Haircare in India & Nepal`,
    description: `Buy ${category} products from Dermaclick, India's leading clinical-grade skincare and haircare brand. Formulated with active ingredients like Vitamin C, Niacinamide, Kojic Acid, Keratin, and Argan. Paraben-free, sulphate-free. Available across India and Nepal.`,
    keywords: `${category} India, ${category} Nepal, best ${category} India, buy ${category} online India, ${category} products India, clinical ${category}, dermatologist recommended ${category}, paraben-free ${category}, sulphate-free ${category}, Dermaclick ${category}`,
    path: `/category/${categorySlug}`,
    schema
  });

  return <Collection initialCategory={category} />;
}
