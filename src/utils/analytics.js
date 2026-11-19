import { site } from '../config/site';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || site.ga4Id;
const isDev = import.meta.env.DEV;
const isLocalAdmin = import.meta.env.DEV && typeof window !== 'undefined' && window.location.pathname.startsWith('/local-admin');

// Initialize GA4 - only in production and not on LocalAdmin
export function initAnalytics() {
  if (isDev || isLocalAdmin || !GA_MEASUREMENT_ID) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  // Load gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Configure GA4
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll send page views manually for SPA
    cookie_flags: 'samesite=none;secure',
    debug_mode: false,
    custom_map: {
      'custom_page_path': 'page_path',
      'custom_page_title': 'page_title',
    }
  });

  // Google Ads conversion tracking (if configured)
  if (site.adsConversionId) {
    window.gtag('config', site.adsConversionId);
  }
}

// Track page view for SPA navigation
export function trackPageView(path, title) {
  if (isDev || isLocalAdmin || !GA_MEASUREMENT_ID) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}

// Helper to format product parameters for GA4
const productParams = (p) => {
  if (!p) return {};
  return {
    item_id: p.id,
    item_name: p.name,
    item_category: p.category,
    item_category2: p.size || undefined,
    price: '0',
    currency: 'INR',
  };
};

// GA4 standard events
export const trackViewItem = (p) => {
  if (isDev || isLocalAdmin || !GA_MEASUREMENT_ID) return;
  window.gtag('event', 'view_item', {
    items: [productParams(p)],
  });
};

export const trackSelectItem = (p) => {
  if (isDev || isLocalAdmin || !GA_MEASUREMENT_ID) return;
  window.gtag('event', 'select_item', {
    items: [productParams(p)],
  });
};

export const trackWhatsAppClick = (location, p) => {
  if (isDev || isLocalAdmin || !GA_MEASUREMENT_ID) return;
  window.gtag('event', 'whatsapp_click', {
    location,
    ...productParams(p),
  });
};

export const trackContactClick = (type, location) => {
  if (isDev || isLocalAdmin || !GA_MEASUREMENT_ID) return;
  window.gtag('event', 'contact_click', {
    contact_type: type,
    location,
  });
};

export const trackGenerateLead = (p) => {
  if (isDev || isLocalAdmin || !GA_MEASUREMENT_ID) return;
  window.gtag('event', 'generate_lead', {
    ...productParams(p),
    value: 0,
    currency: 'INR',
  });
  
  // Google Ads conversion tracking
  if (site.adsConversionId && site.adsConversionLabel) {
    window.gtag('event', 'conversion', {
      send_to: `${site.adsConversionId}/${site.adsConversionLabel}`,
      value: 0,
      currency: 'INR',
    });
  }
};

// Legacy event names for backward compatibility (deprecated, use new functions above)
export const trackProductView = trackViewItem;
export const trackWhatsApp = trackWhatsAppClick;
export const trackPhone = (location) => trackContactClick('phone', location);
export const trackCta = (label, location, p) => {
  if (isDev || isLocalAdmin || !GA_MEASUREMENT_ID) return;
  window.gtag('event', 'cta_click', {
    cta_label: label,
    location,
    ...productParams(p),
  });
};
export const trackFormStart = () => {
  if (isDev || isLocalAdmin || !GA_MEASUREMENT_ID) return;
  window.gtag('event', 'form_start', { form_name: 'enquiry' });
};
export const trackFormSubmit = trackGenerateLead;

// UTM Parameter Tracking for Ad Campaigns
export const getUTMParameters = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_term: urlParams.get('utm_term'),
    utm_content: urlParams.get('utm_content'),
  };
};

// Custom dimension tracking for customer preferences
export const trackCustomerPreference = (preference, value) => {
  if (isDev || isLocalAdmin || !GA_MEASUREMENT_ID) return;
  window.gtag('event', 'customer_preference', {
    preference_type: preference,
    preference_value: value,
  });
};

// Track category view for customer preference analysis
export const trackCategoryView = (category) => {
  if (isDev || isLocalAdmin || !GA_MEASUREMENT_ID) return;
  window.gtag('event', 'category_view', {
    category_name: category,
  });
};

// Track time on page for engagement analysis
export const trackTimeOnPage = (duration, path) => {
  if (isDev || isLocalAdmin || !GA_MEASUREMENT_ID) return;
  window.gtag('event', 'time_on_page', {
    engagement_time_msec: duration,
    page_path: path,
  });
};
