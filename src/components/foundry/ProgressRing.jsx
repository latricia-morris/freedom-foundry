import React from 'react';

export default function ProgressRing({ percentage = 0, size = 220, strokeWidth = 18, label, sublabel }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Hotspot position — on the ring at ~30° from top (brightest gradient area)
  const hotspotAngle = Math.PI * 0.17;
  const hotspotX = size / 2 + radius * Math.sin(hotspotAngle);
  const hotspotY = size / 2 - radius * Math.cos(hotspotAngle);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a0404" />
            <stop offset="20%" stopColor="#840a1a" />
            <stop offset="45%" stopColor="#b3232c" />
            <stop offset="65%" stopColor="#d9622c" />
            <stop offset="85%" stopColor="#f0d9b5" />
            <stop offset="100%" stopColor="#4a0404" />
          </linearGradient>
          <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="softStroke" />
            <feGaussianBlur in="softStroke" stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="softStroke" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#ring-glow)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="ring-hotspot" style={{ left: hotspotX - 20, top: hotspotY - 20 }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {label && <span className="font-heading text-3xl font-light text-foreground">{label}</span>}
        {sublabel && <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">{sublabel}</span>}
      </div>
    </div>
  );
}