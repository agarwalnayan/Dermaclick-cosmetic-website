// Pure-logic tests: export, import validation, storage safety, loader priority, placeholder rules.
import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, buildExport, buildSelectedExport, productSelection, toggleProductSelection, resolveProductSelection, parseCatalogueText, planImport, saveCatalogue, resolveCatalogue, auditCatalogue, publicProducts, isPlaceholder, makeIdsUnique, hasDuplicateIds, backupFilename } from '../src/data/catalogue.js';
import { catalogue, product, placeholder, memStorage, PNG_DATA_URL } from './helpers.mjs';

test('1. export contains every product, valid formatted JSON, meaningful filename, summary', () => {
  const list = catalogue();
  const b = buildExport(list, new Date(2026, 9, 9, 18, 30));
  const parsed = JSON.parse(b.text);
  assert.equal(parsed.products.length, 4);
  assert.equal(parsed.count, 4);
  assert.equal(parsed.format, 'dermaclick-catalogue');
  assert.match(b.text, /\n  "products"/, 'pretty-printed');
  assert.equal(b.filename, 'dermaclick-products-backup-2026-10-09-1830.json');
  assert.equal(b.roundTripOk, true);
  assert.equal(b.summary.total, 4);
  assert.equal(b.summary.incomplete, 0);
});

test('2. export preserves all fields, unknown fields, ingredients and image refs (data URL and path) and does not mutate input', () => {
  const list = catalogue(); const before = JSON.stringify(list);
  const out = JSON.parse(buildExport(list).text).products;
  assert.deepEqual(out, list);
  assert.equal(out[1].image, PNG_DATA_URL);
  assert.equal(out[0].image, '/products/face-wash.webp');
  assert.deepEqual(out[1].extraUnknownField, { keep: 'me' });
  assert.equal(JSON.stringify(list), before, 'live catalogue untouched');
});

test('2b. previously exported plain-array files (legacy format) are still accepted', () => {
  const r = parseCatalogueText(JSON.stringify(catalogue(), null, 2));
  assert.equal(r.ok, true); assert.equal(r.format, 'array'); assert.equal(r.products.length, 4);
  const env = parseCatalogueText(buildExport(catalogue()).text);
  assert.equal(env.ok, true); assert.equal(env.format, 'envelope');
});

test('selective export: individual, all, none, and configured selection retain exact product records', () => {
  const list = [...catalogue(), placeholder(), null, product({ id: '', name: 'Incomplete', slug: '' })];
  assert.deepEqual([...productSelection(list, 'all')], ['DC-01', 'DC-02', 'DC-03', 'DC-04', 'DC-09']);
  assert.deepEqual([...productSelection(list, 'none')], []);
  assert.deepEqual([...productSelection(list, 'configured')], ['DC-01', 'DC-02', 'DC-03', 'DC-04']);

  const individual = toggleProductSelection(new Set(), 'DC-02');
  assert.deepEqual([...individual], ['DC-02']);
  assert.deepEqual([...toggleProductSelection(individual, 'DC-02')], []);

  const resolved = resolveProductSelection(list, new Set(['DC-02', 'DC-01']));
  assert.equal(resolved.ok, true);
  const selected = resolved.products;
  const result = buildSelectedExport(selected);
  const parsed = JSON.parse(result.text);
  assert.equal(result.filename, 'dermaclick-products-export.json');
  assert.equal(result.roundTripOk, true);
  assert.equal(parsed.count, 2);
  assert.deepEqual(parsed.products, selected);
  assert.equal(parsed.products[0].image, PNG_DATA_URL);
  assert.deepEqual(parsed.products[0].extraUnknownField, { keep: 'me' });
});

test('selecting eight configured products from an 18-card catalogue exports exactly eight JSON records', () => {
  const configured = Array.from({ length: 8 }, (_, index) => product({
    id: `DC-${String(index + 1).padStart(2, '0')}`,
    slug: `test-product-${index + 1}`,
    name: `Test Product ${index + 1}`,
    order: index + 1,
    image: index === 0 ? PNG_DATA_URL : `/products/test-${index + 1}.webp`,
    extraExportField: { index },
  }));
  const incomplete = Array.from({ length: 10 }, (_, index) => placeholder({
    id: `DC-${String(index + 9).padStart(2, '0')}`,
    slug: `placeholder-${index + 1}`,
  }));
  const list = [...configured, ...incomplete];
  const ids = productSelection(list, 'configured');
  assert.equal(list.length, 18);
  assert.equal(ids.size, 8);
  const selection = resolveProductSelection(list, ids);
  assert.equal(selection.ok, true);
  assert.equal(selection.products.length, 8);

  const result = buildSelectedExport(selection.products);
  const file = JSON.parse(result.text);
  assert.equal(result.roundTripOk, true);
  assert.equal(file.count, 8);
  assert.equal(file.products.length, 8);
  assert.deepEqual(file.products.map((entry) => entry.id), [...ids]);
  assert.equal(file.products[0].image, PNG_DATA_URL);
  assert.deepEqual(file.products[7].extraExportField, { index: 7 });
});

