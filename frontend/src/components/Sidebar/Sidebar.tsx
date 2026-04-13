import { useState, useEffect } from 'react';
import { useEventStore } from '../../stores/eventStore';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { EventList } from './EventList';
import { EventDetail } from './EventDetail';

export function Sidebar() {
  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const [open, setOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(true);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-bg-secondary border border-bg-tertiary rounded-r-lg px-1 py-4 text-text-secondary hover:text-text-primary transition-colors"
        style={{ left: open ? '380px' : '0px', transition: 'left 300ms ease' }}
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
      >
        {open ? '‹' : '›'}
      </button>

      <div
        className="h-full bg-bg-secondary border-r border-bg-tertiary flex flex-col shrink-0 overflow-hidden z-10"
        style={{
          width: '380px',
          marginLeft: open ? '0px' : '-380px',
          transition: 'margin-left 300ms ease',
        }}
      >
        <div className="p-3 border-b border-bg-tertiary">
          <SearchBar />
        </div>
        <FilterPanel />
        <div className="flex-1 overflow-y-auto">
          {selectedEvent ? <EventDetail /> : <EventList />}
        </div>
      </div>
    </>
  );
}
