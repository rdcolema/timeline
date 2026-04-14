import { Router } from 'express';
import { generateForRegion } from '../generate';

export const generateRouter = Router();

generateRouter.post('/', async (req, res) => {
  const { lat, lng, year } = req.body;

  if (typeof lat !== 'number' || typeof lng !== 'number' || typeof year !== 'number') {
    res.status(400).json({ error: 'lat, lng, and year are required (numbers)' });
    return;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({ error: 'Invalid coordinates' });
    return;
  }

  if (year < -3000 || year > 2030) {
    res.status(400).json({ error: 'Year must be between -3000 and 2030' });
    return;
  }

  try {
    const events = await generateForRegion({ lat, lng, year });

    res.json({ events, total: events.length });
  } catch (err: any) {
    console.error('Generation failed:', err.message);
    res.status(502).json({ error: 'Event generation failed. Try again.' });
  }
});
