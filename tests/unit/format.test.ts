import { describe, expect, it } from 'vitest';
import { getDayLabel, getShortDate } from '../../src/lib/format';

describe('date formatting', () => {
  it('labels the first forecast day as Hoje', () => {
    expect(getDayLabel('2025-06-18', 0)).toBe('Hoje');
  });

  it('labels the second forecast day as Amanhã', () => {
    expect(getDayLabel('2025-06-19', 1)).toBe('Amanhã');
  });

  it('uses the abbreviated weekday for the remaining days', () => {
    expect(getDayLabel('2025-06-18', 2)).toBe('Qua');
  });

  it('formats the date with day and abbreviated month', () => {
    expect(getShortDate('2025-06-12')).toBe('12 Jun');
  });
});
