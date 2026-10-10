import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// 1x1 transparent PNG (valid image, tiny)
export const PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
export const PNG_DATA_URL = `data:image/png;base64,${PNG_B64}`;

// Synthetic fixtures built from the verified reference details in the brief (not shipped as site data).
export const product = (o = {}) => ({
  id: 'DC-01', slug: 'face-wash', name: 'Face Wash', category: 'Cleansers', image: '/products/face-wash.webp', price: null, featured: true,
  tagline: 'Gentle daily cleanse', size: '100 ml', suitableFor: ['All skin types'], shortDescription: 'Brightening cleanser.', description: 'A cleanser with Kojic Acid, Alpha Arbutin and Niacinamide.',
  benefits: ['Brightens', 'Evens tone'], ingredients: [{ name: 'Kojic Acid', description: '' }, { name: 'Alpha Arbutin', description: '' }, { name: 'Niacinamide', description: '' }],
  seoTitle: 'Face Wash | Dermaclick', seoDescription: 'Brightening face wash.', seoKeywords: ['face wash', 'kojic acid'], order: 1, ...o,
});
export const catalogue = () => [
  product(),
  product({ id: 'DC-02', slug: 'moisturizer', name: 'Moisturizer', category: 'Moisturisers', image: PNG_DATA_URL, order: 2, featured: false, description: 'Hydration with Vitamin B3 and Vitamin E.', ingredients: [{ name: 'Vitamin B3', description: '' }, { name: 'Vitamin E', description: '' }], extraUnknownField: { keep: 'me' } }),
  product({ id: 'DC-03', slug: 'sunscreen', name: 'Sunscreen', category: 'Sun Care', image: '/products/sunscreen.webp', order: 3, featured: false, description: 'SPF 50, PA+++ with 1% Hyaluronic Acid.', ingredients: [{ name: '1% Hyaluronic Acid', description: '' }] }),
  product({ id: 'DC-04', slug: 'vitamin-c-serum', name: 'Vitamin C Serum', category: 'Serums', image: null, order: 4, featured: false, description: '10% Vitamin C serum.', ingredients: [{ name: '10% Vitamin C', description: '' }] }),
];
export const placeholder = (o = {}) => ({ id: 'DC-09', slug: 'product-09', name: 'Product 09', category: 'Category A', image: null, price: null, featured: false, order: 9, description: 'Product description coming soon.', seoKeywords: [], ...o });

export const memStorage = (initial = {}) => {
  const m = new Map(Object.entries(initial));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); }, _m: m };
};

// A disposable copy of the project (source only; node_modules is symlinked). Real files are never touched by tests.
export function tempProject({ products, images = [] } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-test-'));
  for (const f of ['src', 'public', 'scripts']) fs.cpSync(path.join(PROJECT, f), path.join(dir, f), { recursive: true });
  for (const f of ['index.html', 'package.json', 'vite.config.js']) fs.copyFileSync(path.join(PROJECT, f), path.join(dir, f));
  fs.rmSync(path.join(dir, 'src/data/products.json'), { force: true }); // never inherit a real catalogue
  fs.symlinkSync(path.join(PROJECT, 'node_modules'), path.join(dir, 'node_modules'), 'dir');
  if (products !== undefined) fs.writeFileSync(path.join(dir, 'src/data/products.json'), JSON.stringify(products, null, 2));
  for (const img of images) { fs.mkdirSync(path.dirname(path.join(dir, 'public', img)), { recursive: true }); fs.writeFileSync(path.join(dir, 'public', img), Buffer.from(PNG_B64, 'base64')); }
  return { dir, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}
