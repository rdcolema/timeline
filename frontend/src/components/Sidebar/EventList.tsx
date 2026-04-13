import { useEventStore } from '../../stores/eventStore';
import { useMapStore } from '../../stores/mapStore';
import { CATEGORY_COLORS } from '../../lib/constants';
import { formatYear } from '../../lib/yearScale';

export function EventList() {
  const events = useEventStore((s) => s.events);
  const activeCategories = useEventStore((s) => s.activeCategories);
  const minSignificance = useEventStore((s) => s.minSignificance);
  const isLoading = useEventStore((s) => s.isLoading);
  const selectEvent = useEventStore((s) => s.selectEvent);
  const flyTo = useMapStore((s) => s.flyTo);

  const filtered = events
    .filter((e) => activeCategories.has(e.category) && e.significance >= minSignificance)
    .sort((a, b) => b.significance - a.significance || a.year - b.year);

  if (isLoading) {
    return (
      <div className="p-3 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-bg-tertiary rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="p-6 text-center text-text-muted text-sm">
        <div className="mb-2 text-2xl">🗺️</div>
        No events loaded yet.
        <br /><br />
        <span className="text-text-secondary">
          Set a time period with the slider, switch to <strong className="text-accent-gold">Generate</strong> mode, and click a region on the map.
        </span>
      </div>
    );
  }

  return (
    <div className="divide-y divide-bg-tertiary">
      {filtered.map((e) => (
        <button
          key={e.id}
          onClick={() => {
            selectEvent(e);
            flyTo(e.latitude, e.longitude, 6);
          }}
          className="w-full text-left px-3 py-2.5 hover:bg-bg-tertiary transition-colors flex items-center gap-2"
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: CATEGORY_COLORS[e.category] }}
          />
          <span className="text-sm text-text-primary truncate flex-1">{e.name}</span>
          <span className="text-xs text-text-muted shrink-0">{formatYear(e.year)}</span>
        </button>
      ))}
    </div>
  );
}
