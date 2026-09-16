import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const FORECAST_DAYS = 5;

interface GeocodingResult {
  id?: number | null;
  name?: string | null;
  admin1?: string | null;
  country?: string | null;
  country_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastCurrentResponse {
  temperature_2m?: number | null;
  weather_code?: number | null;
  relative_humidity_2m?: number | null;
  wind_speed_10m?: number | null;
  precipitation?: number | null;
  surface_pressure?: number | null;
}

interface ForecastDailyResponse {
  time?: Array<string | null>;
  weather_code?: Array<number | null>;
  temperature_2m_max?: Array<number | null>;
  temperature_2m_min?: Array<number | null>;
  precipitation_probability_max?: Array<number | null>;
}

interface ForecastResponse {
  timezone?: string;
  current?: ForecastCurrentResponse;
  daily?: ForecastDailyResponse;
}

/** Categoria da falha, usada para mensagens e testes mais precisos. */
export type WeatherServiceErrorKind = 'offline' | 'timeout' | 'http' | 'parse' | 'unknown';

export class WeatherServiceError extends Error {
  readonly kind: WeatherServiceErrorKind;

  constructor(message: string, kind: WeatherServiceErrorKind = 'unknown') {
    super(message);
    this.name = 'WeatherServiceError';
    this.kind = kind;
  }
}

const REQUEST_TIMEOUT_MS = 10_000;

function finiteNumber(value: number | null | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  if (isOffline()) {
    throw new WeatherServiceError(
      'Você está sem conexão com a internet. Verifique sua rede e tente novamente.',
      'offline',
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new WeatherServiceError(
        'A requisição demorou demais para responder. Tente novamente em instantes.',
        'timeout',
      );
    }
    if (isOffline()) {
      throw new WeatherServiceError(
        'Você está sem conexão com a internet. Verifique sua rede e tente novamente.',
        'offline',
      );
    }
    throw new WeatherServiceError(
      'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.',
      'offline',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new WeatherServiceError('Resposta inválida do servidor. Tente novamente.', 'parse');
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
    throw new WeatherServiceError(
      `Falha ao buscar cidades: HTTP ${response.status}`,
      'http',
    );
  }

  const data = await parseJson<GeocodingResponse>(response);

  return (data.results ?? []).filter(isGeocodingResult).map((result) => ({
    id: result.id ?? undefined,
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
    temperatureCelsius: finiteNumber(current.temperature_2m),
    weatherCode: finiteNumber(current.weather_code),
    humidity: finiteNumber(current.relative_humidity_2m),
    windSpeedKmh: finiteNumber(current.wind_speed_10m),
    precipitationMm: finiteNumber(current.precipitation),
    pressureHpa: finiteNumber(current.surface_pressure),
  };
}

function mapForecastDays(daily: ForecastDailyResponse): ForecastDay[] {
  const dates = daily.time ?? [];
  if (dates.length < FORECAST_DAYS) {
    throw new WeatherServiceError('Resposta de previsão incompleta: dias insuficientes', 'parse');
  }

    const forecastDates = dates
      .slice(0, FORECAST_DAYS)
      .filter((date): date is string => typeof date === 'string' && date.trim().length > 0);
    if (forecastDates.length < FORECAST_DAYS) {
      throw new WeatherServiceError('Resposta de previsão incompleta: datas ausentes', 'parse');
    }

    return forecastDates.map((date, index) => ({
      date,
    weatherCode: finiteNumber(daily.weather_code?.[index]),
    precipitationProbability: finiteNumber(daily.precipitation_probability_max?.[index]) ?? 0,
    minTemperatureCelsius: finiteNumber(daily.temperature_2m_min?.[index]),
    maxTemperatureCelsius: finiteNumber(daily.temperature_2m_max?.[index]),
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: String(FORECAST_DAYS),
    timezone: 'auto',
    temperature_unit: 'celsius',
  });

  const response = await fetchWithTimeout(`${FORECAST_ENDPOINT}?${params.toString()}`);

  if (!response.ok) {
    throw new WeatherServiceError(`Falha ao buscar previsão: HTTP ${response.status}`, 'http');
  }

  const data = await parseJson<ForecastResponse>(response);

  if (!data.current || !data.daily || !data.timezone) {
    throw new WeatherServiceError('Resposta de previsão incompleta: dados ausentes', 'parse');
  }

  return {
    city,
    timezone: data.timezone,
    current: mapCurrentWeather(data.current),
    forecast: mapForecastDays(data.daily),
  };
}