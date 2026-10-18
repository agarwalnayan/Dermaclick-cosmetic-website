#!/usr/bin/env node
// Usage: node scripts/promote-catalogue.mjs <export.json> [--dry-run] [--merge] [--allow-shrink] [--allow-incomplete] [--root dir]
// Safely promotes a Local Admin export into the tracked src/data/products.json:
//  - validates first, never partially writes
//  - refuses to REPLACE a larger catalogue with a smaller one unless --allow-shrink
//  - extracts embedded base64 images to public/products/ and rewrites the references
//  - backs up the existing products.json to catalogue-backups/ before overwriting
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { planImport } from '../src/data/catalogue.js';
import { parseArgs, rootDir, productsJsonPath, readCatalogueFile, auditForPublish } from './_shared.mjs';

const { flags, opts, pos } = parseArgs(process.argv.slice(2));
const root = rootDir(opts), dry = flags.has('dry-run'), mergeMode = flags.has('merge');
const die = (m) => { console.error(`\nPROMOTE REFUSED: ${m}\nNothing was changed.`); process.exit(1); };
if (!pos[0]) die('give the exported JSON file: node scripts/promote-catalogue.mjs <export.json>');

const incoming = readCatalogueFile(path.resolve(pos[0]));
if (!incoming.ok) die(incoming.error);
const target = productsJsonPath(root);
let current = [];
if (fs.existsSync(target)) { const c = readCatalogueFile(target); if (!c.ok) die(`existing ${target} is unreadable (${c.error}). Fix or move it manually first.`); current = c.products; }

// Extract embedded images (decode -> public/products/<slug>-<hash>.<ext>); input objects are not mutated.
const EXT = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/avif': 'avif' };
const writes = [];
const extractImage = (p) => {
  const m = typeof p?.image === 'string' && /^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i.exec(p.image);
  if (!m) return p;
  const ext = EXT[m[1].toLowerCase()];
  if (!ext) die(`product "${p.name || p.id}" has an unsupported embedded image type ${m[1]}.`);
  const buf = Buffer.from(m[2].replace(/\s/g, ''), 'base64');
  if (!buf.length) die(`product "${p.name || p.id}" has an empty embedded image.`);
  const slug = String(p.slug || 'product').replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'product';
  const name = `${slug}-${crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8)}.${ext}`;
  writes.push({ file: path.join(root, 'public', 'products', name), buf });
  return { ...p, image: `/products/${name}` };
};

let out, mergeSummary = null;
if (mergeMode) {
  const validation = planImport([], incoming.products, 'replace', incoming);
  if (!validation.ok) die('the file has blocking problems:\n  - ' + validation.errors.join('\n  - '));
  const mergeProducts = incoming.products.map(extractImage);
  out = [...current];
  mergeSummary = { added: 0, updated: 0, skipped: 0 };
  for (const product of mergeProducts) {
    const byId = product?.id ? out.flatMap((existing, index) => existing?.id === product.id ? [index] : []) : [];
    const bySlug = product?.slug ? out.flatMap((existing, index) => existing?.slug === product.slug ? [index] : []) : [];
    if (byId.length > 1 || bySlug.length > 1) die(`the existing catalogue has ambiguous matches for "${product.name || product.id}". Fix duplicate ids/slugs before merging.`);
    if (byId.length && bySlug.length && byId[0] !== bySlug[0]) die(`"${product.name || product.id}" matches different existing products by id and slug. Resolve the identity conflict before merging.`);

    const match = byId[0] ?? bySlug[0];
    if (match === undefined) {
      out.push(product);
      mergeSummary.added++;
      continue;
    }

    const existing = out[match];
    const updated = { ...existing, ...product };
    if ((product.image == null || product.image === '') && existing.image != null && existing.image !== '') updated.image = existing.image;
    if (isDeepStrictEqual(existing, updated)) mergeSummary.skipped++;
    else { out[match] = updated; mergeSummary.updated++; }
  }
  const finalPlan = planImport([], out, 'replace');
  if (!finalPlan.ok) die('the merged catalogue has blocking problems:\n  - ' + finalPlan.errors.join('\n  - '));
} else {
  const plan = planImport(current, incoming.products, 'replace', incoming);
  if (!plan.ok) die('the file has blocking problems:\n  - ' + plan.errors.join('\n  - '));
  if (incoming.products.length < current.length && !flags.has('allow-shrink')) die(`the file has ${incoming.products.length} products but the committed catalogue has ${current.length}. This looks like an incomplete export. Re-export from the correct browser/port, or pass --allow-shrink if you really intend to remove products.`);
  out = incoming.products;
}

if (!mergeMode) out = out.map(extractImage);

// Publish audit must consider the images we are about to write.
const pending = new Set(writes.map((w) => w.file));
const { base, errors, warnings } = auditForPublish(out, root);
const realErrors = errors.filter((e) => { const m = /image file missing: (public.+)$/.exec(e); return !(m && pending.has(path.join(root, m[1]))); });
const essential = realErrors.filter((e) => !/Duplicate|image/.test(e));
if (realErrors.length && !(flags.has('allow-incomplete') && realErrors.length === essential.length)) die('publish audit found errors:\n  - ' + realErrors.join('\n  - ') + (essential.length === realErrors.length ? '\n(pass --allow-incomplete to promote records with missing name/category/slug; they will not render correctly)' : ''));

console.log(`Records: ${out.length} (current committed: ${current.length}) | placeholders: ${base.placeholders} | embedded images to extract: ${writes.length} | warnings: ${warnings.length}`);
if (mergeSummary) console.log(`Merge: ${mergeSummary.added} to add | ${mergeSummary.updated} to update | ${mergeSummary.skipped} unchanged/skipped`);
warnings.slice(0, 20).forEach((w) => console.log('  warning: ' + w));
if (dry) { console.log('\n--dry-run: no files were written.'); process.exit(0); }

if (fs.existsSync(target)) {
  const dir = path.join(root, 'catalogue-backups');
  fs.mkdirSync(dir, { recursive: true });
  const b = path.join(dir, `products-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.copyFileSync(target, b);
  console.log(`Backed up previous catalogue -> ${path.relative(root, b)}`);
}
for (const w of writes) { fs.mkdirSync(path.dirname(w.file), { recursive: true }); if (!fs.existsSync(w.file)) fs.writeFileSync(w.file, w.buf); }
fs.mkdirSync(path.dirname(target), { recursive: true });
const tmp = target + '.tmp';
fs.writeFileSync(tmp, JSON.stringify(out, null, 2) + '\n');
fs.renameSync(tmp, target); // atomic replace
console.log(`Wrote ${path.relative(root, target)} (${out.length} products) and ${writes.length} image file(s) in public/products/.\nNext: npm run catalogue:audit && npm run build && git add src/data/products.json public/products && git commit`);
