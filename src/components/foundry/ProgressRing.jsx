import React from 'react';

export default function ProgressRing({ percentage = 0, size = 180, strokeWidth = 12, label, sublabel }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="molten-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#660000" />
            <stop offset="50%" stopColor="#FF4D00" />
            <stop offset="100%" stopColor="#C88062" />
          </linearGradient>
          <filter id="molten-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(240 5% 12%)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#molten-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#molten-glow)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="font-heading text-3xl font-light text-foreground">{label}</span>}
        {sublabel && <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">{sublabel}</span>}
      </div>
    </div>
  );
}