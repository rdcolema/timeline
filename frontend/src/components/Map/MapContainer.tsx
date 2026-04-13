import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useMapStore } from '../../stores/mapStore';
import { useEventStore } from '../../stores/eventStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { MAP_STYLES } from '../../lib/constants';
import { MapContext } from './MapContext';
import { EventMarkers } from './EventMarkers';
import { EventPopup } from './EventPopup';
import { CountryBorders } from './CountryBorders';

export function MapContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const mapStyle = useMapStore((s) => s.mapStyle);
  const flyToRequested = useMapStore((s) => s.flyToRequested);
  const clearFlyTo = useMapStore((s) => s.clearFlyTo);
  const setBounds = useMapStore((s) => s.setBounds);
  const mode = useMapStore((s) => s.mode);
  const setMode = useMapStore((s) => s.setMode);
  const generateForLocation = useEventStore((s) => s.generateForLocation);
  const isGenerating = useEventStore((s) => s.isGenerating);
  const generateMessage = useEventStore((s) => s.generateMessage);
  const year = useTimelineStore((s) => s.year);

  useEffect(() => {
    if (!containerRef.current) return;
    const m = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLES[mapStyle],
      center: [20, 20],
      zoom: 2,
      minZoom: 1.5,
      maxZoom: 15,
      attributionControl: {},
    });
    m.addControl(new maplibregl.NavigationControl(), 'top-right');

    m.on('moveend', () => {
      const b = m.getBounds();
      setBounds({
        sw_lat: b.getSouth(),
        sw_lng: b.getWest(),
        ne_lat: b.getNorth(),
        ne_lng: b.getEast(),
      });
    });

    m.on('load', () => setMap(m));

    return () => { m.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    const handleClick = (e: maplibregl.MapMouseEvent) => {
      if (useMapStore.getState().mode !== 'generate') return;
      if (useEventStore.getState().isGenerating) return;
      const features = map.queryRenderedFeatures(e.point, { layers: ['events-layer'] });
      if (features.length > 0) return;

      const { lat, lng } = e.lngLat;
      generateForLocation(lat, lng, year);
    };
    map.on('click', handleClick);
    return () => { map.off('click', handleClick); };
  }, [map, generateForLocation, year]);

  useEffect(() => {
    if (!map) return;
    map.getCanvas().style.cursor = mode === 'generate' ? 'crosshair' : '';
  }, [map, mode]);

  useEffect(() => {
    if (!map) return;
    map.setStyle(MAP_STYLES[mapStyle]);
  }, [map, mapStyle]);

  useEffect(() => {
    if (!map || !flyToRequested) return;
    map.flyTo({
      center: [flyToRequested.lng, flyToRequested.lat],
      zoom: flyToRequested.zoom ?? 6,
      duration: 1500,
    });
    clearFlyTo();
  }, [map, flyToRequested, clearFlyTo]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-bg-secondary border border-bg-tertiary rounded-lg p-1 shadow-lg">
        <button
          onClick={() => setMode('explore')}
          className={`px-3 py-1.5 text-xs rounded transition-colors ${
            mode === 'explore'
              ? 'bg-bg-tertiary text-text-primary font-semibold'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          Explore
        </button>
        <button
          onClick={() => setMode('generate')}
          className={`px-3 py-1.5 text-xs rounded transition-colors ${
            mode === 'generate'
              ? 'bg-accent-gold text-bg-primary font-semibold'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          Generate
        </button>
      </div>
      {mode === 'generate' && !isGenerating && !generateMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-bg-secondary/90 border border-bg-tertiary rounded-lg px-3 py-1.5 shadow-lg">
          <span className="text-xs text-text-muted">Click anywhere to generate events</span>
        </div>
      )}
      {isGenerating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-text-secondary">Generating events for this region...</span>
        </div>
      )}
      {generateMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-bg-secondary border border-bg-tertiary rounded-lg px-4 py-2 shadow-lg">
          <span className="text-sm text-text-secondary">{generateMessage}</span>
        </div>
      )}
      {map && (
        <MapContext.Provider value={map}>
          <EventMarkers />
          <EventPopup />
          <CountryBorders />
        </MapContext.Provider>
      )}
    </div>
  );
}
