import { useState } from 'react';

export default function HomeImage({ src, alt, className, fallback }) {
  const [err, setErr] = useState(false);
  if (!src || err) return fallback || null;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErr(true)}
      loading="lazy"
    />
  );
}
