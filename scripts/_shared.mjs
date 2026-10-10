// Shared helpers for the catalogue CLI scripts. Node only, no dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditCatalogue, imageKind, isPlaceholder, normalizeRoot } from '../src/data/catalogue.js';

export const parseArgs = (argv) => {
  const flags = new Set(), opts = {}, pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') opts.root = argv[++i];
    else if (a.startsWith('--')) flags.add(a.slice(2));
    else pos.push(a);
  }
  return { flags, opts, pos };
};
export const rootDir = (opts) => path.resolve(opts.root || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
export const productsJsonPath = (root) => path.join(root, 'src', 'data', 'products.json');

// Publish-grade audit: structure/essential problems and unusable images are ERRORS; the rest are warnings.
export function auditForPublish(products, root) {
  const base = auditCatalogue(products);
  const errors = [], warnings = [];
  const label = (r) => `#${r.index + 1} ${r.name ? `"${r.name}"` : r.id || '(unnamed)'}`;
  base.records.forEach((r) => r.issues.forEach((i) => {
    if (i.level === 'structure' || i.level === 'essential') errors.push(`${label(r)}: ${i.msg}`);
    else if (i.field === 'seo' || i.field === '(record)') warnings.push(`${label(r)}: ${i.msg}`);
    else if (i.field === 'image' || i.field === 'description') warnings.push(`${label(r)}: ${i.msg}`);
  }));
  base.duplicateIds.forEach((d) => errors.push(`Duplicate id "${d.value}" x${d.count}.`));
  base.duplicateSlugs.forEach((d) => errors.push(`Duplicate slug "${d.value}" x${d.count}.`));
  products.forEach((p, idx) => {
    if (!p || typeof p !== 'object') return;
    const r = { index: idx, name: p.name, id: p.id };
    const kind = imageKind(p.image);
    if (kind === 'data-url') warnings.push(`${label(r)}: image is an embedded base64 data URL (bloats the JS bundle). Run catalogue:promote to extract it to public/products/.`);
    else if (kind === 'remote-url') warnings.push(`${label(r)}: image is a remote URL (${p.image}); it must stay online and is outside this project.`);
    else if (kind === 'relative-path') errors.push(`${label(r)}: image "${p.image}" is a relative/local path that will not exist in production. Use /products/<file> in public/products/.`);
    else if (kind === 'public-path') {
      const clean = p.image.split(/[?#]/)[0];
      const abs = path.resolve(root, 'public', '.' + clean);
      if (!abs.startsWith(path.resolve(root, 'public') + path.sep)) errors.push(`${label(r)}: image path "${p.image}" escapes the public folder.`);
      else if (!fs.existsSync(abs)) errors.push(`${label(r)}: image file missing: public${clean}`);
    }
  });
  return { base, errors, warnings };
}

export function readCatalogueFile(file) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { return { ok: false, error: `Cannot read ${file}: ${e.message}` }; }
  let value;
  try { value = JSON.parse(text.replace(/^\uFEFF/, '')); } catch (e) { return { ok: false, error: `${file} is not valid JSON: ${e.message}` }; }
  const n = normalizeRoot(value);
  return n.ok ? { ok: true, ...n } : { ok: false, error: n.error };
}
export { isPlaceholder };
