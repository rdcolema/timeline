import { getAI } from './ai';
import { getDb } from './db';

interface GeneratedEvent {
  name: string;
  description: string;
  date_display: string;
  year: number;
  location_name: string;
  latitude: number;
  longitude: number;
  category: string;
  significance: number;
  location_precision: string;
}

const VALID_CATEGORIES = ['military', 'political', 'cultural', 'scientific', 'disaster', 'exploration', 'religious', 'other'];

// 10 degree grid cells, roughly 1000km at equator
const GRID_SIZE = 10;

// Well-known cities as coordinate anchors for the LLM
const GEOGRAPHIC_REFS: { name: string; lat: number; lng: number }[] = [
  { name: 'London', lat: 51.5, lng: -0.1 },
  { name: 'Paris', lat: 48.9, lng: 2.3 },
  { name: 'Rome', lat: 41.9, lng: 12.5 },
  { name: 'Athens', lat: 38.0, lng: 23.7 },
  { name: 'Istanbul', lat: 41.0, lng: 29.0 },
  { name: 'Cairo', lat: 30.0, lng: 31.2 },
  { name: 'Jerusalem', lat: 31.8, lng: 35.2 },
  { name: 'Baghdad', lat: 33.3, lng: 44.4 },
  { name: 'Tehran', lat: 35.7, lng: 51.4 },
  { name: 'Delhi', lat: 28.6, lng: 77.2 },
  { name: 'Beijing', lat: 39.9, lng: 116.4 },
  { name: 'Tokyo', lat: 35.7, lng: 139.7 },
  { name: 'Moscow', lat: 55.8, lng: 37.6 },
  { name: 'Lisbon', lat: 38.7, lng: -9.1 },
  { name: 'Tangier', lat: 35.8, lng: -5.8 },
  { name: 'Carthage (Tunis)', lat: 36.9, lng: 10.2 },
  { name: 'Alexandria', lat: 31.2, lng: 29.9 },
  { name: 'Addis Ababa', lat: 9.0, lng: 38.7 },
  { name: 'Nairobi', lat: -1.3, lng: 36.8 },
  { name: 'Cape Town', lat: -33.9, lng: 18.4 },
  { name: 'Timbuktu', lat: 16.8, lng: -3.0 },
  { name: 'Dakar', lat: 14.7, lng: -17.5 },
  { name: 'Mexico City', lat: 19.4, lng: -99.1 },
  { name: 'Cusco', lat: -13.5, lng: -72.0 },
  { name: 'New York', lat: 40.7, lng: -74.0 },
  { name: 'Lima', lat: -12.0, lng: -77.0 },
  { name: 'Buenos Aires', lat: -34.6, lng: -58.4 },
  { name: 'Sydney', lat: -33.9, lng: 151.2 },
  { name: 'Samarkand', lat: 39.7, lng: 66.9 },
  { name: 'Bangkok', lat: 13.8, lng: 100.5 },
  { name: 'Guangzhou', lat: 23.1, lng: 113.3 },
  { name: 'Kyoto', lat: 35.0, lng: 135.8 },
];

function getDefaultRange(year: number): { start: number; end: number } {
  if (year < -1000) return { start: year - 150, end: year + 150 };
  if (year < -500) return { start: year - 75, end: year + 75 };
  if (year < 500) return { start: year - 50, end: year + 50 };
  if (year < 1500) return { start: year - 30, end: year + 30 };
  if (year < 1800) return { start: year - 15, end: year + 15 };
  return { start: year - 10, end: year + 10 };
}

export function makeRegionKey(lat: number, lng: number, yearStart: number, yearEnd: number): string {
  const gridLat = Math.floor(lat / GRID_SIZE) * GRID_SIZE;
  const gridLng = Math.floor(lng / GRID_SIZE) * GRID_SIZE;
  return `${gridLat},${gridLng}:${yearStart}:${yearEnd}`;
}

export function isRegionGenerated(regionKey: string): boolean {
  const db = getDb();
  const row = db.prepare('SELECT region_key FROM generated_regions WHERE region_key = ?').get(regionKey);
  return !!row;
}

