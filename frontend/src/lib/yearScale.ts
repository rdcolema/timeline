import { MIN_YEAR, MAX_YEAR } from './constants';

// Piecewise linear slider: recent history gets more slider real estate.
// [sliderPosition, year]
const BREAKPOINTS: [number, number][] = [
  [0.00, -3000],
  [0.15, -500],
  [0.30, 500],
  [0.45, 1300],
  [0.60, 1700],
  [0.80, 1900],
  [1.00, 2030],
];

export function sliderToYear(position: number): number {
  const clamped = Math.max(0, Math.min(1, position));
  for (let i = 1; i < BREAKPOINTS.length; i++) {
    const [p0, y0] = BREAKPOINTS[i - 1];
    const [p1, y1] = BREAKPOINTS[i];
    if (clamped <= p1) {
      const t = (clamped - p0) / (p1 - p0);
      return Math.round(y0 + t * (y1 - y0));
    }
  }
  return MAX_YEAR;
}

export function yearToSlider(year: number): number {
  const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
  for (let i = 1; i < BREAKPOINTS.length; i++) {
    const [p0, y0] = BREAKPOINTS[i - 1];
    const [p1, y1] = BREAKPOINTS[i];
    if (clamped <= y1) {
      const t = (clamped - y0) / (y1 - y0);
      return p0 + t * (p1 - p0);
    }
  }
  return 1;
}

export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  if (year === 0) return '1 BCE';
  return `${year} CE`;
}

export function getEraForYear(year: number): string {
  if (year < -500) return 'Ancient';
  if (year < 500) return 'Classical';
  if (year < 1000) return 'Early Medieval';
  if (year < 1300) return 'High Medieval';
  if (year < 1500) return 'Late Medieval';
  if (year < 1750) return 'Early Modern';
  if (year < 1900) return 'Modern';
  return 'Contemporary';
}
