// Production build tests on disposable project copies (real dist/ is not touched).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { tempProject, catalogue, product } from './helpers.mjs';

const npmRun = (dir, script) => spawnSync('npm', ['run', script, '--silent'], { cwd: dir, encoding: 'utf8', timeout: 180000 });
const bundle = (dir) => fs.readdirSync(path.join(dir, 'dist/assets')).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(dir, 'dist/assets', f), 'utf8')).join('\n');
const images = ['products/face-wash.webp', 'products/sunscreen.webp'];
const publishable = catalogue().map((p) => (p.image && p.image.startsWith('data:') ? { ...p, image: null } : p));

test('11 + 12. production build succeeds, uses the committed catalogue, and excludes the local admin and browser-storage access', () => {
  const t = tempProject({ products: publishable, images });
  try {
    const r = npmRun(t.dir, 'build');
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const js = bundle(t.dir);
    assert.ok(fs.existsSync(path.join(t.dir, 'dist/index.html')));
    for (const marker of ['Local Product Manager', 'stored in this browser only', 'local-admin', 'Make IDs unique', 'Import preview']) assert.ok(!js.includes(marker), `admin marker "${marker}" must not ship`);
    assert.ok(!js.includes('dermaclick.products.v1'), 'live site must not read browser storage');
    for (const n of ['Face Wash', 'Kojic Acid', 'Vitamin C Serum', 'Hyaluronic']) assert.ok(js.includes(n), `committed product data "${n}" is in the build`);
    assert.ok(fs.existsSync(path.join(t.dir, 'dist/products/face-wash.webp')), 'product image deployed from public/');
  } finally { t.cleanup(); }
});

test('build is blocked by the catalogue audit when committed data is invalid (duplicate slugs / missing image file)', () => {
  let t = tempProject({ products: [product(), product({ id: 'DC-02' })], images });
  try { const r = npmRun(t.dir, 'build'); assert.notEqual(r.status, 0); assert.match(r.stderr, /Duplicate slug/); assert.equal(fs.existsSync(path.join(t.dir, 'dist')), false); } finally { t.cleanup(); }
  t = tempProject({ products: [product({ image: '/products/missing.webp' })] });
  try { const r = npmRun(t.dir, 'build'); assert.notEqual(r.status, 0); assert.match(r.stderr, /image file missing/); } finally { t.cleanup(); }
});

test('build still succeeds when no products.json exists yet (empty state)', () => {
  const t = tempProject();
  try { const r = npmRun(t.dir, 'build'); assert.equal(r.status, 0, r.stdout + r.stderr); } finally { t.cleanup(); }
});
