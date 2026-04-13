import { useState } from 'react';
import { useEventStore } from '../../stores/eventStore';
import { ALL_CATEGORIES, CATEGORY_COLORS, CATEGORY_LABELS } from '../../lib/constants';

export function FilterPanel() {
  const [expanded, setExpanded] = useState(false);
  const activeCategories = useEventStore((s) => s.activeCategories);
  const toggleCategory = useEventStore((s) => s.toggleCategory);
  const minSignificance = useEventStore((s) => s.minSignificance);
  const setMinSignificance = useEventStore((s) => s.setMinSignificance);

  return (
    <div className="border-b border-bg-tertiary">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-3 py-2 text-xs text-text-secondary hover:text-text-primary flex items-center justify-between"
      >
        <span>Filters</span>
        <span>{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          <div>
            <label className="text-xs text-text-muted block mb-1.5">Categories</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-2 py-0.5 text-xs rounded-full transition-colors border ${
                    activeCategories.has(cat)
                      ? 'text-white border-transparent'
                      : 'text-text-muted border-bg-tertiary opacity-40'
                  }`}
                  style={activeCategories.has(cat) ? { backgroundColor: CATEGORY_COLORS[cat] } : {}}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted block mb-1.5">
              Min. significance: {minSignificance}
            </label>
            <input
              type="range"
              min={0}
              max={10}
              value={minSignificance}
              onChange={(e) => setMinSignificance(Number(e.target.value))}
              className="w-full accent-accent-gold"
            />
          </div>
        </div>
      )}
    </div>
  );
}
