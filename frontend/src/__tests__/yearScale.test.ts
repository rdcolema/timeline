import { describe, it, expect } from 'vitest';
import { sliderToYear, yearToSlider, formatYear, getEraForYear } from '../lib/yearScale';

describe('sliderToYear', () => {
  it('maps 0 to -3000', () => {
    expect(sliderToYear(0)).toBe(-3000);
  });

  it('maps 1 to 2030', () => {
    expect(sliderToYear(1)).toBe(2030);
  });

  it('clamps below 0', () => {
    expect(sliderToYear(-0.5)).toBe(-3000);
  });

  it('clamps above 1', () => {
    expect(sliderToYear(1.5)).toBe(2030);
  });

  it('maps midpoints monotonically', () => {
    const positions = [0, 0.1, 0.2, 0.3, 0.5, 0.7, 0.9, 1.0];
    const years = positions.map(sliderToYear);
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeGreaterThanOrEqual(years[i - 1]);
    }
  });
});

describe('yearToSlider', () => {
  it('maps -3000 to 0', () => {
    expect(yearToSlider(-3000)).toBe(0);
  });

  it('maps 2030 to 1', () => {
    expect(yearToSlider(2030)).toBe(1);
  });

  it('roundtrips with sliderToYear', () => {
    const years = [-3000, -1000, 0, 500, 1200, 1600, 1850, 1950, 2030];
    for (const y of years) {
      const pos = yearToSlider(y);
      const back = sliderToYear(pos);
      expect(Math.abs(back - y)).toBeLessThanOrEqual(1);
    }
  });
});

describe('formatYear', () => {
  it('formats BCE years', () => {
    expect(formatYear(-500)).toBe('500 BCE');
  });

  it('formats CE years', () => {
    expect(formatYear(1900)).toBe('1900 CE');
  });

  it('formats year 0 as 1 BCE', () => {
    expect(formatYear(0)).toBe('1 BCE');
  });
});

describe('getEraForYear', () => {
  it('returns Ancient for -1000', () => {
    expect(getEraForYear(-1000)).toBe('Ancient');
  });

  it('returns Classical for 0', () => {
    expect(getEraForYear(0)).toBe('Classical');
  });

  it('returns Contemporary for 2000', () => {
    expect(getEraForYear(2000)).toBe('Contemporary');
  });
});
