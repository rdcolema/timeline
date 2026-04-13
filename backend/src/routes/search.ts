import { Router } from 'express';
import { getDb } from '../db';

export const searchRouter = Router();

searchRouter.get('/', (req, res) => {
  const q = (req.query.q as string || '').trim();
  if (!q || q.length > 200) {
    res.status(400).json({ error: 'q parameter is required (max 200 chars)' });
    return;
  }

  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  const db = getDb();

  const sanitized = q.replace(/["*:()]/g, '').trim();
  if (!sanitized) {
    res.json({ results: [], total: 0 });
    return;
  }

  const results = db.prepare(`
    SELECT e.* FROM events e
    JOIN events_fts fts ON e.id = fts.rowid
    WHERE events_fts MATCH ?
    ORDER BY e.significance DESC
    LIMIT ?
  `).all(sanitized, limit);

  res.json({ results, total: results.length });
});
