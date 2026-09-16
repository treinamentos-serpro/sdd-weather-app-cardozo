export interface WeatherCondition {
  label: string;
  icon: string;
}

const WEATHER_CONDITIONS: Record<number, WeatherCondition> = {
  0: { label: 'Céu limpo', icon: '☀️' },
  1: { label: 'Predominantemente limpo', icon: '🌤️' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Neblina', icon: '🌫️' },
  48: { label: 'Neblina congelante', icon: '🌫️' },
  51: { label: 'Chuvisco leve', icon: '🌦️' },
  53: { label: 'Chuvisco moderado', icon: '🌦️' },
  55: { label: 'Chuvisco intenso', icon: '🌧️' },
  61: { label: 'Chuva leve', icon: '🌦️' },
  63: { label: 'Chuva moderada', icon: '🌧️' },
  65: { label: 'Chuva intensa', icon: '🌧️' },
  71: { label: 'Neve leve', icon: '🌨️' },
  73: { label: 'Neve moderada', icon: '🌨️' },
  75: { label: 'Neve intensa', icon: '❄️' },
  80: { label: 'Pancadas de chuva leves', icon: '🌦️' },
  81: { label: 'Pancadas de chuva moderadas', icon: '🌧️' },
  82: { label: 'Pancadas de chuva intensas', icon: '⛈️' },
  95: { label: 'Tempestade', icon: '⛈️' },
  96: { label: 'Tempestade com granizo leve', icon: '⛈️' },
  99: { label: 'Tempestade com granizo intenso', icon: '⛈️' },
};

const UNAVAILABLE_CONDITION: WeatherCondition = {
  label: 'Condição indisponível',
  icon: '🌡️',
};

export function getWeatherCondition(weatherCode: number | undefined): WeatherCondition {
  if (weatherCode === undefined || !Number.isFinite(weatherCode)) {
    return UNAVAILABLE_CONDITION;
  }

  return WEATHER_CONDITIONS[weatherCode] ?? UNAVAILABLE_CONDITION;
}
