import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

interface MetricProps {
  label: string;
  value: number | null | undefined;
  suffix: string;
}

function formatMetric(value: number | null | undefined, suffix: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }

  return `${Math.round(value)}${suffix}`;
}

function Metric({ label, value, suffix }: MetricProps) {
  return (
    <div className="border-l border-white/10 pl-3 first:border-l-0 first:pl-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-white/70">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-white">{formatMetric(value, suffix)}</dd>
    </div>
  );
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const condition = getWeatherCondition(current.weatherCode);
  const location = city.country ? `${city.name}, ${city.country}` : city.name;

  return (
    <section
      aria-labelledby="current-weather-title"
      className="w-full rounded-lg border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md sm:p-7"
    >
      <p className="break-words text-sm font-medium text-white/75">{location}</p>
      <div className="mt-4 flex items-center gap-4 sm:gap-6">
        <span aria-hidden="true" className="shrink-0 text-6xl leading-none sm:text-7xl">
          {condition.icon}
        </span>
        <div className="min-w-0">
          <h2 id="current-weather-title" className="text-4xl font-semibold leading-none text-white sm:text-6xl">
            <span className="sr-only">Temperatura atual: </span>
            {formatTemperature(current.temperatureCelsius, unit)}
          </h2>
          <p className="mt-2 text-base text-white/75">{condition.label}</p>
        </div>
      </div>
      <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
        <Metric label="Umidade" value={current.humidity} suffix="%" />
        <Metric label="Vento" value={current.windSpeedKmh} suffix=" km/h" />
        <Metric label="Precipitação" value={current.precipitationMm} suffix=" mm" />
        <Metric label="Pressão" value={current.pressureHpa} suffix=" hPa" />
      </dl>
    </section>
  );
}
