import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useMap } from './MapContext';
import { useEventStore } from '../../stores/eventStore';
import { CATEGORY_COLORS } from '../../lib/constants';
import { getEraForYear } from '../../lib/yearScale';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function EventPopup() {
  const map = useMap();
  const selectedEvent = useEventStore((s) => s.selectedEvent);
  const selectEvent = useEventStore((s) => s.selectEvent);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const closedByEffect = useRef(false);

  useEffect(() => {
    if (popupRef.current) {
      closedByEffect.current = true;
      popupRef.current.remove();
      popupRef.current = null;
      closedByEffect.current = false;
    }

    if (!map || !selectedEvent) return;

    const color = CATEGORY_COLORS[selectedEvent.category] || '#7f8c8d';
    const era = getEraForYear(selectedEvent.year);

    const html = `
      <div style="font-family: 'Source Sans 3', sans-serif; max-width: 280px; color: #e8e6e1;">
        <h3 style="font-family: 'Lora', serif; font-size: 16px; font-weight: 700; margin: 0 0 4px 0; color: #e8e6e1;">${esc(selectedEvent.name)}</h3>
        <div style="font-size: 13px; color: #a8a49c; margin-bottom: 6px;">${esc(selectedEvent.date_display)} · ${esc(era)}</div>
        ${selectedEvent.location_name ? `<div style="font-size: 12px; color: #8a8680; margin-bottom: 6px;">\u{1F4CD} ${esc(selectedEvent.location_name)}</div>` : ''}
        <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; color: white; background: ${color}; margin-bottom: 8px; text-transform: capitalize;">${esc(selectedEvent.category)}</span>
        <p style="font-size: 14px; line-height: 1.5; margin: 0; color: #c8c5be;">${esc(selectedEvent.description)}</p>
      </div>
    `;

    const popup = new maplibregl.Popup({
      closeOnClick: false,
      maxWidth: '320px',
      className: 'timeline-popup',
    })
      .setLngLat([selectedEvent.longitude, selectedEvent.latitude])
      .setHTML(html)
      .addTo(map);

    popup.on('close', () => {
      if (!closedByEffect.current) selectEvent(null);
    });
    popupRef.current = popup;

    return () => {
      closedByEffect.current = true;
      popup.remove();
      closedByEffect.current = false;
    };
  }, [map, selectedEvent, selectEvent]);

  return null;
}
