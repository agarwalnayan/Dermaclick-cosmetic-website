// To add an image: put it in src/assets/products/ and set image: new URL('../assets/products/x.webp', import.meta.url).href
// Data priority: localStorage (/local-admin, dev only) > src/data/products.json > an empty collection.
export const STORAGE_KEY = 'dermaclick.products.v1';
export const defaultProducts = [];
const fromStorage = () => { try { const a = JSON.parse(localStorage.getItem(STORAGE_KEY)); return Array.isArray(a) ? a : null; } catch { return null; } };
const fromFile = Object.values(import.meta.glob('./products.json', { eager: true, import: 'default' }))[0];
const storedProducts = fromStorage();
const source = storedProducts ?? (Array.isArray(fromFile) ? fromFile : defaultProducts);
const isTemplateProduct = (p) =>
  /^Product \d+$/i.test(p.name || '') ||
  /^Category [A-Z]$/i.test(p.category || '') ||
  /^Product description coming soon\.?$/i.test(p.description || '');
export const products = [...source]
  .filter((p) => !isTemplateProduct(p))
  .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
export const categories = [...new Set(products.map((p) => p.category?.trim()).filter(Boolean))];
