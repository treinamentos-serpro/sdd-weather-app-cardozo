import type { City } from '../types/weather';

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

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

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
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
  const response = await fetch(url);

  if (!response.ok) {
    throw new WeatherServiceError(`Falha ao buscar cidades: HTTP ${response.status}`);
  }

  const data = (await response.json()) as GeocodingResponse;

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