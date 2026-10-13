// LOCAL-ONLY product manager (dev server only; excluded from production builds by App.jsx).
// Data -> this browser's localStorage (per origin/port/profile!). Publish via `npm run catalogue:promote` (docs/CATALOGUE_WORKFLOW.md).
import { useState, useRef, useEffect } from 'react';
import { STORAGE_KEY, committedProducts } from '../data/products';
import { resolveCatalogue, saveCatalogue, buildExport, buildSelectedExport, parseCatalogueText, planImport, hasDuplicateIds, makeIdsUnique, isPlaceholder, isConfiguredProduct, productSelection, toggleProductSelection, resolveProductSelection } from '../data/catalogue';

// Same priority as the site: non-empty browser copy, else the committed src/data/products.json, else empty.
const readRaw = () => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } };
const load = () => resolveCatalogue({ storageRaw: readRaw(), fileValue: committedProducts, useStorage: true }).raw;
const download = (b) => { const url = URL.createObjectURL(new Blob([b.text], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = b.filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
const renumber = (a) => [...a].sort((x, y) => (x?.order ?? 9999) - (y?.order ?? 9999)).map((p, i) => (p && typeof p === 'object' && !Array.isArray(p) ? { ...p, order: i + 1 } : p));
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const lines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);
const blank = (category = '') => ({ id: '', name: '', slug: '', category, image: '', shortDescription: '', description: '', tagline: '', size: '', suitableFor: '', ingredients: [{ name: '', description: '' }], benefits: '', featured: false, seoTitle: '', seoDescription: '', seoKeywords: [], order: '' });
const toForm = (p) => ({ ...blank(), ...p, image: p.image || '', suitableFor: (p.suitableFor || []).join('\n'), benefits: (p.benefits || []).join('\n'), ingredients: p.ingredients?.length ? p.ingredients : [{ name: '', description: '' }], seoKeywords: Array.isArray(p.seoKeywords) ? p.seoKeywords.filter((keyword) => typeof keyword === 'string') : [], order: p.order ?? '' });
const compress = (file) => new Promise((res, rej) => {
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => { const s = Math.min(1, 900 / img.width), c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL('image/webp', 0.85)); };
  img.onerror = rej; img.src = url;
});

export default function LocalAdmin() {
  const [items, setItems] = useState(load);
  const [editing, setEditing] = useState(null); // id or null (= new)
  const [f, setF] = useState(blank());
  const [slugTouched, setSlugTouched] = useState(false);
  const [msg, setMsg] = useState('');
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keywordEditing, setKeywordEditing] = useState(null);
  const [err, setErr] = useState('');
  const [plan, setPlan] = useState(null); // pending import: {fileName, parsed, mode, confirmed}
  const [exportInfo, setExportInfo] = useState(null);
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [exportReviewCount, setExportReviewCount] = useState(null);
  const nameRef = useRef(), formRef = useRef();
  const keywordRef = useRef();
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const categories = [...new Set(items.map((p) => p?.category).filter(Boolean))];
  const dupIds = hasDuplicateIds(items);
  const hidden = items.filter(isPlaceholder).length;
  const selectedCount = selectedIds.size;
  const selectableIds = productSelection(items, 'all');
  const unselectableCount = items.length - selectableIds.size;
  const ip = plan && planImport(items, plan.parsed.products, plan.mode, plan.parsed);
  const committedDiffers = committedProducts && (committedProducts.length !== items.length || committedProducts.map((p) => p?.id).join() !== items.map((p) => p?.id).join());

  const persist = (next) => {
    const n = renumber(next);
    let r; try { r = saveCatalogue(localStorage, n, STORAGE_KEY); } catch (e) { r = { ok: false, error: `Browser storage is unavailable: ${e.message}` }; }
    if (!r.ok) { setErr(r.error); return false; } // previous data is untouched; nothing is reported as saved
    setErr(''); setItems(n); return true;
  };
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2000); };

  const dupBlock = () => { if (dupIds) { setErr('Several products share the same id. Use "Make IDs unique" first so edits cannot affect the wrong product.'); return true; } return false; };
  const save = (next) => {
    if (dupBlock()) return;
    if (!f.name.trim() || !f.category.trim()) return alert('Name and category are required.');
    const slug = f.slug.trim() || slugify(f.name);
    if (items.some((p) => p?.slug === slug && p?.id !== editing)) return alert(`Slug "${slug}" already exists.`);
    const nums = items.map((p) => parseInt(String(p?.id).replace(/\D/g, ''), 10) || 0);
    const id = editing || `DC-${String(Math.max(0, ...nums) + 1).padStart(2, '0')}`;
    const prod = {
      ...(items.find((p) => p?.id === editing) || { price: null }), id, slug, name: f.name.trim(), category: f.category.trim(), image: f.image || null,
      shortDescription: f.shortDescription.trim(), description: f.description.trim(), tagline: f.tagline.trim(), size: f.size.trim(),
      suitableFor: lines(f.suitableFor), benefits: lines(f.benefits), featured: f.featured,
      ingredients: f.ingredients.filter((g) => g.name.trim()).map((g) => ({ name: g.name.trim(), description: g.description.trim() })),
      seoTitle: f.seoTitle.trim() || `${f.name.trim()} | Dermaclick`, seoDescription: f.seoDescription.trim() || f.shortDescription.trim() || f.description.trim().slice(0, 155),
      seoKeywords: f.seoKeywords.map((keyword) => keyword.trim()).filter(Boolean),
      order: f.order === '' ? items.length + 1 : Number(f.order),
    };
    if (!persist(editing ? items.map((p) => (p?.id === editing ? prod : p)) : [...items, prod])) return;
    flash(`Saved "${prod.name}"`);
    if (next) { setEditing(null); setF(blank(prod.category)); setSlugTouched(false); setKeywordDraft(''); setKeywordEditing(null); setTimeout(() => nameRef.current?.focus(), 0); }
    else { setEditing(id); setF(toForm({ ...prod, order: prod.order })); }
  };
  const edit = (p) => { setEditing(p.id); setF(toForm(p)); setSlugTouched(true); setKeywordDraft(''); setKeywordEditing(null); formRef.current?.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => nameRef.current?.focus(), 0); };
  const fresh = () => { setEditing(null); setF(blank(f.category)); setSlugTouched(false); setKeywordDraft(''); setKeywordEditing(null); nameRef.current?.focus(); };
  const del = (p) => { if (dupBlock()) return; if (confirm(`Delete "${p.name}"?\nTip: use Export JSON first if you have no backup.`)) { const n = items.filter((x) => x?.id !== p.id); if (n.length) persist(n); else { try { localStorage.removeItem(STORAGE_KEY); } catch {} setItems(load()); } if (editing === p.id) fresh(); } };
  const move = (i, d) => { const a = [...items], j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; persist(a.map((p, k) => (p && typeof p === 'object' && !Array.isArray(p) ? { ...p, order: k + 1 } : p))); };
  const feature = (p) => !dupBlock() && persist(items.map((x) => (x?.id === p.id ? { ...x, featured: !x.featured } : x)));
  const pickImage = async (file) => { if (file) try { set('image', await compress(file)); } catch { alert('Could not read image.'); } };
  const setIng = (i, k, v) => setF((o) => ({ ...o, ingredients: o.ingredients.map((g, x) => (x === i ? { ...g, [k]: v } : g)) }));
  const addIng = () => setF((o) => ({ ...o, ingredients: [...o.ingredients, { name: '', description: '' }] }));
  const commitKeyword = () => {
    const keyword = keywordDraft.trim().replace(/,+$/, '').trim();
    if (!keyword) return;
    if (f.seoKeywords.some((item, index) => index !== keywordEditing && item.toLocaleLowerCase() === keyword.toLocaleLowerCase())) {
      flash('That keyword is already added.');
      return;
    }
    const seoKeywords = keywordEditing === null
      ? [...f.seoKeywords, keyword]
      : f.seoKeywords.map((item, index) => index === keywordEditing ? keyword : item);
    set('seoKeywords', seoKeywords);
    setKeywordDraft('');
    setKeywordEditing(null);
  };
  const removeKeyword = (index) => {
    set('seoKeywords', f.seoKeywords.filter((_, itemIndex) => itemIndex !== index));
    if (keywordEditing === index) { setKeywordDraft(''); setKeywordEditing(null); }
    else if (keywordEditing !== null && keywordEditing > index) setKeywordEditing(keywordEditing - 1);
  };
  const backupNow = () => { if (!items.length) return true; const b = buildExport(items); if (!b.roundTripOk) throw new Error('backup self-check failed'); download(b); return true; };
  const exportJson = () => {
    try {
      const b = buildExport(items); // reads current state only; never mutates the catalogue
      if (!b.roundTripOk) throw new Error('the exported file failed its own re-read check');
      download(b); setErr(''); setExportInfo({ ...b.summary, filename: b.filename }); flash(`Exported ${b.summary.total} products`);
    } catch (e) { setErr(`Export failed: ${e.message}. Nothing was changed.`); }
  };
  const reviewSelectedExport = () => {
    const selection = resolveProductSelection(items, selectedIds);
    if (!selection.ok) { setErr(selection.error); return; }
    setErr('');
    setExportReviewCount(selection.products.length);
  };
  const exportSelected = () => {
    try {
      const selection = resolveProductSelection(items, selectedIds);
      if (!selection.ok) throw new Error(selection.error);
      if (selection.products.length !== exportReviewCount) throw new Error(`The selection changed after review (${exportReviewCount} expected, ${selection.products.length} found). Review the count again; nothing was downloaded.`);
      const b = buildSelectedExport(selection.products);
      const check = parseCatalogueText(b.text);
      if (!b.roundTripOk || !check.ok || check.products.length !== exportReviewCount || check.countMismatch) {
        throw new Error(`Export validation expected ${exportReviewCount} products but found ${check.ok ? check.products.length : 'invalid JSON'}. Nothing was downloaded.`);
      }
      download(b);
      setErr('');
      setExportInfo({ ...b.summary, filename: b.filename });
      setExportReviewCount(null);
      setSelectionOpen(false);
      flash(`Exported ${b.summary.total} selected products`);
    } catch (e) { setErr(`Export failed: ${e.message}. Nothing was changed.`); }
  };
  const startImport = async (file, fileName = file?.name) => {
    let text; try { text = await file.text(); } catch (e) { setErr(`Could not read "${fileName}": ${e.message}. Nothing was changed.`); return; }
    const parsed = parseCatalogueText(text);
    if (!parsed.ok) { setErr(`Import blocked - ${parsed.error} Nothing was changed.`); return; }
    setErr(''); setPlan({ fileName, parsed, mode: 'replace', confirmed: false });
  };
  const loadCommitted = () => setPlan({ fileName: 'src/data/products.json (committed)', parsed: { products: committedProducts }, mode: 'replace', confirmed: false });
  const applyImport = () => {
    if (!ip?.ok || !plan.confirmed) return;
    try { if (plan.mode === 'replace') backupNow(); } catch (e) { setErr(`Could not create the safety backup (${e.message}). Import cancelled; nothing was changed.`); return; }
    if (persist(ip.next)) { flash(`Imported: ${ip.summary.resulting} products now in the editor`); setPlan(null); fresh(); }
  };
  const reset = () => {
    if (!confirm('Clear the product data stored in THIS browser?\n\nA backup file will be downloaded first. The editor will then show the committed src/data/products.json (or be empty if there is none).')) return;
    try { backupNow(); } catch (e) { setErr(`Could not create the safety backup (${e.message}). Reset cancelled.`); return; }
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { setErr(`Could not clear storage: ${e.message}`); return; }
    setItems(load()); fresh();
  };
  useEffect(() => { nameRef.current?.focus(); }, []);
  useEffect(() => {
    if (!selectionOpen) return undefined;
    const closeOnEscape = (e) => { if (e.key === 'Escape') setSelectionOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectionOpen]);

  const onKey = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); save(true); } };
  return (
    <main className="la" onKeyDown={onKey}>
      <style>{CSS}</style>
      <header className="la-top"><h1>Local Product Manager <small>({items.length} products{hidden ? ` · ${hidden} hidden placeholder${hidden > 1 ? 's' : ''}` : ''} · stored in this browser only)</small></h1>
        <div className="la-bar"><a className="b" href="/" target="_blank" rel="noreferrer">View site ↗</a><button className="b" onClick={() => { setSelectedIds(new Set()); setExportReviewCount(null); setSelectionOpen(true); }}>Export Products to JSON</button><button className="b" onClick={exportJson}>Export JSON</button>
          <label className="b">Import JSON<input type="file" accept="application/json,.json" hidden onChange={(e) => { const file = e.target.files[0]; e.target.value = ''; file && startImport(file); }} /></label><button className="b danger" onClick={reset}>Reset</button></div></header>
      <section className="la-note" aria-label="Catalogue status">
        <span>Browser copy: <b>{items.length}</b> · Committed <code>src/data/products.json</code>: <b>{committedProducts ? committedProducts.length : 'not found'}</b> · Origin: <code>{typeof location !== 'undefined' ? location.host : ''}</code> (each port/browser keeps its own copy)</span>
        {committedDiffers && <button className="b" onClick={loadCommitted}>Compare / load committed catalogue…</button>}
      </section>
      {err && !selectionOpen && <p className="la-err" role="alert">{err} <button className="b" onClick={() => setErr('')}>Dismiss</button></p>}
      {dupIds && <p className="la-err" role="alert">Duplicate product ids detected. Editing and deleting are paused. <button className="b" onClick={() => persist(makeIdsUnique(items))}>Make IDs unique</button></p>}
      {exportInfo && <section className="la-panel" aria-live="polite"><strong>Exported {exportInfo.total} products to {exportInfo.filename}</strong>
        <div>{exportInfo.incomplete} need review (missing id/name/category/slug) · {exportInfo.placeholders} placeholders · {exportInfo.duplicateIds + exportInfo.duplicateSlugs} duplicate id/slug · {exportInfo.dataUrlImages} embedded images · {(exportInfo.bytes / 1024).toFixed(0)} KB</div>
        {exportInfo.flagged.length > 0 && <ul>{exportInfo.flagged.slice(0, 20).map((x, i) => <li key={i}>{x.name || x.id || `Record ${i + 1}`}: {x.issues.join('; ')}</li>)}</ul>}
        <button className="b" onClick={() => setExportInfo(null)}>Close</button></section>}
      {selectionOpen && <div className="la-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectionOpen(false); }}>
        <section className="la-selection" role="dialog" aria-modal="true" aria-labelledby="la-selection-title">
          <header className="la-selection-head"><div><h2 id="la-selection-title">Select products to export</h2><p>Choose the exact products to include. Product data and images are not changed.</p></div>
            <button type="button" aria-label="Close product selection" onClick={() => setSelectionOpen(false)}>Close</button></header>
          <div className="la-selection-tools">
            <div className="la-bar"><button type="button" onClick={() => { setSelectedIds(productSelection(items, 'all')); setExportReviewCount(null); }}>Select All</button>
              <button type="button" onClick={() => { setSelectedIds(productSelection(items, 'none')); setExportReviewCount(null); }}>Deselect All</button>
              <button type="button" onClick={() => { setSelectedIds(productSelection(items, 'configured')); setExportReviewCount(null); }}>Select Configured Products</button></div>
            <strong aria-live="polite">{selectedCount} {selectedCount === 1 ? 'product' : 'products'} selected</strong>
          </div>
          {err && <p className="la-err" role="alert">{err} <button className="b" onClick={() => setErr('')}>Dismiss</button></p>}
          {unselectableCount > 0 && <p className="la-err" role="status">{unselectableCount} product{unselectableCount === 1 ? ' has' : 's have'} a missing or duplicate ID and cannot be selected until its ID is fixed.</p>}
          <div className="la-selection-list">
            {items.length === 0 && <p>No products are currently available in Local Admin.</p>}
            {items.map((product, index) => {
              const record = product && typeof product === 'object' && !Array.isArray(product) ? product : {};
              const configured = isConfiguredProduct(record);
              const productId = typeof record.id === 'string' ? record.id : '';
              const selectable = selectableIds.has(productId);
              const name = typeof record.name === 'string' && record.name.trim() ? record.name : 'Unnamed product';
              const category = typeof record.category === 'string' && record.category.trim() ? record.category : 'No category';
              const image = typeof record.image === 'string' && record.image.trim() ? record.image : '';
              return <label key={index} className={`la-product-choice${configured ? ' configured' : ' incomplete'}`}>
                <input type="checkbox" checked={selectedIds.has(productId)} disabled={!selectable} onChange={() => { setSelectedIds((current) => toggleProductSelection(current, productId)); setExportReviewCount(null); }} aria-label={`Select ${name} (${productId || 'missing ID'})`} />
                {image ? <img src={image} alt="" /> : <span className="la-product-thumb">No image</span>}
                <span className="la-product-copy"><strong>{name}</strong><small>{category}{record.id != null ? ` · ${record.id}` : ''}</small>
                  <span className={`la-product-status${configured ? ' configured' : ' incomplete'}`}>{configured ? 'Configured' : 'Needs configuration'}</span></span>
              </label>;
            })}
          </div>
          {exportReviewCount !== null && <p className="la-export-review" role="status">Ready to export <strong>{exportReviewCount} {exportReviewCount === 1 ? 'product' : 'products'}</strong>. The downloaded JSON will contain exactly this many records.</p>}
          <footer className="la-selection-foot"><button type="button" onClick={() => { setSelectionOpen(false); setExportReviewCount(null); }}>Cancel</button>
            {exportReviewCount === null
              ? <button type="button" className="b primary" disabled={!selectedCount} onClick={reviewSelectedExport}>Export Selected as JSON</button>
              : <><button type="button" onClick={() => setExportReviewCount(null)}>Change selection</button>
                <button type="button" className="b primary" onClick={exportSelected}>Download {exportReviewCount} {exportReviewCount === 1 ? 'product' : 'products'} as JSON</button></>}
          </footer>
        </section>
      </div>}
      {plan && ip && <section className="la-panel" aria-label="Import preview">
        <strong>Import preview: {plan.fileName}</strong>
        <div>File: <b>{ip.summary.incoming ?? 0}</b> products · Currently in editor: <b>{ip.summary.current ?? 0}</b> · {plan.parsed.format ? `format: ${plan.parsed.format}${plan.parsed.version ? ' v' + plan.parsed.version : ''}` : ''}</div>
        <div className="la-bar"><label><input type="radio" name="imode" checked={plan.mode === 'replace'} onChange={() => setPlan({ ...plan, mode: 'replace', confirmed: false })} /> Replace the catalogue</label>
          <label><input type="radio" name="imode" checked={plan.mode === 'merge'} onChange={() => setPlan({ ...plan, mode: 'merge', confirmed: false })} /> Merge: add only new products (existing ones are never changed)</label></div>
        <div>Result: <b>{ip.summary.resulting ?? 0}</b> products{plan.mode === 'merge' ? ` (${ip.summary.added} added, ${ip.summary.skipped} skipped as conflicts)` : ip.summary.removed ? ` - the ${ip.summary.removed} current products would be replaced` : ''} · placeholders in file: {ip.summary.placeholders ?? 0} · records needing review: {ip.summary.incomplete ?? 0}</div>
        {ip.summary.shrinks && plan.mode === 'replace' && <p className="la-err">Warning: this leaves FEWER products ({ip.summary.resulting}) than you have now ({ip.summary.current}).</p>}
        {ip.errors.length > 0 && <div className="la-err" role="alert"><b>Blocked - fix the file and try again:</b><ul>{ip.errors.slice(0, 20).map((m, i) => <li key={i}>{m}</li>)}</ul></div>}
        {ip.warnings.length > 0 && <details><summary>{ip.warnings.length} warning(s) - records are kept, but need review</summary><ul>{ip.warnings.slice(0, 50).map((m, i) => <li key={i}>{m}</li>)}</ul></details>}
        <label className="chk"><input type="checkbox" checked={plan.confirmed} disabled={!ip.ok} onChange={(e) => setPlan({ ...plan, confirmed: e.target.checked })} /> {plan.mode === 'replace' ? `I understand this replaces the ${ip.summary.current ?? 0} products in this editor (a backup file is downloaded first).` : 'I want to add the new products listed above.'}</label>
        <div className="la-bar"><button className="b primary" disabled={!ip.ok || !plan.confirmed} onClick={applyImport}>Apply import</button><button className="b" onClick={() => setPlan(null)}>Cancel (nothing changes)</button></div></section>}
      <div className="la-grid">
        <section className="la-list">
          {items.map((p, i) => {
            const record = p && typeof p === 'object' && !Array.isArray(p) ? p : {};
            const name = typeof record.name === 'string' && record.name.trim() ? record.name : 'Unnamed product';
            const manageable = Boolean(record.id);
            return <div key={`${record.id ?? 'record'}-${i}`} className={`la-row${editing === record.id ? ' on' : ''}`}>
              <span className="n">{record.order ?? i + 1}</span>
              {typeof record.image === 'string' && record.image ? <img src={record.image} alt="" /> : <span className="th" />}
              <div className="t"><strong>{name}</strong><small>{record.category || 'No category'}{record.slug ? ` · /${record.slug}` : ''}{isPlaceholder(record) ? ' · placeholder (hidden on site)' : ''}</small></div>
              <button title="Featured" aria-label={record.featured ? `Remove ${name} from featured products` : `Feature ${name}`} className={`star${record.featured ? ' on' : ''}`} onClick={() => feature(p)} disabled={!manageable}>★</button>
              <button title="Up" aria-label={`Move ${name} up`} onClick={() => move(i, -1)} disabled={!manageable || i === 0}>↑</button><button title="Down" aria-label={`Move ${name} down`} onClick={() => move(i, 1)} disabled={!manageable || i === items.length - 1}>↓</button>
              <button onClick={() => edit(p)} disabled={!manageable}>Edit</button><button className="danger" aria-label={`Delete ${name}`} onClick={() => del(p)} disabled={!manageable}>✕</button>
            </div>;
          })}
        </section>
        <section className="la-form" ref={formRef}>
          <h2>{editing ? `Edit ${editing}` : 'Add product'} {msg && <em className="ok">{msg}</em>}</h2>
          <div className="r2"><label>Name *<input ref={nameRef} value={f.name} onChange={(e) => { set('name', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)); }} /></label>
            <label>Slug<input value={f.slug} onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} /></label></div>
          <div className="r2"><label>Category *<input list="la-cats" value={f.category} onChange={(e) => set('category', e.target.value)} /><datalist id="la-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist></label>
            <label>Size<input value={f.size} placeholder="e.g. 100 ml" onChange={(e) => set('size', e.target.value)} /></label></div>
          <label>Tagline<input value={f.tagline} onChange={(e) => set('tagline', e.target.value)} /></label>
          <label>Short description<textarea rows="2" value={f.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} /></label>
          <label>Description<textarea rows="4" value={f.description} onChange={(e) => set('description', e.target.value)} /></label>
          <div className="r2"><label>Suitable for <small>(one per line)</small><textarea rows="3" value={f.suitableFor} onChange={(e) => set('suitableFor', e.target.value)} /></label>
            <label>Benefits <small>(one per line)</small><textarea rows="3" value={f.benefits} onChange={(e) => set('benefits', e.target.value)} /></label></div>
          <fieldset><legend>Ingredients</legend>
            {f.ingredients.map((g, i) => (
              <div className="ing" key={i}><input placeholder="Name" value={g.name} onChange={(e) => setIng(i, 'name', e.target.value)} />
                <input placeholder="Description (Enter = next row)" value={g.description} onChange={(e) => setIng(i, 'description', e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); if (i === f.ingredients.length - 1) addIng(); setTimeout(() => e.target.closest('.ing').nextElementSibling?.querySelector('input')?.focus(), 0); } }} />
                <button type="button" onClick={() => setF((o) => ({ ...o, ingredients: o.ingredients.length > 1 ? o.ingredients.filter((_, x) => x !== i) : [{ name: '', description: '' }] }))}>✕</button></div>))}
            <button type="button" className="b" onClick={addIng}>+ Ingredient</button></fieldset>
          <div className="img">
            {f.image ? <img src={f.image} alt="" /> : <span className="th big">No image</span>}
            <div><label className="b">Upload image<input type="file" accept="image/*" hidden onChange={(e) => pickImage(e.target.files[0])} /></label>
              <input placeholder="…or path/URL, e.g. /products/x.webp" value={f.image.startsWith('data:') ? '' : f.image} onChange={(e) => set('image', e.target.value)} />
              {f.image && <button type="button" className="b" onClick={() => set('image', '')}>Remove</button>}</div></div>
          <div className="r2"><label>SEO title<input value={f.seoTitle} placeholder={f.name ? `${f.name} | Dermaclick` : 'auto'} onChange={(e) => set('seoTitle', e.target.value)} /></label>
            <label>Order<input type="number" min="1" value={f.order} placeholder={String(items.length + 1)} onChange={(e) => set('order', e.target.value)} /></label></div>
          <label>SEO description<textarea rows="2" value={f.seoDescription} placeholder="auto: short description" onChange={(e) => set('seoDescription', e.target.value)} /></label>
          <fieldset className="seo-keywords">
            <legend>SEO keywords</legend>
            <p className="hint">Editorial keywords for product metadata. Not displayed on the product page.</p>
            {f.seoKeywords.length > 0 && <div className="keyword-list" aria-label="Product SEO keywords">
              {f.seoKeywords.map((keyword, i) => <span className="keyword-chip" key={`${keyword}-${i}`}>
                <button type="button" className="keyword-edit" aria-label={`Edit keyword: ${keyword}`} onClick={() => { setKeywordDraft(keyword); setKeywordEditing(i); keywordRef.current?.focus(); }}>{keyword}</button>
                <button type="button" className="keyword-remove" aria-label={`Remove keyword: ${keyword}`} onClick={() => removeKeyword(i)}>×</button>
              </span>)}
            </div>}
            <div className="keyword-entry">
              <input ref={keywordRef} aria-label={keywordEditing === null ? 'Add SEO keyword' : 'Edit SEO keyword'} placeholder="Add a keyword or phrase" value={keywordDraft} onChange={(e) => setKeywordDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commitKeyword(); } if (e.key === 'Escape') { setKeywordDraft(''); setKeywordEditing(null); } }} />
              <button type="button" className="b" onClick={commitKeyword}>{keywordEditing === null ? '+ Add keyword' : 'Save keyword'}</button>
              {keywordEditing !== null && <button type="button" className="b" onClick={() => { setKeywordDraft(''); setKeywordEditing(null); }}>Cancel</button>}
            </div>
          </fieldset>
          <label className="chk"><input type="checkbox" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} /> Featured</label>
          <div className="act"><button className="b primary" onClick={() => save(true)}>Save &amp; add next (Ctrl+Enter)</button><button className="b" onClick={() => save(false)}>Save</button><button className="b" onClick={fresh}>New / clear</button></div>
        </section>
      </div>
    </main>
  );
}

