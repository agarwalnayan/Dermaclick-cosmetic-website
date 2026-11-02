import { useState } from 'react';
import logo from '../assets/logo/logo.webp';
// Shows the complete product photograph (never cropped; framing is done by the parent container).
// `decorative` is for images that sit beside text that already names the product.
export default function ProductVisual({ p, eager, decorative }) {
  const [failed, setFailed] = useState(false); // a missing/broken image falls back to the logo placeholder
  if (p.image && !failed) {
    const alt = decorative ? '' : `${p.name} - ${p.category} product by Dermaclick. ${p.shortDescription || p.description?.substring(0, 100)}`;
    return <img src={p.image} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" width="900" height="900" onError={() => setFailed(true)} />;
  }
  return (<div className="ph" role="img" aria-label={`${p.name}: product image unavailable`}><img src={logo} alt="Dermaclick Logo" width="90" height="71" loading="lazy" /></div>);
}