import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('temperature', () => {
  describe('convertTemperature', () => {
    it.each([
      [0, 32],
      [100, 212],
      [-40, -40],
    ])('%d°C converts to %d°F', (temperatureCelsius, expected) => {
      expect(convertTemperature(temperatureCelsius, 'fahrenheit')).toBe(expected);
    });

    it('returns the Celsius value for the Celsius unit', () => {
      expect(convertTemperature(21.6, 'celsius')).toBe(22);
    });

    it('rounds Fahrenheit values to the nearest integer', () => {
      expect(convertTemperature(20, 'fahrenheit')).toBe(68);
      expect(convertTemperature(20.4, 'fahrenheit')).toBe(69);
    });
  });

  describe('formatTemperature', () => {
    it('rounds the value and appends the Celsius symbol', () => {
      expect(formatTemperature(21.6, 'celsius')).toBe('22°C');
    });

    it('converts, rounds, and appends the Fahrenheit symbol', () => {
      expect(formatTemperature(20.4, 'fahrenheit')).toBe('69°F');
    });
  });

  describe('unitLabel', () => {
    it('returns the symbol for each unit', () => {
      expect(unitLabel('celsius')).toBe('°C');
      expect(unitLabel('fahrenheit')).toBe('°F');
    });
  });
});