const CSS = `
.la-note{display:flex;gap:.6rem;align-items:center;justify-content:space-between;flex-wrap:wrap;font-size:.82rem;background:#fff;border:1px solid #ddd;padding:.5rem .7rem;margin-bottom:.8rem}.la-note code{background:#f1e6dd;padding:0 .25rem}
.la-err{background:#fdecec;border:1px solid #a22;color:#701;padding:.5rem .7rem;margin:0 0 .8rem}.la-err ul{margin:.3rem 0 0 1.1rem;padding:0}
.la-panel{background:#fff;border:2px solid #B8913A;padding:.7rem;margin-bottom:.8rem;display:grid;gap:.5rem;font-size:.85rem}.la-panel ul{margin:0 0 0 1.1rem;padding:0;max-height:10rem;overflow:auto}
.la{font:15px/1.4 system-ui,sans-serif;color:#231F20;background:#FAF7F2;min-height:100vh;padding:1rem}
.la *{box-sizing:border-box}.la h1{font:600 1.4rem system-ui;margin:0}.la h1 small{font-weight:400;color:#6b6460;font-size:.8rem}.la h2{font:600 1.1rem system-ui;margin:0 0 .5rem}
.la-top{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem}.la-bar{display:flex;gap:.4rem}
.la button,.la .b{font:inherit;padding:.35rem .7rem;border:1px solid #231F20;background:#fff;color:#231F20;border-radius:3px;cursor:pointer;text-decoration:none;display:inline-block}
.la button:disabled{opacity:.3;cursor:default}.la .primary{background:#231F20;color:#fff}.la .danger{color:#a22;border-color:#a22}
.la-grid{display:grid;grid-template-columns:minmax(320px,1fr) minmax(380px,1.2fr);gap:1rem;align-items:start}
.la-list{background:#fff;border:1px solid #ddd;max-height:calc(100vh - 90px);overflow:auto;position:sticky;top:1rem}
.la-row{display:flex;align-items:center;gap:.4rem;padding:.4rem .5rem;border-bottom:1px solid #eee}.la-row.on{background:#F1E6DD}
.la-row .n{width:1.6rem;color:#999;text-align:right}.la-row img,.th{width:36px;height:45px;object-fit:cover;background:#e8dccd;flex:none}.la-row .t{flex:1;min-width:0;display:flex;flex-direction:column}.la-row .t small{color:#777;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.la-row button{padding:.2rem .5rem}.star{color:#bbb}.star.on{color:#B8913A;border-color:#B8913A}
.la-form{background:#fff;border:1px solid #ddd;padding:1rem;display:grid;gap:.6rem}
.la label{display:grid;gap:.2rem;font-size:.85rem;margin:0}.la input:not([type=checkbox]),.la textarea{width:100%;padding:.45rem .55rem;border:1px solid #999;background:#fff;color:#231F20;border-radius:3px;font:inherit}
.r2{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}.ing{display:grid;grid-template-columns:1fr 2fr auto;gap:.4rem;margin-bottom:.4rem}
.la fieldset{border:1px solid #ddd;padding:.6rem}.img{display:flex;gap:.8rem;align-items:flex-start}.img>div{display:grid;gap:.4rem;flex:1}.th.big{width:96px;height:120px;display:grid;place-content:center;font-size:.75rem;color:#777}.img>img{width:96px;height:120px;object-fit:cover}
.la .seo-keywords{display:grid;gap:.5rem;min-width:0}.la .seo-keywords .hint{margin:0;color:#6b6460;font-size:.78rem}.keyword-list{display:flex;flex-wrap:wrap;gap:.4rem}.keyword-chip{display:inline-flex;max-width:100%;align-items:center;overflow:hidden;border:1px solid #d8cdbf;border-radius:99px;background:#FAF7F2}.la .keyword-chip button{min-height:34px;border:0;background:transparent}.la .keyword-edit{max-width:min(46vw,320px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.la .keyword-remove{padding-inline:.5rem;color:#6b6460;font-size:1.15rem}.la .keyword-remove:hover{color:#a22}.keyword-entry{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center}.keyword-entry input{min-width:min(100%,220px);flex:1 1 220px}
.la-modal-backdrop{position:fixed;inset:0;z-index:1000;background:#231f20a8;display:grid;place-items:center;padding:1rem}.la-selection{width:min(760px,100%);max-height:min(90vh,900px);display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;gap:.75rem;background:#FAF7F2;border:1px solid #B8913A;padding:1rem;box-shadow:0 12px 40px #0005}.la-selection-head,.la-selection-tools,.la-selection-foot{display:flex;align-items:center;justify-content:space-between;gap:.75rem;flex-wrap:wrap}.la-selection-head p{margin:.2rem 0 0;color:#6b6460;font-size:.85rem}.la-selection-tools{padding:.5rem 0;border-block:1px solid #ddd}.la-selection-list{overflow:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-content:start;gap:.5rem}.la-product-choice{display:grid!important;grid-template-columns:auto 54px minmax(0,1fr);align-items:center;gap:.55rem!important;padding:.55rem;background:#fff;border:1px solid #ddd;cursor:pointer}.la-product-choice.configured{border-left:4px solid #54835b}.la-product-choice.incomplete{border-left:4px solid #b8913a}.la-product-choice input[type=checkbox]{width:1rem;height:1rem;margin:0}.la-product-choice img,.la-product-thumb{width:54px;height:64px;object-fit:cover;background:#e8dccd}.la-product-thumb{display:grid;place-items:center;color:#6b6460;font-size:.68rem}.la-product-copy{display:grid;min-width:0;gap:.1rem}.la-product-copy strong,.la-product-copy small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.la-product-copy small{color:#6b6460}.la-product-status{font-size:.72rem;font-weight:600}.la-product-status.configured{color:#28643b}.la-product-status.incomplete{color:#806018}.la-selection-foot{justify-content:flex-end}
.chk{display:flex!important;align-items:center;gap:.4rem}.act{display:flex;gap:.5rem;flex-wrap:wrap;position:sticky;bottom:0;background:#fff;padding:.5rem 0}.ok{color:#2a7a2a;font-weight:400;font-size:.85rem;font-style:normal}
@media(max-width:900px){.la-grid{grid-template-columns:1fr}.la-list{position:static;max-height:none}.r2{grid-template-columns:1fr}}
.la button,.la .b{min-height:40px}.la input:focus-visible,.la textarea:focus-visible,.la button:focus-visible,.la .b:focus-visible{outline:3px solid #B8913A;outline-offset:2px}
@media(max-width:560px){.la{padding:.75rem}.la-top{align-items:flex-start}.la-bar{flex-wrap:wrap}.la-row{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.35rem;padding:.55rem}.la-row .n{grid-row:1;grid-column:1}.la-row img,.la-row .th{grid-row:1;grid-column:2}.la-row .t{grid-row:1;grid-column:3 / span 2}.la-row>button:nth-of-type(1){grid-row:1;grid-column:5}.la-row>button:nth-of-type(2){grid-row:2;grid-column:1}.la-row>button:nth-of-type(3){grid-row:2;grid-column:2}.la-row>button:nth-of-type(4){grid-row:2;grid-column:3}.la-row>button:nth-of-type(5){grid-row:2;grid-column:4}.la-row button{min-width:40px;padding:.35rem}.ing{grid-template-columns:1fr auto}.ing input:nth-child(2){grid-column:1}.ing button{grid-column:2;grid-row:1 / span 2}.img{flex-wrap:wrap}.keyword-entry{align-items:stretch}.keyword-entry input{flex-basis:100%}.act{position:static}.la-selection{max-height:94vh;padding:.75rem}.la-selection-list{grid-template-columns:1fr}.la-selection-tools>.la-bar{width:100%}.la-selection-tools>.la-bar button{flex:1 1 30%}.la-selection-foot{position:sticky;bottom:0;background:#FAF7F2;padding-top:.5rem}.la-selection-foot button:last-child{flex:1}}`;
