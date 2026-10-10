// Product data source (see docs/CATALOGUE_WORKFLOW.md).
//   development: browser copy edited in /local-admin (non-empty) > src/data/products.json > empty
//   production : src/data/products.json ONLY (browser storage is never read on the live site)
// Images: use public paths such as /products/face-wash.webp (files live in public/products/).
import { STORAGE_KEY, resolveCatalogue, publicProducts, listCategories, normalizeRoot } from './catalogue';

export { STORAGE_KEY };
export const defaultProducts = [];

const fileValue = Object.values(import.meta.glob('./products.json', { eager: true, import: 'default' }))[0] ?? null;
const readStorage = () => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } };

const resolved = resolveCatalogue({ storageRaw: import.meta.env.DEV ? readStorage() : null, fileValue, useStorage: import.meta.env.DEV });
const fileNorm = fileValue == null ? null : normalizeRoot(fileValue);

// The committed catalogue (null when src/data/products.json is absent or unreadable).
export const committedProducts = fileNorm?.ok ? fileNorm.products : null;
export const catalogueInfo = { source: resolved.source, storedCount: resolved.storedCount, fileCount: resolved.fileCount };
export const products = publicProducts(resolved.raw);
export const categories = listCategories(products);

if (import.meta.env.DEV) console.info(`[dermaclick] catalogue source: ${resolved.source} (${products.length} public of ${resolved.raw.length} records)`);
