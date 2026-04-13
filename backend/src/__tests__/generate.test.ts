import { describe, it, expect } from 'vitest';
import { makeRegionKey } from '../generate';

describe('makeRegionKey', () => {
  it('floors to 10-degree grid', () => {
    expect(makeRegionKey(15.5, 23.7, -500, 500)).toBe('10,20:-500:500');
  });

  it('handles negative coordinates', () => {
    expect(makeRegionKey(-5.2, -17.3, 1890, 1910)).toBe('-10,-20:1890:1910');
  });

  it('handles exact grid boundaries', () => {
    expect(makeRegionKey(30, 40, 0, 100)).toBe('30,40:0:100');
  });

  it('handles zero coordinates', () => {
    expect(makeRegionKey(0, 0, -50, 50)).toBe('0,0:-50:50');
  });
});
