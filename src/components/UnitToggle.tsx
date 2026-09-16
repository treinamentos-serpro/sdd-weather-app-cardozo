import type { KeyboardEvent } from 'react';
import { useRef } from 'react';

import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const units: Unit[] = ['celsius', 'fahrenheit'];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const buttonRefs = useRef<Record<Unit, HTMLButtonElement | null>>({
    celsius: null,
    fahrenheit: null,
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentUnit: Unit) => {
    const currentIndex = units.indexOf(currentUnit);
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % units.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + units.length) % units.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = units.length - 1;
    }

    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextUnit = units[nextIndex];
    onChange(nextUnit);
    buttonRefs.current[nextUnit]?.focus();
  };

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex shrink-0 rounded-lg border border-white/10 bg-white/5 p-1"
    >
      {units.map((option) => {
        const isActive = option === unit;
        const label = option === 'celsius' ? '°C' : '°F';

        return (
          <button
            key={option}
            ref={(button) => {
              buttonRefs.current[option] = button;
            }}
            type="button"
            aria-label={option === 'celsius' ? 'Usar graus Celsius' : 'Usar graus Fahrenheit'}
            aria-pressed={isActive}
            onClick={() => onChange(option)}
            onKeyDown={(event) => handleKeyDown(event, option)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-800 ${
              isActive
                ? 'bg-accent-500 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
