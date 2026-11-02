import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { WhatsAppCta } from '../components/Cta';
import { ChevronIcon } from '../components/Icons';
import { categories } from '../data/products';
import { categoryId } from '../utils/categoryId';
const links = [['Featured', '/#featured'], ['About', '/#about'], ['Contact', '/#contact']];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // the Products dropdown (desktop) / accordion (mobile)
  const [scrolled, setScrolled] = useState(false);
  const buttonRef = useRef(null);
  const navRef = useRef(null);
  const closeMenu = () => {
    setOpen(false);
    setMenuOpen(false);
    buttonRef.current?.focus();
  };
  const toggleMenu = () => { if (open) closeMenu(); else setOpen(true); };
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
        return;
      }
      if (event.key === 'Tab') {
        if (!navRef.current?.contains(document.activeElement)) return;
        const focusable = [...(navRef.current?.querySelectorAll('a[href], button:not(:disabled)') || [])];
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);
  useEffect(() => {
    if (!menuOpen || open) return undefined; // on mobile the full-screen menu above handles Escape
    const close = (event) => { if (event.type === 'keydown' ? event.key === 'Escape' : !navRef.current?.contains(event.target)) setMenuOpen(false); };
    document.addEventListener('keydown', close);
    document.addEventListener('mousedown', close);
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('mousedown', close); };
  }, [menuOpen, open]);
  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 18);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);
  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}><div className="wrap nav-in">
      <Link to="/" aria-label="Dermaclick home" onClick={() => { setOpen(false); setMenuOpen(false); }}><Logo /></Link>
      <button ref={buttonRef} className="burger" aria-expanded={open} aria-controls="menu" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={toggleMenu}><span /><span /></button>
      <nav ref={navRef} id="menu" className={open ? 'open' : ''} aria-label="Main navigation" onClick={() => { if (open) closeMenu(); }}>
        {categories.length > 0 && (
          <div className={`nav-item${menuOpen ? ' expanded' : ''}`}>
            <button type="button" className="nav-link" aria-expanded={menuOpen} aria-controls="products-menu" onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}>Products <ChevronIcon /></button>
            <div id="products-menu" className="nav-menu">
              {categories.map((c) => <a key={c} href={`/#${categoryId(c)}`} onClick={() => setMenuOpen(false)}>{c}</a>)}
              <a href="/#products" onClick={() => setMenuOpen(false)}>All products</a>
            </div>
          </div>
        )}
        {links.map(([l, h]) => <a key={l} className="nav-link" href={h}>{l}</a>)}
        <WhatsAppCta location="navbar" variant="solid sm">Enquire</WhatsAppCta>
      </nav>
    </div></header>
  );
}