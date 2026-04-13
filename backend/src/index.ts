import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { eventsRouter } from './routes/events';
import { searchRouter } from './routes/search';
import { enrichRouter } from './routes/enrich';
import { generateRouter } from './routes/generate';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10kb' }));

  app.use('/api/events', eventsRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/enrich', enrichRouter);
  app.use('/api/generate', generateRouter);

  app.use('/api/geo', express.static(path.join(__dirname, '../../data/geo'), {
    maxAge: '1d',
    setHeaders: (res) => {
      res.setHeader('Content-Type', 'application/json');
    }
  }));

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3099;
  createApp().listen(PORT, () => console.log(`Timeline API on port ${PORT}`));
}
