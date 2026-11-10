import { useParams } from 'react-router-dom';
import { categories, products } from '../data/products';
import { categoryId } from '../utils/categoryId';
import Collection from '../sections/Collection';
import { useSeo } from '../hooks/useSeo';
import { site } from '../config/site';

export default function CategoryPage() {
  const { categorySlug } = useParams();
  
  // Find the category from the slug
  const category = categories.find(c => categoryId(c) === categorySlug);
  
  if (!category) {
    return (
      <section className="wrap sec">
        <h1>Category not found</h1>
        <a href="/">Go home</a>
      </section>
    );
  }

  useSeo({
    title: `${category} | Dermaclick`,
    description: `Browse ${category} products from Dermaclick.`,
    path: `/category/${categorySlug}`
  });

  return <Collection initialCategory={category} />;
}
