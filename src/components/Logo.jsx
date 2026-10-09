import logo from '../assets/logo/logo.webp';
export default function Logo({ size = 44, word = true }) {
  return (<span className="logo"><img src={logo} width={size} height={Math.round(size * 0.79)} alt="Dermaclick crest logo" />{word && <span className="wordmark">Dermaclick</span>}</span>);
}
