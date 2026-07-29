import React from 'react';

export default function WarmGradientDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="warmGradient" x1="0%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#b3232c" />
          <stop offset="55%" stopColor="#d9622c" />
          <stop offset="100%" stopColor="#f0d9b5" />
        </linearGradient>
      </defs>
    </svg>
  );
}