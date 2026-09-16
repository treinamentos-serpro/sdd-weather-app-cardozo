import { useCallback, useRef, useState } from 'react';

import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

const GENERIC_ERROR_MESSAGE = 'Não foi possível carregar os dados meteorológicos.';

function getErrorMessage(error: unknown): string {
  return error instanceof WeatherServiceError ? error.message : GENERIC_ERROR_MESSAGE;
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Guarda a última operação disparada para permitir refazê-la em retry().
  const lastOperationRef = useRef<() => Promise<void>>(async () => {});

  const loadWeatherForCity = useCallback(async (city: City) => {
    setStatus('loading');
    setError(null);
    try {
      const weather = await getWeather(city);
      setData(weather);
      setStatus('success');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }, []);

  const runSearch = useCallback(
    async (name: string) => {
      setStatus('loading');
      setError(null);
      setData(null);

      try {
        const results = await searchCities(name);
        setCities(results);

        if (results.length === 0) {
          setStatus('empty');
          return;
        }

        await loadWeatherForCity(results[0]);
      } catch (err) {
        setError(getErrorMessage(err));
        setStatus('error');
      }
    },
    [loadWeatherForCity],
  );

  const search = useCallback(
    async (name: string) => {
      setQuery(name);
      lastOperationRef.current = () => runSearch(name);
      await runSearch(name);
    },
    [runSearch],
  );

  const selectCity = useCallback(
    async (city: City) => {
      lastOperationRef.current = () => loadWeatherForCity(city);
      await loadWeatherForCity(city);
    },
    [loadWeatherForCity],
  );

  const retry = useCallback(async () => {
    await lastOperationRef.current();
  }, []);

  return { status, data, cities, error, query, search, selectCity, retry };
}
