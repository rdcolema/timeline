import { useTimelineStore } from '../../stores/timelineStore';
import { getEraForYear } from '../../lib/yearScale';

const PRESET_ERAS = [
  { label: 'Ancient', midYear: -1750 },
  { label: 'Classical', midYear: 0 },
  { label: 'Medieval', midYear: 1000 },
  { label: 'Early Modern', midYear: 1625 },
  { label: 'Modern', midYear: 1825 },
  { label: 'Contemporary', midYear: 1960 },
];

export function EraPresets() {
  const year = useTimelineStore((s) => s.year);
  const setYear = useTimelineStore((s) => s.setYear);
  const currentEra = getEraForYear(year);

  const isActive = (label: string) => {
    if (label === 'Medieval') {
      return ['Early Medieval', 'High Medieval', 'Late Medieval'].includes(currentEra);
    }
    return currentEra === label;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-2">
      {PRESET_ERAS.map((era) => (
        <button
          key={era.label}
          onClick={() => setYear(era.midYear)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            isActive(era.label)
              ? 'bg-accent-gold text-bg-primary font-semibold'
              : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
          }`}
        >
          {era.label}
        </button>
      ))}
    </div>
  );
}
