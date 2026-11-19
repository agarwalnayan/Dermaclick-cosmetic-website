# Google Analytics & Google Ads Setup Guide

## Overview
This guide explains how to set up Google Analytics for customer preference tracking and configure Google Ads conversion tracking for the Dermaclick website.

## Google Analytics Setup

### 1. Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Admin" > "Create Account"
3. Account Name: "Dermaclick"
4. Property Name: "Dermaclick Website"
5. Reporting Time Zone: "India Standard Time"
6. Currency: "Indian Rupee (INR)"
7. Click "Next" and complete setup

### 2. Get Measurement ID

1. In GA4 Admin > Property > Data Streams
2. Click "Web" stream
3. Copy the Measurement ID (format: `G-XXXXXXXXXX`)

### 3. Add to .env File

Add to `.env` file:
```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Verify Setup

- Open Google Analytics > Realtime report
- Visit the website
- You should see active users

## Custom Events Tracked

### Product Events
- `view_item` - When user views a product detail page
- `select_item` - When user clicks a product card
- `category_view` - When user views a category page
- `generate_lead` - When user submits enquiry (WhatsApp/phone)

### Engagement Events
- `whatsapp_click` - When user clicks WhatsApp CTA
- `contact_click` - When user clicks phone CTA
- `cta_click` - When user clicks any CTA button
- `time_on_page` - Tracks time spent on each page
- `form_start` - When user starts filling a form
- `customer_preference` - Custom preference tracking

### Page Events
- `page_view` - Automatic on every route change
- Tracks page path, title, and location

## Customer Preference Analysis

### What to Track in GA4

#### 1. Most Viewed Categories
- **Metric:** Event count for `category_view`
- **Dimension:** `category_name`
- **Insight:** Which product categories are most popular
- **Action:** Focus ads on top categories

#### 2. Product Engagement
- **Metric:** Event count for `view_item`, `select_item`
- **Dimension:** `item_name`, `item_category`
- **Insight:** Which products get most views and clicks
- **Action:** Promote high-engagement products in ads

#### 3. Conversion Funnel
- **Funnel Steps:**
  1. Category view → Product view → WhatsApp click → Lead
- **Metric:** Event count for each step
- **Insight:** Where users drop off
- **Action:** Optimize weak funnel steps

#### 4. Location Analysis
- **Metric:** Users by country/region
- **Dimension:** Country, City
- **Insight:** Geographic distribution of users
- **Action:** Target ads to high-converting regions

#### 5. UTM Campaign Performance
- **Metric:** Users, conversions by campaign
- **Dimension:** `utm_source`, `utm_medium`, `utm_campaign`
- **Insight:** Which ad campaigns perform best
- **Action:** Scale successful campaigns

### Custom Reports to Create

#### Report 1: Product Performance
```
- Dimensions: item_name, item_category
- Metrics: view_item, select_item, generate_lead
- Filter: Event name contains any of these events
```

#### Report 2: Category Popularity
```
- Dimensions: category_name
- Metrics: category_view, view_item, generate_lead
- Filter: Event name contains category_view or view_item
```

#### Report 3: Conversion Funnel
```
- Funnel steps:
  1. category_view
  2. view_item
  3. whatsapp_click
  4. generate_lead
