import { useEffect, useMemo, useRef } from 'react';
import { useMap } from './MapContext';
import { useEventStore } from '../../stores/eventStore';
import { useMapStore } from '../../stores/mapStore';
import { CATEGORY_COLORS } from '../../lib/constants';
import type { TimelineEvent } from '../../lib/types';

function buildGeoJSON(events: TimelineEvent[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: events.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.longitude, e.latitude] },
      properties: {
        id: e.id, name: e.name, category: e.category,
        significance: e.significance, date_display: e.date_display,
        location_precision: e.location_precision || 'city',
      },
    })),
  };
}

export function EventMarkers() {
  const map = useMap();
  const events = useEventStore((s) => s.events);
  const activeCategories = useEventStore((s) => s.activeCategories);
  const minSignificance = useEventStore((s) => s.minSignificance);

  const filtered = useMemo(
    () => events.filter(
      (e) => activeCategories.has(e.category) && e.significance >= minSignificance
    ),
    [events, activeCategories, minSignificance],
  );

  // One-time layer + handler setup
  useEffect(() => {
    if (!map) return;

    const setup = () => {
      if (map.getSource('events-source')) return;

      map.addSource('events-source', { type: 'geojson', data: buildGeoJSON([]) });

      const catColors: string[] = Object.entries(CATEGORY_COLORS).flatMap(
        ([cat, color]) => [cat, color]
      );

      map.addLayer({
        id: 'events-layer',
        type: 'circle',
        source: 'events-source',
        paint: {
          'circle-radius': [
            'match', ['get', 'location_precision'],
            'exact', ['interpolate', ['linear'], ['get', 'significance'], 1, 4, 5, 6, 8, 9, 10, 12],
            'city', ['interpolate', ['linear'], ['get', 'significance'], 1, 5, 5, 8, 8, 11, 10, 14],
            /* region */ ['interpolate', ['linear'], ['get', 'significance'], 1, 12, 5, 18, 8, 24, 10, 30],
          ] as any,
          'circle-color': [
            'match', ['get', 'category'],
            ...catColors,
            '#7f8c8d',
          ] as any,
          'circle-stroke-width': [
            'match', ['get', 'location_precision'],
            'exact', 2,
            'city', 1.5,
            0.5,
          ] as any,
          'circle-stroke-color': [
            'match', ['get', 'location_precision'],
            'region', 'rgba(200, 195, 180, 0.3)',
            'rgba(26, 29, 35, 0.8)',
          ] as any,
          'circle-opacity': [
            'match', ['get', 'location_precision'],
            'exact', 0.9,
            'city', 0.75,
            0.3,
          ] as any,
          'circle-blur': [
            'match', ['get', 'location_precision'],
            'region', 0.6,
            0,
          ] as any,
        },
      });

      map.on('click', 'events-layer', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const id = Number(feature.properties?.id);
        const current = useEventStore.getState().events;
        const event = current.find((ev) => ev.id === id);
        if (event) useEventStore.getState().selectEvent(event);
      });

      map.on('mouseenter', 'events-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'events-layer', () => {
        map.getCanvas().style.cursor = useMapStore.getState().mode === 'generate' ? 'crosshair' : '';
      });
    };

    if (map.isStyleLoaded()) setup();

    const onStyleLoad = () => setup();
    map.on('style.load', onStyleLoad);
    return () => { map.off('style.load', onStyleLoad); };
  }, [map]);

  // Update source data when filtered events change
  useEffect(() => {
    if (!map) return;
    const src = map.getSource('events-source') as maplibregl.GeoJSONSource | undefined;
    if (src) src.setData(buildGeoJSON(filtered));
  }, [map, filtered]);

  return null;
}
