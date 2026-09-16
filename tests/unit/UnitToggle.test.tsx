import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../../src/types/weather';

const city: City = {
  name: 'Curitiba',
  country: 'Brasil',
  latitude: -25.43,
  longitude: -49.27,
};

const current: CurrentWeatherData = {
  temperatureCelsius: 0,
  weatherCode: 0,
};

function WeatherUnitExample() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather city={city} current={current} unit={unit} />
    </>
  );
}

describe('UnitToggle com CurrentWeather', () => {
  it('converte 0°C para 32°F ao selecionar Fahrenheit', async () => {
    const user = userEvent.setup();
    render(<WeatherUnitExample />);

    await user.click(screen.getByRole('button', { name: 'Usar graus Fahrenheit' }));

    expect(
      screen.getByRole('heading', { name: /Temperatura atual:\s*32°F/ }),
    ).toBeInTheDocument();
  });
});