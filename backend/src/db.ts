import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const SCHEMA_PATH = path.join(__dirname, '../../data/schema.sql');
let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/timeline.db');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const isNew = !fs.existsSync(DB_PATH);
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');

    if (isNew) {
      const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
      db.exec(schema);
      db.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS events_fts USING fts5(
          name, description,
          content='events', content_rowid='id'
        );
      `);
      console.log('Database initialized automatically.');
    }

    const cols = db.prepare("PRAGMA table_info(events)").all() as { name: string }[];
    const colNames = new Set(cols.map(c => c.name));
    if (!colNames.has('location_name')) {
      db.exec("ALTER TABLE events ADD COLUMN location_name TEXT NOT NULL DEFAULT ''");
    }

    // Add unique index to prevent duplicate events from overlapping grid cells
    // First, remove existing duplicates (keep the one with the lowest id)
    const hasIndex = db.prepare(
      "SELECT 1 FROM sqlite_master WHERE type='index' AND name='idx_events_name_year'"
    ).get();
    if (!hasIndex) {
      db.exec(`
        DELETE FROM events WHERE id NOT IN (
          SELECT MIN(id) FROM events GROUP BY name, year
        )
      `);
      db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_events_name_year ON events(name, year)');
    }
  }
  return db;
}
