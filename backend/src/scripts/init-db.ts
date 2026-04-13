import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/timeline.db');
const SCHEMA_PATH = path.join(__dirname, '../../../data/schema.sql');

function main() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Remove existing DB for a fresh start
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  // Create empty FTS table
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS events_fts USING fts5(
      name, description,
      content='events', content_rowid='id'
    );
  `);

  console.log(`✅ Database initialized at ${DB_PATH}`);
  console.log('Events will be generated on-demand when queried (requires ANTHROPIC_API_KEY).');

  db.close();
}

main();
