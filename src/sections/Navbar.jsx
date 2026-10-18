import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { WhatsAppCta } from '../components/Cta';
const links = [['Home', '/#home'], ['About', '/#about'], ['Products', '/#products'], ['Contact', '/#contact']];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const buttonRef = useRef(null);
  const navRef = useRef(null);
  const closeMenu = () => {
    setOpen(false);
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
    const updateScrollState = () => setScrolled(window.scrollY > 18);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);
  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}><div className="wrap nav-in">
      <Link to="/" aria-label="Dermaclick home" onClick={() => setOpen(false)}><Logo /></Link>
      <button ref={buttonRef} className="burger" aria-expanded={open} aria-controls="menu" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={toggleMenu}><span /><span /></button>
      <nav ref={navRef} id="menu" className={open ? 'open' : ''} aria-label="Main navigation" onClick={() => { if (open) closeMenu(); }}>
        {links.map(([l, h]) => <a key={l} href={h}>{l}</a>)}
        <WhatsAppCta location="navbar" variant="solid sm">WhatsApp</WhatsAppCta>
      </nav>
    </div></header>
  );
}
