import { Router } from 'express';
import { getDb } from '../db';

export const eventsRouter = Router();

function getDefaultRange(year: number): number {
  if (year < -1000) return 150;
  if (year < -500) return 75;
  if (year < 500) return 50;
  if (year < 1500) return 30;
  if (year < 1800) return 15;
  return 10;
}

eventsRouter.get('/', (req, res) => {
  const year = parseInt(req.query.year as string);
  if (isNaN(year)) {
    res.status(400).json({ error: 'year parameter is required' });
    return;
  }

  const range = req.query.range ? parseInt(req.query.range as string) : getDefaultRange(year);
  const limit = Math.min(req.query.limit ? parseInt(req.query.limit as string) || 500 : 500, 1000);
  const categories = req.query.category ? (req.query.category as string).split(',') : null;
  const boundsStr = req.query.bounds as string | undefined;

  const db = getDb();
  let sql = `SELECT * FROM events WHERE year BETWEEN ? AND ?`;
  const params: (string | number)[] = [year - range, year + range];

  if (categories && categories.length > 0) {
    sql += ` AND category IN (${categories.map(() => '?').join(',')})`;
    params.push(...categories);
  }

  if (boundsStr) {
    const [swLat, swLng, neLat, neLng] = boundsStr.split(',').map(Number);
    if ([swLat, swLng, neLat, neLng].every((n) => !isNaN(n))) {
      sql += ` AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?`;
      params.push(swLat, neLat, swLng, neLng);
    }
  }

  sql += ` ORDER BY significance DESC, year ASC LIMIT ?`;
  params.push(limit);

  const events = db.prepare(sql).all(...params);
  res.json({ events, total: events.length });
});
