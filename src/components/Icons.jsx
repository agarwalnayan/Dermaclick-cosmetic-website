// Small inline line icons (decorative; they carry no meaning of their own, so they are hidden from assistive tech).
const base = { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', focusable: 'false' };
export const FlaskIcon = (props) => (<svg {...base} {...props}><path d="M9 3h6M10 3v6.2L4.6 18.5A2 2 0 0 0 6.3 21.5h11.4a2 2 0 0 0 1.7-3L14 9.2V3" /><path d="M7.6 15h8.8" /></svg>);
export const TagIcon = (props) => (<svg {...base} {...props}><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V4a1 1 0 0 1 1-1h9l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.6" cy="7.6" r="1.2" /></svg>);
export const DropIcon = (props) => (<svg {...base} {...props}><path d="M12 3.2c3.2 4 6 7 6 10.3a6 6 0 0 1-12 0c0-3.3 2.8-6.3 6-10.3z" /></svg>);
export const ChatIcon = (props) => (<svg {...base} {...props}><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9.5L5 20.5V17H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" /></svg>);
export const CheckCircleIcon = (props) => (<svg {...base} width={26} height={26} strokeWidth={1.5} {...props}><circle cx="12" cy="12" r="9" /><path d="M8 12.4l2.7 2.7 5.5-5.5" /></svg>);
export const ChevronIcon = (props) => (<svg {...base} width={14} height={14} strokeWidth={2} {...props}><path d="M6 9l6 6 6-6" /></svg>);