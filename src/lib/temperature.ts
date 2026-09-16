import type { Unit } from '../types/weather';

const UNIT_SYMBOL: Record<Unit, string> = {
  celsius: '°C',
  fahrenheit: '°F',
};

export function convertTemperature(temperatureCelsius: number, unit: Unit): number {
  const temperature = unit === 'fahrenheit'
    ? (temperatureCelsius * 9) / 5 + 32
    : temperatureCelsius;

  return Math.round(temperature);
}

export function formatTemperature(temperatureCelsius: number | undefined, unit: Unit): string {
  if (temperatureCelsius === undefined || !Number.isFinite(temperatureCelsius)) {
    return 'Indisponível';
  }

  return `${convertTemperature(temperatureCelsius, unit)}${UNIT_SYMBOL[unit]}`;
}
