import { describe, it, expect } from 'vitest';
import { scaleScoreTo10 } from '@/lib/score';

describe('scaleScoreTo10', () => {
  it('scales 50/100 to 5', () => {
    expect(scaleScoreTo10(50)).toBe(5);
  });

  it('scales 95/100 to 10', () => {
    expect(scaleScoreTo10(95)).toBe(10);
  });

  it('scales 8/10 to 8', () => {
    expect(scaleScoreTo10(8, 10)).toBe(8);
  });

  it('handles zero max score', () => {
    expect(scaleScoreTo10(5, 0)).toBe(0);
  });
});
