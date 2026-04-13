import { useEffect, useRef } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { formatYear, getEraForYear } from '../../lib/yearScale';

const SPEEDS = [1, 2, 5, 10];

export function YearDisplay() {
  const year = useTimelineStore((s) => s.year);
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const playSpeed = useTimelineStore((s) => s.playSpeed);
  const togglePlay = useTimelineStore((s) => s.togglePlay);
  const setPlaySpeed = useTimelineStore((s) => s.setPlaySpeed);
  const tick = useTimelineStore((s) => s.tick);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(tick, 1000 / playSpeed);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, playSpeed, tick]);

  return (
    <div className="flex items-center justify-center gap-4 mb-1">
      <div className="text-center">
        <div className="font-heading text-2xl text-accent-gold" aria-live="polite">
          {formatYear(year)}
        </div>
        <div className="text-sm text-text-secondary">{getEraForYear(year)}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-tertiary text-text-primary hover:bg-accent-gold hover:text-bg-primary transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div className="flex gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setPlaySpeed(s)}
              className={`px-1.5 py-0.5 text-xs rounded ${
                playSpeed === s
                  ? 'bg-accent-gold text-bg-primary font-semibold'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
