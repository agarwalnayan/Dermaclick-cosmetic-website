// Renders the REAL components and REAL src/data/products.js (incl. import.meta.glob) against a temp project
// containing a fixture src/data/products.json. Browser storage is simulated with a global shim.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import { Routes, Route } from 'react-router-dom';
import React from 'react';
import { tempProject, catalogue, product, placeholder, memStorage } from './helpers.mjs';
import { STORAGE_KEY } from '../src/data/catalogue.js';

async function withSite({ products, storage }, fn) {
  const t = tempProject({ products });
  const had = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  if (storage !== undefined) Object.defineProperty(globalThis, 'localStorage', { value: memStorage(storage === null ? {} : { [STORAGE_KEY]: storage }), configurable: true, writable: true });
  const srv = await createServer({ root: t.dir, configFile: false, plugins: [react()], logLevel: 'silent', server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
  try {
    const load = (f) => srv.ssrLoadModule(path.posix.join('/src', f));
    const page = async (url) => {
      const App = (await load('App.jsx')).default;
      return renderToString(React.createElement(StaticRouter, { location: url }, React.createElement(App)));
    };
    await fn({ load, page, data: await load('data/products.js') });
  } finally {
    await srv.close(); t.cleanup();
    if (storage !== undefined) { if (had) Object.defineProperty(globalThis, 'localStorage', had); else delete globalThis.localStorage; }
  }
}
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test('10. committed products.json is loaded when browser storage is absent; collection + counts + categories come from it; placeholders excluded', async () => {
  await withSite({ products: [...catalogue(), placeholder()] }, async ({ data, page }) => {
    assert.equal(data.catalogueInfo.source, 'products.json');
    assert.equal(data.products.length, 4);
    assert.deepEqual(data.categories, ['Cleansers', 'Moisturisers', 'Sun Care', 'Serums']);
    const html = await page('/');
    const t = text(html);
    assert.match(t, /4 products/);
    for (const n of ['Face Wash', 'Moisturizer', 'Sunscreen', 'Vitamin C Serum']) assert.ok(t.includes(n), n + ' in collection');
    assert.ok(!t.includes('Product 09') && !/Category A/.test(t), 'no placeholders on the public page');
    for (const s of ['face-wash', 'moisturizer', 'sunscreen', 'vitamin-c-serum']) assert.ok(html.includes(`href="/products/${s}"`), 'card link ' + s);
    for (const c of ['Cleansers', 'Moisturisers', 'Sun Care', 'Serums']) assert.ok(html.includes(`>${c}</button>`), 'category chip ' + c);
  });
});

test('10b. every valid product has a working detail route using the same record as its card', async () => {
  await withSite({ products: catalogue() }, async ({ data, page }) => {
    for (const p of data.products) {
      const html = await page(`/products/${p.slug}`); const t = text(html);
      assert.ok(t.includes(p.name), p.slug + ' name');
      assert.ok(t.includes(p.category), p.slug + ' category');
      assert.ok(t.includes(p.description), p.slug + ' description');
      for (const g of p.ingredients) assert.ok(t.includes(g.name), `${p.slug} ingredient ${g.name}`);
      for (const b of p.benefits) assert.ok(t.includes(b), `${p.slug} benefit`);
      if (p.image) assert.ok(html.includes(`src="${p.image}"`), p.slug + ' image src');
      assert.ok(!t.includes('Product not found'));
    }
    assert.match(text(await page('/products/does-not-exist')), /Product not found/);
  });
});

test('10c. products with only the essential fields render without crashing (cards and detail)', async () => {
  const bare = { id: 'DC-01', slug: 'bare', name: 'Bare Product', category: 'Misc' };
  await withSite({ products: [bare] }, async ({ page }) => {
    assert.match(text(await page('/')), /Bare Product/);
    assert.match(text(await page('/products/bare')), /Bare Product/);
  });
});

test('10d. empty or missing catalogue shows the empty-collection message, not a crash', async () => {
  await withSite({}, async ({ data, page }) => { assert.equal(data.catalogueInfo.source, 'empty'); assert.match(text(await page('/')), /get in touch/); });
  await withSite({ products: [] }, async ({ data, page }) => { assert.equal(data.products.length, 0); assert.match(text(await page('/')), /get in touch/); });
});

test('regression: an empty "[]" in browser storage no longer hides the committed catalogue; a real browser copy still wins in dev', async () => {
  await withSite({ products: catalogue(), storage: '[]' }, async ({ data }) => { assert.equal(data.products.length, 4); assert.equal(data.catalogueInfo.source, 'products.json'); });
  await withSite({ products: catalogue(), storage: JSON.stringify([product({ id: 'DC-77', slug: 'browser-copy', name: 'Browser Copy' })]) }, async ({ data }) => {
    assert.equal(data.catalogueInfo.source, 'browser-storage'); assert.equal(data.catalogueInfo.fileCount, 4); assert.equal(data.products.length, 1);
  });
});

test('regression: a real product with leftover template description is visible on the public site', async () => {
  await withSite({ products: [product({ name: 'Vitamin C Serum', slug: 'vc', description: 'Product description coming soon.' })] }, async ({ data, page }) => {
    assert.equal(data.products.length, 1); assert.match(text(await page('/products/vc')), /Vitamin C Serum/);
  });
});
