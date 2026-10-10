# Diagnosis: "Local Admin shows the full catalogue, exported/uploaded products.json has one record"

Confirmed from the supplied source (no catalogue data exists in the ZIP, `.git` history or `dist/`):
1. Export (`LocalAdmin.jsx`, old `exportJson`) serialised the same `items` state that renders the list, so within one page the export always equals what is displayed. A one-record export therefore means that tab/origin held one record.
2. Old `importJson` called `persist(parsedArray)` with no preview/confirmation/backup: importing a one-record test file replaced the whole catalogue immediately. Importing `[]` wiped it.
3. Browser storage is per origin (host+port) and profile. A different port/browser/project copy starts empty (admin showed 0 and exported `[]`).
4. Old `products.js` let an empty `[]` in storage mask `src/data/products.json`; old LocalAdmin ignored products.json entirely; production also read localStorage.
5. Old export used the fixed name `products.json` (browsers add " (1)", " (2)"), making it easy to upload a stale test file.
6. Deleting/saving by `id` removed/replaced every record sharing that id. The placeholder filter hid real products that kept the placeholder description.
Not provable from here: which of 1-5 actually happened on the owner's machine (their localStorage was not available).