```

#### Report 4: Customer Preferences
```
- Dimensions: preference_type, preference_value
- Metrics: customer_preference event count
- Use this to track custom preferences like "skin type", "concern", etc.
```

## Google Ads Setup

### 1. Create Google Ads Account

1. Go to [Google Ads](https://ads.google.com/)
2. Click "Start now"
3. Account Name: "Dermaclick"
4. Business Location: India
5. Time Zone: India Standard Time
6. Currency: Indian Rupee (INR)

### 2. Set Up Conversion Tracking

#### Option A: Google Tag Manager (Recommended)

1. In Google Ads > Tools & Settings > Conversions
2. Click "New conversion action"
3. Conversion Name: "WhatsApp Enquiry"
4. Category: "Lead"
5. Value: "0" (or set actual value if known)
6. Click "Save"
7. Copy the Conversion ID and Conversion Label

#### Option B: GA4 Conversions

1. In GA4 Admin > Events
2. Mark `generate_lead` as a conversion
3. Google Ads will automatically import it

### 3. Add Conversion ID to Site

Add to `.env` file:
```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ADS_CONVERSION_ID=AW-XXXXXXXXXX
VITE_ADS_CONVERSION_LABEL=AbcDefGhIjKlMnOpQrStUv
```

Update `src/config/site.js`:
```javascript
adsConversionId: process.env.VITE_ADS_CONVERSION_ID || '',
adsConversionLabel: process.env.VITE_ADS_CONVERSION_LABEL || '',
```

### 4. Create Ad Campaigns

#### Campaign 1: Search Ads - Skincare India
- **Campaign Type:** Search
- **Network:** Search Network
- **Location:** India, Nepal
- **Language:** English
- **Bidding Strategy:** Maximize Clicks (initially)
- **Budget:** Set daily budget
- **Keywords:**
  - "best skincare India"
  - "clinical skincare India"
  - "paraben-free skincare"
  - "vitamin c serum India"
  - "niacinamide face wash"
  - "skincare for Indian skin"
  - "buy skincare online India"

#### Campaign 2: Search Ads - Haircare India
- **Campaign Type:** Search
- **Network:** Search Network
- **Location:** India, Nepal
- **Language:** English
- **Keywords:**
  - "best hair care India"
  - "keratin shampoo India"
  - "argan oil hair mask"
  - "hair care for Indian hair"
  - "buy hair care online India"

#### Campaign 3: Display Ads - Brand Awareness
- **Campaign Type:** Display
- **Network:** Google Display Network
- **Location:** India, Nepal
- **Targeting:** In-market audiences for skincare, beauty
- **Bidding Strategy:** Maximize Impressions

### 5. Set Up UTM Tracking for Ads

#### UTM Parameter Structure
```
https://www.dermaclick.co.in/?utm_source=google&utm_medium=cpc&utm_campaign=skincare_india&utm_term=best+skincare&utm_content=ad_copy_1
```

#### Auto-tagging in Google Ads
1. Google Ads > Tools & Settings > Account Settings
2. Enable "Auto-tagging"
3. Google will automatically add UTM parameters

## Dashboard Setup

### Recommended GA4 Dashboards

#### Dashboard 1: Overview
- Users, sessions, bounce rate
- Top countries: India, Nepal
- Top traffic sources: Google, Direct, Social
- Top pages by views

#### Dashboard 2: Product Performance
- Most viewed products
- Most clicked products
- Conversion rate by product
- Revenue by product (if e-commerce enabled)

#### Dashboard 3: Category Analysis
- Category views
- Products per category
- Conversion rate by category
- Time spent per category

#### Dashboard 4: Customer Preferences
- Custom preference tracking
- Demographics (age, gender if available)
- Interests
- Device breakdown

#### Dashboard 5: Ad Performance
- Campaign performance (from GA4 integration)
- Ad group performance
- Keyword performance
- Conversion rate by campaign

## Conversion Tracking Verification

### Test WhatsApp Conversion
1. Open website in incognito mode
2. Click WhatsApp button on a product
3. Check Google Analytics > Realtime > Events
4. Look for `whatsapp_click` event
5. Check Google Ads > Conversions (after ~24 hours)

### Test Category View
1. Navigate to a category page
2. Check GA4 Realtime > Events
3. Look for `category_view` event

### Test Product View
1. Click on a product
2. Check GA4 Realtime > Events
3. Look for `view_item` event

## UTM Campaign Best Practices

### Naming Convention
- Source: `google`, `facebook`, `instagram`, `email`
- Medium: `cpc`, `social`, `email`, `organic`
- Campaign: `skincare_india_2024`, `haircare_nepal`, `summer_sale`
- Term: Keyword (for search ads)
- Content: Ad variant, landing page, etc.

### Example UTM URLs
```
# Google Search Ad
https://www.dermaclick.co.in/?utm_source=google&utm_medium=cpc&utm_campaign=skincare_india&utm_term=best+skincare

# Facebook Ad
https://www.dermaclick.co.in/?utm_source=facebook&utm_medium=social&utm_campaign=summer_promo&utm_content=carousel_ad

# Email Campaign
https://www.dermaclick.co.in/?utm_source=newsletter&utm_medium=email&utm_campaign=launch_promo
```

## Important Notes

### Development vs Production
- Analytics is **disabled** in development mode
- Only tracks in production when `.env` has `VITE_GA_MEASUREMENT_ID`
- LocalAdmin route is excluded from tracking

### Data Privacy
- No personal user data is collected
- Only aggregated analytics data
- Compliant with GDPR and Indian data protection laws

### Conversion Attribution
- Google Ads uses last-click attribution by default
- Consider setting up data-driven attribution for better accuracy
- Multiple touchpoints: Ad → Site → WhatsApp → Lead

### Budget Recommendations
- Start with ₹500-1000/day per campaign
- Scale successful campaigns
- Pause underperforming keywords/ads
- A/B test ad copy and creatives

## Next Steps

1. ✅ Analytics code integrated
2. ✅ Custom events configured
3. ✅ Conversion tracking ready
4. ⏳ Set up GA4 property and get Measurement ID
5. ⏳ Add Measurement ID to .env file
6. ⏳ Create Google Ads account
7. ⏳ Set up conversion tracking
8. ⏳ Create and launch ad campaigns
9. ⏳ Monitor and optimize based on data

## Support Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [Google Ads Conversion Tracking](https://support.google.com/google-ads/answer/7386792)
- [Google Tag Assistant](https://tagassistant.google.com/) - Verify tracking setup
- [GA4 Explore](https://support.google.com/analytics/answer/9356801) - Advanced analysis
