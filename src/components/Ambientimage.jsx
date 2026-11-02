import ProductVisual from './ProductVisual';
// Shows the COMPLETE product photograph (never cropped) over a blurred, enlarged copy of the same photograph.
// Wide or tall containers are therefore filled with the photo's own colours instead of flat bars, so the
// frame reads as one continuous scene. `className` sizes the container (see .ambient in styles.css).
export default function AmbientImage({ p, eager, decorative, className = '' }) {
  const style = p.image ? { '--ambient': `url("${p.image}")` } : undefined;
  return (
    <div className={`ambient ${className}`.trim()} style={style}>
      <ProductVisual p={p} eager={eager} decorative={decorative} />
    </div>
  );
}