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
  useEffect(() => {
    if (!open) return undefined;
    navRef.current?.querySelector('a')?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
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
      <nav ref={navRef} id="menu" className={open ? 'open' : ''} aria-label="Main navigation" onClick={() => setOpen(false)}>
        {links.map(([l, h]) => <a key={l} href={h}>{l}</a>)}
        <WhatsAppCta location="navbar" variant="solid sm">WhatsApp</WhatsAppCta>
      </nav>
      <button ref={buttonRef} className="burger" aria-expanded={open} aria-controls="menu" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}><span /><span /></button>
    </div></header>
  );
}
