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
  // Identifica a operação mais recente para descartar respostas de buscas antigas (fora de ordem).
  const operationIdRef = useRef(0);

  const fetchWeatherForCity = useCallback(async (city: City, operationId: number) => {
    try {
      const weather = await getWeather(city);
      if (operationId !== operationIdRef.current) return;
      setData(weather);
      setStatus('success');
    } catch (err) {
      if (operationId !== operationIdRef.current) return;
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }, []);

  const loadWeatherForCity = useCallback(
    async (city: City) => {
      const operationId = ++operationIdRef.current;
      setStatus('loading');
      setError(null);
      await fetchWeatherForCity(city, operationId);
    },
    [fetchWeatherForCity],
  );

  const runSearch = useCallback(
    async (name: string) => {
      const operationId = ++operationIdRef.current;
      setStatus('loading');
      setError(null);
      setData(null);

      try {
        const results = await searchCities(name);
        if (operationId !== operationIdRef.current) return;
        setCities(results);

        if (results.length === 0) {
          setStatus('empty');
          return;
        }

        await fetchWeatherForCity(results[0], operationId);
      } catch (err) {
        if (operationId !== operationIdRef.current) return;
        setError(getErrorMessage(err));
        setStatus('error');
      }
    },
    [fetchWeatherForCity],
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
