// URL slug for a category route, e.g. "Face Care" -> "face-care".
export const categorySlug = (category) => String(category).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
