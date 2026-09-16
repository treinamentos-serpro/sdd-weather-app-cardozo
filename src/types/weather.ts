/** Unidade de temperatura selecionada para apresentação. */
export type Unit = 'celsius' | 'fahrenheit';

/** Localidade retornada pelo serviço de geocoding da Open-Meteo. */
export interface City {
  /** Identificador opcional retornado pela Open-Meteo. */
  id?: number;
  /** Nome exibível da localidade. */
  name: string;
  /** Estado, província ou região administrativa, quando disponível. */
  region?: string;
  /** País da localidade. */
  country: string;
  /** Código ISO do país, quando disponível. */
  countryCode?: string;
  /** Latitude usada na consulta de previsão. */
  latitude: number;
  /** Longitude usada na consulta de previsão. */
  longitude: number;
}

/** Condições meteorológicas atuais retornadas pela Open-Meteo. */
export interface CurrentWeather {
  /** Temperatura atual em Celsius, quando disponível. */
  temperatureCelsius?: number;
  /** Código de condição meteorológica WMO, quando disponível. */
  weatherCode?: number;
}

/** Previsão meteorológica de um único dia. */
export interface ForecastDay {
  /** Data ISO local retornada pela API, no formato YYYY-MM-DD. */
  date: string;
  /** Código de condição meteorológica WMO previsto para o dia. */
  weatherCode?: number;
  /** Temperatura mínima prevista em Celsius. */
  minTemperatureCelsius?: number;
  /** Temperatura máxima prevista em Celsius. */
  maxTemperatureCelsius?: number;
}

/** Dados internos normalizados para a tela de clima. */
export interface WeatherData {
  /** Cidade selecionada para a consulta. */
  city: City;
  /** Fuso horário retornado pela Open-Meteo. */
  timezone: string;
  /** Condições meteorológicas atuais. */
  current: CurrentWeather;
  /** Previsão diária ordenada cronologicamente. */
  forecast: ForecastDay[];
}