CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  ai_summary TEXT,
  date_display TEXT NOT NULL,
  year INTEGER NOT NULL,
  location_name TEXT NOT NULL DEFAULT '',
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  significance INTEGER NOT NULL DEFAULT 5,
  location_precision TEXT NOT NULL DEFAULT 'city',
  region_key TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_year ON events(year);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_coords ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_significance ON events(significance DESC);
CREATE INDEX IF NOT EXISTS idx_events_region ON events(region_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_name_year ON events(name, year);

CREATE TABLE IF NOT EXISTS generated_regions (
  region_key TEXT PRIMARY KEY,
  center_lat REAL NOT NULL,
  center_lng REAL NOT NULL,
  year_start INTEGER NOT NULL,
  year_end INTEGER NOT NULL,
  event_count INTEGER NOT NULL DEFAULT 0,
  generated_at TEXT DEFAULT (datetime('now'))
);
