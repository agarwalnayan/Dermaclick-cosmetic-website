import { Routes, Route, useLocation } from 'react-router-dom'; import { useEffect, lazy, Suspense } from 'react';
import Navbar from './sections/Navbar'; import Footer from './sections/Footer'; import Home from './pages/Home'; import ProductDetail from './pages/ProductDetail'; import CategoryPage from './pages/CategoryPage';
import { WhatsAppCta, CallCta } from './components/Cta';
import { trackPageView } from './utils/analytics';
const LocalAdmin = import.meta.env.DEV ? lazy(() => import('./pages/LocalAdmin')) : null; // dev-only, excluded from production build
export default function App() {
  const { hash, pathname } = useLocation();
  useEffect(() => { if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView(), 50); }, [hash, pathname]);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  useEffect(() => {
    // Track page view on route changes (exclude LocalAdmin)
    if (!(import.meta.env.DEV && pathname.startsWith('/local-admin'))) {
      const title = document.title;
      trackPageView(pathname, title);
    }
  }, [pathname]);
  if (import.meta.env.DEV && LocalAdmin && pathname.startsWith('/local-admin')) return <Suspense fallback={null}><LocalAdmin /></Suspense>;
  return (<>
    <div className="site-frame">
      <a className="skip" href="#main">Skip to content</a><Navbar />
      <main id="main"><Routes><Route path="/" element={<Home />} /><Route path="/category/:categorySlug" element={<CategoryPage />} /><Route path="/products/:slug" element={<ProductDetail />} /><Route path="*" element={<section className="wrap sec"><h1>Page not found</h1><a href="/">Go home</a></section>} /></Routes></main>
      <Footer />
    </div>
  </>);
}
