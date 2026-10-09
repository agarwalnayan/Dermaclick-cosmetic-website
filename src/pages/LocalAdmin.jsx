// LOCAL-ONLY product manager (dev server only). Data -> localStorage, read by src/data/products.js
import { useState, useRef, useEffect } from 'react';
import { STORAGE_KEY, defaultProducts } from '../data/products';

const load = () => { try { const a = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (Array.isArray(a) && a.length) return a; } catch {} return defaultProducts; };
const renumber = (a) => [...a].sort((x, y) => (x.order ?? 9999) - (y.order ?? 9999)).map((p, i) => ({ ...p, order: i + 1 }));
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
  const nameRef = useRef(), formRef = useRef();
  const keywordRef = useRef();
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const categories = [...new Set(items.map((p) => p.category).filter(Boolean))];

  const persist = (next) => {
    const n = renumber(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(n)); } catch { alert('localStorage is full. Use smaller images or an image path instead.'); return false; }
    setItems(n); return true;
  };
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2000); };

  const save = (next) => {
    if (!f.name.trim() || !f.category.trim()) return alert('Name and category are required.');
    const slug = f.slug.trim() || slugify(f.name);
    if (items.some((p) => p.slug === slug && p.id !== editing)) return alert(`Slug "${slug}" already exists.`);
    const nums = items.map((p) => parseInt(String(p.id).replace(/\D/g, ''), 10) || 0);
    const id = editing || `DC-${String(Math.max(0, ...nums) + 1).padStart(2, '0')}`;
    const prod = {
      ...(items.find((p) => p.id === editing) || { price: null }), id, slug, name: f.name.trim(), category: f.category.trim(), image: f.image || null,
      shortDescription: f.shortDescription.trim(), description: f.description.trim(), tagline: f.tagline.trim(), size: f.size.trim(),
      suitableFor: lines(f.suitableFor), benefits: lines(f.benefits), featured: f.featured,
      ingredients: f.ingredients.filter((g) => g.name.trim()).map((g) => ({ name: g.name.trim(), description: g.description.trim() })),
      seoTitle: f.seoTitle.trim() || `${f.name.trim()} | Dermaclick`, seoDescription: f.seoDescription.trim() || f.shortDescription.trim() || f.description.trim().slice(0, 155),
      seoKeywords: f.seoKeywords.map((keyword) => keyword.trim()).filter(Boolean),
      order: f.order === '' ? items.length + 1 : Number(f.order),
    };
    if (!persist(editing ? items.map((p) => (p.id === editing ? prod : p)) : [...items, prod])) return;
    flash(`Saved "${prod.name}"`);
    if (next) { setEditing(null); setF(blank(prod.category)); setSlugTouched(false); setKeywordDraft(''); setKeywordEditing(null); setTimeout(() => nameRef.current?.focus(), 0); }
    else { setEditing(id); setF(toForm({ ...prod, order: prod.order })); }
  };
  const edit = (p) => { setEditing(p.id); setF(toForm(p)); setSlugTouched(true); setKeywordDraft(''); setKeywordEditing(null); formRef.current?.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => nameRef.current?.focus(), 0); };
  const fresh = () => { setEditing(null); setF(blank(f.category)); setSlugTouched(false); setKeywordDraft(''); setKeywordEditing(null); nameRef.current?.focus(); };
  const del = (p) => { if (confirm(`Delete "${p.name}"?`)) { const n = items.filter((x) => x.id !== p.id); if (n.length) persist(n); else { localStorage.removeItem(STORAGE_KEY); setItems(defaultProducts); } if (editing === p.id) fresh(); } };
  const move = (i, d) => { const a = [...items], j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; persist(a.map((p, k) => ({ ...p, order: k + 1 }))); };
  const feature = (p) => persist(items.map((x) => (x.id === p.id ? { ...x, featured: !x.featured } : x)));
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
  const exportJson = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' })); a.download = 'products.json'; a.click(); };
  const importJson = async (file) => { try { const a = JSON.parse(await file.text()); if (!Array.isArray(a)) throw 0; persist(a); } catch { alert('Invalid products.json'); } };
  const reset = () => { if (confirm('Clear all local product data?')) { localStorage.removeItem(STORAGE_KEY); setItems(defaultProducts); fresh(); } };
  useEffect(() => { nameRef.current?.focus(); }, []);

  const onKey = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); save(true); } };
  return (
    <main className="la" onKeyDown={onKey}>
      <style>{CSS}</style>
      <header className="la-top"><h1>Local Product Manager <small>({items.length} products · stored in this browser only)</small></h1>
        <div className="la-bar"><a className="b" href="/" target="_blank" rel="noreferrer">View site ↗</a><button className="b" onClick={exportJson}>Export JSON</button>
          <label className="b">Import JSON<input type="file" accept="application/json" hidden onChange={(e) => e.target.files[0] && importJson(e.target.files[0])} /></label><button className="b danger" onClick={reset}>Reset</button></div></header>
      <div className="la-grid">
        <section className="la-list">
          {items.map((p, i) => (
            <div key={p.id} className={`la-row${editing === p.id ? ' on' : ''}`}>
              <span className="n">{p.order}</span>
              {p.image ? <img src={p.image} alt="" /> : <span className="th" />}
              <div className="t"><strong>{p.name}</strong><small>{p.category} · /{p.slug}</small></div>
              <button title="Featured" aria-label={p.featured ? `Remove ${p.name} from featured products` : `Feature ${p.name}`} className={`star${p.featured ? ' on' : ''}`} onClick={() => feature(p)}>★</button>
              <button title="Up" aria-label={`Move ${p.name} up`} onClick={() => move(i, -1)} disabled={i === 0}>↑</button><button title="Down" aria-label={`Move ${p.name} down`} onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
              <button onClick={() => edit(p)}>Edit</button><button className="danger" aria-label={`Delete ${p.name}`} onClick={() => del(p)}>✕</button>
            </div>))}
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
.chk{display:flex!important;align-items:center;gap:.4rem}.act{display:flex;gap:.5rem;flex-wrap:wrap;position:sticky;bottom:0;background:#fff;padding:.5rem 0}.ok{color:#2a7a2a;font-weight:400;font-size:.85rem;font-style:normal}
@media(max-width:900px){.la-grid{grid-template-columns:1fr}.la-list{position:static;max-height:none}.r2{grid-template-columns:1fr}}
.la button,.la .b{min-height:40px}.la input:focus-visible,.la textarea:focus-visible,.la button:focus-visible,.la .b:focus-visible{outline:3px solid #B8913A;outline-offset:2px}
@media(max-width:560px){.la{padding:.75rem}.la-top{align-items:flex-start}.la-bar{flex-wrap:wrap}.la-row{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.35rem;padding:.55rem}.la-row .n{grid-row:1;grid-column:1}.la-row img,.la-row .th{grid-row:1;grid-column:2}.la-row .t{grid-row:1;grid-column:3 / span 2}.la-row>button:nth-of-type(1){grid-row:1;grid-column:5}.la-row>button:nth-of-type(2){grid-row:2;grid-column:1}.la-row>button:nth-of-type(3){grid-row:2;grid-column:2}.la-row>button:nth-of-type(4){grid-row:2;grid-column:3}.la-row>button:nth-of-type(5){grid-row:2;grid-column:4}.la-row button{min-width:40px;padding:.35rem}.ing{grid-template-columns:1fr auto}.ing input:nth-child(2){grid-column:1}.ing button{grid-column:2;grid-row:1 / span 2}.img{flex-wrap:wrap}.keyword-entry{align-items:stretch}.keyword-entry input{flex-basis:100%}.act{position:static}}`;
