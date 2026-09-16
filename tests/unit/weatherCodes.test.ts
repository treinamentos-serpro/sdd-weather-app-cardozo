import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('getWeatherCondition', () => {
  it('returns the condition for a known weather code', () => {
    expect(getWeatherCondition(0)).toEqual({
      label: 'Céu limpo',
      icon: '☀️',
    });
  });

  it('returns the unavailable condition for an unknown weather code', () => {
    expect(getWeatherCondition(999)).toEqual({
      label: 'Condição indisponível',
      icon: '🌡️',
    });
  });
});
