'use client';
import { useState } from 'react';

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1a1a2e"/>
          <stop offset="100%" stop-color="#0a0a1a"/>
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#g)"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#6C5CE7" font-family="sans-serif" font-size="20" font-weight="bold">No Image</text>
    </svg>`
  );

export default function SafeImage({ src, alt = '', className = '', loading = 'lazy', ...rest }) {
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={errored || !src ? FALLBACK : src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
}
