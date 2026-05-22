import { officeHighlights } from '../config/officeHighlights';

export default function HighlightList({ className = '', itemClass = 'text-white/70 text-sm', emojiClass = 'text-xl' }) {
  return (
    <ul className={`space-y-2 ${className}`}>
      {officeHighlights.map((item) => (
        <li key={item.text} className={`flex items-start gap-2 ${itemClass}`}>
          <span className={`shrink-0 leading-none ${emojiClass}`} aria-hidden>{item.emoji}</span>
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
}
