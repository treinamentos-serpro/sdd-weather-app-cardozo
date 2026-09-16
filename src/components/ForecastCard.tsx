import { getDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

function formatPrecipitationProbability(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }

  return `${Math.round(value)}%`;
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const condition = getWeatherCondition(day.weatherCode);

  return (
    <article className="min-w-0 rounded-lg border border-white/10 bg-white/5 p-4 text-center shadow-glass backdrop-blur-md">
      <h3 className="text-sm font-semibold text-white">{getDayLabel(day.date, index)}</h3>
      <p className="mt-1 text-xs text-white/75">{condition.label}</p>
      <span aria-hidden="true" className="mt-4 block text-4xl leading-none">
        {condition.icon}
      </span>
      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-white/75">Máx.</dt>
          <dd className="font-semibold text-sun">{formatTemperature(day.maxTemperatureCelsius, unit)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-white/75">Mín.</dt>
          <dd className="font-semibold text-white">{formatTemperature(day.minTemperatureCelsius, unit)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2">
          <dt className="text-white/75">Chuva</dt>
          <dd className="font-semibold text-accent-400">
            {formatPrecipitationProbability(day.precipitationProbability)}
          </dd>
        </div>
      </dl>
    </article>
  );
}