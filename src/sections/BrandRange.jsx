import { products, categories } from '../data/products';
import AmbientImage from '../components/AmbientImage';
import { useReveal } from '../hooks/useReveal';
import { categoryId } from '../utils/categoryId';
import { inCategory, categoryCover } from '../utils/catalogueViews';

const blurbs = {
  'Face Care': 'Daily essentials for cleansing, hydration, and brightening.',
  'Serum': 'Targeted treatments for specific skin concerns.',
  'Sun Care': 'Broad-spectrum protection for everyday sun safety.',
  'Hair Care': 'Nourishing formulations for hair health and styling.',
};
const coverIds = { 'Face Care': 'DC-17', 'Serum': 'DC-04', 'Sun Care': 'DC-03', 'Hair Care': 'DC-22' };
const words = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

export default function BrandRange() {
  const ref = useReveal();
  if (!categories.length) return null;
  const n = categories.length;
  const filter = (category) => (e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('filterCategory', { detail: category })); };
  return (
    <section id="range" className="sec range">
      <div className="wrap reveal" ref={ref}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Explore by category</p>
            <h2>{n > 1 && n < 10 ? `${words[n]} categories` : 'Categories'} for skin and hair care</h2>
          </div>
          <div className="section-aside">
            <p>From daily skincare essentials to targeted treatments and hair care, choose a category to see its formulations.</p>
            <a className="arrow-link" href="#products">View all products <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="range-grid">
          {categories.map((category) => {
            const count = inCategory(category).length;
            const cover = categoryCover(category, coverIds[category]);
            return (
              <a key={category} href={`#${categoryId(category)}`} className="range-tile" onClick={filter(category)}>
                {cover && <AmbientImage p={cover} decorative className="range-media" />}
                <div className="range-body">
                  <h3>{category}</h3>
                  {blurbs[category] && <p>{blurbs[category]}</p>}
                  <span className="tag">{String(count).padStart(2, '0')} {count === 1 ? 'product' : 'products'}</span>
                  <span className="arrow-link">View {category} <span aria-hidden="true">→</span></span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}