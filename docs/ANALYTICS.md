# Google Analytics 4 Integration

## Overview

The Dermaclick website uses Google Analytics 4 (GA4) for tracking user behavior and marketing attribution. The integration is designed to:

- Track page views in the Single Page Application (SPA)
- Track product interactions (view, select)
- Track contact actions (WhatsApp, phone, email)
- Track lead generation from the enquiry form
- Preserve UTM parameters for campaign attribution
- Respect user privacy (no tracking in development or LocalAdmin)

## Setup

### Environment Variable

Create a `.env` file in the project root (this file is gitignored for security):

```bash
VITE_GA_MEASUREMENT_ID=G-3062V9WS15
```

**Important:** The `.env` file is in `.gitignore` and should never be committed. Each developer and production environment should have their own `.env` file with the appropriate GA4 Measurement ID.

### Verification

To verify the setup:

1. Run `npm run build` to ensure the production build succeeds
2. Deploy to production (Cloudflare Pages)
3. Visit the live site at `www.dermaclick.co.in`
4. Open GA4 Realtime report to see active users
5. Use GA4 DebugView to see events in real-time (Chrome extension: Google Analytics Debugger)

## Tracked Events

### Page Views

**Event:** `page_view`
- Automatically tracked on every route change in the SPA
- Parameters: `page_path`, `page_title`
- Fired on: All public pages (not LocalAdmin)

### Product Interactions

**Event:** `view_item`
- Fired when: User views a product detail page
- Parameters: `item_id`, `item_name`, `item_category`
- Location: `ProductDetail.jsx`

**Event:** `select_item`
- Fired when: User clicks on a product card in the catalogue
- Parameters: `item_id`, `item_name`, `item_category`
- Location: `ProductCard.jsx`

### Contact Actions

**Event:** `whatsapp_click`
- Fired when: User clicks a WhatsApp link/button
- Parameters: `location`, `item_id`, `item_name`, `item_category` (if product context)
- Locations: Hero, product pages, sticky bar, footer

**Event:** `contact_click`
- Fired when: User clicks phone or email links
- Parameters: `contact_type` (phone/email), `location`
- Locations: Footer, sticky bar, product pages

### Lead Generation

**Event:** `generate_lead`
- Fired when: User successfully submits the enquiry form
- Parameters: `item_id`, `item_name`, `item_category` (if product context)
- Location: FinalCta form in `Sections.jsx`

**Event:** `form_start`
- Fired when: User first interacts with the enquiry form
- Parameters: `form_name`
- Location: FinalCta form in `Sections.jsx`

## Marketing Attribution

The GA4 integration automatically preserves standard UTM parameters:

- `utm_source`: Traffic source (e.g., instagram, facebook, google)
- `utm_medium`: Marketing medium (e.g., cpc, social, email)
- `utm_campaign`: Campaign name
- `utm_term`: Search terms
- `utm_content`: Ad content identifier

### Campaign Tracking Examples

**Instagram Campaign:**
```
https://www.dermaclick.co.in/?utm_source=instagram&utm_medium=social&utm_campaign=summer_sale
```

**Google Ads Campaign:**
```
https://www.dermaclick.co.in/?utm_source=google&utm_medium=cpc&utm_campaign=skincare_keywords
```

**Facebook Campaign:**
```
https://www.dermaclick.co.in/?utm_source=facebook&utm_medium=social&utm_campaign=new_launch
```

## Implementation Details

### Analytics Helper Functions

Located in `src/utils/analytics.js`:

- `initAnalytics()` - Initializes GA4 on app load (production only)
- `trackPageView(path, title)` - Tracks SPA page views
- `trackViewItem(p)` - Tracks product detail views
- `trackSelectItem(p)` - Tracks product selection from catalogue
- `trackWhatsAppClick(location, p)` - Tracks WhatsApp clicks
- `trackContactClick(type, location)` - Tracks phone/email clicks
- `trackGenerateLead(p)` - Tracks form submissions

### Development vs Production

- **Development:** Analytics is disabled when `import.meta.env.DEV` is true
- **LocalAdmin:** Analytics is disabled on `/local-admin` routes
- **Production:** Analytics is enabled and events are sent to GA4

### SPA Page View Tracking

Page views are tracked in `App.jsx` using a `useEffect` hook that monitors `pathname` changes. This ensures accurate page view tracking without duplicate events.

## Exclusions

The following are NOT tracked:

- Local Admin Panel (`/local-admin`)
- Development environment (unless explicitly enabled)
- Page views from React StrictMode (duplicate renders)
- Product prices (not an e-commerce site)
- Purchase events (lead generation only)

## Troubleshooting

### Events Not Appearing in GA4

1. Check that `.env` exists with `VITE_GA_MEASUREMENT_ID=G-3062V9WS15`
2. Verify you're on the production domain, not localhost
3. Clear browser cache and cookies
4. Use GA4 DebugView extension to see events in real-time
5. Check browser console for JavaScript errors

### Duplicate Events

- The implementation uses `isDev` and `isLocalAdmin` guards to prevent duplicate tracking
- Page views are tracked once per route change, not on every render
- React StrictMode double-invocation is handled by the guards

### UTM Parameters Not Working

- Ensure links include full UTM parameters
- Use GA4 Acquisition > Campaigns report to verify
- Check that campaign URLs are correctly formatted

## Migration Notes

This implementation replaced the previous analytics setup:

- **Old:** Custom event names (`product_view`, `enquiry_form_submit`)
- **New:** GA4 standard event names (`view_item`, `generate_lead`)
- **Old:** GTM support (removed to simplify)
- **New:** Direct GA4 gtag.js integration

Legacy function names are aliased for backward compatibility:
- `trackProductView` → `trackViewItem`
- `trackWhatsApp` → `trackWhatsAppClick`
- `trackPhone` → `trackContactClick`
- `trackFormSubmit` → `trackGenerateLead`

## Privacy and Compliance

- No personal data is sent to GA4 beyond what's necessary for analytics
- Email addresses and phone numbers are not included in events
- Form submissions track lead generation without storing user input
- Cookie settings are configured with `samesite=none;secure` for production
- Users can opt out using browser settings or ad blockers

## Files Changed

- `src/utils/analytics.js` - Core analytics implementation
- `src/App.jsx` - Page view tracking for SPA navigation
- `src/components/Cta.jsx` - WhatsApp and contact click tracking
- `src/components/ProductCard.jsx` - Product selection tracking
- `src/sections/Footer.jsx` - Contact link tracking
- `.env` - Environment variable (not committed to git)

## Testing

To test analytics without affecting production data:

1. Create a separate GA4 property for testing
2. Use the test Measurement ID in `.env`
3. Test in a staging environment
4. Verify events in GA4 Realtime and DebugView

## Support

For GA4-specific issues, refer to:
- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/9304153)
- [GA4 Event Measurement](https://support.google.com/analytics/answer/9216061)
- [GA4 DebugView](https://support.google.com/analytics/answer/7201382)
