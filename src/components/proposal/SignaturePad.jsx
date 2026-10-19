import React, { useRef, useState } from 'react';
import { Eraser } from 'lucide-react';

/** Draw-signature canvas. Exports a compact PNG data URL for the signing record. */
export default function SignaturePad({ onChange, disabled }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvasRef.current.width,
      y: ((e.clientY - rect.top) / rect.height) * canvasRef.current.height,
    };
  };
  const start = (e) => {
    if (disabled) return;
    drawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e) => {
    if (!drawing.current || disabled) return;
    const ctx = canvasRef.current.getContext('2d');
    const p = pos(e);
    ctx.strokeStyle = '#f7f5f5';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (!hasInk) setHasInk(true);
  };
  const end = () => {
    drawing.current = false;
    if (hasInk && onChange) onChange(canvasRef.current.toDataURL('image/png'));
  };
  const clear = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasInk(false);
    onChange('');
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width="500"
        height="150"
        className="forged-well h-36 w-full cursor-crosshair touch-none"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <button
        type="button"
        onClick={clear}
        disabled={disabled}
        className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <Eraser className="h-3.5 w-3.5" /> Clear signature
      </button>
    </div>
  );
}