import { useRef, useCallback } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';
import { yearToSlider } from '../../lib/yearScale';
import { ERAS } from '../../lib/constants';

const TICKS = [-3000, -500, 0, 500, 1000, 1500, 1800, 1900, 2000];

export function TimelineSlider() {
  const sliderPosition = useTimelineStore((s) => s.sliderPosition);
  const setSliderPosition = useTimelineStore((s) => s.setSliderPosition);
  const setYear = useTimelineStore((s) => s.setYear);
  const year = useTimelineStore((s) => s.year);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const posFromEvent = useCallback((clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setSliderPosition(posFromEvent(e.clientX));
  }, [posFromEvent, setSliderPosition]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    setSliderPosition(posFromEvent(e.clientX));
  }, [posFromEvent, setSliderPosition]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    let delta = 0;
    if (e.key === 'ArrowRight') delta = e.shiftKey ? 10 : e.metaKey || e.ctrlKey ? 100 : 1;
    if (e.key === 'ArrowLeft') delta = -(e.shiftKey ? 10 : e.metaKey || e.ctrlKey ? 100 : 1);
    if (delta !== 0) {
      e.preventDefault();
      setYear(Math.max(-3000, Math.min(2025, year + delta)));
    }
  }, [year, setYear]);

  return (
    <div className="mt-2">
      <div
        ref={trackRef}
        className="relative h-4 cursor-pointer select-none touch-none"
        role="slider"
        tabIndex={0}
        aria-valuemin={-3000}
        aria-valuemax={2025}
        aria-valuenow={year}
        aria-valuetext={`Year ${year}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
      >
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 rounded-full bg-bg-tertiary" />

        {/* Era segments */}
        {ERAS.map((era) => {
          const left = yearToSlider(era.startYear) * 100;
          const right = yearToSlider(era.endYear) * 100;
          return (
            <div
              key={era.name}
              className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full opacity-30"
              style={{ left: `${left}%`, width: `${right - left}%`, backgroundColor: era.color }}
            />
          );
        })}

        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-accent-gold border-2 border-bg-primary shadow-lg pointer-events-none"
          style={{ left: `${sliderPosition * 100}%` }}
        />
      </div>

      {/* Tick marks */}
      <div className="relative h-5 mt-0.5">
        {TICKS.map((tickYear) => {
          const pos = yearToSlider(tickYear) * 100;
          return (
            <div key={tickYear} className="absolute -translate-x-1/2" style={{ left: `${pos}%` }}>
              <div className="w-px h-2 bg-text-muted mx-auto" />
              <span className="text-[9px] text-text-muted block text-center mt-0.5">{tickYear < 0 ? `${Math.abs(tickYear)}BC` : tickYear}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
