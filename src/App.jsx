import { Routes, Route, useLocation } from 'react-router-dom'; import { useEffect, lazy, Suspense } from 'react';
import Navbar from './sections/Navbar'; import Footer from './sections/Footer'; import Home from './pages/Home'; import ProductDetail from './pages/ProductDetail';
import { WhatsAppCta, CallCta } from './components/Cta';
import CustomCursor from './components/CustomCursor';
import ScrollProgress from './components/ScrollProgress';
const LocalAdmin = import.meta.env.DEV ? lazy(() => import('./pages/LocalAdmin')) : null; // dev-only, excluded from production build
export default function App() {
  const { hash, pathname } = useLocation();
  useEffect(() => { if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView(), 50); }, [hash, pathname]);
  if (LocalAdmin && pathname.startsWith('/local-admin')) return <Suspense fallback={null}><LocalAdmin /></Suspense>;
  return (<>
    <CustomCursor />
    <ScrollProgress />
    <div className="site-frame">
      <a className="skip" href="#main">Skip to content</a><Navbar />
      <main id="main"><Routes><Route path="/" element={<Home />} /><Route path="/products/:slug" element={<ProductDetail />} /><Route path="*" element={<section className="wrap sec"><h1>Page not found</h1><a href="/">Go home</a></section>} /></Routes></main>
      <Footer />
    </div>
    <div className="sticky" role="group" aria-label="Quick contact actions"><WhatsAppCta location="sticky_bar" variant="gold">WhatsApp</WhatsAppCta><CallCta location="sticky_bar" variant="line">Call</CallCta></div>
  </>);
}
