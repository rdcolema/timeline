import { useEffect, useRef, useCallback } from 'react';
import { useMap } from './MapContext';
import { useMapStore } from '../../stores/mapStore';
import { fetchCountryBorders } from '../../lib/api';

export function CountryBorders() {
  const map = useMap();
  const showBorders = useMapStore((s) => s.showBorders);
  const bordersData = useRef<GeoJSON.FeatureCollection | null>(null);
  const loaded = useRef(false);

  const addBorderLayers = useCallback(() => {
    if (!map || !bordersData.current) return;
    if (map.getSource('country-borders')) return;

    map.addSource('country-borders', { type: 'geojson', data: bordersData.current });

    map.addLayer({
      id: 'country-fills-layer',
      type: 'fill',
      source: 'country-borders',
      paint: {
        'fill-color': 'rgba(200, 195, 180, 0.05)',
        'fill-outline-color': 'rgba(200, 195, 180, 0.2)',
      },
      layout: { visibility: showBorders ? 'visible' : 'none' },
    });

    map.addLayer({
      id: 'country-borders-layer',
      type: 'line',
      source: 'country-borders',
      paint: {
        'line-color': 'rgba(200, 195, 180, 0.3)',
        'line-width': 0.8,
      },
      layout: { visibility: showBorders ? 'visible' : 'none' },
    });

    loaded.current = true;
  }, [map, showBorders]);

  useEffect(() => {
    if (!map) return;

    const init = async () => {
      if (!bordersData.current) {
        try {
          bordersData.current = await fetchCountryBorders();
        } catch {
          return;
        }
      }
      if (map.isStyleLoaded()) addBorderLayers();
    };

    init();

    const onStyleLoad = () => {
      loaded.current = false;
      addBorderLayers();
    };
    map.on('style.load', onStyleLoad);
    return () => { map.off('style.load', onStyleLoad); };
  }, [map, addBorderLayers]);

  useEffect(() => {
    if (!map || !loaded.current) return;
    const vis = showBorders ? 'visible' : 'none';
    try {
      map.setLayoutProperty('country-borders-layer', 'visibility', vis);
      map.setLayoutProperty('country-fills-layer', 'visibility', vis);
    } catch { /* layers may not exist yet */ }
  }, [map, showBorders]);

  return null;
}
