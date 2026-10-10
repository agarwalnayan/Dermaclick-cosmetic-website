// Pure catalogue logic shared by the site, /local-admin, scripts/*.mjs and tests.
// No import.meta / DOM access here, so it runs unchanged in Node.

export const STORAGE_KEY = 'dermaclick.products.v1';
export const EXPORT_FORMAT = 'dermaclick-catalogue';
export const EXPORT_VERSION = 1;
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const PLACEHOLDER_DESCRIPTION = /^Product description coming soon\.?$/i;

const isStr = (v) => typeof v === 'string';
const blank = (v) => !isStr(v) || !v.trim();
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const STRING_FIELDS = ['id', 'slug', 'name', 'category', 'tagline', 'size', 'shortDescription', 'description', 'seoTitle', 'seoDescription'];
const STRING_ARRAY_FIELDS = ['suitableFor', 'benefits', 'seoKeywords'];

/* ---------- placeholder detection ---------- */
// Hidden on the public site only when the record is *clearly* template data:
// a template name ("Product 05"), or template category AND template description together.
// A real product that merely kept one leftover template value is shown and flagged for review.
export const placeholderSignals = (p) => ({
  name: /^Product \d+$/i.test(p?.name || ''),
  category: /^Category [A-Z]$/i.test(p?.category || ''),
  description: PLACEHOLDER_DESCRIPTION.test(p?.description || ''),
});
export const isPlaceholder = (p) => {
  const s = placeholderSignals(p);
  return s.name || (s.category && s.description);
};
export const hasPlaceholderResidue = (p) => {
  const s = placeholderSignals(p);
  return !isPlaceholder(p) && (s.category || s.description);
};

/* ---------- root normalisation / parsing ---------- */
// Accepts a plain array (legacy exports, src/data/products.json) or the versioned envelope.
export function normalizeRoot(value) {
  if (Array.isArray(value)) return { ok: true, products: value, format: 'array', version: null };
  if (isObj(value) && value.format === EXPORT_FORMAT) {
    if (typeof value.version !== 'number' || value.version > EXPORT_VERSION) return { ok: false, error: `Unsupported export version "${value.version}" (this app understands up to ${EXPORT_VERSION}).` };
    if (!Array.isArray(value.products)) return { ok: false, error: 'Export envelope has no "products" array.' };
    const out = { ok: true, products: value.products, format: 'envelope', version: value.version };
    if (typeof value.count === 'number' && value.count !== value.products.length) out.countMismatch = { declared: value.count, actual: value.products.length };
    return out;
  }
  return { ok: false, error: 'File root must be an array of products or a Dermaclick export ({"format":"dermaclick-catalogue",...}). Found ' + (isObj(value) ? 'an unrelated object.' : typeof value + '.') };
}
export function parseCatalogueText(text) {
  if (!isStr(text) || !text.trim()) return { ok: false, error: 'The file is empty.' };
  let value;
  try { value = JSON.parse(text.replace(/^\uFEFF/, '')); } catch (e) { return { ok: false, error: `Not valid JSON: ${e.message}` }; }
  return normalizeRoot(value);
}

