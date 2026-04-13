import { useState, useEffect, useRef } from 'react';
import { useEventStore } from '../../stores/eventStore';
import { useMapStore } from '../../stores/mapStore';
import { useDebounce } from '../../hooks/useDebounce';
import { CATEGORY_COLORS } from '../../lib/constants';
import { formatYear } from '../../lib/yearScale';

export function SearchBar() {
  const [input, setInput] = useState('');
  const debounced = useDebounce(input, 300);
  const search = useEventStore((s) => s.search);
  const clearSearch = useEventStore((s) => s.clearSearch);
  const searchResults = useEventStore((s) => s.searchResults);
  const selectEvent = useEventStore((s) => s.selectEvent);
  const flyTo = useMapStore((s) => s.flyTo);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounced.trim()) {
      search(debounced);
      setShowDropdown(true);
    } else {
      clearSearch();
      setShowDropdown(false);
    }
  }, [debounced, search, clearSearch]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSelect = (result: typeof searchResults[0]) => {
    selectEvent(result);
    flyTo(result.latitude, result.longitude, 6);
    setShowDropdown(false);
    setInput('');
    clearSearch();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">🔍</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setInput('');
              clearSearch();
              setShowDropdown(false);
            }
          }}
          placeholder="Search events..."
          className="w-full pl-9 pr-8 py-2 bg-bg-tertiary rounded-lg text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-1 focus:ring-accent-gold"
        />
        {input && (
          <button
            onClick={() => { setInput(''); clearSearch(); setShowDropdown(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-bg-tertiary rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          {searchResults.slice(0, 10).map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-3 py-2 hover:bg-bg-tertiary transition-colors flex items-center gap-2"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[r.category] }}
              />
              <span className="text-sm text-text-primary truncate flex-1">{r.name}</span>
              <span className="text-xs text-text-muted shrink-0">{formatYear(r.year)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
