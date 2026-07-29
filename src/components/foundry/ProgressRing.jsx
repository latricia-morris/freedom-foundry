import React from 'react';

export default function ProgressRing({ percentage = 0, size = 220, strokeWidth = 18, label, sublabel }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Reflection hotspot — ~12° arc near the brightest gradient point (~80% around)
  const reflectionLength = (12 / 360) * circumference;
  const reflectionOffset = -((80 / 360) * circumference);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a1518" />
            <stop offset="45%" stopColor="#b3232c" />
            <stop offset="80%" stopColor="#d9622c" />
            <stop offset="100%" stopColor="#f5c88a" />
          </linearGradient>
          <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
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
        {/* Reflection hotspot */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,245,220,0.85)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${reflectionLength} ${circumference - reflectionLength}`}
          strokeDashoffset={reflectionOffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="font-heading text-3xl font-light text-foreground">{label}</span>}
        {sublabel && <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">{sublabel}</span>}
      </div>
    </div>
  );
}