import { useState } from 'react';
import { useEventStore } from '../../stores/eventStore';
import { useMapStore } from '../../stores/mapStore';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../lib/constants';
import { formatYear, getEraForYear } from '../../lib/yearScale';

export function EventDetail() {
  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const events = useEventStore((s) => s.events);
  const selectEvent = useEventStore((s) => s.selectEvent);
  const enrichSelectedEvent = useEventStore((s) => s.enrichSelectedEvent);
  const isEnriching = useEventStore((s) => s.isEnriching);
  const flyTo = useMapStore((s) => s.flyTo);
  const [enrichError, setEnrichError] = useState<string | null>(null);

  if (!selectedEvent) return null;

  const color = CATEGORY_COLORS[selectedEvent.category];
  const era = getEraForYear(selectedEvent.year);

  const nearby = events
    .filter((e) => e.id !== selectedEvent.id && Math.abs(e.year - selectedEvent.year) <= 50)
    .sort((a, b) => b.significance - a.significance)
    .slice(0, 5);

  const handleEnrich = async () => {
    setEnrichError(null);
    try {
      await enrichSelectedEvent();
    } catch (err: any) {
      setEnrichError(err.message || 'Failed to generate summary');
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={() => selectEvent(null)}
        className="text-sm text-text-secondary hover:text-text-primary mb-3 flex items-center gap-1"
      >
        ← Back
      </button>

      <h2 className="font-heading text-xl font-bold text-text-primary mb-1">
        {selectedEvent.name}
      </h2>
      <div className="text-sm text-text-secondary mb-2">
        {selectedEvent.date_display} · {era}
      </div>
      {selectedEvent.location_name && (
        <div className="text-xs text-text-muted mb-2">📍 {selectedEvent.location_name}</div>
      )}
      <span
        className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white mb-4"
        style={{ backgroundColor: color }}
      >
        {CATEGORY_LABELS[selectedEvent.category]}
      </span>

      <div className="border-t border-bg-tertiary pt-3 mb-3">
        <p className="text-sm text-text-primary leading-relaxed">{selectedEvent.description}</p>
      </div>

      <div className="border-t border-bg-tertiary pt-3 mb-3">
        {selectedEvent.ai_summary ? (
          <div className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
            {selectedEvent.ai_summary}
          </div>
        ) : (
          <div>
            <button
              onClick={handleEnrich}
              disabled={isEnriching}
              className="px-4 py-2 bg-accent-gold text-bg-primary text-sm font-semibold rounded-full hover:bg-accent-gold-bright transition-colors disabled:opacity-50"
            >
              {isEnriching ? 'Generating...' : 'Generate deeper analysis'}
            </button>
            {isEnriching && (
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-bg-tertiary rounded animate-pulse" />
                <div className="h-4 bg-bg-tertiary rounded animate-pulse w-5/6" />
                <div className="h-4 bg-bg-tertiary rounded animate-pulse w-4/6" />
              </div>
            )}
            {enrichError && (
              <p className="mt-2 text-sm text-cat-military">{enrichError}</p>
            )}
          </div>
        )}
      </div>

      {nearby.length > 0 && (
        <div className="border-t border-bg-tertiary pt-3">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
            Nearby in time
          </h3>
          <div className="space-y-1">
            {nearby.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  selectEvent(e);
                  flyTo(e.latitude, e.longitude, 6);
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-bg-tertiary rounded transition-colors flex items-center gap-2"
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
        </div>
      )}
    </div>
  );
}
