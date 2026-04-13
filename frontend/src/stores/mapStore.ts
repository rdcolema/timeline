import { create } from 'zustand';
import type { MapBounds } from '../lib/types';
import type { MapStyleKey } from '../lib/constants';
import { DEFAULT_MAP_STYLE } from '../lib/constants';

export type MapMode = 'explore' | 'generate';

interface MapState {
  mapStyle: MapStyleKey;
  showBorders: boolean;
  bounds: MapBounds | null;
  flyToRequested: { lat: number; lng: number; zoom?: number } | null;
  mode: MapMode;

  setMapStyle: (style: MapStyleKey) => void;
  toggleBorders: () => void;
  setBounds: (bounds: MapBounds) => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  clearFlyTo: () => void;
  setMode: (mode: MapMode) => void;
}

export const useMapStore = create<MapState>((set) => ({
  mapStyle: DEFAULT_MAP_STYLE,
  showBorders: false,
  bounds: null,
  flyToRequested: null,
  mode: 'explore',

  setMapStyle: (style) => set({ mapStyle: style }),
  toggleBorders: () => set((s) => ({ showBorders: !s.showBorders })),
  setBounds: (bounds) => set({ bounds }),
  flyTo: (lat, lng, zoom) => set({ flyToRequested: { lat, lng, zoom } }),
  clearFlyTo: () => set({ flyToRequested: null }),
  setMode: (mode) => set({ mode }),
}));