/* ---------- per-record and catalogue audit ---------- */
// Issue levels: 'structure' (breaks the admin/site), 'essential' (cannot be published), 'review' (optional/cosmetic).
export function auditProduct(p) {
  const issues = [];
  const add = (level, field, msg) => issues.push({ level, field, msg });
  if (!isObj(p)) { add('structure', '(record)', 'Record is not an object.'); return issues; }
  for (const f of STRING_FIELDS) if (p[f] != null && !isStr(p[f])) add('structure', f, `"${f}" must be text.`);
  for (const f of STRING_ARRAY_FIELDS) if (p[f] != null && (!Array.isArray(p[f]) || p[f].some((x) => !isStr(x)))) add('structure', f, `"${f}" must be a list of text values.`);
  if (p.ingredients != null && (!Array.isArray(p.ingredients) || p.ingredients.some((g) => !isObj(g) || !isStr(g.name) || (g.description != null && !isStr(g.description))))) add('structure', 'ingredients', '"ingredients" must be a list of {name, description}.');
  if (p.image != null && !isStr(p.image)) add('structure', 'image', '"image" must be text or null.');
  if (p.featured != null && typeof p.featured !== 'boolean') add('structure', 'featured', '"featured" must be true/false.');
  if (p.order != null && p.order !== '' && !Number.isFinite(Number(p.order))) add('structure', 'order', '"order" must be a number.');
  if (blank(p.id)) add('structure', 'id', 'Missing id.');
  if (blank(p.name)) add('essential', 'name', 'Missing name.');
  if (blank(p.category)) add('essential', 'category', 'Missing category.');
  if (blank(p.slug)) add('essential', 'slug', 'Missing slug (the product page cannot be routed).');
  else if (isStr(p.slug) && !SLUG_RE.test(p.slug)) add('essential', 'slug', `Slug "${p.slug}" is not URL-safe (use lowercase letters, digits and hyphens).`);
  if (isPlaceholder(p)) add('review', '(record)', 'Looks like template placeholder data (hidden on the public site).');
  else if (hasPlaceholderResidue(p)) add('review', '(record)', 'Contains leftover template text (category or description) - please review.');
  if (blank(p.description)) add('review', 'description', 'No description.');
  if (blank(p.image)) add('review', 'image', 'No image.');
  if (blank(p.seoTitle) || blank(p.seoDescription)) add('review', 'seo', 'SEO title or description is missing.');
  return issues;
}
export const imageKind = (img) => (blank(img) ? 'none' : /^data:image\//i.test(img) ? 'data-url' : /^https?:\/\//i.test(img) ? 'remote-url' : img.startsWith('/') ? 'public-path' : 'relative-path');

export function auditCatalogue(products) {
  const list = Array.isArray(products) ? products : [];
  const idCount = new Map(), slugCount = new Map();
  list.forEach((p) => {
    if (!isObj(p)) return;
    if (!blank(p.id)) idCount.set(p.id, (idCount.get(p.id) || 0) + 1);
    if (!blank(p.slug)) slugCount.set(p.slug, (slugCount.get(p.slug) || 0) + 1);
  });
  const duplicateIds = [...idCount].filter(([, n]) => n > 1).map(([v, n]) => ({ value: v, count: n }));
  const duplicateSlugs = [...slugCount].filter(([, n]) => n > 1).map(([v, n]) => ({ value: v, count: n }));
  const records = list.map((p, index) => ({ index, id: isObj(p) ? p.id : undefined, name: isObj(p) ? p.name : undefined, issues: auditProduct(p) }));
  const has = (r, level) => r.issues.some((i) => i.level === level);
  const images = { none: 0, 'data-url': 0, 'remote-url': 0, 'public-path': 0, 'relative-path': 0 };
  list.forEach((p) => { images[imageKind(isObj(p) ? p.image : null)]++; });
  return {
    total: list.length,
    structureErrors: records.filter((r) => has(r, 'structure')).length,
    incompleteEssential: records.filter((r) => has(r, 'essential') || has(r, 'structure')).length,
    placeholders: list.filter((p) => isObj(p) && isPlaceholder(p)).length,
    placeholderResidue: list.filter((p) => isObj(p) && hasPlaceholderResidue(p)).length,
    missingImage: images.none,
    images,
    duplicateIds, duplicateSlugs,
    valid: records.filter((r) => !has(r, 'structure') && !has(r, 'essential') && !isPlaceholder(list[r.index])).length,
    records,
  };
}

/* ---------- loader used by src/data/products.js ---------- */
const parseStored = (raw) => {
  if (raw == null) return null;
  try { const n = normalizeRoot(JSON.parse(raw)); return n.ok && n.products.length ? n.products : null; } catch { return null; }
};
// Priority: browser copy (dev only, non-empty) > committed products.json > nothing.
// An EMPTY or corrupt browser copy never masks the committed file.
export function resolveCatalogue({ storageRaw = null, fileValue = null, useStorage = false } = {}) {
  const stored = useStorage ? parseStored(storageRaw) : null;
  const fileNorm = fileValue == null ? null : normalizeRoot(fileValue);
  const file = fileNorm?.ok ? fileNorm.products : null;
  if (stored) return { source: 'browser-storage', raw: stored, storedCount: stored.length, fileCount: file ? file.length : null };
  if (file) return { source: 'products.json', raw: file, storedCount: null, fileCount: file.length };
  return { source: 'empty', raw: [], storedCount: null, fileCount: null };
}
export const sortByOrder = (a) => [...a].sort((x, y) => (x?.order ?? 9999) - (y?.order ?? 9999));
export const publicProducts = (raw) => sortByOrder(raw.filter((p) => isObj(p) && !isPlaceholder(p)));
export const listCategories = (products) => [...new Set(products.map((p) => (isStr(p.category) ? p.category.trim() : '')).filter(Boolean))];

/* ---------- export ---------- */
const pad = (n) => String(n).padStart(2, '0');
export const backupFilename = (d = new Date()) => `dermaclick-products-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.json`;
// Never filters, reorders or rewrites records: the backup is the exact current catalogue.
export function buildExport(products, now = new Date()) {
  const list = Array.isArray(products) ? products : [];
  const audit = auditCatalogue(list);
  const envelope = { format: EXPORT_FORMAT, version: EXPORT_VERSION, exportedAt: now.toISOString(), count: list.length, products: list };
  const text = JSON.stringify(envelope, null, 2);
  const check = parseCatalogueText(text); // round-trip verification
  const roundTripOk = check.ok && check.products.length === list.length && !check.countMismatch;
  return {
    filename: backupFilename(now), text, roundTripOk,
    summary: {
      total: audit.total, incomplete: audit.incompleteEssential, placeholders: audit.placeholders, placeholderResidue: audit.placeholderResidue,
      duplicateIds: audit.duplicateIds.length, duplicateSlugs: audit.duplicateSlugs.length, dataUrlImages: audit.images['data-url'], bytes: text.length,
      flagged: audit.records.filter((r) => r.issues.some((i) => i.level !== 'review' || i.field === '(record)')).map((r) => ({ id: r.id, name: r.name, issues: r.issues.filter((i) => i.level !== 'review' || i.field === '(record)').map((i) => i.msg) })),
    },
  };
}

/* ---------- import planning (never writes anything) ---------- */
export function planImport(current, incoming, mode = 'replace', meta = {}) {
  const cur = Array.isArray(current) ? current : [];
  const errors = [], warnings = [];
  if (meta.countMismatch) errors.push(`File declares ${meta.countMismatch.declared} products but contains ${meta.countMismatch.actual} - it may be truncated.`);
  if (!Array.isArray(incoming)) return { ok: false, errors: ['No product list found.'], warnings, summary: {} };
  if (incoming.length === 0) {
    errors.push(cur.length ? `The file contains 0 products. Importing it would erase your ${cur.length} current products, so it is blocked.` : 'The file contains 0 products - nothing to import.');
  }
  const audit = auditCatalogue(incoming);
  audit.records.forEach((r) => r.issues.forEach((i) => {
    const who = `Record ${r.index + 1}${r.name ? ` ("${r.name}")` : ''}`;
    if (i.level === 'structure') errors.push(`${who}: ${i.msg}`);
    else if (i.level === 'essential' || (i.level === 'review' && i.field === '(record)')) warnings.push(`${who}: ${i.msg}`);
  }));
  audit.duplicateIds.forEach((d) => errors.push(`Duplicate id "${d.value}" appears ${d.count} times.`));
  audit.duplicateSlugs.forEach((d) => errors.push(`Duplicate slug "${d.value}" appears ${d.count} times.`));
  let next = incoming, added = incoming.length, skipped = [];
  if (mode === 'merge') {
    const ids = new Set(cur.map((p) => p?.id)), slugs = new Set(cur.map((p) => p?.slug));
    const fresh = [];
    incoming.forEach((p) => {
      if (isObj(p) && (ids.has(p.id) || slugs.has(p.slug))) skipped.push({ id: p.id, name: p.name, reason: ids.has(p.id) ? 'id already exists' : 'slug already exists' });
      else fresh.push(p);
    });
    skipped.forEach((s) => warnings.push(`Skipped "${s.name || s.id}": ${s.reason} (existing product kept unchanged).`));
    next = [...cur, ...fresh]; added = fresh.length;
  }
  return {
    ok: errors.length === 0, errors, warnings, mode, next, skipped,
    summary: { incoming: incoming.length, current: cur.length, resulting: next.length, added, skipped: skipped.length, removed: mode === 'replace' ? cur.length : 0, shrinks: next.length < cur.length, placeholders: audit.placeholders, incomplete: audit.incompleteEssential },
  };
}

/* ---------- safe, verified storage writes ---------- */
const isQuota = (e) => e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014);
// Returns {ok:true} only after the value has been written AND read back identically.
// On any failure the previous value is restored (or left alone) and the reason is returned.
export function saveCatalogue(storage, products, key = STORAGE_KEY) {
  let json;
  try { json = JSON.stringify(products); } catch (e) { return { ok: false, code: 'serialize', error: `Could not serialise the catalogue: ${e.message}` }; }
  let previous;
  try { previous = storage.getItem(key); } catch (e) { return { ok: false, code: 'read', error: `Browser storage is unavailable: ${e.message}` }; }
  const restore = () => { try { if (previous == null) storage.removeItem(key); else if (storage.getItem(key) !== previous) storage.setItem(key, previous); } catch { /* nothing more we can do */ } };
  try { storage.setItem(key, json); } catch (e) {
    restore();
    return isQuota(e) ? { ok: false, code: 'quota', error: 'Browser storage is full. Nothing was changed. Export a backup, then use smaller images or image paths (e.g. /products/x.webp).' } : { ok: false, code: 'write', error: `Could not save: ${e.message}` };
  }
  try { if (storage.getItem(key) !== json) throw new Error('stored value differs from what was written'); } catch (e) { restore(); return { ok: false, code: 'verify', error: `Save could not be verified (${e.message}). Previous data was restored.` }; }
  return { ok: true, bytes: json.length };
}

/* ---------- ids ---------- */
export const hasDuplicateIds = (list) => new Set(list.map((p) => p?.id)).size !== list.length;
// Explicit user action only: keeps the first record of each id, gives LATER duplicates a fresh id. Nothing is removed.
export function makeIdsUnique(list) {
  const seen = new Set(list.map((p) => p?.id));
  let max = Math.max(0, ...list.map((p) => parseInt(String(p?.id).replace(/\D/g, ''), 10) || 0));
  const used = new Set();
  return list.map((p) => {
    if (!used.has(p.id)) { used.add(p.id); return p; }
    do { max++; } while (seen.has(`DC-${String(max).padStart(2, '0')}`));
    const id = `DC-${String(max).padStart(2, '0')}`; seen.add(id); used.add(id);
    return { ...p, id };
  });
}
