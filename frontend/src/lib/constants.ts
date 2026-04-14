import type { Era, EventCategory } from './types';

export const ERAS: Era[] = [
  { name: 'Ancient',        startYear: -3000, endYear: -500,  color: '#8B7355' },
  { name: 'Classical',      startYear: -500,  endYear: 500,   color: '#B8860B' },
  { name: 'Early Medieval', startYear: 500,   endYear: 1000,  color: '#6B8E23' },
  { name: 'High Medieval',  startYear: 1000,  endYear: 1300,  color: '#4682B4' },
  { name: 'Late Medieval',  startYear: 1300,  endYear: 1500,  color: '#7B68EE' },
  { name: 'Early Modern',   startYear: 1500,  endYear: 1750,  color: '#CD853F' },
  { name: 'Modern',         startYear: 1750,  endYear: 1900,  color: '#BC8F8F' },
  { name: 'Contemporary',   startYear: 1900,  endYear: 2030,  color: '#C9A84C' },
];

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  military:    '#c94a4a',
  political:   '#4a7cc9',
  cultural:    '#5cb85c',
  scientific:  '#d4a843',
  disaster:    '#9b59b6',
  exploration: '#2eaaa1',
  religious:   '#c97a4a',
  other:       '#7f8c8d',
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  military:    'Military',
  political:   'Political',
  cultural:    'Cultural',
  scientific:  'Scientific',
  disaster:    'Disaster',
  exploration: 'Exploration',
  religious:   'Religious',
  other:       'Other',
};

export const ALL_CATEGORIES: EventCategory[] = Object.keys(CATEGORY_COLORS) as EventCategory[];

export const MIN_YEAR = -3000;
export const MAX_YEAR = 2030;

export const MAP_STYLES = {
  liberty: 'https://tiles.openfreemap.org/styles/liberty',
  bright:  'https://tiles.openfreemap.org/styles/bright',
  positron: 'https://tiles.openfreemap.org/styles/positron',
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

export const DEFAULT_MAP_STYLE: MapStyleKey = 'positron';
