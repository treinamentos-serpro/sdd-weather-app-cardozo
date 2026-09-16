import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const FORECAST_DAYS = 5;

interface GeocodingResult {
  id?: number;
  name?: string;
  admin1?: string;
  country?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastCurrentResponse {
  temperature_2m?: number;
  weather_code?: number;
}

interface ForecastDailyResponse {
  time?: string[];
  weather_code?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
}

interface ForecastResponse {
  timezone?: string;
  current?: ForecastCurrentResponse;
  daily?: ForecastDailyResponse;
}

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

const REQUEST_TIMEOUT_MS = 10_000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais.');
    }
    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new WeatherServiceError('Resposta inválida do servidor.');
  }
}

function isGeocodingResult(result: GeocodingResult): result is GeocodingResult & {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
} {
  return (
    typeof result.name === 'string' &&
    result.name.trim().length > 0 &&
    typeof result.country === 'string' &&
    typeof result.latitude === 'number' &&
    Number.isFinite(result.latitude) &&
    typeof result.longitude === 'number' &&
    Number.isFinite(result.longitude)
  );
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const url = `${GEOCODING_ENDPOINT}?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(`Falha ao buscar cidades: HTTP ${response.status}`);
  }

  const data = await parseJson<GeocodingResponse>(response);

  return (data.results ?? []).filter(isGeocodingResult).map((result) => ({
    id: result.id,
    name: result.name,
    region: result.admin1,
    country: result.country,
    countryCode: result.country_code,
    latitude: result.latitude,
    longitude: result.longitude,
  }));
}

function mapCurrentWeather(current: ForecastCurrentResponse): CurrentWeather {
  return {
    temperatureCelsius: current.temperature_2m,
    weatherCode: current.weather_code,
  };
}

function mapForecastDays(daily: ForecastDailyResponse): ForecastDay[] {
  const dates = daily.time ?? [];
  if (dates.length < FORECAST_DAYS) {
    throw new WeatherServiceError('Resposta de previsão incompleta: dias insuficientes');
  }

  return dates.slice(0, FORECAST_DAYS).map((date, index) => ({
    date,
    weatherCode: daily.weather_code?.[index],
    minTemperatureCelsius: daily.temperature_2m_min?.[index],
    maxTemperatureCelsius: daily.temperature_2m_max?.[index],
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    forecast_days: String(FORECAST_DAYS),
    timezone: 'auto',
    temperature_unit: 'celsius',
  });

  const response = await fetchWithTimeout(`${FORECAST_ENDPOINT}?${params.toString()}`);

  if (!response.ok) {
    throw new WeatherServiceError(`Falha ao buscar previsão: HTTP ${response.status}`);
  }

  const data = await parseJson<ForecastResponse>(response);

  if (!data.current || !data.daily || !data.timezone) {
    throw new WeatherServiceError('Resposta de previsão incompleta: dados ausentes');
  }

  return {
    city,
    timezone: data.timezone,
    current: mapCurrentWeather(data.current),
    forecast: mapForecastDays(data.daily),
  };
}