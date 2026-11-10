import ProductVisual from './ProductVisual';
export default function AmbientImage({ p, eager, decorative, className = '' }) {
  const style = p.image ? { '--ambient': `url("${p.image}")` } : undefined;
  return (
    <div className={`ambient ${className}`.trim()} style={style}>
      <ProductVisual p={p} eager={eager} decorative={decorative} />
    </div>
  );
}