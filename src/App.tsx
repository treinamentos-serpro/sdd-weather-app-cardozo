import { useState } from 'react';

import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, error, search, retry } = useWeather();

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <LoadingState />;
      case 'empty':
        return <EmptyState hint="Tente buscar outra cidade." title="Nenhuma cidade encontrada" />;
      case 'error':
        return (
          <ErrorState
            message={error ?? 'Não foi possível carregar os dados meteorológicos.'}
            onRetry={retry}
          />
        );
      case 'success':
        return data ? (
          <div className="space-y-8">
            <CurrentWeather city={data.city} current={data.current} unit={unit} />
            <ForecastList forecast={data.forecast} unit={unit} />
          </div>
        ) : null;
      case 'idle':
        return (
          <EmptyState
            hint="Busque pelo nome de uma cidade para consultar as condições meteorológicas."
            title="Qual é o clima na sua cidade?"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <a
        href="#main-content"
        className="absolute left-4 top-4 z-10 -translate-y-24 rounded-md bg-white px-4 py-2 font-semibold text-night-900 transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900"
      >
        Ir para o conteúdo principal
      </a>
      <header className="border-b border-white/10 bg-night-800/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <a
            className="rounded-md text-xl font-semibold tracking-wide text-white focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-800"
            href="/"
            aria-label="Weather App - início"
          >
            Weather App
          </a>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar disabled={status === 'loading'} onSearch={search} />
            <UnitToggle onChange={setUnit} unit={unit} />
          </div>
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        aria-busy={status === 'loading'}
        className="mx-auto w-full max-w-6xl px-4 py-8 outline-none sm:px-6 lg:px-8"
      >
        {renderContent()}
      </main>
    </div>
  );
}