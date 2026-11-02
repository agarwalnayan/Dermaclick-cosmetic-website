import { products } from '../data/products';
 
export const inCategory = (category) => products.filter((p) => p.category?.trim() === category);
 
// One product per distinct category first (so a short list shows range, not three near-duplicates), then fill.
export function pickFeatured(n = 3) {
  const pool = (products.some((p) => p.featured) ? products.filter((p) => p.featured) : products)
    .slice().sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const picked = [];
  const seen = new Set();
  for (const p of pool) if (!seen.has(p.category) && picked.length < n) { picked.push(p); seen.add(p.category); }
  for (const p of pool) if (!picked.includes(p) && picked.length < n) picked.push(p);
  return picked;
}
 
// The product whose photograph represents a category: a preferred id when present, else the first with an image.
export function categoryCover(category, preferredId) {
  const list = inCategory(category);
  return list.find((p) => p.id === preferredId) || list.find((p) => p.image) || list[0];
}
 
export const humanList = (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);