import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import type { Express } from 'express';

const TEST_DB = path.join(__dirname, '../../test.db');
process.env.DATABASE_PATH = TEST_DB;
process.env.NODE_ENV = 'test';

let app: Express;

function request(app: Express, method: string, url: string, body?: unknown) {
  return new Promise<{ status: number; body: Record<string, unknown> }>((resolve) => {
    const { createServer } = require('http');
    const server = createServer(app);
    server.listen(0, () => {
      const port = (server.address() as { port: number }).port;
      const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
      if (body) opts.body = JSON.stringify(body);
      fetch(`http://localhost:${port}${url}`, opts)
        .then(async (res) => {
          const json = await res.json().catch(() => ({}));
          server.close();
          resolve({ status: res.status, body: json as Record<string, unknown> });
        });
    });
  });
}

beforeAll(async () => {
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);

  const { createApp } = await import('../index');
  const { getDb } = await import('../db');
  const { rebuildFts } = await import('../generate');

  app = createApp();

  const db = getDb();
  db.prepare(`
    INSERT INTO events (name, description, date_display, year, location_name, latitude, longitude, category, significance, location_precision, region_key)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('Battle of Thermopylae', 'Spartans fought Persians', '480 BCE', -480, 'Thermopylae, Greece', 38.8, 22.5, 'military', 9, 'exact', '30,20:-530:-430');

  db.prepare(`
    INSERT INTO events (name, description, date_display, year, location_name, latitude, longitude, category, significance, location_precision, region_key)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('Founding of Rome', 'Legendary founding of Rome', '753 BCE', -753, 'Rome, Italy', 41.9, 12.5, 'political', 10, 'city', '40,10:-803:-703');

  db.prepare(`
    INSERT INTO events (name, description, date_display, year, location_name, latitude, longitude, category, significance, location_precision, region_key)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('Construction of Parthenon', 'Temple built on the Acropolis', '447 BCE', -447, 'Athens, Greece', 38.0, 23.7, 'cultural', 8, 'exact', '30,20:-530:-430');

  rebuildFts();
});

afterAll(() => {
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
});

describe('GET /api/events', () => {
  it('returns events within year range', async () => {
    const res = await request(app, 'GET', '/api/events?year=-480&bounds=-90,-180,90,180');
    expect(res.status).toBe(200);
    const events = res.body.events as unknown[];
    expect(events.length).toBeGreaterThanOrEqual(2);
  });

  it('requires year parameter', async () => {
    const res = await request(app, 'GET', '/api/events');
    expect(res.status).toBe(400);
  });

  it('filters by bounds', async () => {
    const res = await request(app, 'GET', '/api/events?year=-480&bounds=37,20,40,25');
    expect(res.status).toBe(200);
    const events = res.body.events as { name: string }[];
    const names = events.map(e => e.name);
    expect(names).toContain('Battle of Thermopylae');
    expect(names).not.toContain('Founding of Rome');
  });

  it('filters by category', async () => {
    const res = await request(app, 'GET', '/api/events?year=-480&category=military&bounds=-90,-180,90,180');
    expect(res.status).toBe(200);
    const events = res.body.events as { category: string }[];
    expect(events.every(e => e.category === 'military')).toBe(true);
  });
});

describe('GET /api/search', () => {
  it('finds events by name', async () => {
    const res = await request(app, 'GET', '/api/search?q=thermopylae');
    expect(res.status).toBe(200);
    const results = res.body.results as { name: string }[];
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Battle of Thermopylae');
  });

  it('finds events by description', async () => {
    const res = await request(app, 'GET', '/api/search?q=spartans');
    expect(res.status).toBe(200);
    const results = res.body.results as unknown[];
    expect(results.length).toBe(1);
  });

  it('returns empty for no matches', async () => {
    const res = await request(app, 'GET', '/api/search?q=xyznothing');
    expect(res.status).toBe(200);
    expect((res.body.results as unknown[]).length).toBe(0);
  });

  it('requires q parameter', async () => {
    const res = await request(app, 'GET', '/api/search');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/generate', () => {
  it('rejects missing parameters', async () => {
    const res = await request(app, 'POST', '/api/generate', { lat: 40 });
    expect(res.status).toBe(400);
  });

  it('rejects invalid coordinates', async () => {
    const res = await request(app, 'POST', '/api/generate', { lat: 999, lng: 0, year: 1900 });
    expect(res.status).toBe(400);
  });
});
