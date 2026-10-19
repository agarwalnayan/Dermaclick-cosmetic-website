import { useEffect } from 'react';
import { site } from '../config/site';
export function useSeo({ title, description, path = '/', schema, keywords }) {
  useEffect(() => {
    document.title = title;
    const set = (sel, attr, val, mk) => { let e = document.head.querySelector(sel); if (!e) { e = document.createElement(mk.tag); Object.entries(mk.attrs).forEach(([k, v]) => e.setAttribute(k, v)); document.head.appendChild(e); } e.setAttribute(attr, val); };
    set('meta[name=description]', 'content', description, { tag: 'meta', attrs: { name: 'description' } });
    if (keywords) { set('meta[name=keywords]', 'content', keywords, { tag: 'meta', attrs: { name: 'keywords' } }); }
    const origin = site.url || window.location.origin;
    const url = new URL(path, origin).href;
    set('link[rel=canonical]', 'href', url, { tag: 'link', attrs: { rel: 'canonical' } });
    set('meta[property="og:title"]', 'content', title, { tag: 'meta', attrs: { property: 'og:title' } });
    set('meta[property="og:description"]', 'content', description, { tag: 'meta', attrs: { property: 'og:description' } });
    set('meta[property="og:url"]', 'content', url, { tag: 'meta', attrs: { property: 'og:url' } });
    set('meta[property="og:type"]', 'content', 'website', { tag: 'meta', attrs: { property: 'og:type' } });
    set('meta[property="og:site_name"]', 'content', site.name, { tag: 'meta', attrs: { property: 'og:site_name' } });
    set('meta[name="twitter:card"]', 'content', 'summary_large_image', { tag: 'meta', attrs: { name: 'twitter:card' } });
    set('meta[name="twitter:title"]', 'content', title, { tag: 'meta', attrs: { name: 'twitter:title' } });
    set('meta[name="twitter:description"]', 'content', description, { tag: 'meta', attrs: { name: 'twitter:description' } });
    let s = document.getElementById('ld'); if (s) s.remove();
    if (schema) { s = document.createElement('script'); s.id = 'ld'; s.type = 'application/ld+json'; s.textContent = JSON.stringify(schema); document.head.appendChild(s); }
  }, [title, description, path, schema, keywords]);
}
