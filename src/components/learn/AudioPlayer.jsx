import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward } from 'lucide-react';
import { formatTime } from '@/lib/learn';

const SPEEDS = [1, 1.25, 1.5, 2];
const ICON_BTN = 'flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30';

/** Listening bar for a lesson or chapter: seek, skip 15 seconds, speed, previous and next. */
export default function AudioPlayer({ src, title, onPrev, onNext }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => { setPlaying(false); setTime(0); setDuration(0); }, [src]);
  useEffect(() => { if (ref.current) ref.current.playbackRate = speed; }, [speed, src]);

  const toggle = () => (ref.current.paused ? ref.current.play() : ref.current.pause());
  const skip = (by) => { ref.current.currentTime = Math.max(0, Math.min(duration || 0, ref.current.currentTime + by)); };

  return (
    <div className="smoked-glass border border-border bg-card/90 p-4 sm:p-5" onContextMenu={(e) => e.preventDefault()}>
      <audio
        ref={ref} src={src} preload="metadata" controlsList="nodownload"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setPlaying(false)}
      />
      <p className="truncate text-sm font-medium text-foreground">{title}</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="w-10 text-xs tabular-nums text-muted-foreground">{formatTime(time)}</span>
        <input
          type="range" min="0" max={duration || 0} step="1" value={time} aria-label="Seek"
          onChange={(e) => { ref.current.currentTime = Number(e.target.value); setTime(Number(e.target.value)); }}
          className="h-1 flex-1 cursor-pointer accent-primary"
        />
        <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{formatTime(duration)}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button type="button" aria-label="Previous" className={ICON_BTN} onClick={onPrev} disabled={!onPrev}><SkipBack className="h-4 w-4" /></button>
        <button type="button" aria-label="Back 15 seconds" className={ICON_BTN} onClick={() => skip(-15)}><RotateCcw className="h-4 w-4" /></button>
        <button type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={toggle} className="btn-forge flex h-12 w-12 items-center justify-center rounded-full">
          {playing ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="ml-0.5 h-5 w-5" fill="currentColor" />}
        </button>
        <button type="button" aria-label="Forward 15 seconds" className={ICON_BTN} onClick={() => skip(15)}><RotateCw className="h-4 w-4" /></button>
        <button type="button" aria-label="Next" className={ICON_BTN} onClick={onNext} disabled={!onNext}><SkipForward className="h-4 w-4" /></button>
        <div className="ml-2 flex gap-1">
          {SPEEDS.map((s) => (
            <button key={s} type="button" aria-pressed={speed === s} onClick={() => setSpeed(s)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${speed === s ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}