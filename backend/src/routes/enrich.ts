import { Router } from 'express';
import { getAI } from '../ai';
import { getDb } from '../db';

export const enrichRouter = Router();

enrichRouter.post('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }

  const db = getDb();
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  if (event.ai_summary) {
    res.json(event);
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: 'AI summaries require an Anthropic API key' });
    return;
  }

  try {
    const client = getAI();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'You are a historian writing for an educated general audience. Write a 2–3 paragraph summary of this historical event. Explain what happened, why it mattered, and connect it to broader historical context. Mention key people involved. Be engaging and accessible — not dry or encyclopedic. Write in plain prose paragraphs, no markdown formatting, no bullet points.',
      messages: [{
        role: 'user',
        content: `Event: ${event.name}\nDate: ${event.date_display}\nLocation: approximately ${event.latitude}°N, ${event.longitude}°E\nCategory: ${event.category}\nBrief description: ${event.description}`,
      }],
    });

    const summary = message.content[0].type === 'text' ? message.content[0].text : '';

    db.prepare('UPDATE events SET ai_summary = ? WHERE id = ?').run(summary, id);

    const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    res.json(updated);
  } catch (err: unknown) {
    console.error('Enrichment failed:', err);
    res.status(502).json({ error: 'Failed to generate summary' });
  }
});