test('selection validation blocks empty, duplicate-ID, and unresolved selections', () => {
  assert.equal(resolveProductSelection(catalogue(), new Set()).ok, false);
  const duplicateIds = [product(), product({ name: 'Duplicate', slug: 'duplicate' })];
  assert.equal(productSelection(duplicateIds, 'all').size, 0);
  assert.equal(resolveProductSelection(duplicateIds, new Set(['DC-01'])).ok, false);
  assert.equal(resolveProductSelection(catalogue(), new Set(['not-stored'])).ok, false);
});

test('3. malformed JSON is rejected with a specific message and stored data is untouched', () => {
  const st = memStorage({ [STORAGE_KEY]: JSON.stringify(catalogue()) });
  const before = st.getItem(STORAGE_KEY);
  for (const bad of ['{oops', '', '   ', '[{"id":']) {
    const r = parseCatalogueText(bad);
    assert.equal(r.ok, false); assert.ok(r.error.length > 10);
  }
  assert.equal(st.getItem(STORAGE_KEY), before);
});

test('4. invalid catalogue structures are rejected', () => {
  assert.equal(parseCatalogueText('{"foo":1}').ok, false);
  assert.equal(parseCatalogueText('"text"').ok, false);
  assert.equal(parseCatalogueText('42').ok, false);
  assert.equal(parseCatalogueText('null').ok, false);
  assert.equal(parseCatalogueText('{"format":"dermaclick-catalogue","version":99,"products":[]}').ok, false);
  assert.equal(parseCatalogueText('{"format":"dermaclick-catalogue","version":1}').ok, false);
  const junk = planImport(catalogue(), [1, null, 'x']);
  assert.equal(junk.ok, false);
  assert.ok(junk.errors.some((e) => /not an object/.test(e)));
  const wrongTypes = planImport([], [product({ benefits: 'one string', ingredients: 'x', featured: 'yes' })]);
  assert.equal(wrongTypes.ok, false);
  assert.ok(wrongTypes.errors.length >= 3);
  const truncated = parseCatalogueText(JSON.stringify({ format: 'dermaclick-catalogue', version: 1, count: 16, products: [product()] }));
  assert.deepEqual(truncated.countMismatch, { declared: 16, actual: 1 });
  assert.equal(planImport(catalogue(), truncated.products, 'replace', truncated).ok, false, 'count mismatch blocks');
});

test('5. an empty import cannot wipe existing records', () => {
  const st = memStorage({ [STORAGE_KEY]: JSON.stringify(catalogue()) });
  const p = planImport(catalogue(), [], 'replace');
  assert.equal(p.ok, false);
  assert.match(p.errors[0], /erase your 4 current products/);
  assert.equal(JSON.parse(st.getItem(STORAGE_KEY)).length, 4);
  assert.equal(planImport([], [], 'replace').ok, false, 'nothing to import');
});

test('5b. replacing with fewer products is flagged as shrinking (UI requires explicit confirmation)', () => {
  const p = planImport(catalogue(), [product()], 'replace');
  assert.equal(p.ok, true); assert.equal(p.summary.shrinks, true); assert.equal(p.summary.removed, 4);
});

test('6. duplicate ids and duplicate slugs are detected', () => {
  const dup = [product(), product({ id: 'DC-01', slug: 'other' }), product({ id: 'DC-03', slug: 'face-wash' })];
  const a = auditCatalogue(dup);
  assert.deepEqual(a.duplicateIds, [{ value: 'DC-01', count: 2 }]);
  assert.deepEqual(a.duplicateSlugs, [{ value: 'face-wash', count: 2 }]);
  const p = planImport([], dup);
  assert.equal(p.ok, false);
  assert.ok(p.errors.some((e) => /Duplicate id "DC-01"/.test(e)) && p.errors.some((e) => /Duplicate slug "face-wash"/.test(e)));
});

test('6b. makeIdsUnique removes nothing and only renames later duplicates', () => {
  const dup = [product({ name: 'A' }), product({ name: 'B', slug: 'b' }), product({ name: 'C', slug: 'c' })];
  assert.equal(hasDuplicateIds(dup), true);
  const fixed = makeIdsUnique(dup);
  assert.equal(fixed.length, 3); assert.equal(hasDuplicateIds(fixed), false);
  assert.equal(fixed[0].id, 'DC-01'); assert.deepEqual(fixed.map((p) => p.name), ['A', 'B', 'C']);
});

test('7. incomplete records are kept and flagged, never silently dropped', () => {
  const list = [...catalogue(), { id: 'DC-05', slug: '', name: '', category: '' }];
  const b = buildExport(list);
  assert.equal(JSON.parse(b.text).products.length, 5, 'still in the backup');
  assert.equal(b.summary.incomplete, 1);
  assert.equal(b.summary.flagged.length, 1);
  assert.equal(b.summary.flagged[0].id, 'DC-05');
  const p = planImport([], list);
  assert.equal(p.ok, true, 'importable');
  assert.equal(p.next.length, 5);
  assert.ok(p.warnings.some((w) => /Missing name/.test(w)));
});

