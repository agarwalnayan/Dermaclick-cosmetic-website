#!/usr/bin/env node
// Usage: node scripts/audit-catalogue.mjs [file] [--root dir] [--quiet]
// Audits the committed catalogue (default src/data/products.json). Exit 1 on publish-blocking errors.
// A missing products.json is NOT an error (the site then shows its empty-collection message).
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, rootDir, productsJsonPath, readCatalogueFile, auditForPublish } from './_shared.mjs';

const { flags, opts, pos } = parseArgs(process.argv.slice(2));
const root = rootDir(opts);
const file = pos[0] ? path.resolve(pos[0]) : productsJsonPath(root);
const say = (...a) => { if (!flags.has('quiet')) console.log(...a); };

if (!fs.existsSync(file)) { say(`catalogue audit: ${path.relative(process.cwd(), file)} not found - the site will show the empty collection state.`); process.exit(0); }
const r = readCatalogueFile(file);
if (!r.ok) { console.error(`catalogue audit FAILED: ${r.error}`); process.exit(1); }
const { base, errors, warnings } = auditForPublish(r.products, root);
const kinds = Object.entries(base.images).filter(([, n]) => n).map(([k, n]) => `${k}: ${n}`).join(', ') || 'none';
say(`Catalogue audit: ${path.relative(process.cwd(), file) || file}`);
say(`  total records        : ${base.total}`);
say(`  valid (publishable)  : ${base.valid}`);
say(`  placeholders         : ${base.placeholders} (hidden on the site)`);
say(`  incomplete essentials: ${base.incompleteEssential}`);
say(`  missing image        : ${base.missingImage}`);
say(`  duplicate ids/slugs  : ${base.duplicateIds.length}/${base.duplicateSlugs.length}`);
say(`  image references     : ${kinds}`);
if (warnings.length) { say(`\n${warnings.length} warning(s):`); warnings.slice(0, 60).forEach((w) => say('  - ' + w)); }
if (errors.length) { console.error(`\n${errors.length} ERROR(S) - fix before publishing:`); errors.slice(0, 60).forEach((e) => console.error('  - ' + e)); process.exit(1); }
say('\nAudit passed (no publish-blocking errors).');
