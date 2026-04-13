import type { EventsResponse, SearchResponse, TimelineEvent } from './types';

const BASE = '';

export async function fetchEvents(params: {
  year: number;
  range?: number;
  category?: string;
  bounds?: string;
  limit?: number;
}): Promise<EventsResponse> {
  const qs = new URLSearchParams();
  qs.set('year', String(params.year));
  if (params.range != null) qs.set('range', String(params.range));
  if (params.category) qs.set('category', params.category);
  if (params.bounds) qs.set('bounds', params.bounds);
  if (params.limit != null) qs.set('limit', String(params.limit));
  const res = await fetch(`${BASE}/api/events?${qs}`);
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  return res.json();
}

export async function searchEvents(q: string, limit = 20): Promise<SearchResponse> {
  const qs = new URLSearchParams({ q, limit: String(limit) });
  const res = await fetch(`${BASE}/api/search?${qs}`);
  if (!res.ok) throw new Error(`Failed to search events: ${res.status}`);
  return res.json();
}

export async function enrichEvent(id: number): Promise<TimelineEvent> {
  const res = await fetch(`${BASE}/api/enrich/${id}`, { method: 'POST' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(body.error || `Failed to enrich event: ${res.status}`);
  }
  return res.json();
}

export async function generateEvents(lat: number, lng: number, year: number): Promise<EventsResponse> {
  const res = await fetch(`${BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng, year }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(body.error || `Failed to generate events: ${res.status}`);
  }
  return res.json();
}

export async function fetchCountryBorders(): Promise<GeoJSON.FeatureCollection> {
  const res = await fetch(`${BASE}/api/geo/countries-110m.geojson`);
  if (!res.ok) throw new Error(`Failed to fetch borders: ${res.status}`);
  return res.json();
}