const generatingRegions = new Map<string, Promise<GeneratedEvent[]>>();

export interface GenerateRequest {
  lat: number;
  lng: number;
  year: number;
  yearStart?: number;
  yearEnd?: number;
}

export async function generateForRegion(req: GenerateRequest): Promise<GeneratedEvent[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Event generation requires an Anthropic API key. Set ANTHROPIC_API_KEY in your .env file.');
  }

  const range = getDefaultRange(req.year);
  const yearStart = req.yearStart ?? range.start;
  const yearEnd = req.yearEnd ?? range.end;
  const regionKey = makeRegionKey(req.lat, req.lng, yearStart, yearEnd);

  if (isRegionGenerated(regionKey)) {
    const db = getDb();
    return db.prepare('SELECT * FROM events WHERE region_key = ?').all(regionKey) as GeneratedEvent[];
  }

  const existing = generatingRegions.get(regionKey);
  if (existing) return existing;

  const promise = doGenerate(req.lat, req.lng, yearStart, yearEnd, regionKey);
  generatingRegions.set(regionKey, promise);
  try {
    return await promise;
  } finally {
    generatingRegions.delete(regionKey);
  }
}

async function doGenerate(
  lat: number, lng: number,
  yearStart: number, yearEnd: number,
  regionKey: string
): Promise<GeneratedEvent[]> {
  const gridLat = Math.floor(lat / GRID_SIZE) * GRID_SIZE;
  const gridLng = Math.floor(lng / GRID_SIZE) * GRID_SIZE;

  const fmtYear = (y: number) => y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`;
  const span = yearEnd - yearStart;
  const targetCount = Math.max(8, Math.min(30, Math.round(span / 10)));

  console.log(`🌍 Generating ~${targetCount} events for region [${gridLat}–${gridLat + GRID_SIZE}°N, ${gridLng}–${gridLng + GRID_SIZE}°E] from ${fmtYear(yearStart)} to ${fmtYear(yearEnd)}...`);

  const client = getAI();

  // Build reference points for geographic anchoring
  const refs = GEOGRAPHIC_REFS.filter(r =>
    r.lat >= gridLat - 5 && r.lat <= gridLat + GRID_SIZE + 5 &&
    r.lng >= gridLng - 5 && r.lng <= gridLng + GRID_SIZE + 5
  ).slice(0, 6);
  const refText = refs.length > 0
    ? `\nReference points in or near this area (use these to calibrate your coordinates):\n${refs.map(r => `- ${r.name}: ${r.lat}°N, ${r.lng}°E`).join('\n')}\n`
    : '';

  const prompt = `Generate ${targetCount} significant historical events that occurred:
- Geographically: within roughly ${gridLat}° to ${gridLat + GRID_SIZE}°N latitude and ${gridLng}° to ${gridLng + GRID_SIZE}°E longitude
- Temporally: between ${fmtYear(yearStart)} and ${fmtYear(yearEnd)}

The user clicked near coordinates (${lat.toFixed(1)}°N, ${lng.toFixed(1)}°E). Focus events on this broader region.
${refText}
If this region/period has fewer than ${targetCount} notable events, return however many are historically accurate — never invent fictional events. If you can identify more significant events, include up to ${targetCount + 10}.

Return ONLY a JSON array with no other text. Each object must have exactly these fields:
{
  "name": "Event name — concise, specific",
  "description": "1–3 factual sentences: who, what, where, why it mattered",
  "date_display": "Most specific known date, e.g. 'March 15, 44 BCE' or '480 BCE' or 'c. 1200 BCE'",
  "year": integer (negative for BCE),
  "location_name": "Modern or historical place name, e.g. 'Thapsus, Tunisia' or 'Strait of Hormuz'",
  "latitude": number — the real coordinates of location_name, NOT adjusted to fit the box,
  "longitude": number — the real coordinates of location_name, NOT adjusted to fit the box,
  "category": one of "military"|"political"|"cultural"|"scientific"|"disaster"|"exploration"|"religious"|"other",
  "significance": integer 1-10 (10 = civilizational turning point, 8-9 = widely known, 6-7 = history student level, 4-5 = notable, 1-3 = minor but interesting),
  "location_precision": "exact" | "city" | "region"
}

COORDINATE ACCURACY — CRITICAL:
- First decide the location_name (a real place). Then provide the real-world coordinates of THAT place.
- Do NOT guess coordinates. If you name a city, use that city's actual coordinates.
- Example: "Tangier, Morocco" → 35.78°N, -5.81°E. Do NOT place Tangier at 20°N.
- If the real coordinates of an event fall outside the geographic box above, OMIT that event entirely. Never move an event's coordinates to force it inside the box.

The location_precision field indicates how confident the coordinates are:
- "exact": A specific site — a battlefield, a building, a monument. Coordinates accurate to the actual place.
- "city": A city-level event — something that happened in a specific city but not a pinpointable site. Coordinates are the city center.
- "region": A broad process, trade route, migration, or cultural trend spanning a large area. Coordinates are a representative center point.

REQUIREMENTS:
- Category balance: include multiple categories, not just battles.
- Include cultural, scientific, religious events where historically present.
- All events must be real, documented historical events.
- It is better to return fewer events than to include any with wrong coordinates.

Before finalizing, verify each event: does the location_name actually match the latitude/longitude? If not, fix or remove it.

Return ONLY the JSON array. No markdown fences, no commentary.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  let events: GeneratedEvent[];
  try {
    const trimmed = text.trim();
    const jsonStart = trimmed.indexOf('[');
    const jsonEnd = trimmed.lastIndexOf(']');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON array found in response');
    events = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
  } catch (e: any) {
    console.error('Failed to parse generated events:', e.message);
    console.error('Raw response (first 500 chars):', text.slice(0, 500));
    throw new Error('Failed to parse generated events');
  }

  // Validate
  const margin = 2; // allow 2° outside the grid for border events
  const valid = events.filter((e) => {
    if (!e.name || !e.description || !e.date_display) return false;
    if (typeof e.year !== 'number' || e.year < -3500 || e.year > 2026) return false;
    if (typeof e.latitude !== 'number' || e.latitude < -90 || e.latitude > 90) return false;
    if (typeof e.longitude !== 'number' || e.longitude < -180 || e.longitude > 180) return false;
    // Reject events outside the grid cell (catches LLM coordinate hallucinations)
    if (e.latitude < gridLat - margin || e.latitude > gridLat + GRID_SIZE + margin) return false;
    if (e.longitude < gridLng - margin || e.longitude > gridLng + GRID_SIZE + margin) return false;
    if (!e.location_name || typeof e.location_name !== 'string') e.location_name = '';
    if (!VALID_CATEGORIES.includes(e.category)) e.category = 'other';
    if (typeof e.significance !== 'number' || e.significance < 1 || e.significance > 10) e.significance = 5;
    if (!['exact', 'city', 'region'].includes(e.location_precision)) e.location_precision = 'city';
    return true;
  });

  console.log(`  ✅ Parsed ${valid.length}/${events.length} valid events`);

  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO events (name, description, date_display, year, location_name, latitude, longitude, category, significance, location_precision, region_key)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAll = db.transaction((evts: GeneratedEvent[]) => {
    for (const e of evts) {
      insert.run(e.name, e.description, e.date_display, e.year, e.location_name, e.latitude, e.longitude, e.category, e.significance, e.location_precision, regionKey);
    }
  });

  insertAll(valid);

  db.prepare(`
    INSERT OR REPLACE INTO generated_regions (region_key, center_lat, center_lng, year_start, year_end, event_count)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(regionKey, lat, lng, yearStart, yearEnd, valid.length);

  rebuildFts();

  const stored = db.prepare('SELECT * FROM events WHERE region_key = ?').all(regionKey) as GeneratedEvent[];

  console.log(`  📍 Region ${regionKey} complete (${valid.length} events stored)`);
  return stored;
}

export function rebuildFts() {
  const db = getDb();
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS events_fts USING fts5(
      name, description,
      content='events', content_rowid='id'
    );
  `);
  db.exec(`INSERT INTO events_fts(events_fts) VALUES('rebuild')`);
}
