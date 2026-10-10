import { useState } from 'react';
import logo from '../assets/logo/logo.webp';
export default function ProductVisual({ p, eager }) {
  const [failed, setFailed] = useState(false); // a missing/broken image falls back to the logo placeholder
  if (p.image && !failed) return <img src={p.image} alt={`${p.name}, ${p.category} by Dermaclick`} loading={eager ? 'eager' : 'lazy'} decoding="async" width="600" height="750" onError={() => setFailed(true)} />;
  return (<div className="ph" role="img" aria-label={`${p.name}: product image unavailable`}><img src={logo} alt="" width="90" height="71" loading="lazy" /></div>);
}
