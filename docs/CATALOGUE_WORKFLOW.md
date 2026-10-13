# Dermaclick catalogue workflow

## The one rule
**`/local-admin` data lives only in one browser (one origin = host + port, one browser profile).**
The live website can never see it. The only data the production site uses is the **tracked file `src/data/products.json`** plus images in **`public/products/`**.

```
/local-admin (browser localStorage)  --Export-->  backup .json  --catalogue:promote-->  src/data/products.json + public/products/*  --git push-->  Cloudflare Pages build
```

Local storage is per port: `localhost:5173` and `localhost:5174` (or `127.0.0.1`) are different, empty-to-each-other stores. If the admin looks empty or different, check the **Origin** shown in the status bar at the top of /local-admin.

## Everyday steps
1. `npm install` then `npm run dev`; open the URL it prints, then `/local-admin`. Always use the same URL/port when editing.
2. Edit products. Saving writes to browser storage only after the write is verified; a failure shows a red message and keeps the previous data.
3. Use **Export JSON** (top bar) for a full backup. To publish only some records, choose **Export Products to JSON**, select products (or use Select All / Deselect All / Select Configured Products), then press **Export Selected as JSON**. The selection is downloaded as `dermaclick-products-export.json`; the panel reports the exported count. Both files retain the versioned Dermaclick envelope and all selected product fields and image data.
4. Check what would change (nothing is written): `npm run catalogue:promote -- ~/Downloads/<file>.json --dry-run`. A selected subset may be smaller than the committed catalogue, so add `--allow-shrink` to the dry run only when you intentionally want the published catalogue to contain just that subset.
5. Promote for real only after reviewing the dry-run result: `npm run catalogue:promote -- ~/Downloads/<file>.json` (add `--allow-shrink` here too if the chosen subset intentionally removes products). This is the step that updates `src/data/products.json`; exporting alone never changes the committed catalogue.
   - validates everything first; refuses empty/malformed/duplicate/missing-image data
   - refuses to replace a larger committed catalogue with a smaller file (`--allow-shrink` to override deliberately)
   - extracts embedded base64 images into `public/products/<slug>-<hash>.<ext>` and rewrites `image` to `/products/...`
   - copies the previous `products.json` to `catalogue-backups/` before overwriting
6. `npm run catalogue:audit` (report) then `npm test` and `npm run build`.
7. `git add src/data/products.json public/products && git commit -m "Update catalogue" && git push`. Cloudflare Pages redeploys (build command `npm run build`, output `dist`).

`npm run build` runs the audit first (`prebuild`) and **fails** on duplicate ids/slugs, missing name/category/slug, or an image file that does not exist, so a broken catalogue cannot be deployed. A missing `products.json` is allowed (the site shows its "get in touch" empty state).

## Import (Local Admin)
Choose a file -> a **preview** appears (counts, errors, warnings, replace vs merge). Nothing changes until you tick the confirmation and press *Apply import*.
- Accepts a plain array (old exports, `products.json`) or the versioned format below.
- Blocked: invalid JSON, wrong root, non-object records, wrong field types, duplicate ids/slugs, an empty file when you already have products, a file whose declared `count` differs from its contents (truncated).
- Warned but kept: missing name/category/slug/description/image/SEO, placeholder-looking records. Nothing is deleted automatically.
- *Replace* first downloads a safety backup of the current editor contents. *Merge* only adds products whose id **and** slug are new; existing products are never changed.

## Formats
Versioned export (what the admin writes):
`{ "format": "dermaclick-catalogue", "version": 1, "exportedAt": "...", "count": N, "products": [ ... ] }`
`src/data/products.json` is a plain array of products (the envelope is also accepted there).

Product fields (all preserved, unknown extra fields too): `id` (required, unique), `slug` (required, unique, `a-z0-9-`), `name`, `category` (required), `image` (`/products/x.webp` or null), `tagline`, `size`, `shortDescription`, `description`, `suitableFor[]`, `benefits[]`, `ingredients[{name,description}]`, `featured`, `order`, `seoTitle`, `seoDescription`, `seoKeywords[]`, `price` (unused).

## Images
Use files, not base64. Put images in `public/products/` and reference `/products/<file>`; they work identically in dev and on Cloudflare. (`catalogue:promote` does this extraction for you.) Embedded data-URL images work in the admin but are flagged because they bloat the JS bundle and browser storage (about 5 MB per origin).

## Placeholders
Hidden on the public site: records named like `Product 05`, or whose category is `Category A..Z` **and** description is `Product description coming soon.`. A real product that merely kept one leftover template value is shown and flagged "needs review" instead of being hidden.

## Recovering data
- Browser copy lost? Re-import your latest `dermaclick-products-backup-*.json`.
- Bad promote? Copy the newest file from `catalogue-backups/` over `src/data/products.json` (or `git checkout -- src/data/products.json`).
- Safety backups are also downloaded automatically before *Replace* import and *Reset*.

## Security and limits
- `/local-admin` exists **only in `npm run dev`**; `App.jsx` gates it on `import.meta.env.DEV` and it is removed from the production bundle (verified by `tests/build.test.mjs`). In production `/local-admin` shows "Page not found".
- It has no authentication; anyone with access to your dev machine/browser can edit it. Do not run `vite --host` on untrusted networks. Browser localStorage is not a secure, multi-user CMS: no history, no concurrent editing, can be cleared by the browser.
- Production never reads browser storage.
