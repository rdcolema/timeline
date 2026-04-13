import { useMapStore } from '../../stores/mapStore';
import { MAP_STYLES } from '../../lib/constants';
import type { MapStyleKey } from '../../lib/constants';

const styleLabels: Record<MapStyleKey, string> = {
  liberty: 'Liberty',
  bright: 'Bright',
  positron: 'Positron',
};

export function MapControls() {
  const mapStyle = useMapStore((s) => s.mapStyle);
  const setMapStyle = useMapStore((s) => s.setMapStyle);
  const showBorders = useMapStore((s) => s.showBorders);
  const toggleBorders = useMapStore((s) => s.toggleBorders);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {(Object.keys(MAP_STYLES) as MapStyleKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setMapStyle(key)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              mapStyle === key
                ? 'bg-accent-gold text-bg-primary font-semibold'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            {styleLabels[key]}
          </button>
        ))}
      </div>
      <button
        onClick={toggleBorders}
        className={`px-2 py-1 text-xs rounded transition-colors ${
          showBorders
            ? 'bg-accent-gold text-bg-primary font-semibold'
            : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
        }`}
      >
        Borders
      </button>
    </div>
  );
}
