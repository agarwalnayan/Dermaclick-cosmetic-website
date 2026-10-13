// CLI workflow tests. Every run operates on a disposable project copy via --root.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PROJECT, tempProject, catalogue, product, placeholder, PNG_DATA_URL } from './helpers.mjs';
import { buildExport, buildSelectedExport } from '../src/data/catalogue.js';

const run = (script, args, cwd = PROJECT) => spawnSync(process.execPath, [path.join(PROJECT, 'scripts', script), ...args], { cwd, encoding: 'utf8' });
const writeExport = (dir, list, envelope = true) => { const f = path.join(dir, 'export.json'); fs.writeFileSync(f, envelope ? buildExport(list).text : JSON.stringify(list)); return f; };
const images = ['products/face-wash.webp', 'products/sunscreen.webp'];

test('promote: writes products.json, extracts embedded images to public/products, rewrites references, keeps all records', () => {
  const t = tempProject({ images });
  try {
    const f = writeExport(t.dir, catalogue());
    const r = run('promote-catalogue.mjs', [f, '--root', t.dir]);
    assert.equal(r.status, 0, r.stderr + r.stdout);
    const out = JSON.parse(fs.readFileSync(path.join(t.dir, 'src/data/products.json'), 'utf8'));
    assert.equal(out.length, 4); assert.ok(Array.isArray(out), 'plain array for the loader');
    assert.match(out[1].image, /^\/products\/moisturizer-[0-9a-f]{8}\.png$/);
    assert.ok(fs.existsSync(path.join(t.dir, 'public', out[1].image)));
    assert.deepEqual(out[1].extraUnknownField, { keep: 'me' });
    assert.equal(out.every((p) => !String(p.image || '').startsWith('data:')), true);
    assert.equal(run('audit-catalogue.mjs', ['--root', t.dir]).status, 0);
  } finally { t.cleanup(); }
});

test('promote: --dry-run writes nothing', () => {
  const t = tempProject({ images });
  try {
    const r = run('promote-catalogue.mjs', [writeExport(t.dir, catalogue()), '--dry-run', '--root', t.dir]);
    assert.equal(r.status, 0);
    assert.equal(fs.existsSync(path.join(t.dir, 'src/data/products.json')), false);
    assert.equal(fs.existsSync(path.join(t.dir, 'public/products/moisturizer-' )), false);
  } finally { t.cleanup(); }
});

test('promote: accepts a selective export and requires explicit shrink approval for a subset', () => {
  const full = catalogue().map((p) => ({ ...p, image: p.image?.startsWith('data:') ? null : p.image }));
  const t = tempProject({ products: full, images });
  const target = path.join(t.dir, 'src/data/products.json');
  const selected = [catalogue()[1], catalogue()[0]];
  const file = path.join(t.dir, 'dermaclick-products-export.json');
  fs.writeFileSync(file, buildSelectedExport(selected).text);
  try {
    const refused = run('promote-catalogue.mjs', [file, '--root', t.dir]);
    assert.equal(refused.status, 1);
    assert.match(refused.stderr, /incomplete export/);
    const before = fs.readFileSync(target, 'utf8');
    const dry = run('promote-catalogue.mjs', [file, '--dry-run', '--allow-shrink', '--root', t.dir]);
    assert.equal(dry.status, 0, dry.stderr + dry.stdout);
    assert.equal(fs.readFileSync(target, 'utf8'), before);

    const promoted = run('promote-catalogue.mjs', [file, '--allow-shrink', '--root', t.dir]);
    assert.equal(promoted.status, 0, promoted.stderr + promoted.stdout);
    const output = JSON.parse(fs.readFileSync(target, 'utf8'));
    assert.deepEqual(output.map((p) => p.id), selected.map((p) => p.id));
    assert.deepEqual(output[0].extraUnknownField, { keep: 'me' });
    assert.match(output[0].image, /^\/products\/moisturizer-[0-9a-f]{8}\.png$/);
  } finally { t.cleanup(); }
});

test('promote: refuses an incomplete (smaller) export over a larger committed catalogue, leaves files intact; backs up on real replace', () => {
  const full = catalogue().map((p) => ({ ...p, image: p.image && p.image.startsWith('data:') ? null : p.image }));
  const t = tempProject({ products: full, images });
  const target = path.join(t.dir, 'src/data/products.json');
  try {
    const before = fs.readFileSync(target, 'utf8');
    const r = run('promote-catalogue.mjs', [writeExport(t.dir, [product()]), '--root', t.dir]);
    assert.equal(r.status, 1); assert.match(r.stderr, /incomplete export/);
    assert.equal(fs.readFileSync(target, 'utf8'), before);
    assert.equal(fs.existsSync(path.join(t.dir, 'catalogue-backups')), false);
    // a legitimate same-size update works and leaves a backup of the previous file
    const upd = full.map((p, i) => (i === 0 ? { ...p, tagline: 'Updated' } : p));
    const ok = run('promote-catalogue.mjs', [writeExport(t.dir, upd), '--root', t.dir]);
    assert.equal(ok.status, 0, ok.stderr);
    assert.equal(JSON.parse(fs.readFileSync(target, 'utf8'))[0].tagline, 'Updated');
    const backups = fs.readdirSync(path.join(t.dir, 'catalogue-backups'));
    assert.equal(backups.length, 1); assert.equal(fs.readFileSync(path.join(t.dir, 'catalogue-backups', backups[0]), 'utf8'), before);
  } finally { t.cleanup(); }
});

test('promote: rejects empty, malformed, duplicate and missing-image inputs without writing', () => {
  const t = tempProject({ images });
  const target = path.join(t.dir, 'src/data/products.json');
  try {
    const bad = (name, content, args = []) => { const f = path.join(t.dir, name); fs.writeFileSync(f, content); const r = run('promote-catalogue.mjs', [f, '--root', t.dir, ...args]); assert.equal(r.status, 1, name + ' should be refused'); assert.equal(fs.existsSync(target), false, name + ' must not write'); return r.stderr; };
    bad('empty.json', '[]'); bad('malformed.json', '{oops'); bad('obj.json', '{"a":1}');
    assert.match(bad('dups.json', JSON.stringify([product(), product({ id: 'DC-02' })])), /Duplicate slug/);
    assert.match(bad('missing.json', JSON.stringify([product({ image: '/products/nope.webp' })])), /image file missing/);
    assert.match(bad('rel.json', JSON.stringify([product({ image: 'src/assets/x.webp' })])), /relative\/local path/);
    assert.match(bad('noname.json', JSON.stringify([product({ name: '' })])), /Missing name/);
  } finally { t.cleanup(); }
});

test('audit: reports placeholders/SEO/duplicates, fails on errors, tolerates a missing products.json', () => {
  let t = tempProject();
  try { const r = run('audit-catalogue.mjs', ['--root', t.dir]); assert.equal(r.status, 0); assert.match(r.stdout, /not found/); } finally { t.cleanup(); }
  t = tempProject({ products: [catalogue()[0], placeholder(), product({ id: 'DC-07', slug: 'no-seo', name: 'No SEO', seoTitle: '' })], images });
  try {
    const r = run('audit-catalogue.mjs', ['--root', t.dir]);
    assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /placeholders\s+: 1/); assert.match(r.stdout, /SEO title or description is missing/);
  } finally { t.cleanup(); }
  t = tempProject({ products: [product(), product({ id: 'DC-02' })], images });
  try { assert.equal(run('audit-catalogue.mjs', ['--root', t.dir]).status, 1); } finally { t.cleanup(); }
});
