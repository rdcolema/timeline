import { MapContainer } from '../Map/MapContainer';
import { MapControls } from '../Map/MapControls';
import { Sidebar } from '../Sidebar/Sidebar';
import { TimelineSlider } from '../Timeline/TimelineSlider';
import { YearDisplay } from '../Timeline/YearDisplay';
import { EraPresets } from '../Timeline/EraPresets';
import { useEvents } from '../../hooks/useEvents';

export function AppShell() {
  useEvents();

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary font-body text-text-primary overflow-hidden">
      <header className="h-12 flex items-center justify-between px-4 border-b border-bg-tertiary shrink-0">
        <h1 className="font-heading text-xl text-accent-gold tracking-wide">Timeline</h1>
        <MapControls />
      </header>

      <div className="flex-1 flex relative overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative">
          <MapContainer />
        </div>
      </div>

      <div className="px-6 py-3 bg-bg-secondary border-t border-bg-tertiary shrink-0">
        <YearDisplay />
        <TimelineSlider />
        <EraPresets />
      </div>
    </div>
  );
}
