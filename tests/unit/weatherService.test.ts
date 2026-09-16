import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

function stubOnlineStatus(online: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);
}

function stubFetch(response: unknown, init: ResponseInit = {}) {
  const fetchMock = vi.fn().mockImplementation(async () =>
    new Response(JSON.stringify(response), {
      status: 200,
      ...init,
    }),
  );

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

const city: City = {
  id: 1,
  name: 'São Paulo',
  region: 'São Paulo',
  country: 'Brasil',
  countryCode: 'BR',
  latitude: -23.55,
  longitude: -46.63,
};

describe('weatherService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('searchCities', () => {
    it('returns an empty list and does not call fetch for empty input', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      await expect(searchCities('   ')).resolves.toEqual([]);

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('maps geocoding results to cities', async () => {
      const fetchMock = stubFetch({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            country_code: 'BR',
            latitude: -23.5475,
            longitude: -46.6361,
          },
        ],
      });

      await expect(searchCities('São Paulo')).resolves.toEqual([
        {
          id: 3448439,
          name: 'São Paulo',
          region: 'São Paulo',
          country: 'Brasil',
          countryCode: 'BR',
          latitude: -23.5475,
          longitude: -46.6361,
        },
      ]);
      expect(fetchMock).toHaveBeenCalledOnce();
    });

    it('returns an empty list when geocoding results are absent', async () => {
      stubFetch({});

      await expect(searchCities('Curitiba')).resolves.toEqual([]);
    });

    it('throws WeatherServiceError for a non-ok geocoding response', async () => {
      stubFetch({ reason: 'Service unavailable' }, { status: 503 });

      await expect(searchCities('Recife')).rejects.toThrow(WeatherServiceError);
      await expect(searchCities('Recife')).rejects.toThrow('Falha ao buscar cidades: HTTP 503');
    });
  });

  describe('getWeather', () => {
    it('maps current weather and five daily forecast items', async () => {
      stubFetch({
        timezone: 'America/Sao_Paulo',
        current: {
          temperature_2m: 26.4,
          weather_code: 2,
          relative_humidity_2m: 68,
          wind_speed_10m: 12.5,
          precipitation: 1.2,
          surface_pressure: 1014,
        },
        daily: {
          time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21'],
          weather_code: [2, 3, 45, 61, 80, 95],
          temperature_2m_max: [28, 27, 25, 24, 26, 29],
          temperature_2m_min: [18, 17, 16, 15, 16, 19],
          precipitation_probability_max: [10, null, 45, 80, 0, 20],
        },
      });

      await expect(getWeather(city)).resolves.toEqual({
        city,
        timezone: 'America/Sao_Paulo',
        current: {
          temperatureCelsius: 26.4,
          weatherCode: 2,
          humidity: 68,
          windSpeedKmh: 12.5,
          precipitationMm: 1.2,
          pressureHpa: 1014,
        },
        forecast: [
          {
            date: '2026-09-16',
            weatherCode: 2,
            minTemperatureCelsius: 18,
            maxTemperatureCelsius: 28,
            precipitationProbability: 10,
          },
          {
            date: '2026-09-17',
            weatherCode: 3,
            minTemperatureCelsius: 17,
            maxTemperatureCelsius: 27,
            precipitationProbability: 0,
          },
          {
            date: '2026-09-18',
            weatherCode: 45,
            minTemperatureCelsius: 16,
            maxTemperatureCelsius: 25,
            precipitationProbability: 45,
          },
          {
            date: '2026-09-19',
            weatherCode: 61,
            minTemperatureCelsius: 15,
            maxTemperatureCelsius: 24,
            precipitationProbability: 80,
          },
          {
            date: '2026-09-20',
            weatherCode: 80,
            minTemperatureCelsius: 16,
            maxTemperatureCelsius: 26,
            precipitationProbability: 0,
          },
        ],
      });
    });

    it('throws WeatherServiceError when current or daily forecast data is absent', async () => {
      stubFetch({ timezone: 'America/Sao_Paulo' });

      await expect(getWeather(city)).rejects.toThrow(WeatherServiceError);
      await expect(getWeather(city)).rejects.toThrow('Resposta de previsão incompleta: dados ausentes');
    });

    it('normalizes null or absent weather fields without exposing invalid values', async () => {
      stubFetch({
        timezone: 'America/Sao_Paulo',
        current: {
          temperature_2m: null,
          weather_code: null,
          relative_humidity_2m: null,
          wind_speed_10m: null,
          precipitation: null,
          surface_pressure: null,
        },
        daily: {
          time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
        },
      });

      const result = await getWeather(city);

      expect(result.current).toEqual({
        temperatureCelsius: undefined,
        weatherCode: undefined,
        humidity: undefined,
        windSpeedKmh: undefined,
        precipitationMm: undefined,
        pressureHpa: undefined,
      });
      expect(result.forecast).toHaveLength(5);
      expect(result.forecast[0]).toMatchObject({
        weatherCode: undefined,
        minTemperatureCelsius: undefined,
        maxTemperatureCelsius: undefined,
        precipitationProbability: 0,
      });
    });
  });

  describe('rede offline', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('rejects immediately with a friendly offline message when navigator.onLine is false', async () => {
      stubOnlineStatus(false);
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      await expect(searchCities('Recife')).rejects.toMatchObject({
        name: 'WeatherServiceError',
        kind: 'offline',
        message: expect.stringContaining('sem conexão'),
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('maps a failed fetch (e.g. DNS/connection failure) to a friendly offline error', async () => {
      stubOnlineStatus(true);
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
      );

      await expect(getWeather(city)).rejects.toMatchObject({
        name: 'WeatherServiceError',
        kind: 'offline',
      });
    });

    it('maps an aborted request to a clear timeout error', async () => {
      vi.useFakeTimers();
      stubOnlineStatus(true);
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(
          (_url: string, options: { signal: AbortSignal }) =>
            new Promise((_resolve, reject) => {
              options.signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }),
        ),
      );

      const promise = getWeather(city);
      const assertion = expect(promise).rejects.toMatchObject({
        name: 'WeatherServiceError',
        kind: 'timeout',
        message: expect.stringContaining('demorou'),
      });

      await vi.advanceTimersByTimeAsync(10_000);
      await assertion;
      vi.useRealTimers();
    });
  });
});