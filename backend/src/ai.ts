import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getAI(): Anthropic {
  if (!client) {
    client = new Anthropic({ maxRetries: 4 });
  }
  return client;
}
