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
  }
  return db;
}
