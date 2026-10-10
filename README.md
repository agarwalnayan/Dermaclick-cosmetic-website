# Dermaclick
React + Vite product showcase. `npm install` -> `npm run dev` / `npm run build` (output `dist/`) / `npm test`.
Cloudflare Pages: build command `npm run build`, output directory `dist`.

**Products:** the live site shows `src/data/products.json` and images from `public/products/`. Edit products in `/local-admin` (dev only), export, then promote with `npm run catalogue:promote -- <export.json>`. Full steps, safety rules and recovery: [docs/CATALOGUE_WORKFLOW.md](docs/CATALOGUE_WORKFLOW.md). Other scripts: `npm run catalogue:audit`.

Replace later: contact + IDs in `src/config/site.js`; FAQs in `src/data/content.js`; domain in `index.html`, `public/robots.txt`, `public/sitemap.xml`.