test('7b. placeholders are identified but not auto-deleted from imports/backups', () => {
  const list = [...catalogue(), placeholder()];
  assert.equal(buildExport(list).summary.placeholders, 1);
  const p = planImport([], list); assert.equal(p.ok, true); assert.equal(p.next.length, 5); assert.equal(p.summary.placeholders, 1);
});

test('8. storage write failures: quota error keeps previous data and reports failure', () => {
  const old = JSON.stringify(catalogue());
  const st = memStorage({ [STORAGE_KEY]: old });
  const realSet = st.setItem;
  st.setItem = () => { const e = new Error('full'); e.name = 'QuotaExceededError'; throw e; };
  const r = saveCatalogue(st, [product()]);
  assert.equal(r.ok, false); assert.equal(r.code, 'quota'); assert.match(r.error, /Nothing was changed/);
  assert.equal(st.getItem(STORAGE_KEY), old);
  st.setItem = realSet;
  assert.equal(saveCatalogue(st, [product()]).ok, true);
});

test('8b. a silent partial write is detected by read-back and the previous data is restored', () => {
  const old = JSON.stringify(catalogue());
  const st = memStorage({ [STORAGE_KEY]: old });
  const realSet = st.setItem; let first = true;
  st.setItem = (k, v) => { if (first) { first = false; realSet(k, v.slice(0, 10)); } else realSet(k, v); }; // truncates once, restore works
  const r = saveCatalogue(st, catalogue());
  assert.equal(r.ok, false); assert.equal(r.code, 'verify');
  assert.equal(st.getItem(STORAGE_KEY), old, 'previous dataset restored');
});

test('8c. unavailable storage and unserialisable data fail safely', () => {
  const broken = { getItem() { throw new Error('denied'); }, setItem() {}, removeItem() {} };
  assert.equal(saveCatalogue(broken, []).code, 'read');
  const circ = {}; circ.self = circ;
  assert.equal(saveCatalogue(memStorage(), circ).code, 'serialize');
});

test('9. loader: committed JSON is used when browser storage is absent', () => {
  const r = resolveCatalogue({ storageRaw: null, fileValue: catalogue(), useStorage: true });
  assert.equal(r.source, 'products.json'); assert.equal(r.raw.length, 4);
});

test('9b. loader: empty "[]", corrupt or non-array browser data never masks the committed file', () => {
  for (const raw of ['[]', '{bad', 'null', '{"a":1}', '""']) {
    const r = resolveCatalogue({ storageRaw: raw, fileValue: catalogue(), useStorage: true });
    assert.equal(r.source, 'products.json', `raw=${raw}`); assert.equal(r.raw.length, 4);
  }
});

test('9c. loader: production (useStorage=false) ignores browser storage entirely; dev prefers a non-empty browser copy', () => {
  const stored = JSON.stringify([product({ name: 'Browser only' })]);
  assert.equal(resolveCatalogue({ storageRaw: stored, fileValue: catalogue(), useStorage: false }).raw.length, 4);
  const dev = resolveCatalogue({ storageRaw: stored, fileValue: catalogue(), useStorage: true });
  assert.equal(dev.source, 'browser-storage'); assert.equal(dev.fileCount, 4);
  assert.equal(resolveCatalogue({}).source, 'empty');
  assert.equal(resolveCatalogue({ fileValue: { format: 'dermaclick-catalogue', version: 1, products: catalogue() } }).raw.length, 4, 'envelope also works as source');
});

test('13. placeholder filtering hides templates but never real products that kept leftover template text', () => {
  assert.equal(isPlaceholder(placeholder()), true);
  assert.equal(isPlaceholder(product({ name: 'Vitamin C Serum', description: 'Product description coming soon.' })), false, 'real name + leftover description stays visible');
  assert.equal(isPlaceholder(product({ category: 'Category B' })), false, 'real name + leftover category stays visible');
  assert.equal(isPlaceholder(product({ name: 'Product 07' })), true);
  const shown = publicProducts([...catalogue(), placeholder(), product({ id: 'DC-20', slug: 'x', name: 'Real', order: 99, description: 'Product description coming soon.' })]);
  assert.equal(shown.length, 5);
  assert.deepEqual(shown.map((p) => p.order).slice(0, 4), [1, 2, 3, 4]);
});

test('merge: adds only new products, never modifies or overwrites existing ones, reports conflicts', () => {
  const cur = catalogue();
  const incoming = [product({ name: 'CHANGED NAME' }), product({ id: 'DC-50', slug: 'moisturizer', name: 'Slug clash' }), product({ id: 'DC-60', slug: 'new-one', name: 'New One' })];
  const p = planImport(cur, incoming, 'merge');
  assert.equal(p.ok, true); assert.equal(p.summary.added, 1); assert.equal(p.summary.skipped, 2);
  assert.equal(p.next.length, 5);
  assert.deepEqual(p.next.slice(0, 4), cur, 'existing untouched');
  assert.equal(p.next[0].name, 'Face Wash');
});

test('filename helper', () => assert.match(backupFilename(new Date(2026, 0, 5, 7, 4)), /^dermaclick-products-backup-2026-01-05-0704\.json$/));
