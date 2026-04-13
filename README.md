# Timeline

Interactive historical world map. Click anywhere on the map to generate historical events for that region and time period using Claude. Events are cached in SQLite so the same region/era loads instantly on subsequent visits.

Built with MapLibre GL JS, React, Express, and the Anthropic API.

## Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

## Setup

```
git clone <repo-url> && cd timeline
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

cp .env.example .env
# add your ANTHROPIC_API_KEY to .env

npm run dev
```

Opens at http://localhost:5173. The database is created automatically on first run.

## How it works

The map divides the world into 10-degree grid cells. When you click a location, the backend checks if that cell + time range has been generated before. If not, it calls Claude to produce historically accurate events for the region, validates the coordinates, and stores everything in SQLite. Future clicks in the same cell return cached results.

Each event has a name, date, coordinates, category, significance rating, and location precision (exact site, city, or region). Marker size and opacity on the map reflect these properties.

You can also click any event and hit "Generate deeper analysis" for an AI-written narrative summary. Those are cached too.

## Architecture

```
frontend/     Vite + React + TypeScript + Tailwind CSS 4 + Zustand
backend/      Express + TypeScript + better-sqlite3 + Anthropic SDK
data/
  schema.sql  SQLite schema (auto-applied on first run)
  geo/        Natural Earth country borders (110m, public domain)
```

Map tiles from [OpenFreeMap](https://openfreemap.org/) (no API key needed).

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start frontend + backend concurrently |
| `npm run init-db` | Reset the database |
| `npm run build` | Production build of frontend |

## Things I'd still like to do

- Geocoding pass on generated events (verify LLM coordinates against a gazetteer)
- Denser reference city grid for better coordinate anchoring in underserved regions
- Event clustering at low zoom levels
- Historical border overlays that change with the timeline
