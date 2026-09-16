/**
 * Dados mock de WeatherData para desenvolver a UI sem depender da API real.
 */
import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    region: 'São Paulo',
    country: 'Brasil',
    countryCode: 'BR',
    latitude: -23.5475,
    longitude: -46.6361,
  },
  timezone: 'America/Sao_Paulo',
  current: {
    temperatureCelsius: 24,
    weatherCode: 2,
  },
  forecast: [
    {
      date: '2026-09-16',
      weatherCode: 2,
      precipitationProbability: 15,
      minTemperatureCelsius: 17,
      maxTemperatureCelsius: 26,
    },
    {
      date: '2026-09-17',
      weatherCode: 3,
      precipitationProbability: 30,
      minTemperatureCelsius: 16,
      maxTemperatureCelsius: 23,
    },
    {
      date: '2026-09-18',
      weatherCode: 61,
      precipitationProbability: 70,
      minTemperatureCelsius: 15,
      maxTemperatureCelsius: 20,
    },
    {
      date: '2026-09-19',
      weatherCode: 1,
      precipitationProbability: 10,
      minTemperatureCelsius: 14,
      maxTemperatureCelsius: 22,
    },
    {
      date: '2026-09-20',
      weatherCode: 0,
      precipitationProbability: 0,
      minTemperatureCelsius: 15,
      maxTemperatureCelsius: 25,
    },
  ],
};
