import logo from '../assets/logo/logo.webp';
export default function ProductVisual({ p, eager }) {
  if (p.image) return <img src={p.image} alt={`${p.name}, ${p.category} by Dermaclick`} loading={eager ? 'eager' : 'lazy'} decoding="async" width="600" height="750" />;
  return (<div className="ph" role="img" aria-label={`${p.name}: product image unavailable`}><img src={logo} alt="" width="90" height="71" loading="lazy" /></div>);
}
