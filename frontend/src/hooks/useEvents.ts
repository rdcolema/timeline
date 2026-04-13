import { useEffect } from 'react';
import { useTimelineStore } from '../stores/timelineStore';
import { useEventStore } from '../stores/eventStore';
import { useMapStore } from '../stores/mapStore';
import { useDebounce } from './useDebounce';

export function useEvents() {
  const year = useTimelineStore((s) => s.year);
  const debouncedYear = useDebounce(year, 150);
  const fetchEvents = useEventStore((s) => s.fetchEvents);
  const bounds = useMapStore((s) => s.bounds);

  useEffect(() => {
    if (!bounds) return;
    const boundsStr = `${bounds.sw_lat},${bounds.sw_lng},${bounds.ne_lat},${bounds.ne_lng}`;
    fetchEvents(debouncedYear, boundsStr);
  }, [debouncedYear, bounds, fetchEvents]);
}
