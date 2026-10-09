import { useEffect } from 'react';
import { site } from '../config/site';
export function useSeo({ title, description, path = '/', schema }) {
  useEffect(() => {
    document.title = title;
    const set = (sel, attr, val, mk) => { let e = document.head.querySelector(sel); if (!e) { e = document.createElement(mk.tag); Object.entries(mk.attrs).forEach(([k, v]) => e.setAttribute(k, v)); document.head.appendChild(e); } e.setAttribute(attr, val); };
    set('meta[name=description]', 'content', description, { tag: 'meta', attrs: { name: 'description' } });
    const origin = site.url || window.location.origin;
    set('link[rel=canonical]', 'href', new URL(path, origin).href, { tag: 'link', attrs: { rel: 'canonical' } });
    set('meta[property="og:title"]', 'content', title, { tag: 'meta', attrs: { property: 'og:title' } });
    set('meta[property="og:description"]', 'content', description, { tag: 'meta', attrs: { property: 'og:description' } });
    set('meta[property="og:image"]', 'content', `${origin}/og-image.jpg`, { tag: 'meta', attrs: { property: 'og:image' } });
    let s = document.getElementById('ld'); if (s) s.remove();
    if (schema) { s = document.createElement('script'); s.id = 'ld'; s.type = 'application/ld+json'; s.textContent = JSON.stringify(schema); document.head.appendChild(s); }
  }, [title, description, path, schema]);
}
